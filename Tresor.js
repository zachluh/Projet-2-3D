var positionTresor = null;
var tresorObj = null;
var tresorCollecte = false;

function choisirPositionTresor() {
    // chose a position if it is an empty space
    // var corridors = [];
    // for (var i = 1; i < matrice.length - 1; i++) {
    //     for (var j = 1; j < matrice[i].length - 1; j++) {
    //         if (matrice[i][j] === 0) corridors.push([i, j]);
    //     }
    // }
    // return corridors[Math.floor(Math.random() * corridors.length)];
    return [12, 15]; // hard coded for test
}

//yes i vibe coded the treasure sowwy (remove when remise)
function creerVertexTresor(objgl) {
    var bw = 0.35, bd = 0.35, bh = 0.30; // body half-extents & height
    var lw = 0.37, ld = 0.37, lh = 0.15; // lid (slightly wider)
    var ly = bh;                           // lid bottom = body top

    var tabVertex = [
        // Body front
        [ 0.0, bh/2, bd,   bw, bh, bd,  -bw, bh, bd,  -bw, 0, bd,   bw, 0, bd,   bw, bh, bd  ],
        // Body back
        [ 0.0, bh/2,-bd,   bw, bh,-bd,  -bw, bh,-bd,  -bw, 0,-bd,   bw, 0,-bd,   bw, bh,-bd  ],
        // Body right
        [ bw, bh/2, 0,     bw, bh, bd,   bw, bh,-bd,   bw, 0,-bd,   bw, 0, bd,   bw, bh, bd  ],
        // Body left
        [-bw, bh/2, 0,    -bw, bh, bd,  -bw, bh,-bd,  -bw, 0,-bd,  -bw, 0, bd,  -bw, bh, bd  ],
        // Body top (gold seam)
        [ 0, bh, 0,        bw, bh, bd,  -bw, bh, bd,  -bw, bh,-bd,  bw, bh,-bd,  bw, bh, bd  ],
        // Lid front
        [ 0.0, ly+lh/2, ld,   lw, ly+lh, ld,  -lw, ly+lh, ld,  -lw, ly, ld,   lw, ly, ld,   lw, ly+lh, ld  ],
        // Lid back
        [ 0.0, ly+lh/2,-ld,   lw, ly+lh,-ld,  -lw, ly+lh,-ld,  -lw, ly,-ld,   lw, ly,-ld,   lw, ly+lh,-ld  ],
        // Lid right
        [ lw, ly+lh/2, 0,     lw, ly+lh, ld,   lw, ly+lh,-ld,   lw, ly,-ld,   lw, ly, ld,   lw, ly+lh, ld  ],
        // Lid left
        [-lw, ly+lh/2, 0,    -lw, ly+lh, ld,  -lw, ly+lh,-ld,  -lw, ly,-ld,  -lw, ly, ld,  -lw, ly+lh, ld  ],
        // Lid top
        [ 0, ly+lh, 0,        lw, ly+lh, ld,  -lw, ly+lh, ld,  -lw, ly+lh,-ld,  lw, ly+lh,-ld,  lw, ly+lh, ld ]
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

function creerCouleursTresor(objgl) {
    var corpsC      = [0.55, 0.27, 0.07, 1.0]; // saddlebrown
    var couvC       = [0.36, 0.18, 0.05, 1.0]; // dark brown
    var seamC       = [0.85, 0.65, 0.13, 1.0]; // gold seam
    var lidTopC     = [0.72, 0.53, 0.04, 1.0]; // gold lid

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

function initTresor(objgl) {
    positionTresor = choisirPositionTresor();
    tresorCollecte = false;

    tresorObj = new Object();
    tresorObj.vertex        = creerVertexTresor(objgl);
    tresorObj.couleurs      = creerCouleursTresor(objgl);
    tresorObj.transformations = creerTransformations();
    tresorObj.binVisible    = true;

    setPositionsXYZ([positionTresor[0], 0.5, positionTresor[1]], tresorObj.transformations);
}

function dessinerTresor(objgl, objProgShaders) {
    if (!tresorObj || !tresorObj.binVisible) return;

    var trans = tresorObj.transformations;
    var matModeleVue = mat4.create();
    mat4.identity(matModeleVue);
    mat4.lookAt(getPositionsCameraXYZ(joueur),
                getCiblesCameraXYZ(joueur),
                getOrientationsXYZ(joueur),
                matModeleVue);
    mat4.translate(matModeleVue, getPositionsXYZ(trans));

    objgl.uniformMatrix4fv(objProgShaders.matModeleVue, false, matModeleVue);

    for (var i = 0; i < tresorObj.vertex.length; i++) {
        objgl.bindBuffer(objgl.ARRAY_BUFFER, tresorObj.vertex[i]);
        objgl.vertexAttribPointer(objProgShaders.posVertex, 3, objgl.FLOAT, false, 0, 0);

        objgl.bindBuffer(objgl.ARRAY_BUFFER, tresorObj.couleurs[i]);
        objgl.vertexAttribPointer(objProgShaders.couleurVertex, 4, objgl.FLOAT, false, 0, 0);

        objgl.drawArrays(tresorObj.vertex[i].typeDessin, 0, tresorObj.vertex[i].nbVertex);
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
