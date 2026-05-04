/** --- Tresor.js ---
 * Ce fichier contient la logique liée à la création et à la gestion du trésor dans la scène 3D.
 * @author Ken-Li Roux
 */


// Creer les vertex du trésor : 10 faces (corps, couvercle, coutures et dessus du couvercle)
function creerVertexTresor(objgl) {
    var tabVertex = [
        [ 0.0,   0.15,  0.35,   0.35,  0.3,  0.35,  -0.35,  0.3,  0.35,  -0.35, 0.0,  0.35,   0.35, 0.0,  0.35,   0.35,  0.3,  0.35 ],
        [ 0.0,   0.15, -0.35,   0.35,  0.3, -0.35,  -0.35,  0.3, -0.35,  -0.35, 0.0, -0.35,   0.35, 0.0, -0.35,   0.35,  0.3, -0.35 ],
        [ 0.35,  0.15,  0.0,    0.35,  0.3,  0.35,   0.35,  0.3, -0.35,   0.35, 0.0, -0.35,   0.35, 0.0,  0.35,   0.35,  0.3,  0.35 ],
        [-0.35,  0.15,  0.0,   -0.35,  0.3,  0.35,  -0.35,  0.3, -0.35,  -0.35, 0.0, -0.35,  -0.35, 0.0,  0.35,  -0.35,  0.3,  0.35 ],
        [ 0.0,   0.3,   0.0,    0.35,  0.3,  0.35,  -0.35,  0.3,  0.35,  -0.35, 0.3, -0.35,   0.35, 0.3, -0.35,   0.35,  0.3,  0.35 ],
        [ 0.0,   0.375, 0.37,   0.37,  0.45, 0.37,  -0.37,  0.45, 0.37,  -0.37, 0.3,  0.37,   0.37, 0.3,  0.37,   0.37,  0.45, 0.37 ],
        [ 0.0,   0.375,-0.37,   0.37,  0.45,-0.37,  -0.37,  0.45,-0.37,  -0.37, 0.3, -0.37,   0.37, 0.3, -0.37,   0.37,  0.45,-0.37 ],
        [ 0.37,  0.375, 0.0,    0.37,  0.45, 0.37,   0.37,  0.45,-0.37,   0.37, 0.3, -0.37,   0.37, 0.3,  0.37,   0.37,  0.45, 0.37 ],
        [-0.37,  0.375, 0.0,   -0.37,  0.45, 0.37,  -0.37,  0.45,-0.37,  -0.37, 0.3, -0.37,  -0.37, 0.3,  0.37,  -0.37,  0.45, 0.37 ],
        [ 0.0,   0.45,  0.0,    0.37,  0.45, 0.37,  -0.37,  0.45, 0.37,  -0.37, 0.45,-0.37,   0.37, 0.45,-0.37,   0.37,  0.45, 0.37 ]
    ];

    var tabObjTresor = [];
    for (var i = 0; i < tabVertex.length; i++) {
        tabObjTresor[i] = objgl.createBuffer();
        objgl.bindBuffer(objgl.ARRAY_BUFFER, tabObjTresor[i]);
        objgl.bufferData(objgl.ARRAY_BUFFER, new Float32Array(tabVertex[i]), objgl.STATIC_DRAW);
        tabObjTresor[i].typeDessin = objgl.TRIANGLE_FAN;
        tabObjTresor[i].nbVertex   = 6;
    }
    return tabObjTresor;
}

// Crée les couleurs du trésor : différentes couleurs pour le corps, le couvercle, les coutures et le dessus du couvercle
function creerCouleursTresor(objgl) {
    var corpsC      = [0.55, 0.27, 0.07, 1.0]; // brun
    var couvC       = [0.36, 0.18, 0.05, 1.0]; // brun foncé
    var seamC       = [0.85, 0.65, 0.13, 1.0]; // couture dorée
    var lidTopC     = [0.72, 0.53, 0.04, 1.0]; // dessus du couvercle doré 

    var palette = [corpsC, corpsC, corpsC, corpsC, seamC,
                   couvC,  couvC,  couvC,  couvC,  lidTopC];

    var tabCouleursTresor = [];
    for (var i = 0; i < palette.length; i++) {
        var arr = [];
        for (var k = 0; k < 6; k++) arr = arr.concat(palette[i]);
        tabCouleursTresor[i] = objgl.createBuffer();
        objgl.bindBuffer(objgl.ARRAY_BUFFER, tabCouleursTresor[i]);
        objgl.bufferData(objgl.ARRAY_BUFFER, new Float32Array(arr), objgl.STATIC_DRAW);
    }
    return tabCouleursTresor;
}

// Initialise le trésor : trouve une position vide dans la matrice, crée les buffers de vertex et de couleurs, et ajoute le trésor à la scène
function initTresor(objgl) {
    positionTresor = trouveCaseVide(matrice, 5);
    console.log("Position du trésor : " + positionTresor); 
    tresorCollecte = false;

    tresorObj = new Object();
    tresorObj.vertex        = creerVertexTresor(objgl);
    tresorObj.couleurs      = creerCouleursTresor(objgl);
    tresorObj.transformations = creerTransformations();
    tresorObj.binVisible    = true;

    

    setPositionsXYZ([positionTresor[0], 0.5, positionTresor[1]], tresorObj.transformations);
    tresorObj.gridX = positionTresor[0];
    tresorObj.gridZ = positionTresor[1];

    tresorObj.matModele = mat4.create();
    mat4.identity(tresorObj.matModele);
    mat4.translate(tresorObj.matModele, getPositionsXYZ(tresorObj.transformations));
}

