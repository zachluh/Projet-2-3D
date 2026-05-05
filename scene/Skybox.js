/** --- Skybox.js ---
 * Crée une boîte de ciel (5 faces texturées) autour du dédale.
 * Visible depuis la vue aérienne comme horizon; fournit le fond en vue première personne.
 * @author Zachary Luheshi, Ken-Li Roux
 *
 * Fichiers requis (à placer dans textures/) :
 *   textures/skybox_haut.jpg  — dessus de la boîte (ciel)
 *   textures/skybox_cote.jpg  — 4 faces latérales (horizon)
 */

// UV standard pour un quad TRIANGLE_FAN à 4 sommets (BL → BR → TR → TL)
var _uvQuadSkybox = new Float32Array([0.0, 1.0,  1.0, 1.0,  1.0, 0.0,  0.0, 0.0]);

function creerSkybox(objgl, texHaut, texCote) {
    var objets = [];

    // Boîte 5 unités au-delà du dédale 31×31, du sol (Y=-2) au ciel (Y=50)
    var xMin = -5,  xMax = 36; 
    var zMin = -5,  zMax = 36;
    var yMin = -2,  yMax = 50;

    var faces = [
        // Dessus (ciel)
        { verts: [xMin,yMax,zMin,  xMax,yMax,zMin,  xMax,yMax,zMax,  xMin,yMax,zMax],  tex: texHaut },
        // Nord  (Z = zMin, vue de l'intérieur)
        { verts: [xMin,yMin,zMin,  xMax,yMin,zMin,  xMax,yMax,zMin,  xMin,yMax,zMin],  tex: texCote },
        // Sud   (Z = zMax)
        { verts: [xMax,yMin,zMax,  xMin,yMin,zMax,  xMin,yMax,zMax,  xMax,yMax,zMax],  tex: texCote },
        // Ouest (X = xMin)
        { verts: [xMin,yMin,zMax,  xMin,yMin,zMin,  xMin,yMax,zMin,  xMin,yMax,zMax],  tex: texCote },
        // Est   (X = xMax)
        { verts: [xMax,yMin,zMin,  xMax,yMin,zMax,  xMax,yMax,zMax,  xMax,yMax,zMin],  tex: texCote },
    ];

    for (var f = 0; f < faces.length; f++) {
        var obj = new Object();

        var vertexBuffer = objgl.createBuffer();
        objgl.bindBuffer(objgl.ARRAY_BUFFER, vertexBuffer);
        objgl.bufferData(objgl.ARRAY_BUFFER, new Float32Array(faces[f].verts), objgl.STATIC_DRAW);
        vertexBuffer.typeDessin  = objgl.TRIANGLE_FAN;
        vertexBuffer.intNbVertex = 4;

        var uvBuffer = objgl.createBuffer();
        objgl.bindBuffer(objgl.ARRAY_BUFFER, uvBuffer);
        objgl.bufferData(objgl.ARRAY_BUFFER, _uvQuadSkybox, objgl.STATIC_DRAW);

        obj.vertex            = [vertexBuffer];
        obj.uvCoords          = [uvBuffer];
        obj.texture           = faces[f].tex;
        obj.maillage          = null;
        obj.transformations   = creerTransformations();
        obj.matModele         = mat4.create();
        mat4.identity(obj.matModele);
        obj.binVisible        = true;
        obj.estSkybox         = true;
        obj.estTextureeArrays = true;
        obj.gridX             = 15;
        obj.gridZ             = 15;

        objets.push(obj);
    }

    return objets;
}
