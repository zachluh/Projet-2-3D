/**  --- Flowey.js ---
 * Ce fichier contient l'entièreté de la logique liée aux cutscènes de Flowey : les dialogues, les sprites, les sons, etc.
 * (Basé sur un personnage du jeu Undertale, créé par Toby Fox)
 * P-S: On s'excuse pour la désorganisation du code, l'idée nous est venu très tard  
 * @author Zachary Luheshi
*/

var cutsceneActive = false;
var repliquesEnCours = null;

var indexReplique = 0;


// --- TABLEAUX DE RÉPLIQUES ---
/**
 * texte: Le texte à afficher pour la réplique
 * sprite: Le sprite à afficher pour la réplique (peut être une chaîne ou un tableau de chaînes pour une animation)
 * son: Le son à jouer pour la réplique (doit correspondre à une fonction de jeu/Sound.js)
 * duree_typewriter: La durée en ms entre chaque caractère pour l'effet de machine à écrire
 * duree_son: La durée en secondes pendant laquelle le son doit être joué (pour les sons qui doivent être coupés avant la fin)
 */

//Svp ne nous fait pas perdre de points pour des erreurs de français :(

const repliquesIntro = [
    { texte: "J'aimerais jouer à un jeu avec toi...",                          sprite: "cutscenes/images/flowey_gentil-removebg-preview.png",  son: "son_gentil",   duree_typewriter: 40,  duree_son: 1.5 },
    { texte: "Tu veux jouer à un jeu?",                                   sprite: "cutscenes/images/flowey_gentil2-removebg-preview.png",  son: "son_gentil",   duree_typewriter: 40,  duree_son: 1.0 },
    { texte: "Je suis sûr que tu vas adorer!",                            sprite: "cutscenes/images/flowey_gentil-removebg-preview.png", son: "son_gentil",   duree_typewriter: 40,  duree_son: 1.5 },
    { texte: "En tout cas, tu n'as pas vraiment le choix.",               sprite: "cutscenes/images/flowey_wink.png",                    son: "son_gentil",   duree_typewriter: 40,  duree_son: 2.0 },
    { texte: "Si tu veux revoir tes amis un jour...",                     sprite: "cutscenes/images/flowey_malefique1.png",              son: "son_malefique",   duree_typewriter: 40,  duree_son: 1.5 },
    { texte: "Et oui, c'est vrai! C'est moi qui ai leurs âmes!",         sprite: "cutscenes/images/flowey_gentil-removebg-preview.png",              son: "son_gentil",   duree_typewriter: 40,  duree_son: 2.0 },
    { texte: "Mais ne t'inquiète pas, j'en ai bien pris soin",           sprite: "cutscenes/images/flowey_gentil2-removebg-preview.png",              son: "son_gentil",   duree_typewriter: 40,  duree_son: 2.0 },
    { texte: "Ils sont bien au chaud dans mon labyrinthe!",               sprite: "cutscenes/images/flowey_malefique2.png",              son: "son_malefique",   duree_typewriter: 40,  duree_son: 2.0 },
    { texte: "Mais retournons donc à mon jeu...",                         sprite: "cutscenes/images/flowey_gentil-removebg-preview.png",  son: "son_gentil",   duree_typewriter: 40,  duree_son: 1.5 },
    { texte: "Tu veux revoir tes amis?",                                  sprite: "cutscenes/images/flowey_gentil-removebg-preview.png",  son: "son_gentil",   duree_typewriter: 40,  duree_son: 1.0 },
    { texte: "Eh bien, je te donne 60 secondes pour les chercher.",               sprite: "cutscenes/images/flowey_gentil-removebg-preview.png",  son: "son_gentil",   duree_typewriter: 40,  duree_son: 2.0 },
    { texte: "Si tu arrives à trouver les âmes de tes amis, ils seront libres!", sprite: "cutscenes/images/flowey_gentil2-removebg-preview.png", son: "son_gentil", duree_typewriter: 40,  duree_son: 2.5 },
    { texte: "Mais si tu échoues...",                                     sprite: "cutscenes/images/flowey_malefique1.png",             son: "son_malefique", duree_typewriter: 60,  duree_son: 1.3 },
    { texte: "Eh bien, tes amis...",                                      sprite: "cutscenes/images/flowey_malefique2.png",             son: "son_malefique", duree_typewriter: 60,  duree_son: 1.2 },
    { texte: "Je vais les faire souffrir pour très...",                  sprite: "cutscenes/images/flowey_transforme2.png",             son: "son_malefique", duree_typewriter: 60, duree_son: 2.3 },
    { texte: "très...",                                                   sprite: "cutscenes/images/flowey_transforme2.png",             son: "son_malefique", duree_typewriter: 60, duree_son: 0.4 },
    { texte: "trèèèèès longtemps.",                                    sprite: "cutscenes/images/flowey_transforme3.png",             son: "son_malefique", duree_typewriter: 120, duree_son: 2.6 },
    { texte: "Essaie de ne pas trop les manquer!",                        sprite: "cutscenes/images/flowey_wink.png",                    son: "son_gentil",   duree_typewriter: 40,  duree_son: 1.5 },
    { texte: "HAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHA", sprite: ["cutscenes/images/flowey_transforme4.png", "cutscenes/images/flowey_transforme3.png"],         son: "son_rire",     duree_typewriter: 40,  duree_son: 10.0 },
]

