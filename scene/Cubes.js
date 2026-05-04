/** --- Cubes.js ---
 * Ce fichier contient la logique liée à la création et à la gestion des cubes (qui composent les murs et le sol) dans la scène 3D.
 * @author Zachary Luheshi
 */

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
    case 2 || 6 || 7: 
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

function initCubes(objgl) {
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
            objet3D.gridX = i;
            objet3D.gridZ = j;
            tabObjets3D.push(objet3D);
        }
    }
}