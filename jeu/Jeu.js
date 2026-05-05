/** --- Jeu.js ---
 * Ce fichier continent la logique principale du jeu : démarrage, niveaux, timer, score, conditions de victoire et de défaite, etc.
 * @author Ken-Li Roux, Zachary Luheshi
 */


function demarrerJeu() {
    sonNouveauNiveau();
    jeuEnCours = true;
    fermerPressStart();
    afficherNiveau(niveau);
    niveau = 1;
    score = 300;
    nbOuvreurs = nbOuvreursInitiaux(niveau);
    nbFleches = nbFlechesInitiaux(niveau);
    nbTransporteurs = nbTransporteursInitiaux(niveau);
    nbRecepteurs = nbRecepteursInitiaux(niveau);
    jeuActif = true;
    timerActif = true;
    tempsEffectifEcouleMs = 0;
    dernierTimestampJeu = Date.now();
    _derniereSecondeRestante = -1;
    _niveauEnRestart = false;
    _soundtrackTimeout = setTimeout(soundTrack, 5000);
    mettreAJourHUD(DUREE_NIVEAU);
}

function mettreAJourJeu() {
    if (!timerActif) return;

    var now = Date.now();
    var delta = now - dernierTimestampJeu;
    dernierTimestampJeu = now;

    // Timer avance 2x plus vite en mode vue aérienne
    var multiplicateur = enModeVueAerienne ? 2 : 1;
    tempsEffectifEcouleMs += delta * multiplicateur;

    var tempsRestant = Math.max(0, DUREE_NIVEAU - Math.floor(tempsEffectifEcouleMs / 1000));

    // Déduction de points en mode vue aérienne (-10 pts par seconde réelle)
    if (enModeVueAerienne) {
        var secondesAeriennes = Math.floor((now - tempsDebutVueAerienne) / 1000);
        if (secondesAeriennes > derniereSecondeVueAerienne) {
            score -= 10 * (secondesAeriennes - derniereSecondeVueAerienne);
            derniereSecondeVueAerienne = secondesAeriennes;
            mettreAJourHUD(tempsRestant);
        }
    }

    // Mettre à jour le HUD une fois par seconde effective
    if (tempsRestant !== _derniereSecondeRestante) {
        if (tempsRestant <= 10 && tempsRestant > 0 && _derniereSecondeRestante > 10) {
            afficherDepeche();
            if (niveau < 6) {
                if (_soundtrackTimeout !== null) { clearTimeout(_soundtrackTimeout); _soundtrackTimeout = null; }
                arreterSoundTrack();
                soundTrack(2);
            }
        }
        _derniereSecondeRestante = tempsRestant;
        mettreAJourHUD(tempsRestant);
    }

    // Temps écoulé : recommencer le niveau
    if (tempsRestant === 0) {
        timerActif = false;
        sonTempsEcoule();
        recommencerNiveau();
    }
}

// Recommence le niveau actuel : réinitialise le joueur, les compteurs et affiche le message de temps écoulé
function recommencerNiveau() {
    if (_niveauEnRestart) return;
    _niveauEnRestart = true;
    jeuActif = false;
    score -= 200;
    if (_soundtrackTimeout !== null) { clearTimeout(_soundtrackTimeout); _soundtrackTimeout = null; }
    arreterSoundTrack();
    mettreAJourHUD(0);

    if (score < 200) {
        declencherGameOver();
        return;
    }

    if (niveau >= 6) {
        dialogueFlash(dialoguesFlash.length - 1);
    }

    afficherTempsEcoule();

    setTimeout(async function() {

        // Réinitialiser les variables du niveau
        nbOuvreurs = nbOuvreursInitiaux(niveau);
        nbFleches = nbFlechesInitiaux(niveau);
        nbTransporteurs = nbTransporteursInitiaux(niveau);

        // Réinitialiser le joueur
        joueur = initJoueur();
        angleCamera = -Math.PI / 2;

        // Réinitialiser le compteur de temps
        tempsEffectifEcouleMs = 0;
        dernierTimestampJeu = Date.now();
        _derniereSecondeRestante = -1;
        _niveauEnRestart = false;
        timerActif = true;
        jeuActif = true;
        _soundtrackTimeout = niveau < 6 ? setTimeout(() => soundTrack(1), 3000) : null;
        mettreAJourHUD(DUREE_NIVEAU);
        
        // La scène n'est pas réinitialisée car elle reste la même

    }, 0);
}

