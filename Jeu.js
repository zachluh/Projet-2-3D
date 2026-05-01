var niveau = 1;
var jeuActif = false;
var timerActif = false;
var jeuEnCours = false;
var score = 300;
var DUREE_NIVEAU = 60; // Durée d'un niveau en secondes (variable globale pour les tests)
var nbOuvreurs = 4;
var nbFleches = 18;
var nbTransporteurs = 0;
var nbRecepteurs = 0;

var enModeVueAerienne = false;
var tempsDebutVueAerienne = 0;
var derniereSecondeVueAerienne = 0;

// Delta-time timer: la vue aérienne fait avancer le chrono 2x plus vite
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

function demarrerJeu() {
    jeuEnCours = true;
    var ecranDebut = document.getElementById('ecran-debut');
    if (ecranDebut) ecranDebut.style.display = 'none';
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
        _derniereSecondeRestante = tempsRestant;
        mettreAJourHUD(tempsRestant);
    }

    // Temps écoulé : recommencer le niveau
    if (tempsRestant === 0) {
        timerActif = false;
        recommencerNiveau();
    }
}

function recommencerNiveau() {
    if (_niveauEnRestart) return;
    _niveauEnRestart = true;
    jeuActif = false;
    score -= 200;
    mettreAJourHUD(0);

    if (score < 200) {
        declencherGameOver();
        return;
    }

    setTimeout(async function() {
        nbOuvreurs = nbOuvreursInitiaux(niveau);
        nbFleches = nbFlechesInitiaux(niveau);
        nbTransporteurs = nbTransporteursInitiaux(niveau);
        joueur = initJoueur();
        angleCamera = -Math.PI / 2;
        // Les objets gardent leurs positions, seul le joueur et le timer sont remis à zéro
        tempsEffectifEcouleMs = 0;
        dernierTimestampJeu = Date.now();
        _derniereSecondeRestante = -1;
        _niveauEnRestart = false;
        timerActif = true;
        jeuActif = true;
        mettreAJourHUD(DUREE_NIVEAU);
    }, 2000);
}

function passerNiveauSuivant() {
    if (!jeuActif) return;
    timerActif = false;
    jeuActif = false;

    var secondesRestantes = Math.max(0, DUREE_NIVEAU - Math.floor(tempsEffectifEcouleMs / 1000));
    score += 10 * secondesRestantes;

    niveau++;
    mettreAJourHUD(secondesRestantes);

    if (niveau > 10) {
        declencherVictoire();
        return;
    }

    setTimeout(async function() {
        nbOuvreurs = nbOuvreursInitiaux(niveau);
        nbFleches = nbFlechesInitiaux(niveau);
        nbTransporteurs = nbTransporteursInitiaux(niveau);
        nbRecepteurs = nbRecepteursInitiaux(niveau);
        initMatrice();
        joueur = initJoueur();
        angleCamera = -Math.PI / 2;
        objScene3D = await initScene3D(objgl);
        tempsEffectifEcouleMs = 0;
        dernierTimestampJeu = Date.now();
        _derniereSecondeRestante = -1;
        timerActif = true;
        jeuActif = true;
        mettreAJourHUD(DUREE_NIVEAU);
    }, 2000);
}

// Retourne true si l'ouvreur a pu être utilisé, false sinon
function utiliserOuvreur(x, z) {
    if (score < 50) return false;
    if (nbOuvreurs <= 0) return false;
    if (matrice[x][z] !== 1) return false; 
    score -= 50;
    nbOuvreurs--;
    mettreAJourHUD(_derniereSecondeRestante >= 0 ? _derniereSecondeRestante : DUREE_NIVEAU);
    return true;
}

function activerVueAerienne() {
    if (score < 10) return false;
    enModeVueAerienne = true;
    tempsDebutVueAerienne = Date.now();
    derniereSecondeVueAerienne = 0;
    return true;
}

function desactiverVueAerienne() {
    enModeVueAerienne = false;
}

function declencherGameOver() {
    jeuActif = false;
    timerActif = false;
    var timerEl = document.getElementById('hud-timer');
    if (timerEl) {
        timerEl.textContent = 'GAME OVER';
        timerEl.classList.add('urgent');
    }
    console.log("=== GAME OVER === Score final : " + score);
}

function declencherVictoire() {
    jeuActif = false;
    timerActif = false;
    var timerEl = document.getElementById('hud-timer');
    if (timerEl) {
        timerEl.textContent = 'VICTOIRE!';
        timerEl.style.color = '#00e676';
        timerEl.classList.remove('urgent');
    }
    console.log("=== VICTOIRE === Score final : " + score);
}

function mettreAJourHUD(tempsRestant) {
    var niveauEl = document.getElementById('hud-niveau');
    var timerEl = document.getElementById('hud-timer');
    var scoreEl = document.getElementById('hud-score');
    var mursEl = document.getElementById('hud-murs');

    if (niveauEl) niveauEl.textContent = 'Niveau ' + niveau;
    if (scoreEl) scoreEl.textContent = score + ' pts';
    if (mursEl) mursEl.textContent = nbOuvreurs + ' x';

    if (timerEl) {
        timerEl.textContent = tempsRestant + 's';
        if (tempsRestant <= 10) {
            timerEl.classList.add('urgent');
        } else {
            timerEl.classList.remove('urgent');
        }
    }
}
