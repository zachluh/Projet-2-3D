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
        tabObjCube[i].typeDessin  = (i < 6) ? objgl.TRIANGLE_FAN : ((i < 8) ? objgl.LINE_LOOP : objgl.LINES);
        tabObjCube[i].intNbVertex = tabVertex[i].length / 3;
    }

    return tabObjCube;
}

function creerCouleurs(objgl, type) {
    var couleur = (type === 3) ? [1.0, 0.0, 0.0, 1.0] : [1.0, 1.0, 1.0, 1.0];
    var noir = [0.0, 0.0, 0.0, 1.0];

    // Faces 0-5 : 6 sommets chacune ; contours 6-7 : 4 sommets ; arêtes 8 : 8 sommets
    var vertexCounts = [6, 6, 6, 6, 6, 6, 4, 4, 8];

    var tabObjCouleursCube = new Array();
    for (var i = 0; i < 9; i++) {
        var base = (i < 6) ? couleur : noir;
        var data = [];
        for (var k = 0; k < vertexCounts[i]; k++) data = data.concat(base);
        tabObjCouleursCube[i] = objgl.createBuffer();
        objgl.bindBuffer(objgl.ARRAY_BUFFER, tabObjCouleursCube[i]);
        objgl.bufferData(objgl.ARRAY_BUFFER, new Float32Array(data), objgl.STATIC_DRAW);
    }
    return tabObjCouleursCube;
}

// UV pour une face TRIANGLE_FAN à 6 sommets : centre(0.5,0.5), TR, TL, BL, BR, TR (fermeture)
var _uvFaceCube = new Float32Array([
    0.5, 0.5,
    1.0, 0.0,
    0.0, 0.0,
    0.0, 1.0,
    1.0, 1.0,
    1.0, 0.0
]);

// Un seul tampon UV partagé entre les 6 faces (données identiques)
function creerUVsCube(objgl) {
    var uvBuffer = objgl.createBuffer();
    objgl.bindBuffer(objgl.ARRAY_BUFFER, uvBuffer);
    objgl.bufferData(objgl.ARRAY_BUFFER, _uvFaceCube, objgl.STATIC_DRAW);
    return [uvBuffer, uvBuffer, uvBuffer, uvBuffer, uvBuffer, uvBuffer];
}

function initCubes(objgl, texCubes) {
    cubesMatrice = []; // réinitialiser le tableau de référence
    for (var i = 0; i < matrice.length; i++) {
        cubesMatrice[i] = [];
        for (var j = 0; j < matrice[i].length; j++) {
            var objet3D = new Object();
            var type = matrice[i][j];
            objet3D.vertex            = creerCube(objgl);
            objet3D.couleurs           = creerCouleurs(objgl, type);
            objet3D.texture           = texCubes[type] || texCubes[0];
            objet3D.estTextureeArrays = false;
            objet3D.maillage          = null;
            objet3D.transformations   = creerTransformations();
            var y = (type === 1 || type === 2) ? 1 : 0;
            setPositionsXYZ([i, y, j], objet3D.transformations);
            objet3D.matModele = mat4.create();
            mat4.identity(objet3D.matModele);
            mat4.translate(objet3D.matModele, getPositionsXYZ(objet3D.transformations));
            objet3D.gridX = i;
            objet3D.gridZ = j;
            cubesMatrice[i][j] = objet3D;
            tabObjets3D.push(objet3D);
        }
    }
}