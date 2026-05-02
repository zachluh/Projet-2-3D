var audioCtx = new AudioContext();
var buffers = {};

var fichiersSons = {
    nouveauNiveau: 'sfx/nouveau_niveau.ogg',
    tresorTrouve:  'sfx/tresor_trouve.ogg',
    tempsEcoule:   'sfx/temps_ecoule.ogg',
    murOuvert:     'sfx/mur_ouvert.ogg',
    teleporte:     'sfx/teleporte.ogg',
    gameOver:      'sfx/game_over.ogg',
    victoire:      'sfx/victoire.ogg'
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
