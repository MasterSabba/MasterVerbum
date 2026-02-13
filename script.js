let myId = Math.random().toString(36).substring(2, 7).toUpperCase();
const peer = new Peer(myId);
let conn, secretWord = "", guessedLetters = [], mistakes = 0, amIMaster = false, isBot = false;
let timerInterval, timeLeft = 60, myScore = 0, powerUsed = false;

const dizionario = [
    "ACQUA", "ALBERO", "AMICO", "ANIMA", "APERTO", "ASTRO", "BACIO", "BARCA", "BENE", "BOSCO",
    "CALCIO", "CAMMINO", "CANTO", "CAPO", "CARTA", "CHIAVE", "CHIESA", "CIBO", "CIELO", "CITTA",
    "CLIMA", "CUORE", "DADO", "DANZA", "DIARIO", "DIETRO", "DITO", "DOLCE", "DONNA", "DOPO",
    "DRAGO", "ERBA", "ESTATE", "FACCIA", "FAME", "FANGO", "FESTA", "FIORE", "FIUME", "FOGLIA",
    "FORZA", "FUOCO", "GATTO", "GIOCO", "GIORNO", "GIRO", "GUERRA", "IDEA", "ISOLA", "LATTE",
    "LAVORO", "LEGGE", "LIBRO", "LINEA", "LUCE", "LUNA", "MARE", "MANO", "MELA", "MENTE",
    "MESE", "MODO", "MONDO", "MONTE", "MURO", "NASO", "NAVE", "NEVE", "NOME", "NOTTE",
    "OCCHIO", "ONDA", "ORA", "ORO", "PANE", "PAROLA", "PASSO", "PELLE", "PIANO", "PIEDE",
    "PIETRA", "POGGIO", "PONTE", "PORTA", "POSTO", "PRATO", "PUNTO", "RADIO", "RETE", "RISO",
    "SALE", "SANGUE", "SCUOLA", "SERA", "SOLE", "SOGNO", "SPADA", "STORIA", "TERRA", "TESTA",
    "TRENO", "UOMO", "VALLE", "VENTO", "VETRO", "VIA", "VINO", "VITA", "VOCE", "VUOTO", "ZAINO"
];

// Caricamento Punteggio da LocalStorage
const saved = localStorage.getItem('mv_stats');
if(saved) { myScore = JSON.parse(saved).score || 0; }

peer.on('open', id => document.getElementById('my-id').innerText = id);
peer.on('connection', c => { conn = c; setupRemote(); });

function getRank(s) {
    if (s >= 20) return "DIO DEL CODICE";
    if (s >= 15) return "ARCHITETTO";
    if (s >= 10) return "HACKER ELITE";
    if (s >= 5) return "ESPERTO";
    return "RECLUTA";
}

function updateRankUI() {
    const perc = Math.min((myScore / 20) * 100, 100);
    const rankLabel = getRank(myScore) + " (" + myScore + "/20)";

    // Homepage
    const fSetup = document.getElementById('rank-bar-fill-setup');
    const lSetup = document.getElementById('rank-label-setup');
    if(fSetup) fSetup.style.width = perc + "%";
    if(lSetup) lSetup.innerText = rankLabel;

    // In-game
    const fGame = document.getElementById('rank-bar-fill');
    const lGame = document.getElementById('rank-label-ingame');
    if(fGame) fGame.style.width = perc + "%";
    if(lGame) lGame.innerText = rankLabel;
}

function copyId() {
    navigator.clipboard.writeText(myId);
    document.getElementById('copy-btn').innerText = "COPIATO!";
    setTimeout(() => document.getElementById('copy-btn').innerText = "COPIA CODICE", 2000);
}

function startBotGame() {
    isBot = true; amIMaster = false;
    secretWord = dizionario[Math.floor(Math.random() * dizionario.length)];
    initGame();
}

function connectToPeer() {
    const rId = document.getElementById('peer-id-input').value.toUpperCase().trim();
    if(!rId) return;
    conn = peer.connect(rId);
    conn.on('open', () => setupRemote());
}

function setupRemote() {
    isBot = false;
    amIMaster = myId < conn.peer;
    if(amIMaster) {
        secretWord = (prompt("INSERISCI PAROLA SEGRETA:") || "HACKER").toUpperCase().replace(/[^A-Z]/g, '');
        conn.send({ type: 'START', word: secretWord });
        initGame();
    }
    conn.on('data', d => {
        if(d.type === 'START') { secretWord = d.word; initGame(); }
        if(d.type === 'GUESS') handleMove(d.letter);
    });
}