const repliquesMidGame = [
    {texte : "OK, D'accord, j'ai compris", sprite: "cutscenes/images/flowey_gentil-removebg-preview.png", son: "son_gentil", duree_typewriter: 40, duree_son: 1.0},
    {texte : "Tu es un humain particulièrement insolent, toi, hein?", sprite: "cutscenes/images/flowey_gentil2-removebg-preview.png", son: "son_gentil", duree_typewriter: 40, duree_son: 2.1},
    {texte : "Tu penses que tu es TELLEMENT meilleur que moi et mon stupide labyrinthe...", sprite: "cutscenes/images/flowey_wink.png", son: "son_gentil", duree_typewriter: 40, duree_son: 3.0},
    {texte : "N'est-ce pas?", sprite: "cutscenes/images/flowey_wink.png", son: "son_gentil", duree_typewriter: 40, duree_son: 0.5},
    {texte : "Eh bien, tu sais quoi?", sprite: "cutscenes/images/flowey_malefique1.png", son: "son_malefique", duree_typewriter: 40, duree_son: 0.9},
    {texte : "TU N'ES QU'UN INSECTE!", sprite: "cutscenes/images/flowey_malefique2.png", son: "son_malefique", duree_typewriter: 40, duree_son: 0.9},
    {texte : "ET TU N'AS MAINTENANT PLUS QUE 20 SECONDES POUR ME PROUVER LE CONTRAIRE!", sprite: "cutscenes/images/flowey_transforme2.png", son: "son_malefique", duree_typewriter: 40, duree_son: 2.9},
    {texte : "BONNE CHANCE!!!!!!", sprite: "cutscenes/images/flowey_transforme2.png", son: "son_malefique", duree_typewriter: 40, duree_son: 0.6},
    {texte : "HAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHA", sprite: ["cutscenes/images/flowey_transforme4.png", "cutscenes/images/flowey_transforme3.png"], son: "son_rire", duree_typewriter: 40, duree_son: 10.0},
]

