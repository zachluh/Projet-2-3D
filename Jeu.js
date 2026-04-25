var niveau = 1;
var jeuActif = false;
var timerActif = false;
var tempsDebut = 0;
var derniereSecondeLoggee = -1;

function demarrerJeu() {
    niveau = 1;
    jeuActif = true;
    timerActif = true;
    tempsDebut = Date.now();
    derniereSecondeLoggee = -1;
    console.log("=== Niveau " + niveau + " ===");
}

function mettreAJourJeu() {
    if (!timerActif) return;
    var secondes = Math.floor((Date.now() - tempsDebut) / 1000);
    if (secondes !== derniereSecondeLoggee) {
        derniereSecondeLoggee = secondes;
        var min = Math.floor(secondes / 60);
        var sec = secondes % 60;
        var affichage = min + ":" + (sec < 10 ? "0" : "") + sec;
        console.log("Niveau " + niveau + " | Temps : " + affichage);
    }
}

function passerNiveauSuivant() {
    timerActif = false;
    jeuActif = false;

    var secondes = Math.floor((Date.now() - tempsDebut) / 1000);
    var min = Math.floor(secondes / 60);
    var sec = secondes % 60;
    var temps = min + ":" + (sec < 10 ? "0" : "") + sec;
    console.log("=== Trésor trouvé! Temps : " + temps + " ===");

    niveau++;
    console.log("=== Passage au suivant " + '... ===');

    setTimeout(function() {
        joueur = initJoueur();
        angleCamera = 0;
        initTresor(objgl);
        tempsDebut = Date.now();
        derniereSecondeLoggee = -1;
        timerActif = true;
        jeuActif = true;
        console.log("=== Niveau " + niveau + " - Chrono démarré ===");
    }, 2000);
}
