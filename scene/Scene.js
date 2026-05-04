/** --- Scene.js --- 
 * Ce fichier contient la logique liée à la scène 3D : initialisation des objets, dessin, etc.
 * @author Zachary Luheshi, Ken-Li Roux
*/

var tabObjets3D = new Array();

async function initScene3D(objgl) {
    var objScene3D = new Object();
    tabObjets3D = new Array(); // Vider le tableau des objets 3D avant de les réinitialiser

    // Charger les textures des cubes (une par type de case)
    var texCubes = {};
    texSol = chargerTexture(objgl, 'textures/sol.jpg');
    texCubes[0] = texSol;
    texCubes[1] = chargerTexture(objgl, 'textures/mur_ouvrable.jpg');
    texCubes[2] = chargerTexture(objgl, 'textures/mur.jpg');
    texCubes[3] = chargerTexture(objgl, 'textures/enclos.jpg');
    texCubes[4] = texCubes[0]; texCubes[5] = texCubes[0];
    texCubes[6] = texCubes[0]; texCubes[7] = texCubes[0];

    // Skybox texturée (rendue en premier pour apparaître derrière tout le reste)
    var texSkyHaut = chargerTexture(objgl, 'textures/skybox_haut.jpg');
    var texSkyCote = chargerTexture(objgl, 'textures/skybox_cote.jpg');
    var skyboxObjets = creerSkybox(objgl, texSkyHaut, texSkyCote);
    for (var s = 0; s < skyboxObjets.length; s++) tabObjets3D.push(skyboxObjets[s]);

    // Initialiser les cubes texturés (plancher, murs, etc.)
    initCubes(objgl, texCubes);
    
    // Initialiser le trésor
    initTresor(objgl);
    tresorObj.estSpecial = true;
    tabObjets3D.push(tresorObj);

    // Initialiser les flèches
    let fleches = await initFleches();
    for (let i = 0; i < fleches.length; i++) {
        let fleche = creerFleche(objgl, fleches[i].positions, fleches[i].indices);
        initFleche(fleche, i);
    };
    
    // Initialiser les téléporteurs
    let teleporteurs = await initTeleporteurs();
    for (let i = 0; i < teleporteurs.length; i++) {
        let teleporteur = creerTeleporter(objgl, teleporteurs[i].positions, teleporteurs[i].texCoords, teleporteurs[i].indices, 'modeles/teleporteur/textures/Spawnlocation2Mtl_baseColor.png');
        initTeleporteur(teleporteur, i);
        
    }

    // Mettre les objets 3D sur la scène
    objScene3D.tabObjets3D = tabObjets3D;

    return objScene3D;
}

function animer(objgl, objProgShaders, objScene3D) {
// Un cycle d'animation	
// Requête pour le prochain cycle
objCycleAnimation = requestAnimationFrame(function() {
    animer(objgl, objProgShaders, objScene3D);
});

// Le cycle d'animation
mettreAJourJeu();
if (jeuActif) miseAJourPositionJoueur();
verifierCollisionTresor();
verifierCollisionTransporteur();
animationTeleporteur();
effacerCanevas(objgl);
dessiner();
}