const dialoguesFlash = [
    {texte : "TU NE VAS JAMAIS Y ARRIVER!", sprite: "cutscenes/images/flowey_transforme4.png", son: "son_malefique", duree_typewriter: 40, duree_son: 1.1},
    {texte : "ABANDONNE!", sprite: "cutscenes/images/flowey_transforme4.png", son: "son_malefique", duree_typewriter: 40, duree_son: 0.4},
    {texte : "TU N'ES RIEN COMPARÉ À MOI!", sprite: "cutscenes/images/flowey_transforme4.png", son: "son_malefique", duree_typewriter: 40, duree_son: 1.1},
    {texte : "ARRÊTE DE PERDRE TON TEMPS!", sprite: "cutscenes/images/flowey_transforme4.png", son: "son_malefique", duree_typewriter: 40, duree_son: 1.1},
    {texte : "JE NE TE LAISSERAI PAS GAGNER!", sprite: "cutscenes/images/flowey_transforme4.png", son: "son_malefique", duree_typewriter: 40, duree_son: 1.2},
    {texte : "HAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHA", sprite: ["cutscenes/images/flowey_transforme4.png", "cutscenes/images/flowey_transforme3.png"], son: "son_rire", duree_typewriter: 40, duree_son: 2.5},   
]

// Tape le texte dans #dialogue-texte caractère par caractère.
// Si une animation est déjà en cours, elle est annulée avant de commencer la nouvelle.
var _typewriterTimeout = null;
var _spriteInterval = null;
function typewriterEffect(texte, delai) {
    var el = document.getElementById('dialogue-texte');
    el.textContent = '';
    if (_typewriterTimeout !== null) {
        clearTimeout(_typewriterTimeout);
        _typewriterTimeout = null;
    }
    var i = 0;
    function typeNextChar() {
        if (i < texte.length) {
            el.textContent += texte[i];
            i++;
            _typewriterTimeout = setTimeout(typeNextChar, delai);
        } else {
            _typewriterTimeout = null;
        }
    }
    typeNextChar();
}

// Déclenche la cutscene d'intro ou de mi-jeu dépendant du paramètre
// La cutscène d'intro démarre le jeu à la fin
// La cutscène de mi-jeu redonne 20 secondes au joueur pour trouver les âmes restantes et joue le thème de Flowey
function declencherCutscene(repliques, avecFond) {
    var elFlowey = document.getElementById('ecran-flowey');
    var elDialogue = document.getElementById('ecran-dialogue');

    cutsceneActive = true;
    repliquesEnCours = repliques;
    indexReplique = 0;

    elFlowey.style.backgroundColor = avecFond ? 'black' : 'transparent';
    elFlowey.style.display = 'flex';
    elDialogue.style.display = 'flex';
    if (!avecFond) {
        // Cutscène midgame : couper la bande son et lancer le thème d'intro de Flowey
        if (typeof _soundtrackTimeout !== 'undefined' && _soundtrackTimeout !== null) { clearTimeout(_soundtrackTimeout); _soundtrackTimeout = null; }
        arreterSoundTrack();
    }

    var replique = repliques[0];

    //Annuler l'interval de changement de sprite en cours (pour les répliques avec animation) et remettre le sprite à la première image
    if (_spriteInterval !== null) { clearInterval(_spriteInterval); _spriteInterval = null; }
    document.getElementById('flowey-sprite').src = Array.isArray(replique.sprite) ? replique.sprite[0] : replique.sprite;

    // Afficher le texte avec l'effet de machine à écrire
    typewriterEffect(replique.texte, replique.duree_typewriter);

    // Jouer le bon son
    if (replique.son === 'son_gentil')         sonGentil(replique.duree_son);
    else if (replique.son === 'son_malefique') sonMalefique(replique.duree_son);
    else if (replique.son === 'son_rire')      sonRire(replique.duree_son);
}

