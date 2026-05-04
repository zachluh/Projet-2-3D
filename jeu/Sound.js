/** --- Sound.js ---
 * Ce fichier contient la logique liée aux sons du jeu : préchargement, lecture, arrêt, etc.
 * @author Ken-Li Roux
*/

// Précharge les sons du jeu et les stocke dans des buffers pour une lecture rapide
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

// Joue un son à partir du buffer préchargé, avec une durée optionnelle
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

// Arrête un son en cours de lecture en l'enlevant de la liste des sources actives et en appelant stop() dessus
function arreterSon(nom) {
    if (sourcesActives[nom]) {
        sourcesActives[nom].stop();
        delete sourcesActives[nom];
    }
}

// Fonctions de lecture de sons spécifiques
function sonNouveauNiveau() { jouerSon('nouveauNiveau', 4.7); }
function sonTresorTrouve()  { jouerSon('tresorTrouve');  }
function sonTempsEcoule()   { jouerSon('tempsEcoule');   }
function sonMurOuvert()     { jouerSon('murOuvert');     }
function sonTeleporte()     { jouerSon('teleporte');     }
function sonGameOver()      { jouerSon('gameOver');      }
function sonVictoire()      { jouerSon('victoire');      }
function sonDepeche()       { jouerSon('depeche');       }


function arreterSonDepeche() { arreterSon('depeche'); }
