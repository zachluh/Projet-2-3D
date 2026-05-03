import { WebIO } from 'https://cdn.jsdelivr.net/npm/@gltf-transform/core/+esm';

async function initFleches() {
    
    let fleches = [];

    const io = new WebIO();
    const model = await io.read('modeles/fleche/fleche.gltf'); // or .gltf

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

    // Vertex buffer
    const vertexBuffer = objgl.createBuffer();
    objgl.bindBuffer(objgl.ARRAY_BUFFER, vertexBuffer);
    objgl.bufferData(objgl.ARRAY_BUFFER, positionsArray, objgl.STATIC_DRAW);

    // Index buffer (maillage)
    const indices16 = indicesArray instanceof Uint16Array ? indicesArray : new Uint16Array(indicesArray);
    const indexBuffer = objgl.createBuffer();
    objgl.bindBuffer(objgl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    objgl.bufferData(objgl.ELEMENT_ARRAY_BUFFER, indices16, objgl.STATIC_DRAW);

    // VERY IMPORTANT: your renderer expects metadata on maillage
    indexBuffer.intNbTriangles = indicesArray.length / 3;
    indexBuffer.intNbDroites = 0;

    // Color buffer (same color for all vertices)
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

function initFleche(fleche, i) {
        let position = trouveCaseVide(matrice, 4);
        console.log("Position de la flèche " + i + ": " + position);
        setPositionsXYZ([position[0], 1.2, position[1]], fleche.transformations);
        if (i === 0) {
            setPositionsXYZ([12, 1.2, 15], fleche.transformations);
        }
        setEchellesXYZ([0.2, 0.2, 0.2], fleche.transformations); // Positionner la flèche au centre de la scène
        orienterFlecheVersPoint(fleche);
        fleche.matModele = mat4.create();
        mat4.identity(fleche.matModele);
        mat4.translate(fleche.matModele, getPositionsXYZ(fleche.transformations));
        mat4.scale(fleche.matModele, getEchellesXYZ(fleche.transformations));
        mat4.rotateY(fleche.matModele, getAngleY(fleche.transformations) * Math.PI / 180);
        fleche.estSpecial = true;
        tabObjets3D.push(fleche);
} 

function orienterFlecheVersPoint(arrow) {
    const pos = getPositionsXYZ(arrow.transformations);
    const posTresor = getPositionsXYZ(tresorObj.transformations);

    const dx = posTresor[0] - pos[0];
    const dz = posTresor[2] - pos[2];

    const angle = -Math.atan2(dz, dx); // radians
    const angleDeg = angle * 180 / Math.PI;

    console.log("Orientation de la flèche vers le trésor : " + angleDeg.toFixed(2) + "°");

    setAngleY(angleDeg, arrow.transformations);
}

window.initFleches = initFleches;
window.initFleche = initFleche;
window.creerFleche = creerFleche;
window.orienterFlecheVersPoint = orienterFlecheVersPoint;