/** --- Teleporteurs.js ---
 * Ce fichier contient la logique liée à la création et à la gestion des téléporteurs dans la scène 3D.
 * @author Zachary Luheshi
 */

import { WebIO } from 'https://cdn.jsdelivr.net/npm/@gltf-transform/core/+esm';

// Crée une liste de téléporteurs à partir du modèle 3D du téléporteur et centre le pivot de l'objet pour faciliter les rotations et positionnements
async function initTeleporteurs() {
    

    const io = new WebIO();
    const model = await io.read('modeles/teleporteur/scene.gltf'); 

    const root = model.getRoot();
    const mesh = root.listMeshes()[0];
    const primitive = mesh.listPrimitives()[0];


    const positions = primitive.getAttribute('POSITION').getArray();
    const texCoords = primitive.getAttribute('TEXCOORD_0').getArray();
    const indices = primitive.getIndices().getArray();

    // Trouver le centre de l'objet pour centrer le pivot
    const vertexCount = positions.length / 3;
    let cx = 0, cy = 0, cz = 0;

    for (let i = 0; i < positions.length; i += 3) {
        cx += positions[i];
        cy += positions[i + 1];
        cz += positions[i + 2];
    }

    // Moyenne des positions par axe = centre de l'axe
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

// Crée un objet 3D pour un téléporteur à partir de ses positions, coordonnées de texture, indices et source d'image pour la texture
function creerTeleporter(objgl, positions, texCoords, indices, imageSrc) {
    var objet3D = new Object();

    // Position 
    const vertexBuffer = objgl.createBuffer();
    objgl.bindBuffer(objgl.ARRAY_BUFFER, vertexBuffer);
    objgl.bufferData(objgl.ARRAY_BUFFER, positions, objgl.STATIC_DRAW);

    // UV b
    const uvBuffer = objgl.createBuffer();
    objgl.bindBuffer(objgl.ARRAY_BUFFER, uvBuffer);
    objgl.bufferData(objgl.ARRAY_BUFFER, texCoords, objgl.STATIC_DRAW);

    // Index buffer — forcer Uint16 pour éviter les problèmes de compatibilité
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

// Initialisation d'un téléporteur ou récepteur : trouver une position vide dans la matrice, positionner et orienter le téléporteur, et l'ajouter à la scène
function initTeleporteur(teleporteur, i) {

    // Déterminer si le téléporteur sera un transporteur ou un récepteur
    var teleporteurOuRecepteur = i < nbTransporteurs ? 6 : 7;  

    // Positionnement du téléporteur dans une case vide de la matrice
    let positionTeleporteur = trouveCaseVide(matrice, teleporteurOuRecepteur);
    setPositionsXYZ([positionTeleporteur[0], 0.5, positionTeleporteur[1]], teleporteur.transformations);
    teleporteur.gridX = positionTeleporteur[0];
    teleporteur.gridZ = positionTeleporteur[1];

    // Mise à l'échelle, orientation et transformation du téléporteur
    setEchellesXYZ([0.1, 0.1, 0.2], teleporteur.transformations);
    setAngleX(90, teleporteur.transformations);
    setAngleZ(getAngleTeleporteurs(), teleporteur.transformations);

    // Calcul de la matrice de modèle du téléporteur
    teleporteur.matModele = mat4.create();
    mat4.identity(teleporteur.matModele);
    mat4.translate(teleporteur.matModele, getPositionsXYZ(teleporteur.transformations));
    mat4.rotateX(teleporteur.matModele, getAngleX(teleporteur.transformations) * Math.PI / 180);
    mat4.rotateZ(teleporteur.matModele, getAngleZ(teleporteur.transformations) * Math.PI / 180);
    mat4.scale(teleporteur.matModele, getEchellesXYZ(teleporteur.transformations));
    teleporteur.estSpecial = true;
    teleporteur.estTeleporteur = true;

    // Si récepteur, inverser les couleurs et ajouter la position à la liste des positions de récepteurs pour pouvoir téléporter le joueur à ces positions plus tard
    if (i >= nbTransporteurs) {
        teleporteur.estInversee = true;
        positionsRecepteurs.push(positionTeleporteur); 
    }

    // Ajouter le téléporteur à la liste des objets 3D de la scène
    tabObjets3D.push(teleporteur);
}


// Animation des téléporteurs : faire tourner les téléporteurs autour de leur axe vertical
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

// Exportation des fonctions et variables (nécessaire parce que Teleporteurs.js est un module)
window.initTeleporteurs = initTeleporteurs;
window.initTeleporteur = initTeleporteur;
window.creerTeleporter = creerTeleporter;
window.positionsRecepteurs = positionsRecepteurs;
window.getAngleTeleporteurs = function() { return angleTeleporteurs; };
window.animationTeleporteur = animationTeleporteur;