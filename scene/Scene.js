var tabObjets3D = new Array();

async function initScene3D(objgl) {
    var objScene3D = new Object();
    tabObjets3D = new Array(); // Vider le tableau des objets 3D avant de les réinitialiser

    //Initaliser les cubes (plancher, murs, etc.)
    initCubes(objgl);
    
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
     

window.initScene3D = initScene3D;