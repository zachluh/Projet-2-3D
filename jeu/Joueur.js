function initJoueur() {
        var joueur = creerCamera();
        setPositionsCameraXYZ([15, 1, 15], joueur);
        setCiblesCameraXYZ([12, 1, 15], joueur);
        setOrientationsXYZ([0, 1, 0], joueur);
        joueur.vitesse = 0.5;
        joueur.vitesseRotation = 0.1; 
        return joueur;
    }

function enfoncerTouche(event) {
    if (!event) return;
    event.preventDefault();

    // Lancer le jeu si on attend l'écran de démarrage
    if (!jeuEnCours) {
        demarrerJeu();
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

                var idx = nextX * matrice[0].length + nextZ;
                var obj = objScene3D.tabObjets3D[idx];
                mat4.identity(obj.matModele);
                mat4.translate(obj.matModele, [nextX, 0, nextZ]);

                console.log("Mur devant ouvert en (" + nextX + ", " + nextZ + ")");
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


    
function miseAJourPositionJoueur() {
    if (vueTopDown) return;

    var vitesse = joueur.vitesse;
    var vitesseRotation = joueur.vitesseRotation;
    camera = objScene3D.camera;

    //console.log("Touches actives : " + JSON.stringify(touchesActives));

    var posX = getPositionCameraX(joueur);
    var posZ = getPositionCameraZ(joueur);


    var dirX = Math.sin(angleCamera);
    var dirZ = Math.cos(angleCamera);

    if (touchesActives[37]) {// Flèche gauche — tourner à gauche
        angleCamera += vitesseRotation;
    }
    if (touchesActives[39]) {// Flèche droite — tourner à droite
        angleCamera -= vitesseRotation;
    }
    if (touchesActives[38]) {// Flèche haut — avancer dans la direction visée
        if (!positionCollide(posX + dirX * vitesse, posZ)) posX += dirX * vitesse;
        if (!positionCollide(posX, posZ + dirZ * vitesse)) posZ += dirZ * vitesse;
        setPositionCameraX(posX, joueur);
        setPositionCameraZ(posZ, joueur);
    }
    if (touchesActives[40]) {// Flèche bas — reculer
        if (!positionCollide(posX - dirX * vitesse, posZ)) posX -= dirX * vitesse;
        if (!positionCollide(posX, posZ - dirZ * vitesse)) posZ -= dirZ * vitesse;
        setPositionCameraX(posX, joueur);
        setPositionCameraZ(posZ, joueur);
    }

    setCibleCameraX(posX + Math.sin(angleCamera), joueur);
    setCibleCameraZ(posZ + Math.cos(angleCamera), joueur);

    //console.log("Position de la caméra : " + getPositionsCameraXYZ(joueur));
    //console.log("Angle : " + angleCamera);

}

