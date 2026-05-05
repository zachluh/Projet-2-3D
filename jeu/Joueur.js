/** --- Joueur.js ---
 * Ce fichier contient la logique liée au joueur : initialisation, gestion des touches, collisions, etc.
 * @author Ken-Li Roux, Zachary Luheshi
 */

// Initialisation du joueur : position, cible et orientation de la caméra, ainsi que les vitesses de déplacement et de rotation
function initJoueur() {
        var joueur = creerCamera();
        setPositionsCameraXYZ([15, 1, 15], joueur);
        setCiblesCameraXYZ([12, 1, 15], joueur);
        setOrientationsXYZ([0, 1, 0], joueur);
        joueur.vitesse = niveau >= 6 ? 0.15 : 0.07; // Vitesse plus élevée à partir du niveau 6
        joueur.vitesseRotation = 0.07; 
        return joueur;
    }

// Ajoute les touches de mouvement à la liste de touches actives. Pour touches à une seule action, la fonction correspondante est appelée directement
function enfoncerTouche(event) {
    if (!event) return;
    event.preventDefault();

    // Lancer l'intro si le jeu n'a pas encore commencé
    // Le jeu commence lorsque l'intro de Flowey a terminé
    if (!jeuEnCours) {
        if (cutsceneActive) {
            // Intro en cours : Entrée avance les répliques, toute autre touche est ignorée
            if (event.keyCode === 13) afficherProchaineReplique(repliquesEnCours);
        } else {
            declencherCutscene(repliquesIntro, true);
        }
        return;
    }

    // Cutscène midgame en cours : Entrée avance les répliques, toute autre touche est ignorée
    if (cutsceneActive) {
        if (event.keyCode === 13) afficherProchaineReplique(repliquesEnCours);
        return;
    }

    // Page Up — entrer en vue de dessus
    if (event.keyCode === 33 || event.keyCode === 187) {
        if (!vueTopDown) {
            if (!activerVueAerienne()) return; // score < 10, vue aérienne refusée
            vueTopDown = true;
            cameraAvantTopDown = joueur.slice();
            angleCameraAvantTopDown = angleCamera;
            setPositionsCameraXYZ([15, 40, 15], joueur);
            setCiblesCameraXYZ([15, 0, 15], joueur);
            setOrientationsXYZ([0, 0, -1], joueur);
        }
        return;
    }

    // Page Down — quitter la vue de dessus
    if (event.keyCode === 34 || event.keyCode === 189) {
        if (vueTopDown) {
            vueTopDown = false;
            desactiverVueAerienne();
            joueur.splice(0, 9,
                cameraAvantTopDown[0], cameraAvantTopDown[1], cameraAvantTopDown[2],
                cameraAvantTopDown[3], cameraAvantTopDown[4], cameraAvantTopDown[5],
                cameraAvantTopDown[6], cameraAvantTopDown[7], cameraAvantTopDown[8]);
            angleCamera = angleCameraAvantTopDown;
        }
        return;
    }

    // Espace — ouvrir le mur devant le joueur
    if (event.keyCode === 32) {

            console.log("Ouvreur utilisé !");
            var pos = getPositionJoueurDansMatrice();
            var dirX = Math.sin(angleCamera);
            var dirZ = Math.cos(angleCamera);
            var nextX = Math.round(pos[0] + dirX);
            var nextZ = Math.round(pos[1] + dirZ);
            if (utiliserOuvreur(nextX, nextZ)) {
                matrice[nextX][nextZ] = 0;
                var obj = cubesMatrice[nextX][nextZ];
                obj.texture = texSol;
                mat4.identity(obj.matModele);
                mat4.translate(obj.matModele, [nextX, 0, nextZ]);
            }
        
    }

    touchesActives[event.keyCode] = true;

}


//Enleve la touche de touchesActives lorsqu'elle est relachée
function relacherTouche(event) {
    if (!event) return;
    event.preventDefault();
    touchesActives[event.keyCode] = false;
}


