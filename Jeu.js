var niveau = 1;
var jeuActif = false;
var timerActif = false;
var tempsDebut = 0;
var score = 300;
var DUREE_NIVEAU = 60; // Durée d'un niveau en secondes (variable globale pour les tests)

var enModeVueAerienne = false;
var tempsDebutVueAerienne = 0;
var derniereSecondeVueAerienne = 0;

var _derniereSecondeRestante = -1;
var _niveauEnRestart = false;

function demarrerJeu() {
    niveau = 1;
    score = 300;
    jeuActif = true;
    timerActif = true;
    tempsDebut = Date.now();
    _derniereSecondeRestante = -1;
    _niveauEnRestart = false;
    mettreAJourHUD(DUREE_NIVEAU);
}

function mettreAJourJeu() {
    if (!timerActif) return;

    var now = Date.now();
    var tempsEcoule = Math.floor((now - tempsDebut) / 1000);
    var tempsRestant = Math.max(0, DUREE_NIVEAU - tempsEcoule);

    // Déduction de points en mode vue aérienne (-10 pts par seconde)
    if (enModeVueAerienne) {
        var secondesAeriennes = Math.floor((now - tempsDebutVueAerienne) / 1000);
        if (secondesAeriennes > derniereSecondeVueAerienne) {
            score -= 10 * (secondesAeriennes - derniereSecondeVueAerienne);
            derniereSecondeVueAerienne = secondesAeriennes;
            mettreAJourHUD(tempsRestant);
        }
    }

    // Mettre à jour le HUD une fois par seconde seulement
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
        joueur = initJoueur();
        angleCamera = -Math.PI / 2;
        // Les objets gardent leurs positions, seul le joueur et le timer sont remis à zéro
        tempsDebut = Date.now();
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

    var tempsEcoule = Math.floor((Date.now() - tempsDebut) / 1000);
    var secondesRestantes = Math.max(0, DUREE_NIVEAU - tempsEcoule);
    score += 10 * secondesRestantes;

    niveau++;
    mettreAJourHUD(secondesRestantes);

    if (niveau > 10) {
        declencherVictoire();
        return;
    }

    setTimeout(async function() {
        initMatrice();
        joueur = initJoueur();
        angleCamera = -Math.PI / 2;
        objScene3D = await initScene3D(objgl);
        tempsDebut = Date.now();
        _derniereSecondeRestante = -1;
        timerActif = true;
        jeuActif = true;
        mettreAJourHUD(DUREE_NIVEAU);
    }, 2000);
}

// Appelé quand le joueur utilise un ouvreur de murs (espace)
// Retourne true si l'ouvreur a pu être utilisé, false sinon
function utiliserOuvreur() {
    if (score < 50) return false;
    score -= 50;
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

    if (niveauEl) niveauEl.textContent = 'Niveau ' + niveau;
    if (scoreEl) scoreEl.textContent = score + ' pts';

    if (timerEl) {
        timerEl.textContent = tempsRestant + 's';
        if (tempsRestant <= 10) {
            timerEl.classList.add('urgent');
        } else {
            timerEl.classList.remove('urgent');
        }
    }
}
