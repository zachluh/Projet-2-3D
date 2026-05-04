/** --- Tresor.js ---
 * Ce fichier contient la logique liée à la création et à la gestion du trésor dans la scène 3D.
 * @author Ken-Li Roux
 */


// Crée les vertex du coeur 8-bit : 6 rectangles (rangées de pixels) × 2 faces (avant et arrière)
// Grille 7×5 pixels : rangée 0 = 2 bosses, rangées 1-2 = pleine largeur, rangée 3 = 5 pixels, rangée 4 = pointe
function creerVertexTresor(objgl) {
    // Chaque entrée : [x0, x1, y0, y1]
    var runs = [
        [-0.25, -0.05,  0.15,  0.25],  
        [ 0.05,  0.25,  0.15,  0.25],  
        [-0.35,  0.35,  0.05,  0.15],  
        [-0.35,  0.35, -0.05,  0.05],  
        [-0.25,  0.25, -0.15, -0.05],  
        [-0.05,  0.05, -0.25, -0.15],  
    ];

    // 20 segments du périmètre extérieur tracés dans le sens horaire
    var edges = [
        [-0.25,  0.25, -0.05,  0.25],  
        [-0.05,  0.25, -0.05,  0.15],  
        [-0.05,  0.15,  0.05,  0.15],  
        [ 0.05,  0.15,  0.05,  0.25],  
        [ 0.05,  0.25,  0.25,  0.25],  
        [ 0.25,  0.25,  0.25,  0.15],  
        [ 0.25,  0.15,  0.35,  0.15],  
        [ 0.35,  0.15,  0.35, -0.05],  
        [ 0.35, -0.05,  0.25, -0.05],  
        [ 0.25, -0.05,  0.25, -0.15],  
        [ 0.25, -0.15,  0.05, -0.15],  
        [ 0.05, -0.15,  0.05, -0.25],  
        [ 0.05, -0.25, -0.05, -0.25],  
        [-0.05, -0.25, -0.05, -0.15],  
        [-0.05, -0.15, -0.25, -0.15],  
        [-0.25, -0.15, -0.25, -0.05], 
        [-0.25, -0.05, -0.35, -0.05],  
        [-0.35, -0.05, -0.35,  0.15], 
        [-0.35,  0.15, -0.25,  0.15],  
        [-0.25,  0.15, -0.25,  0.25],  
    ];

    function makeRect(x0, x1, y0, y1, z) {
        var cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
        return [cx, cy, z,  x1, y1, z,  x0, y1, z,  x0, y0, z,  x1, y0, z,  x1, y1, z];
    }

    // Relie le segment (x0,y0)→(x1,y1) entre la face avant (z=+0.05) et la face arrière (z=−0.05)
    function makeEdge(x0, y0, x1, y1) {
        var cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
        return [cx, cy, 0,  x0, y0, +0.05,  x1, y1, +0.05,  x1, y1, -0.05,  x0, y0, -0.05,  x0, y0, +0.05];
    }

    var tabVertex = [];
    for (var i = 0; i < runs.length; i++)
        tabVertex.push(makeRect(runs[i][0], runs[i][1], runs[i][2], runs[i][3],  0.05)); // 6 faces avant
    for (var i = 0; i < runs.length; i++)
        tabVertex.push(makeRect(runs[i][0], runs[i][1], runs[i][2], runs[i][3], -0.05)); // 6 faces arrière
    for (var i = 0; i < edges.length; i++)
        tabVertex.push(makeEdge(edges[i][0], edges[i][1], edges[i][2], edges[i][3]));    // 20 faces latérales

    var tabObjTresor = [];
    for (var i = 0; i < tabVertex.length; i++) {
        tabObjTresor[i] = objgl.createBuffer();
        objgl.bindBuffer(objgl.ARRAY_BUFFER, tabObjTresor[i]);
        objgl.bufferData(objgl.ARRAY_BUFFER, new Float32Array(tabVertex[i]), objgl.STATIC_DRAW);
        tabObjTresor[i].typeDessin  = objgl.TRIANGLE_FAN;
        tabObjTresor[i].intNbVertex = 6;
    }
    return tabObjTresor;
}

// Crée les couleurs du coeur : couleur aléatoire pour les 32 faces (6 avant + 6 arrière + 20 latérales)
function creerCouleursTresor(objgl) {
    var couleur = [Math.random(), Math.random(), Math.random(), 1.0];

    var tabCouleursTresor = [];
    for (var i = 0; i < 32; i++) {
        var arr = [];
        for (var k = 0; k < 6; k++) arr = arr.concat(couleur);
        tabCouleursTresor[i] = objgl.createBuffer();
        objgl.bindBuffer(objgl.ARRAY_BUFFER, tabCouleursTresor[i]);
        objgl.bufferData(objgl.ARRAY_BUFFER, new Float32Array(arr), objgl.STATIC_DRAW);
    }
    return tabCouleursTresor;
}

// Angle de rotation courant du coeur (en degrés), incrémenté à chaque frame par animerTresor
var angleTresor = 0;

// Fait tourner le coeur autour de son axe vertical (Y) à chaque frame
function animerTresor() {
    angleTresor += 2;
    if (objScene3D && tresorObj && !tresorCollecte) {
        mat4.identity(tresorObj.matModele);
        mat4.translate(tresorObj.matModele, getPositionsXYZ(tresorObj.transformations));
        mat4.rotateY(tresorObj.matModele, angleTresor * Math.PI / 180);
    }
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

    

    setPositionsXYZ([positionTresor[0], 0.7, positionTresor[1]], tresorObj.transformations);
    tresorObj.gridX = positionTresor[0];
    tresorObj.gridZ = positionTresor[1];

    tresorObj.matModele = mat4.create();
    mat4.identity(tresorObj.matModele);
    mat4.translate(tresorObj.matModele, getPositionsXYZ(tresorObj.transformations));
}

