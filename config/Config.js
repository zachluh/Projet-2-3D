// --------------- INITALISATION DE TOUTE LES VARIABLES DU JEU ---------------

// Variables globales

var objgl = null;
var objProgShaders = null;
var objScene3D = null;

// Variables de la matrice
var matrice = null

// Matrices pré-allocalisées comme ça ils ne sont pas recréées à chaque frame 
var _matProjection = null;
var _matVue = mat4.create();
var _matModeleVue = mat4.create();

// Distance² après laquelle un cube ne sera pas dessiné (pour optimiser le rendu)
var _DISTANCE_RENDER_MAX = 12 * 12;

// Variables de la scène

var tabObjets3D = new Array();

// Variables du joueur

var joueur = null;
var angleCamera = -Math.PI / 2; 
var touchesActives = {};
var vueTopDown = false;
var cameraAvantTopDown = null;
var angleCameraAvantTopDown = 0;

// Variables du jeu

var niveau = 1;
var jeuActif = false;
var timerActif = false;
var jeuEnCours = false;
var score = 300;
var DUREE_NIVEAU = 60; 
var nbOuvreurs = 4;
var nbFleches = 18;
var nbTransporteurs = 0;
var nbRecepteurs = 0;

var enModeVueAerienne = false;
var tempsDebutVueAerienne = 0;
var derniereSecondeVueAerienne = 0;

var tempsEffectifEcouleMs = 0;
var dernierTimestampJeu = 0;
var _derniereSecondeRestante = -1;
var _niveauEnRestart = false;

function nbOuvreursInitiaux(n) {
    return Math.max(0, 4 - Math.floor((n - 1) / 2));
}

function nbFlechesInitiaux(n) {
    return 20 - n*2;
}

function nbTransporteursInitiaux(n) {
    return Math.floor(n / 2);
}

function nbRecepteursInitiaux(n) {
    return n-1;
}

// Variables de teleporteur

let positionsRecepteurs = [];
let angleTeleporteurs = 0;

// Variables du tresor

var positionTresor = null;
var tresorCollecte = false;

// Variables de son

var audioCtx = new AudioContext();
var buffers = {};

var fichiersSons = {
    nouveauNiveau: 'sfx/nouveau_niveau.mp3',
    tresorTrouve:  'sfx/tresor_trouve.mp3',
    tempsEcoule:   'sfx/temps_ecoule.mp3',
    murOuvert:     'sfx/mur_ouvert.mp3',
    teleporte:     'sfx/teleporte.mp3',
    gameOver:      'sfx/game_over.mp3',
    victoire:      'sfx/victoire.mp3',
    depeche:       'sfx/depeche.mp3',
};

var sourcesActives = {};