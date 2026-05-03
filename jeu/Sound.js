var audioCtx = new AudioContext();
var buffers = {};

var fichiersSons = {
    nouveauNiveau: 'sfx/nouveau_niveau.mp3',
    tresorTrouve:  'sfx/tresor_trouve.mp3',
    tempsEcoule:   'sfx/temps_ecoule.mp3',
    murOuvert:     'sfx/mur_ouvert.mp3',
    teleporte:     'sfx/teleporte.mp3',
    gameOver:      'sfx/game_over.mp3',
    victoire:      'sfx/victoire.mp3'
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

function jouerSon(nom) {
    if (!buffers[nom]) return;
    var source = audioCtx.createBufferSource();
    source.buffer = buffers[nom];
    source.connect(audioCtx.destination);
    source.start(0);
}

function sonNouveauNiveau() { jouerSon('nouveauNiveau'); }
function sonTresorTrouve()  { jouerSon('tresorTrouve');  }
function sonTempsEcoule()   { jouerSon('tempsEcoule');   }
function sonMurOuvert()     { jouerSon('murOuvert');     }
function sonTeleporte()     { jouerSon('teleporte');     }
function sonGameOver()      { jouerSon('gameOver');      }
function sonVictoire()      { jouerSon('victoire');      }
