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
    ambiance:       'sfx/ambiance.mp3'
};

async function prechargerSons() {
    for (var nom in fichiersSons) {
        try {
            var reponse = await fetch(fichiersSons[nom]);
            var data = await reponse.arrayBuffer();
            buffers[nom] = await audioCtx.decodeAudioData(data);
        } catch (e) {
            console.warn('Son introuvable : ' + fichiersSons[nom]);
        }
    }
}

var sourcesActives = {};

function jouerSon(nom, duree) {
    if (!buffers[nom]) return;
    var source = audioCtx.createBufferSource();
    source.buffer = buffers[nom];
    source.connect(audioCtx.destination);
    sourcesActives[nom] = source;
    source.onended = function() { if (sourcesActives[nom] === source) delete sourcesActives[nom]; };
    if (duree !== undefined) {
        source.start(0, 0, duree);
    } else {
        source.start(0);
    }
}

function arreterSon(nom) {
    if (sourcesActives[nom]) {
        sourcesActives[nom].stop();
        delete sourcesActives[nom];
    }
}

var sourceAmbiance = null;

function jouerSonEnBoucle(nom) {
    if (!buffers[nom]) return;
    if (sourceAmbiance) { sourceAmbiance.stop(); sourceAmbiance = null; }
    sourceAmbiance = audioCtx.createBufferSource();
    sourceAmbiance.buffer = buffers[nom];
    sourceAmbiance.loop = true;
    sourceAmbiance.connect(audioCtx.destination);
    sourceAmbiance.start(0);
}

function sonNouveauNiveau() { jouerSon('nouveauNiveau', 4.7); }
function sonTresorTrouve()  { jouerSon('tresorTrouve');  }
function sonTempsEcoule()   { jouerSon('tempsEcoule', 4);   }
function sonMurOuvert()     { jouerSon('murOuvert');     }
function sonTeleporte()     { jouerSon('teleporte');     }
function sonGameOver()      { jouerSon('gameOver');      }
function sonVictoire()      { jouerSon('victoire');      }
function sonDepeche()       { jouerSon('depeche');       }
function sonAmbiance()      { jouerSonEnBoucle('ambiance'); }

function arreterSonAmbiance() { arreterSon('ambiance'); }
function arreterSonDepeche() { arreterSon('depeche'); }