function initGame() {
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('play-screen').classList.remove('hidden');
    document.getElementById('overlay').classList.add('hidden');
    
    powerUsed = false;
    const pBtn = document.getElementById('power-btn');
    pBtn.disabled = false;
    pBtn.style.display = amIMaster ? "none" : "block";
    
    document.getElementById('word-display').classList.toggle('word-masked', amIMaster);
    document.getElementById('wrong-letters').innerText = "";
    
    guessedLetters = []; mistakes = 0;
    updateRankUI();
    createKeyboard();
    renderWord();
    if(!amIMaster) startTimer();
}

function createKeyboard() {
    const kb = document.getElementById('keyboard');
    kb.innerHTML = "";
    "QWERTYUIOPASDFGHJKLZXCVBNM".split("").forEach(l => {
        const btn = document.createElement('button');
        btn.className = "key"; btn.innerText = l;
        btn.onclick = () => { 
            btn.classList.add('used'); 
            handleMove(l); 
            if(conn && !isBot) conn.send({type:'GUESS', letter:l}); 
        };
        kb.appendChild(btn);
    });
}

function handleMove(l) {
    // Blocca se il gioco è già finito
    const won = secretWord.split("").every(char => guessedLetters.includes(char));
    if(mistakes >= 6 || won) return;

    if(guessedLetters.includes(l)) return;
    guessedLetters.push(l);
    
    if(!secretWord.includes(l)) {
        mistakes++;
        document.getElementById('wrong-letters').innerText += l + " ";
        if(navigator.vibrate) navigator.vibrate(50);
    }
    renderWord();
}

function renderWord() {
    const display = document.getElementById('word-display');
    display.innerHTML = secretWord.split("").map(l => 
        `<div class="letter-slot">${guessedLetters.includes(l) ? l : ""}</div>`
    ).join("");
    
    drawHangman();

    if(!amIMaster) {
        const isWin = secretWord.split("").every(l => guessedLetters.includes(l));
        if(isWin) endGame(true);
        else if(mistakes >= 6) endGame(false);
    }
}

function usePower() {
    if(powerUsed || timeLeft < 15) return;
    powerUsed = true;
    document.getElementById('power-btn').disabled = true;
    timeLeft -= 10;
    const hidden = secretWord.split("").filter(l => !guessedLetters.includes(l));
    if(hidden.length) {
        handleMove(hidden[0]);
        if(conn && !isBot) conn.send({type:'GUESS', letter:hidden[0]});
    }
}

function startTimer() {
    clearInterval(timerInterval);
    timeLeft = 60;
    timerInterval = setInterval(() => {
        // Ferma timer se gioco finito
        const isWin = secretWord.split("").every(l => guessedLetters.includes(l));
        if(isWin || mistakes >= 6) { clearInterval(timerInterval); return; }

        timeLeft--;
        document.getElementById('timer-display').innerText = `00:${timeLeft < 10 ? '0'+timeLeft : timeLeft}`;
        if(timeLeft <= 0) endGame(false);
    }, 1000);
}

function endGame(win) {
    clearInterval(timerInterval);
    const won = amIMaster ? !win : win;
    
    // Aggiorna punteggio
    if(won) myScore++; 
    else myScore = Math.max(0, myScore - 1);
    
    localStorage.setItem('mv_stats', JSON.stringify({score: myScore}));
    updateRankUI();

    const overlay = document.getElementById('overlay');
    overlay.classList.remove('hidden');
    overlay.style.display = 'flex';

    const title = document.getElementById('result-title');
    title.innerText = won ? "VITTORIA" : "SCONFITTA";
    title.className = "imposing-text " + (won ? "win-glow" : "lose-glow");
    
    document.getElementById('rank-display').innerText = "GRADO: " + getRank(myScore);
    document.getElementById('result-desc').innerText = "LA PAROLA ERA: " + secretWord;
}

function retry() { if(isBot) startBotGame(); else location.reload(); }

function resetAccount() { if(confirm("Vuoi azzerare tutto?")) { localStorage.clear(); location.reload(); } }

function drawHangman() {
    const canvas = document.getElementById('hangmanCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,160,120); ctx.strokeStyle = "#00f2ff"; ctx.lineWidth = 3; ctx.beginPath();
    if(mistakes > 0) ctx.arc(80, 25, 10, 0, Math.PI*2);
    if(mistakes > 1) { ctx.moveTo(80, 35); ctx.lineTo(80, 75); }
    if(mistakes > 2) { ctx.moveTo(80, 45); ctx.lineTo(60, 65); }
    if(mistakes > 3) { ctx.moveTo(80, 45); ctx.lineTo(100, 65); }
    if(mistakes > 4) { ctx.moveTo(80, 75); ctx.lineTo(65, 100); }
    if(mistakes > 5) { ctx.moveTo(80, 75); ctx.lineTo(95, 100); }
    ctx.stroke();
}

// Inizializza barre al caricamento
updateRankUI();
