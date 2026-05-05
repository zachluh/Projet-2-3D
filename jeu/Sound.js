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

// Joue un son à partir du buffer préchargé, avec une durée et une vitesse optionnelles
function jouerSon(nom, duree, vitesse) {
    if (!buffers[nom]) return;
    var source = audioCtx.createBufferSource();
    source.buffer = buffers[nom];
    if (vitesse !== undefined) source.playbackRate.value = vitesse;
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

// Joue un son en boucle infinie
function jouerEnRepetition(nom) {
    if (!buffers[nom]) return;
    var source = audioCtx.createBufferSource();
    source.buffer = buffers[nom];
    source.loop = true;
    source.connect(audioCtx.destination);
    sourcesActives[nom] = source;
    source.start(0);
}

// Fonctions de lecture de sons spécifiques
function sonNouveauNiveau() { jouerSon('nouveauNiveau'); }
function sonTresorTrouve()  { jouerSon('tresorTrouve');  }
function sonTempsEcoule()   { jouerSon('tempsEcoule');   }
function sonMurOuvert()     { jouerSon('murOuvert');     }
function sonTeleporte()     { jouerSon('teleporte');     }
function sonGameOver()      { jouerSon('gameOver');      }
function sonVictoire()      { jouerSon('victoire');      }
function sonGentil(temps)        { jouerSon('son_gentil', temps);    }
function sonMalefique(temps)     { jouerSon('son_malefique', temps); }  
function sonRire(temps)         { jouerSon('son_rire', temps);      }
function soundTrack(vitesse)    { jouerSon('main_soundtrack', undefined, vitesse); }
function jouerFloweyIntro()     { jouerEnRepetition('flowey_intro');    }
function jouerFloweyTheme()     { jouerEnRepetition('flowey_maintheme'); }

// Fonctions d'arrêt de sons spécifiques

function arreterSonGentil() { arreterSon('son_gentil'); }
function arreterSonMalefique() { arreterSon('son_malefique'); }
function arreterSonRire() { arreterSon('son_rire'); }
function arreterSoundTrack() { arreterSon('main_soundtrack'); }
function arreterFloweyIntro() { arreterSon('flowey_intro'); }
function arreterFloweyTheme() { arreterSon('flowey_maintheme'); }