// Fonction appelée à chaque fois que le joueur appuie sur une touche pendant une cutscène pour faire avancer le dialogue
async function afficherProchaineReplique(repliques) {
    indexReplique++;
    let elFloweySprite = document.getElementById('flowey-sprite');

    if (indexReplique >= repliques.length) {
        indexReplique = 0;
        fermerCutscene();
        if (repliques === repliquesIntro) {
            // Fin de l'intro : démarrer le vrai jeu
            jeuEnCours = true;
            demarrerJeu();
            cutsceneActive = false;
        } else if (repliques === repliquesMidGame) {
            // Fin de la cutscène midgame : reprendre le jeu avec 20 secondes
            afficherNiveau(niveau);
            sonNouveauNiveau();
            cutsceneActive = false;
            DUREE_NIVEAU = 20;
            tempsEffectifEcouleMs = 0;
            dernierTimestampJeu = Date.now();
            _derniereSecondeRestante = -1;
            timerActif = true;
            jeuActif = true;
            jouerFloweyTheme();
            mettreAJourHUD(DUREE_NIVEAU);
        }
        return;
    }

    var replique = repliques[indexReplique];

    // Actions déclenchées à des répliques spécifiques du midgame
    if (repliques === repliquesMidGame) {
        if (indexReplique === 2) {
            joueur = initJoueur();
            angleCamera = -Math.PI / 2;
        }
        if (indexReplique === 4) {
            texSkyHaut = chargerTexture(objgl, 'textures/skybox_haut.png');
            texSkyCote = chargerTexture(objgl, 'textures/skybox_cote.png');
            couleurSol = [1.0, 0.0, 0.0, 1.0];
            couleurSolStart = [1.0, 0.0, 0.0, 1.0];
            couleurFleches = [0.0, 0.0 , 0.0, 1.0];
            couleurTextAnnonce = '#000000';
            objScene3D = await initScene3D(objgl);
            jouerFloweyIntro();
        }
    }

    // Annuler l'interval de changement de sprite en cours (pour les répliques avec animation) et lancer la nouvelle animation si besoin
    if (_spriteInterval !== null) { clearInterval(_spriteInterval); _spriteInterval = null; }

    // Gestion du sprite
    // Si le sprite de la réplique est un tableau, on l'anime en alternant les images du tableau à interval régulier
    // Sinon, on affiche simplement l'image
    if (Array.isArray(replique.sprite)) {
        let indexSprite = 0;
        elFloweySprite.src = replique.sprite[0];
        _spriteInterval = setInterval(() => {
            elFloweySprite.src = replique.sprite[indexSprite];
            indexSprite = (indexSprite + 1) % replique.sprite.length;
        }, 300);
    } else {
        document.getElementById('flowey-sprite').src = replique.sprite;
    }

    //Gestion du texte : effet typewriter
    typewriterEffect(replique.texte, replique.duree_typewriter);

    // Couper l'intro Flowey sur la dernière réplique du midgame (le rire)
    if (repliques === repliquesMidGame && indexReplique === repliques.length - 1) {
        arreterFloweyIntro();
    }

    // Gérer le son : arrêter les sons en cours et jouer le bon
    arreterSonGentil();
    arreterSonMalefique();
    arreterSonRire();
    if (replique.son === 'son_gentil')         sonGentil(replique.duree_son);
    else if (replique.son === 'son_malefique') sonMalefique(replique.duree_son);
    else if (replique.son === 'son_rire')      sonRire(replique.duree_son);
}

function fermerCutscene() {
    document.getElementById('ecran-flowey').style.display = 'none';
    document.getElementById('ecran-dialogue').style.display = 'none';
    arreterSonGentil();
    arreterSonMalefique();
    arreterSonRire();
}

function dialogueFlash(param) {
    var elDialogue = document.getElementById('ecran-dialogue');
    elDialogue.style.display = 'flex';
    if (param === 'random') {
        indexReplique = Math.floor(Math.random() * (dialoguesFlash.length - 1));
        typewriterEffect(dialoguesFlash[indexReplique].texte, dialoguesFlash[indexReplique].duree_typewriter);
    }

    if (typeof param === 'number') {
        indexReplique = param;
        typewriterEffect(dialoguesFlash[indexReplique].texte, dialoguesFlash[indexReplique].duree_typewriter);
    }

    if (dialoguesFlash[indexReplique].son === 'son_malefique') sonMalefique(dialoguesFlash[indexReplique].duree_son);
    else if (dialoguesFlash[indexReplique].son === 'son_rire') sonRire(dialoguesFlash[indexReplique].duree_son);

    setTimeout(() => {
        elDialogue.style.display = 'none';
    }, (dialoguesFlash[indexReplique].duree_son * 1000) + 1000);
    
}