function dessiner() {
    // La vue
    objgl.viewport(0, 0, objgl.drawingBufferWidth, objgl.drawingBufferHeight);

    // Matrice de projection — computed once since canvas size is fixed
    if (!_matProjection) {
        _matProjection = mat4.create();
        mat4.perspective(45, objgl.drawingBufferWidth / objgl.drawingBufferHeight, 0.01, 100, _matProjection);
    }
    objgl.uniformMatrix4fv(objProgShaders.matProjection, false, _matProjection);

    // Matrice de vue calculée une seule fois par frame (réutilise le buffer pré-alloué _matVue)
    mat4.identity(_matVue);
    mat4.lookAt(getPositionsCameraXYZ(joueur),
    getCiblesCameraXYZ(joueur),
    getOrientationsXYZ(joueur),
    _matVue);

    // Position du joueur pour les calculs de distance et d'angle
    var joueurX = getPositionCameraX(joueur);
    var joueurZ = getPositionCameraZ(joueur);

    for (var i = 0; i < objScene3D.tabObjets3D.length; i++) {
        var obj = objScene3D.tabObjets3D[i];
        if (obj.binVisible === false) continue;
        if (vueTopDown && obj.estSpecial && !touchesActives[67]) continue;

        // Distance render : Si un cube est trop loin du joueur, ne pas le dessiner (sauf en vue top-down où on veut tout voir)
        if (!vueTopDown) {
            var dx = obj.gridX - joueurX;
            var dz = obj.gridZ - joueurZ;
            if (dx * dx + dz * dz > _DISTANCE_RENDER_MAX) continue;
        }

        if (!vueTopDown) {
        // Si un cube est complètement derrière le joueur, ne pas le dessiner (sauf en vue top-down où on veut tout voir)
            var dirX = Math.sin(angleCamera);
            var dirZ = Math.cos(angleCamera);
            var toObjX = obj.gridX - joueurX;
            var toObjZ = obj.gridZ - joueurZ;
            if (dirX * toObjX + dirZ * toObjZ < 0) continue;
        }

        var vertex = obj.vertex;
        var couleurs = obj.couleurs;
        var maillage = obj.maillage;
        var texture = obj.texture;
        var uv = obj.uv;
        var estTexturee = obj.estTexturee;
        var estInversee = obj.estInversee;

        // Multiplier la vue par la matrice modèle précalculée 
        mat4.multiply(_matVue, obj.matModele, _matModeleVue);

        // Relier la matrice aux shaders
        objgl.uniformMatrix4fv(objProgShaders.matModeleVue, false, _matModeleVue);

        if (obj.estTextureeArrays) {
            // Cubes et skybox : texture sur drawArrays (6 faces max, contours ignorés)
            objgl.enableVertexAttribArray(objProgShaders.posTexel);
            objgl.disableVertexAttribArray(objProgShaders.couleurVertex);
            objgl.activeTexture(objgl.TEXTURE0);
            objgl.bindTexture(objgl.TEXTURE_2D, obj.texture);
            objgl.uniform1i(objProgShaders.noTexture, 0);
            objgl.uniform1f(objProgShaders.pcCouleurTexel, 1.0);
            objgl.uniform1f(objProgShaders.inverserCouleurs, 0.0);
            var nbFaces = Math.min(6, obj.vertex.length);
            for (var j = 0; j < nbFaces; j++) {
                objgl.bindBuffer(objgl.ARRAY_BUFFER, obj.vertex[j]);
                objgl.vertexAttribPointer(objProgShaders.posVertex, 3, objgl.FLOAT, false, 0, 0);
                objgl.bindBuffer(objgl.ARRAY_BUFFER, obj.uvCoords[j]);
                objgl.vertexAttribPointer(objProgShaders.posTexel, 2, objgl.FLOAT, false, 0, 0);
                objgl.drawArrays(obj.vertex[j].typeDessin, 0, obj.vertex[j].intNbVertex);
            }
            objgl.disableVertexAttribArray(objProgShaders.posTexel);
            objgl.enableVertexAttribArray(objProgShaders.couleurVertex);
            objgl.uniform1f(objProgShaders.pcCouleurTexel, 0.0);
        } else if (estTexturee) {
            // Relier les vertex aux shaders
            objgl.bindBuffer(objgl.ARRAY_BUFFER, vertex);
            objgl.vertexAttribPointer(objProgShaders.posVertex, 3, objgl.FLOAT, false, 0, 0);

            // Désactiver couleurVertex (pas de tampon de couleurs pour les objets texturés)
            objgl.disableVertexAttribArray(objProgShaders.couleurVertex);

            // Activer et relier les coordonnées UV
            objgl.enableVertexAttribArray(objProgShaders.posTexel);
            objgl.bindBuffer(objgl.ARRAY_BUFFER, uv);
            objgl.vertexAttribPointer(objProgShaders.posTexel, 2, objgl.FLOAT, false, 0, 0);

            // Relier la texture aux shaders
            objgl.activeTexture(objgl.TEXTURE0);
            objgl.bindTexture(objgl.TEXTURE_2D, texture);
            objgl.uniform1i(objProgShaders.noTexture, 0);
            objgl.uniform1f(objProgShaders.pcCouleurTexel, 1.0);
            objgl.uniform1f(objProgShaders.inverserCouleurs, estInversee ? 1.0 : 0.0);

            // Dessiner avec le tampon d'indices
            objgl.bindBuffer(objgl.ELEMENT_ARRAY_BUFFER, maillage);
            objgl.drawElements(objgl.TRIANGLES, maillage.intNbTriangles * 3, objgl.UNSIGNED_SHORT, 0);

            // Restaurer l'état pour les objets non texturés
            objgl.disableVertexAttribArray(objProgShaders.posTexel);
            objgl.enableVertexAttribArray(objProgShaders.couleurVertex);
            objgl.uniform1f(objProgShaders.pcCouleurTexel, 0.0);
            objgl.uniform1f(objProgShaders.inverserCouleurs, 0.0);
        }

        else {
            if (maillage == null)
                // Dessiner les sous-objets
                for (var j = 0; j < vertex.length; j++) {

                    // Relier les vertex aux shaders
                    objgl.bindBuffer(objgl.ARRAY_BUFFER, vertex[j]);
                    objgl.vertexAttribPointer(objProgShaders.posVertex, 3, objgl.FLOAT, false, 0, 0);
                    var intNbVertex = (objgl.getBufferParameter(objgl.ARRAY_BUFFER, objgl.BUFFER_SIZE) / 4) / 3;

                    // Relier les couleurs aux shaders
                    objgl.bindBuffer(objgl.ARRAY_BUFFER, couleurs[j]);
                    objgl.vertexAttribPointer(objProgShaders.couleurVertex, 4, objgl.FLOAT, false, 0, 0);

                    // Dessiner
                    objgl.drawArrays(vertex[j].typeDessin, 0, intNbVertex);
                }
        else { // Dessiner le maillage
            // Relier les vertex aux shaders
            objgl.bindBuffer(objgl.ARRAY_BUFFER, vertex);
            objgl.vertexAttribPointer(objProgShaders.posVertex, 3, objgl.FLOAT, false, 0, 0);

            // Relier les couleurs aux shaders
            objgl.bindBuffer(objgl.ARRAY_BUFFER, couleurs);
            objgl.vertexAttribPointer(objProgShaders.couleurVertex, 4, objgl.FLOAT, false, 0, 0)

            // Sélectionner le maillage qu'on va utiliser pour les triangles et les droites
            objgl.bindBuffer(objgl.ELEMENT_ARRAY_BUFFER, maillage);

            // Dessiner les triangles
            objgl.drawElements(objgl.TRIANGLES, maillage.intNbTriangles * 3, objgl.UNSIGNED_SHORT, 0);
            // Dessiner les droites à la suite des triangles
            objgl.drawElements(objgl.LINES, maillage.intNbDroites * 2, objgl.UNSIGNED_SHORT, maillage.intNbTriangles * 2 * 3);
        }
        }

    }
}

// Fonction util pour trouver une case vide dans lequel on peut mettre un objet spécial (trésor, flèche, téléporteur)
// Modifie la matrice pour marquer la case comme occupée par l'objet spécial (avec le numéro fourni) 
function trouveCaseVide(matrice, number) {
    var corridors = [];
     for (var i = 1; i < matrice.length - 1; i++) {
         for (var j = 1; j < matrice[i].length - 1; j++) {
             if (matrice[i][j] === 0) corridors.push([i, j]);
         }
    }
     var chosenCorridor = Math.floor(Math.random() * corridors.length);
     matrice[corridors[chosenCorridor][0]][corridors[chosenCorridor][1]] = number;
     return corridors[chosenCorridor];
}
     

window.initScene3D = initScene3D;