//Fonction util pour situer le joueur relatif à la matrice
function getPositionJoueurDansMatrice() {
    var posX = Math.round(getPositionCameraX(joueur));
    var posZ = Math.round(getPositionCameraZ(joueur));
    return [posX, posZ];
}

// Vérifie si la position (x, z) en virgule flottante est trop proche d'un mur (marge de 0.4 unité)
function positionCollide(x, z) {
    var margin = 0.2;
    var coins = [
        [x - margin, z - margin],
        [x - margin, z + margin],
        [x + margin, z - margin],
        [x + margin, z + margin]
    ];
    for (var c of coins) {
        var ix = Math.round(c[0]);
        var iz = Math.round(c[1]);
        if (!matrice[ix] || matrice[ix][iz] === undefined) return true;
        if (matrice[ix][iz] === 1 || matrice[ix][iz] === 2) return true;
    }
    return false;
}

// Vérifie si le joueur est sur une case de transporteur et le téléporte aléatoirement sur un récepteur
function verifierCollisionTransporteur() {
    var pos = getPositionJoueurDansMatrice();
    if (matrice[pos[0]][pos[1]] === 6) {
        var posRecepteur = positionsRecepteurs[Math.floor(Math.random() * positionsRecepteurs.length)];
        setPositionCameraX(posRecepteur[0], joueur);
        setPositionCameraZ(posRecepteur[1], joueur);
        setCibleCameraX(posRecepteur[0] + Math.sin(angleCamera), joueur);
        setCibleCameraZ(posRecepteur[1] + Math.cos(angleCamera), joueur);
        sonTeleporte();
    }
}

// Vérifie si le joueur est proche du trésor et le collecte s'il l'est
function verifierCollisionTresor() {
    if (tresorCollecte || !positionTresor) return;

    var px = getPositionCameraX(joueur);
    var pz = getPositionCameraZ(joueur);
    var dx = px - positionTresor[0];
    var dz = pz - positionTresor[1];

    if (Math.sqrt(dx * dx + dz * dz) < 0.5) {
        tresorCollecte = true;
        tresorObj.binVisible = false;
        passerNiveauSuivant();
    }
}


// Met à jour la position du joueur en fonction des touches actives, en vérifiant les collisions avec les murs. Appelée à chaque frame
function miseAJourPositionJoueur() {
    if (vueTopDown) return;
    if (cutsceneActive) return;

    var vitesse = joueur.vitesse;
    var vitesseRotation = joueur.vitesseRotation;
    camera = objScene3D.camera;

    //Position actuelle du joueur dans la matrice
    var posX = getPositionCameraX(joueur);
    var posZ = getPositionCameraZ(joueur);

    // Direction vers laquelle le joueur regarde, calculée à partir de l'angle de la caméra
    var dirX = Math.sin(angleCamera);
    var dirZ = Math.cos(angleCamera);

    // Flèche gauche — tourner à gauche
    if (touchesActives[37]) {
        angleCamera += vitesseRotation;
    }

    // Flèche droite — tourner à droite
    if (touchesActives[39]) {
        angleCamera -= vitesseRotation;
    }

    // Flèche haut — Avancer
    if (touchesActives[38]) {
        if (!positionCollide(posX + dirX * vitesse, posZ)) posX += dirX * vitesse;
        if (!positionCollide(posX, posZ + dirZ * vitesse)) posZ += dirZ * vitesse;
        setPositionCameraX(posX, joueur);
        setPositionCameraZ(posZ, joueur);
    }

    // Flèche bas — Reculer
    if (touchesActives[40]) {
        if (!positionCollide(posX - dirX * vitesse, posZ)) posX -= dirX * vitesse;
        if (!positionCollide(posX, posZ - dirZ * vitesse)) posZ -= dirZ * vitesse;
        setPositionCameraX(posX, joueur);
        setPositionCameraZ(posZ, joueur);
    }


    // Mettre à jour la cible de la caméra pour qu'elle regarde toujours dans la direction du mouvement
    setCibleCameraX(posX + Math.sin(angleCamera), joueur);
    setCibleCameraZ(posZ + Math.cos(angleCamera), joueur); 

}

