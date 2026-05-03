
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
    mettreAJourHUD(DUREE_NIVEAU);
    sonAmbiance();
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
            sonDepeche();
        }
        _derniereSecondeRestante = tempsRestant;
        mettreAJourHUD(tempsRestant);
    }

    // Temps écoulé : recommencer le niveau
    if (tempsRestant === 0) {
        timerActif = false;
        sonTempsEcoule();
        arreterSonDepeche();
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

    afficherTempsEcoule();

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
    }, 0);
}

function passerNiveauSuivant() {
    if (!jeuActif) return;
    timerActif = false;
    jeuActif = false;
    arreterSonDepeche();
    arreterSonAmbiance();
    sonTresorTrouve();
    sonAmbiance();

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
        objScene3D = await initScene3D(objgl);
        sonNouveauNiveau();
        afficherNiveau(niveau);
        joueur = initJoueur();
        angleCamera = -Math.PI / 2;
        tempsEffectifEcouleMs = 0;
        dernierTimestampJeu = Date.now();
        _derniereSecondeRestante = -1;
        timerActif = true;
        jeuActif = true;
        mettreAJourHUD(DUREE_NIVEAU);
    }, 1000);
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

function activerVueAerienne() {
    if (score < 10) return false;
    cacherTexte();
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
    sonGameOver();
    arreterSonAmbiance();
    arreterSonDepeche();
    afficherGameOver();
    console.log("=== GAME OVER === Score final : " + score);
}

function declencherVictoire() {
    jeuActif = false;
    timerActif = false;
    arreterSonAmbiance();
    arreterSonDepeche();
    sonVictoire();
    afficherVictoire();
    console.log("=== VICTOIRE === Score final : " + score);
}