function passerNiveauSuivant() {
    if (!jeuActif) return;
    timerActif = false;
    jeuActif = false;

    // Jouer le son de trésor trouvé
    if (_soundtrackTimeout !== null) { clearTimeout(_soundtrackTimeout); _soundtrackTimeout = null; }
    arreterSoundTrack();
    sonTresorTrouve();

    var secondesRestantes = Math.max(0, DUREE_NIVEAU - Math.floor(tempsEffectifEcouleMs / 1000));
    score += 10 * secondesRestantes;

    niveau++;
    mettreAJourHUD(secondesRestantes);

    if (niveau >= 7) {
        dialogueFlash('random');
    }

    if (niveau > 10) {
        declencherVictoire();
        arreterFloweyTheme();
        return;
    }

    setTimeout(async function() {
        nbOuvreurs = nbOuvreursInitiaux(niveau);
        nbFleches = nbFlechesInitiaux(niveau);
        nbTransporteurs = nbTransporteursInitiaux(niveau);
        nbRecepteurs = nbRecepteursInitiaux(niveau);
        initMatrice();
        objScene3D = await initScene3D(objgl);

        if (niveau === 6) {
            // Cutscène midgame : bloquer le joueur et lancer le dialogue
            cutsceneActive = true;
            declencherCutscene(repliquesMidGame, false);
        } else {
            sonNouveauNiveau();
            afficherNiveau(niveau);
            joueur = initJoueur();
            angleCamera = -Math.PI / 2;

            tempsEffectifEcouleMs = 0;
            dernierTimestampJeu = Date.now();
            _derniereSecondeRestante = -1;
            timerActif = true;
            jeuActif = true;
            _soundtrackTimeout = niveau < 6 ? setTimeout(() => soundTrack(1), 5000) : null;
            mettreAJourHUD(DUREE_NIVEAU);
        }
    }, 500);
}

// Retourne true si l'ouvreur a pu être utilisé, false sinon
function utiliserOuvreur(x, z) {
    if (score < 50) return false;
    if (nbOuvreurs <= 0) return false;
    if (matrice[x][z] !== 1) return false; 
    score -= 50;
    nbOuvreurs--;
    sonMurOuvert();
    mettreAJourHUD(_derniereSecondeRestante >= 0 ? _derniereSecondeRestante : DUREE_NIVEAU);
    return true;
}

// Active la vue aérienne si le score est suffisant
function activerVueAerienne() {
    if (score < 10) return false;
    cacherTexte();
    enModeVueAerienne = true;
    tempsDebutVueAerienne = Date.now();
    derniereSecondeVueAerienne = 0;
    return true;
}

// Désactive la vue aérienne et retourne à la position précédente du joueur
function desactiverVueAerienne() {
    enModeVueAerienne = false;
}

// Déclenche le game over : arrête le jeu, affiche le message de fin et joue le son de game over
function declencherGameOver() {
    jeuActif = false;
    timerActif = false;
    if (_soundtrackTimeout !== null) { clearTimeout(_soundtrackTimeout); _soundtrackTimeout = null; }
    arreterSoundTrack();
    sonGameOver();
    afficherGameOver();
    console.log("=== GAME OVER === Score final : " + score);
}

// Déclenche la victoire : arrête le jeu, affiche le message de victoire et joue le son de victoire
function declencherVictoire() {
    jeuActif = false;
    timerActif = false;
    if (_soundtrackTimeout !== null) { clearTimeout(_soundtrackTimeout); _soundtrackTimeout = null; }
    sonVictoire();
    afficherVictoire();
    var eld = document.getElementById('ecran-dialogue');
    if (eld) eld.style.display = 'none';
    console.log("=== VICTOIRE === Score final : " + score);
}


