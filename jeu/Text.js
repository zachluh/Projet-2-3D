/** --- Text.js --- 
 * Ce fichier contient la logique liée à l'affichage de textes à l'écran : écrans de début et de fin, messages de victoire et de défaite, affichage du HUD, etc.
 * @author Zachary Luheshi
*/


// Cache l'écran "Pesez une touch pour commencer"
function fermerPressStart() {
    var el = document.getElementById('ecran-press-start');
    if (el) el.style.display = 'none';
}

// Affiche l'écran "Game Over"
function afficherGameOver() {
    var el = document.getElementById('ecran-text');
    if (!el) return;
    el.style.animation = '';
    el.style.backgroundColor = 'red';
    el.style.color = 'black';
    el.style.fontSize = '32px';
    document.getElementById('ecran-text-label').textContent = 'GAME OVER';
    var img = document.getElementById('ecran-flowey-end');
    if (img) { img.src = 'cutscenes/images/flowey_gameover.png'; img.style.display = 'block'; }
    el.style.display = 'flex';
}

// Affiche l'écran de victoire
function afficherVictoire() {
    var el = document.getElementById('ecran-text');
    if (!el) return;
    el.style.animation = '';
    el.style.fontSize = '32px';
    document.getElementById('ecran-text-label').textContent = 'VICTOIRE!!!';
    el.style.backgroundColor = 'green';
    el.style.color = 'white';
    var img = document.getElementById('ecran-flowey-end');
    if (img) { img.src = 'cutscenes/images/flowey_victoire.png'; img.style.display = 'block'; }
    el.style.display = 'flex';
}


// Affiche le numéro du niveau au début de chaque niveau
//Inclue un écran noir sur le premier niveau pour transitionner depuis l'intro de Flowey
function afficherNiveau(n) {
    var el = document.getElementById('ecran-text');
    if (!el) return;
    var img = document.getElementById('ecran-flowey-end');
    if (img) img.style.display = 'none';
    el.style.animation = '';
    el.style.opacity = '1';
    el.style.backgroundColor = n < 2 ? 'black' : 'transparent';
    el.style.color = '#fc1303';
    el.style.fontSize = '48px';
    document.getElementById('ecran-text-label').textContent = 'Niveau ' + n;
    el.style.display = 'flex';
    setTimeout(function() {
        el.style.animation = 'fade-out 1s ease forwards';
        setTimeout(function() {
            el.style.display = 'none';
            el.style.animation = '';
        }, 1000);
    }, 3000);
}


// Affiche un message de "Temps écoulé" lorsque le temps est écoulé sans que le joueur trouve le trésor
function afficherTempsEcoule() {
    var el = document.getElementById('ecran-text');
    if (!el) return;
    var img = document.getElementById('ecran-flowey-end');
    if (img) img.style.display = 'none';
    el.style.animation = '';
    el.style.backgroundColor = 'transparent';
    el.style.color = '#fc1303';
    el.style.fontSize = '48px';
    document.getElementById('ecran-text-label').textContent = 'TEMPS ECOULE';
    el.style.display = 'flex';
    setTimeout(function() {
        el.style.display = 'none';
    }, 1000);
}

//Affiche le message "Dépêche toi" en clignotant lorsque le temps restant est inférieur ou égal à 10 secondes
function afficherDepeche() {
    var el = document.getElementById('ecran-text');
    if (!el) return;
    var img = document.getElementById('ecran-flowey-end');
    if (img) img.style.display = 'none';
    el.style.display = 'flex';
    el.style.backgroundColor = 'transparent';
    el.style.color = '#fc1303';
    el.style.fontSize = '48px';
    document.getElementById('ecran-text-label').textContent = 'DEPECHE TOI';
    el.style.animation = 'clignoter 0.6s step-start infinite';
}

// Met à jour les éléments du HUD (niveau, timer, score, murs restants) en fonction de l'état actuel du jeu
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

// Cache l'écran de texte (invoqué lorsque l'utilisateur affiche la vue aérienne)
function cacherTexte() {
    var el = document.getElementById('ecran-text');
    if (el) el.style.display = 'none';
}
