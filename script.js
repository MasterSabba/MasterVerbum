// --- LOGICA ABILITÀ (FIXED) ---
function unlockPower(id) {
    const b = document.getElementById(id);
    if(b && !b.hasAttribute('data-used') && !amIMaster) {
        b.disabled = false; 
        b.style.opacity = "1";
        // Illuminazione azzurra neon senza contorni verdi
        b.style.boxShadow = "0 0 15px #00f2ff";
        b.style.color = "#00f2ff";
        b.style.borderColor = "#00f2ff";
    }
}

function consumePower(id) {
    const b = document.getElementById(id);
    if(b) {
        b.disabled = true; 
        b.setAttribute('data-used', 'true'); 
        b.style.opacity = "0.1";
        b.style.boxShadow = "none";
        b.style.color = "#444";
        b.style.borderColor = "#444";
    }
}

// Funzioni effettive collegate ai tasti
function useOverclock() { 
    if(isBot || !amIMaster) {
        isOverclock = true; 
        consumePower('p-overclock'); 
        setTimeout(() => isOverclock = false, 5000); 
    }
}

function useRescan() { 
    if(timeLeft <= 10) return; 
    timeLeft -= 10; 
    consumePower('p-rescan'); 
    // Trova una lettera non ancora indovinata e la rivela
    let missing = secretWord.split("").filter(l => !guessedLetters.includes(l));
    if(missing.length > 0) handleMove(missing[0]);
}

function useGhost() { 
    isGhost = true; 
    consumePower('p-ghost'); 
}

// --- RESET UI ALL'INIZIO PARTITA ---
function initGame() {
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('play-screen').classList.remove('hidden');
    document.getElementById('overlay').style.display = 'none';
    guessedLetters = []; mistakes = 0; timeLeft = 60;
    
    // Reset estetico pulsanti (spenti all'inizio)
    document.querySelectorAll('.btn-pwr').forEach(b => {
        b.disabled = true; 
        b.style.opacity = "0.2"; 
        b.style.boxShadow = "none";
        b.style.color = "#444";
        b.style.borderColor = "#444";
        b.removeAttribute('data-used');
    });

    createKeyboard(); renderWord(); drawHangman();
    if (!amIMaster) startTimer();
    else document.getElementById('timer-display').innerText = "LOCK";
}
