var vueTopDown = false;
var cameraAvantTopDown = null;
var angleCameraAvantTopDown = 0;

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

function relacherTouche(event) {
    if (!event) return;
    event.preventDefault();
    touchesActives[event.keyCode] = false;
}

function getPositionJoueurDansMatrice() {
    var posX = Math.round(getPositionCameraX(joueur));
    var posZ = Math.round(getPositionCameraZ(joueur));
    return [posX, posZ];
}

function murDevant() {
    var pos = getPositionJoueurDansMatrice();
    var dirX = Math.sin(angleCamera);
    var dirZ = Math.cos(angleCamera);
    var nextX = Math.round(pos[0] + dirX);
    var nextZ = Math.round(pos[1] + dirZ);
    return matrice[nextX][nextZ] === 1 || matrice[nextX][nextZ] === 2;
}

function murDerriere() {
    var pos = getPositionJoueurDansMatrice();
    var dirX = Math.sin(angleCamera);
    var dirZ = Math.cos(angleCamera);
    var nextX = Math.round(pos[0] - dirX);
    var nextZ = Math.round(pos[1] - dirZ);
    return matrice[nextX][nextZ] === 1 || matrice[nextX][nextZ] === 2;
}

function verifierCollisionTransporteur() {
    var pos = getPositionJoueurDansMatrice();
    if (matrice[pos[0]][pos[1]] === 6) {
        var posRecepteur = positionsRecepteurs[Math.floor(Math.random() * positionsRecepteurs.length)];
        setPositionCameraX(posRecepteur[0], joueur);
        setPositionCameraZ(posRecepteur[1], joueur);
        setCibleCameraX(posRecepteur[0] + Math.sin(angleCamera), joueur);
        setCibleCameraZ(posRecepteur[1] + Math.cos(angleCamera), joueur);
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
    if (touchesActives[38] && !murDevant()) {// Flèche haut — avancer dans la direction visée
        posX += dirX * vitesse;
        posZ += dirZ * vitesse;
        setPositionCameraX(posX, joueur);
        setPositionCameraZ(posZ, joueur);
    }
    if (touchesActives[40] && !murDerriere()) {// Flèche bas — reculer
        posX -= dirX * vitesse;
        posZ -= dirZ * vitesse;
        setPositionCameraX(posX, joueur);
        setPositionCameraZ(posZ, joueur);
    }

    setCibleCameraX(posX + Math.sin(angleCamera), joueur);
    setCibleCameraZ(posZ + Math.cos(angleCamera), joueur);

    //console.log("Position de la caméra : " + getPositionsCameraXYZ(joueur));
    //console.log("Angle : " + angleCamera);

}

