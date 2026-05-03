function fermerPressStart() {
    var el = document.getElementById('ecran-text');
    if (el) el.style.display = 'none';
}

function afficherGameOver() {
    var el = document.getElementById('ecran-text');
    if (!el) return;
    el.style.animation = '';
    el.style.backgroundColor = 'red';
    el.style.color = 'black';
    el.style.fontSize = '32px';
    el.textContent = 'GAME OVER';
    el.style.display = 'flex';
}

function afficherVictoire() {
    var el = document.getElementById('ecran-text');
    if (!el) return;
    el.style.animation = '';
    el.style.fontSize = '32px';
    el.textContent = 'VICTOIRE!!!';
    el.style.backgroundColor = 'green';
    el.style.color = 'white';
    el.style.display = 'flex';
}

function afficherNiveau(n) {
    var el = document.getElementById('ecran-text');
    if (!el) return;
    el.style.display = 'flex';
    el.style.animation = '';
    el.style.backgroundColor = 'transparent';
    el.style.color = '#fc1303';
    el.style.fontSize = '48px';
    el.textContent = 'Niveau';
    el.style.display = 'flex';
    setTimeout(function() {
        el.textContent = n;
        setTimeout(function() {
            el.style.display = 'none';  
        }, 2000);
    }, 2000);
}

function afficherTempsEcoule() {
    var el = document.getElementById('ecran-text');
    if (!el) return;
    el.style.animation = '';
    el.style.backgroundColor = 'transparent';
    el.style.color = '#fc1303';
    el.style.fontSize = '48px';
    el.textContent = 'TEMPS ECOULE';
    el.style.display = 'flex';
    setTimeout(function() {
        el.style.display = 'none';
    }, 1000);
}

function afficherDepeche() {
    var el = document.getElementById('ecran-text');
    if (!el) return;
    el.style.display = 'flex';
    el.style.backgroundColor = 'transparent';
    el.style.color = '#fc1303';
    el.style.fontSize = '48px';
    el.textContent = 'DEPECHE TOI';
    el.style.animation = 'clignoter 0.6s step-start infinite';
    el.style.display = 'flex';
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

function cacherTexte() {
    var el = document.getElementById('ecran-text');
    if (el) el.style.display = 'none';
}
