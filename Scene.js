





async function initScene3D(objgl) {
    var objScene3D = new Object();
    var tabObjets3D = new Array();

    for (var i = 0; i < matrice.length; i++) {
        for (var j = 0; j < matrice[i].length; j++) {
            var objet3D = new Object();
            objet3D.vertex = creerCube(objgl);
            objet3D.couleurs = creerCouleurs(objgl, matrice[i][j]);
            objet3D.maillage = null;
            objet3D.transformations = creerTransformations();
            var y = matrice[i][j] == 1 || matrice[i][j] == 2 ? 1 : 0; 
            setPositionsXYZ([i, y, j], objet3D.transformations);
            objet3D.matModele = mat4.create();
            mat4.identity(objet3D.matModele);
            mat4.translate(objet3D.matModele, getPositionsXYZ(objet3D.transformations));
            tabObjets3D.push(objet3D);
        }
    }
    
    // Initialiser le trésor
    initTresor(objgl);
    tresorObj.estSpecial = true;
    tabObjets3D.push(tresorObj);

    // Initialiser les flèches
    let fleches = await initFleches();

    for (let i = 0; i < fleches.length; i++) {
        let objet3D = creerFleche(objgl, fleches[i].positions, fleches[i].indices);
        let position = trouveCaseVide(matrice, 4);
        console.log("Position de la flèche " + i + ": " + position);
        setPositionsXYZ([position[0], 1.2, position[1]], objet3D.transformations);
        if (i === 0) {
            setPositionsXYZ([12, 1.2, 15], objet3D.transformations);
        }
        setEchellesXYZ([0.2, 0.2, 0.2], objet3D.transformations); // Positionner la flèche au centre de la scène
        orienterFlecheVersPoint(objet3D);
        objet3D.matModele = mat4.create();
        mat4.identity(objet3D.matModele);
        mat4.translate(objet3D.matModele, getPositionsXYZ(objet3D.transformations));
        mat4.scale(objet3D.matModele, getEchellesXYZ(objet3D.transformations));
        mat4.rotateY(objet3D.matModele, getAngleY(objet3D.transformations) * Math.PI / 180);
        objet3D.estSpecial = true;
        tabObjets3D.push(objet3D);
    };
    

    let teleporteurs = await initTeleporteurs();
    for (let i = 0; i < teleporteurs.length; i++) {
        if (i < teleporteurs.length / 2) {
            let transporteur = creerTeleporter(objgl, teleporteurs[i].positions, teleporteurs[i].texCoords, teleporteurs[i].indices, 'modeles/teleporteur/textures/Spawnlocation2Mtl_baseColor.png');
            let positionTransporteur = trouveCaseVide(matrice, 6);
            setPositionsXYZ([positionTransporteur[0], -1.5, positionTransporteur[1]], transporteur.transformations);
            setEchellesXYZ([0.2, 0.2, 0.2], transporteur.transformations);
            setAngleX(0, transporteur.transformations);

            transporteur.matModele = mat4.create();
            mat4.identity(transporteur.matModele);
            mat4.translate(transporteur.matModele, getPositionsXYZ(transporteur.transformations));
            mat4.scale(transporteur.matModele, getEchellesXYZ(transporteur.transformations));
            mat4.rotateX(transporteur.matModele, getAngleX(transporteur.transformations) * Math.PI / 180);
            transporteur.estSpecial = true;
            tabObjets3D.push(transporteur);
        }

        else {
            let positionRecepteur = trouveCaseVide(matrice, 7);
            let recepteur = creerTeleporter(objgl, teleporteurs[i].positions, teleporteurs[i].texCoords, teleporteurs[i].indices, 'modeles/teleporteur/textures/Spawnlocation2Mtl_baseColor.png');
            setPositionsXYZ([positionRecepteur[0], -1.5, positionRecepteur[1]], recepteur.transformations);
            setEchellesXYZ([0.2, 0.2, 0.2], recepteur.transformations);
            setAngleX(0, recepteur.transformations);
            recepteur.estInversee = true;

            recepteur.matModele = mat4.create();
            mat4.identity(recepteur.matModele);
            mat4.translate(recepteur.matModele, getPositionsXYZ(recepteur.transformations));
            mat4.scale(recepteur.matModele, getEchellesXYZ(recepteur.transformations));
            mat4.rotateX(recepteur.matModele, getAngleX(recepteur.transformations) * Math.PI / 180);

            positionsRecepteurs.push(positionRecepteur);
            recepteur.estSpecial = true;
            tabObjets3D.push(recepteur);
        }
    }



    // Mettre les objets 3D sur la scène
    objScene3D.tabObjets3D = tabObjets3D;

    return objScene3D;
}
     
