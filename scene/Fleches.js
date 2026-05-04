import { WebIO } from 'https://cdn.jsdelivr.net/npm/@gltf-transform/core/+esm';

// Crée une liste de flèches à partir du modèle 3D de la flèche
async function initFleches() {
    
    let fleches = [];

    const io = new WebIO();
    const model = await io.read('modeles/fleche/fleche.gltf'); 

    const root = model.getRoot();
    const mesh = root.listMeshes()[0];
    const primitive = mesh.listPrimitives()[0];


    for (let i = 0; i < nbFleches; i++) {
        let fleche = new Object();
        fleche.positions = primitive.getAttribute('POSITION').getArray();
        fleche.indices = primitive.getIndices().getArray();
        fleches.push(fleche);
    }

    return fleches;
}


function creerFleche(objgl, positionsArray, indicesArray) {
    var objet3D = new Object();

    // Vertex 
    const vertexBuffer = objgl.createBuffer();
    objgl.bindBuffer(objgl.ARRAY_BUFFER, vertexBuffer);
    objgl.bufferData(objgl.ARRAY_BUFFER, positionsArray, objgl.STATIC_DRAW);

    // Index
    const indices16 = indicesArray instanceof Uint16Array ? indicesArray : new Uint16Array(indicesArray);
    const indexBuffer = objgl.createBuffer();
    objgl.bindBuffer(objgl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    objgl.bufferData(objgl.ELEMENT_ARRAY_BUFFER, indices16, objgl.STATIC_DRAW);

    indexBuffer.intNbTriangles = indicesArray.length / 3;
    indexBuffer.intNbDroites = 0;

    // Couleur (toute les flèches sont rouges)
    const couleurs = objgl.createBuffer();
    objgl.bindBuffer(objgl.ARRAY_BUFFER, couleurs);

    const nbVertices = positionsArray.length / 3;
    const dataCouleurs = new Float32Array(nbVertices * 4);

    for (let i = 0; i < nbVertices; i++) {
        dataCouleurs.set([1.0, 0.0, 0.0, 1.0], i * 4); // red arrow
    }

    objgl.bufferData(objgl.ARRAY_BUFFER, dataCouleurs, objgl.STATIC_DRAW);

    objet3D.vertex = vertexBuffer;
    objet3D.couleurs = couleurs;
    objet3D.maillage = indexBuffer;
    objet3D.transformations = creerTransformations();

    return objet3D;
}

// Initialise une flèche - positionne la flèche dans une case vide, l'oriente vers le trésor et l'ajoute à la liste des objets 3D
function initFleche(fleche, i) {

        //Positionnement de la flèche dans une case vide
        let position = trouveCaseVide(matrice, 4);
        setPositionsXYZ([position[0], 1.2, position[1]], fleche.transformations);
        fleche.gridX = position[0];
        fleche.gridZ = position[1];

        //Mise à l'échelle de la flèche
        setEchellesXYZ([0.2, 0.2, 0.2], fleche.transformations);

        // Orientation de la flèche vers le trésor
        orienterFlecheVersPoint(fleche);

        // Calcul de la matrice de modèle pour la flèche
        fleche.matModele = mat4.create();
        mat4.identity(fleche.matModele);
        mat4.translate(fleche.matModele, getPositionsXYZ(fleche.transformations));
        mat4.scale(fleche.matModele, getEchellesXYZ(fleche.transformations));
        mat4.rotateY(fleche.matModele, getAngleY(fleche.transformations) * Math.PI / 180);

        // Marquer flèche comme spécial pour qu'elle soit invisible en vue aérienne
        fleche.estSpecial = true;

        // Ajouter la flèche à la liste des objets 3D
        tabObjets3D.push(fleche);
} 

// Oriente une flèche vers le trésor
function orienterFlecheVersPoint(arrow) {
    const pos = getPositionsXYZ(arrow.transformations);
    const posTresor = getPositionsXYZ(tresorObj.transformations);

    const dx = posTresor[0] - pos[0];
    const dz = posTresor[2] - pos[2];

    // Calcule de l'angle en radians entre la flèche et le trésor et conversion en degrés
    const angle = -Math.atan2(dz, dx); // radians
    const angleDeg = angle * 180 / Math.PI;

    // Orientation de la flèche vers le trésor
    setAngleY(angleDeg, arrow.transformations);
}

// Exportation des fonctions (nécessaire parce que Fleches.js est un module)
window.initFleches = initFleches;
window.initFleche = initFleche;
window.creerFleche = creerFleche;
window.orienterFlecheVersPoint = orienterFlecheVersPoint;