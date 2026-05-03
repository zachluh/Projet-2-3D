import { WebIO } from 'https://cdn.jsdelivr.net/npm/@gltf-transform/core/+esm';

async function initTeleporteurs() {
    

    const io = new WebIO();
    const model = await io.read('modeles/teleporteur/scene.gltf'); // or .gltf

    const root = model.getRoot();
    const mesh = root.listMeshes()[0];
    const primitive = mesh.listPrimitives()[0];


    const positions = primitive.getAttribute('POSITION').getArray();
    const texCoords = primitive.getAttribute('TEXCOORD_0').getArray();
    const indices = primitive.getIndices().getArray();

    // Trouver le centre de l'objet pour centrer le pivot et faciliter les rotations + positionnement
    const vertexCount = positions.length / 3;
    let cx = 0, cy = 0, cz = 0;
    for (let i = 0; i < positions.length; i += 3) {
        cx += positions[i];
        cy += positions[i + 1];
        cz += positions[i + 2];
    }
    cx /= vertexCount; cy /= vertexCount; cz /= vertexCount;
    const centeredPositions = new Float32Array(positions.length);
    for (let i = 0; i < positions.length; i += 3) {
        centeredPositions[i]     = positions[i]     - cx;
        centeredPositions[i + 1] = positions[i + 1] - cy;
        centeredPositions[i + 2] = positions[i + 2] - cz;
    }

    let teleporteurs = [];

    for (let i = 0; i < (nbTransporteurs + nbRecepteurs); i++) {
        let teleporteur = new Object();
        teleporteur.positions = centeredPositions;
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
    objet3D.uv = uvBuffer;              
    objet3D.texture = texture;          
    objet3D.maillage = indexBuffer;
    objet3D.transformations = creerTransformations();
    objet3D.estTexturee = true;              

    return objet3D;
}

function initTeleporteur(teleporteur, i) {
    var teleporteurOuRecepteur = i < nbTransporteurs ? 6 : 7;  
    let positionTeleporteur = trouveCaseVide(matrice, teleporteurOuRecepteur);
    setPositionsXYZ([positionTeleporteur[0], 0.5, positionTeleporteur[1]], teleporteur.transformations);
    teleporteur.gridX = positionTeleporteur[0];
    teleporteur.gridZ = positionTeleporteur[1];
    setEchellesXYZ([0.1, 0.1, 0.2], teleporteur.transformations);
    setAngleX(90, teleporteur.transformations);
    setAngleZ(getAngleTeleporteurs(), teleporteur.transformations);

    teleporteur.matModele = mat4.create();
    mat4.identity(teleporteur.matModele);
    mat4.translate(teleporteur.matModele, getPositionsXYZ(teleporteur.transformations));
    mat4.rotateX(teleporteur.matModele, getAngleX(teleporteur.transformations) * Math.PI / 180);
    mat4.rotateZ(teleporteur.matModele, getAngleZ(teleporteur.transformations) * Math.PI / 180);
    mat4.scale(teleporteur.matModele, getEchellesXYZ(teleporteur.transformations));
    teleporteur.estSpecial = true;
    teleporteur.estTeleporteur = true;
    if (i >= nbTransporteurs) {
        teleporteur.estInversee = true;
        positionsRecepteurs.push(positionTeleporteur); 
    }
    tabObjets3D.push(teleporteur);
}

function animationTeleporteur() {
    angleTeleporteurs += 5;
    if (objScene3D) {
        for (var i = 0; i < objScene3D.tabObjets3D.length; i++) {
            var obj = objScene3D.tabObjets3D[i];
            if (!obj.estTeleporteur) continue;
            mat4.identity(obj.matModele);
            mat4.translate(obj.matModele, getPositionsXYZ(obj.transformations));
            mat4.rotateX(obj.matModele, getAngleX(obj.transformations) * Math.PI / 180);
            mat4.rotateZ(obj.matModele, getAngleTeleporteurs() * Math.PI / 180);
            mat4.scale(obj.matModele, getEchellesXYZ(obj.transformations));
        }
    }
}

window.initTeleporteurs = initTeleporteurs;
window.initTeleporteur = initTeleporteur;
window.creerTeleporter = creerTeleporter;
window.positionsRecepteurs = positionsRecepteurs;
window.getAngleTeleporteurs = function() { return angleTeleporteurs; };
window.animationTeleporteur = animationTeleporteur;