function creerCube(objgl) {
    var tabVertex = new Array();

    // Face avant pleine
    tabVertex[0] = [
            0.0,  0.0,  0.5, // Centre du plan
            0.5,  0.5,  0.5,
           -0.5,  0.5,  0.5,
           -0.5, -0.5,  0.5,
            0.5, -0.5,  0.5,
            0.5,  0.5,  0.5
    ];

    // Face arrère pleine
    tabVertex[1] = [
            0.0,  0.0, -0.5, // Centre du plan
            0.5,  0.5, -0.5,
           -0.5,  0.5, -0.5,
           -0.5, -0.5, -0.5,
            0.5, -0.5, -0.5,
            0.5,  0.5, -0.5
    ];

    // Face du dessus pleine
    tabVertex[2] = [
            0.0,  0.5,  0.0, // Centre du plan
            0.5,  0.5,  0.5,
           -0.5,  0.5,  0.5,
           -0.5,  0.5, -0.5,
            0.5,  0.5, -0.5,
            0.5,  0.5,  0.5
    ];

    // Face du dessous pleine
    tabVertex[3] = [
            0.0, -0.5,  0.0, // Centre du plan
            0.5, -0.5,  0.5,
           -0.5, -0.5,  0.5,
           -0.5, -0.5, -0.5,
            0.5, -0.5, -0.5,
            0.5, -0.5,  0.5
    ];

    // Face de droite pleine
    tabVertex[4] = [
            0.5,  0.0,  0.0, // Centre du plan
            0.5,  0.5,  0.5,
            0.5, -0.5,  0.5,
            0.5, -0.5, -0.5,
            0.5,  0.5, -0.5,
            0.5,  0.5,  0.5
    ];

    // Face de gauche pleine
    tabVertex[5] = [
           -0.5,  0.0,  0.0, // Centre du plan
           -0.5,  0.5,  0.5,
           -0.5, -0.5,  0.5,
           -0.5, -0.5, -0.5,
           -0.5,  0.5, -0.5,
           -0.5,  0.5,  0.5
    ];

    // Contour avant
    tabVertex[6] = [
            0.5,  0.5,  0.5,
           -0.5,  0.5,  0.5,
           -0.5, -0.5,  0.5,
            0.5, -0.5,  0.5
    ];

    // Contour arrière
    tabVertex[7] = [
            0.5,  0.5, -0.5,
           -0.5,  0.5, -0.5,
           -0.5, -0.5, -0.5,
            0.5, -0.5, -0.5
    ];

    // Droites reliées aux 2 faces
    tabVertex[8] = [
            0.5,  0.5, -0.5,  0.5,  0.5,  0.5,
           -0.5,  0.5, -0.5, -0.5,  0.5,  0.5,
            0.5, -0.5, -0.5,  0.5, -0.5,  0.5,
           -0.5, -0.5, -0.5, -0.5, -0.5,  0.5
    ];

    // Création des tampons
    var tabObjCube = new Array();
    for (var i = 0; i < 9; i++) {
        tabObjCube[i] = objgl.createBuffer();
        objgl.bindBuffer(objgl.ARRAY_BUFFER, tabObjCube[i]);
        objgl.bufferData(objgl.ARRAY_BUFFER, new Float32Array(tabVertex[i]), objgl.STATIC_DRAW);
        tabObjCube[i].typeDessin = (i < 6) ? objgl.TRIANGLE_FAN : ((i < 8) ? objgl.LINE_LOOP : objgl.LINES);
    }

    return tabObjCube;
}

function creerCouleurs(objgl, type) {
    var tabCouleurs = new Array();
    var couleur = [0.0, 0.0, 0.0, 1.0];


    switch (type) {
    case 0:
        couleur = [1.0, 1.0, 1.0, 1.0]; // Blanc
        break;
    case 1: // Couleurs face avant pleine
        couleur = [1.0, 1.0, 1.0, 1.0]; // Blanc
        break;
    case 2: 
        couleur = [1.0, 1.0, 1.0, 1.0]; // Noir
        break;
    case 3: 
        couleur = [1.0, 0.0, 0.0, 1.0]; // Red
        break;
    default:
        couleur = [1.0, 1.0, 1.0, 1.0]; // Noir
        break;
            
    }

    tabCouleurs[0] = []; // Blanc 
    for (var i = 0; i < 6; i++)
        tabCouleurs[0] = tabCouleurs[0].concat(couleur); // Rouge

    // Couleurs face arrière pleine
    tabCouleurs[1] = []; // Blanc
    for (var i = 0; i < 6; i++)
        tabCouleurs[1] = tabCouleurs[1].concat(couleur); // Vert

    // Couleurs face du dessus
    tabCouleurs[2] = []; // Blanc
    for (var i = 0; i < 6; i++)
        tabCouleurs[2] = tabCouleurs[2].concat(couleur); // Bleu

    // Couleurs face du dessous
    tabCouleurs[3] = []; // Blanc
    for (var i = 0; i < 6; i++)
        tabCouleurs[3] = tabCouleurs[3].concat(couleur); // Cyan

    // Couleurs face de droite
    tabCouleurs[4] = []; // Blanc
    for (var i = 0; i < 6; i++)
        tabCouleurs[4] = tabCouleurs[4].concat(couleur); // Magenta

    // Couleurs face de gauche
    tabCouleurs[5] = []; // Blanc
    for (var i = 0; i < 6; i++)
        tabCouleurs[5] = tabCouleurs[5].concat(couleur); // Jaune

    // Couleurs contour avant
    tabCouleurs[6] = [];
    for (var i = 0; i < 4; i++)
        tabCouleurs[6] = tabCouleurs[6].concat([0.0, 0.0, 0.0, 1.0]); // Noir

    // Couleurs contour arrière
    tabCouleurs[7] = tabCouleurs[6];

    // Couleurs droites reliées aux 2 faces
    tabCouleurs[8] = tabCouleurs[6].concat(tabCouleurs[6]);

    // Création des tampons
    var tabObjCouleursCube = new Array();
    for (var i = 0; i < 9; i++) {
        tabObjCouleursCube[i] = objgl.createBuffer();
        objgl.bindBuffer(objgl.ARRAY_BUFFER, tabObjCouleursCube[i]);
        objgl.bufferData(objgl.ARRAY_BUFFER, new Float32Array(tabCouleurs[i]), objgl.STATIC_DRAW);

    }
    return tabObjCouleursCube;
}

window.initScene3D = initScene3D;