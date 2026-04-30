import { WebIO } from 'https://cdn.jsdelivr.net/npm/@gltf-transform/core/+esm';

let positionsRecepteurs = [];

async function initTeleporteurs() {
    

    const io = new WebIO();
    const model = await io.read('modeles/teleporteur/scene.gltf'); // or .gltf

    const root = model.getRoot();
    const mesh = root.listMeshes()[0];
    const primitive = mesh.listPrimitives()[0];


    const positions = primitive.getAttribute('POSITION').getArray();
    const texCoords = primitive.getAttribute('TEXCOORD_0').getArray();
    const indices = primitive.getIndices().getArray();

    let teleporteurs = [];

    for (let i = 0; i < (nbTransporteurs + nbRecepteurs); i++) {
        let teleporteur = new Object();
        teleporteur.positions = positions;
        teleporteur.texCoords = texCoords;
        teleporteur.indices = indices;
        teleporteurs.push(teleporteur);
    }

    return teleporteurs;
}

function creerTeleporter(objgl, positions, texCoords, indices, imageSrc) {
    var objet3D = new Object();

    // Position buffer
    const vertexBuffer = objgl.createBuffer();
    objgl.bindBuffer(objgl.ARRAY_BUFFER, vertexBuffer);
    objgl.bufferData(objgl.ARRAY_BUFFER, positions, objgl.STATIC_DRAW);

    // UV buffer
    const uvBuffer = objgl.createBuffer();
    objgl.bindBuffer(objgl.ARRAY_BUFFER, uvBuffer);
    objgl.bufferData(objgl.ARRAY_BUFFER, texCoords, objgl.STATIC_DRAW);

    // Index buffer — force Uint16Array so drawElements(UNSIGNED_SHORT) reads correctly
    // (gltf-transform may return Uint32Array depending on the model's componentType)
    const indices16 = indices instanceof Uint16Array ? indices : new Uint16Array(indices);
    const indexBuffer = objgl.createBuffer();
    objgl.bindBuffer(objgl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    objgl.bufferData(objgl.ELEMENT_ARRAY_BUFFER, indices16, objgl.STATIC_DRAW);

    indexBuffer.intNbTriangles = indices.length / 3;
    indexBuffer.intNbDroites = 0;

    // Texture
    const texture = objgl.createTexture();
    const image = new Image();

    image.src = imageSrc;

    image.onload = () => {
        objgl.bindTexture(objgl.TEXTURE_2D, texture);
        objgl.texImage2D(objgl.TEXTURE_2D, 0, objgl.RGBA, objgl.RGBA, objgl.UNSIGNED_BYTE, image);
        objgl.generateMipmap(objgl.TEXTURE_2D);
    };

    objet3D.vertex = vertexBuffer;
    objet3D.uv = uvBuffer;              // NEW
    objet3D.texture = texture;          // NEW
    objet3D.maillage = indexBuffer;
    objet3D.transformations = creerTransformations();
    objet3D.estTexturee = true;              

    return objet3D;
}

window.initTeleporteurs = initTeleporteurs;
window.creerTeleporter = creerTeleporter;
window.positionsRecepteurs = positionsRecepteurs;