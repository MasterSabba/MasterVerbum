// --- CORE CONFIGURATION ---
let myId = Math.random().toString(36).substring(2, 7).toUpperCase();
const peer = new Peer(myId);
let conn, secretWord = "", guessedLetters = [], mistakes = 0, amIMaster = false, isBot = false;
let timerInterval, timeLeft = 60, isOverclock = false, isGhost = false;
let wordHistory = [];

// [AUTO_SAVE] Data Loading
let myScore = JSON.parse(localStorage.getItem('mv_elite_stats'))?.score || 0;
let myHackerTag = localStorage.getItem('mv_hacker_tag') || "GUEST_USER";

const fallback = ["ALBERO","CASA","CANE","GATTO","LIBRO","PENNA","TAVOLO","SEDIA","FINESTRA","PORTA","STRADA","PIAZZA","SCUOLA","MARE","MONTE","FIUME","LAGO","NUVOLA","PIOGGIA","VENTO","FUOCO","TERRA","ARIA","LUCE","OMBRA","SOGNO","TEMPO","SPAZIO","ANIMA","CUORE","MENTE","CORPO","AMORE","ODIO","PACE","GUERRA","FORZA","ENERGIA","MAGIA","STELLA","PIANETA","GALASSIA","UNIVERSO","COMETA","ASTEROIDE","SATELLITE","ORBITA","GRAVITA","MELA","PERA","BANANA","LIMONE","FRAGOLA","CILIEGIA","PESCA","ARANCIA","UVA","PANE","PASTA","PIZZA","LATTE","UOVO","CARNE","PESCE","FORMAGGIO","VINO","BIRRA","ACQUA","SALE","PEPE","OLIO","ACETO","DOLCE","AMARO","SALATO","ACIDO","CALDO","FREDDO","ROSSO","VERDE","BLU","GIALLO","NERO","BIANCO","GRIGIO","AZZURRO","VIOLA","ROSA","MARRONE"];

// --- UI UPDATE CON NICKNAME ---
function updateRankUI() {
    const progress = Math.min((myScore / 100) * 100, 100);
    let r = "NOVICE", c = "#888";
    if(myScore >= 10) { r = "SCRIPT_KIDDIE"; c = "#00d4ff"; }
    if(myScore >= 30) { r = "CYBER_GHOST"; c = "#00f2ff"; }
    if(myScore >= 50) { r = "ELITE_HACKER"; c = "#39ff14"; }
    if(myScore >= 75) { r = "SYSTEM_BREACHER"; c = "#ffea00"; }
    if(myScore >= 90) { r = "VOID_ARCHITECT"; c = "#ff003c"; }
    if(myScore >= 100) { r = "GOD_MODE"; c = "#ff00ff"; }

    localStorage.setItem('mv_elite_stats', JSON.stringify({score: myScore}));
    
    // Aggiorna Nickname e Status nella barra
    const statusText = document.getElementById('status-text');
    if(statusText) statusText.innerText = `[${myHackerTag}] SYSTEM_READY`;

    const updateElements = (suffix) => {
        const fill = document.getElementById('rank-bar-fill-' + suffix);
        const label = document.getElementById('rank-label-' + suffix);
        if(fill) { fill.style.width = progress + "%"; fill.style.background = c; }
        if(label) { label.innerText = `${r} (${myScore}/100)`; label.style.color = c; }
    };
    updateElements('setup');
    updateElements('final');
}

// --- DISEGNO OMINO CLASSICO ---
function drawHangman() {
    const canvas = document.getElementById('hangmanCanvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#00f2ff";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";

    // Disegno basato sui "mistakes" (6 parti: Testa, Busto, 2 Braccia, 2 Gambe)
    if (mistakes > 0) { // Testa
        ctx.beginPath(); ctx.arc(75, 20, 12, 0, Math.PI * 2); ctx.stroke(); 
    }
    if (mistakes > 1) { // Busto
        ctx.beginPath(); ctx.moveTo(75, 32); ctx.lineTo(75, 60); ctx.stroke(); 
    }
    if (mistakes > 2) { // Braccio SX
        ctx.beginPath(); ctx.moveTo(75, 40); ctx.lineTo(55, 50); ctx.stroke(); 
    }
    if (mistakes > 3) { // Braccio DX
        ctx.beginPath(); ctx.moveTo(75, 40); ctx.lineTo(95, 50); ctx.stroke(); 
    }
    if (mistakes > 4) { // Gamba SX
        ctx.beginPath(); ctx.moveTo(75, 60); ctx.lineTo(60, 85); ctx.stroke(); 
    }
    if (mistakes > 5) { // Gamba DX
        ctx.beginPath(); ctx.moveTo(75, 60); ctx.lineTo(90, 85); ctx.stroke(); 
    }
}

// --- MULTIPLAYER & CONN ---
function connectToPeer() {
    const targetId = document.getElementById('peer-id-input').value.toUpperCase();
    if (!targetId) return;
    document.getElementById('status-text').innerText = "LINKING...";
    conn = peer.connect(targetId);
    setupConn();
}

peer.on('connection', (c) => { conn = c; setupConn(); });

function setupConn() {
    conn.on('open', () => {
        document.getElementById('status-text').innerText = "CONNECTED";
        if (!conn.outbound) {
            amIMaster = true;
            let word = prompt("ENTER SECRET WORD:").toUpperCase();
            secretWord = word || "HACK";
            conn.send({ type: 'start', word: secretWord });
            initGame();
        }
    });
    conn.on('data', (data) => {
        if (data.type === 'start') { secretWord = data.word; amIMaster = false; initGame(); }
        else if (data.type === 'move') { handleMove(data.letter); }
    });
}

// --- LOGICA GIOCO ---
function startBotGame() {
    isBot = true; amIMaster = false;
    secretWord = fallback[Math.floor(Math.random() * fallback.length)];
    initGame();
}

function initGame() {
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('play-screen').classList.remove('hidden');
    document.getElementById('overlay').style.display = 'none';
    guessedLetters = []; mistakes = 0; timeLeft = 60;
    document.querySelectorAll('.btn-pwr').forEach(b => {
        b.disabled = true; b.style.opacity = "0.3"; b.removeAttribute('data-used');
    });
    createKeyboard(); renderWord(); drawHangman();
    if (!amIMaster) startTimer();
}

function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        if(timeLeft <= 45) unlockPower('p-overclock');
        if(timeLeft <= 30) unlockPower('p-rescan');
        if(timeLeft <= 15) unlockPower('p-ghost');
        if(timeLeft <= 0) triggerEnd(false);
        document.getElementById('timer-display').innerText = formatTime(timeLeft);
    }, 1000);
}

// --- OVERLAY FINALE (STILE VERBUM) ---
function triggerEnd(win) {
    clearInterval(timerInterval);
    if (!amIMaster) {
        if (win) {
            myScore++;
            if (myHackerTag === "GUEST_USER") {
                let n = prompt("NEW RECORD! ENTER TAG:");
                if(n) { myHackerTag = n; localStorage.setItem('mv_hacker_tag', n); }
            }
        } else {
            myScore = Math.max(0, myScore - 1);
        }
        updateRankUI();
    }

    const ov = document.getElementById('overlay');
    ov.style.display = 'flex';
    
    const title = document.getElementById('result-title');
    title.innerText = win ? "ACCESS_GRANTED" : "CONNECTION_TERMINATED";
    
    // Applichiamo lo stile NEON pulito come VERBUM
    title.style.fontSize = "2.5rem";
    title.style.fontWeight = "900";
    if (win) {
        title.style.color = "#00f2ff";
        title.style.textShadow = "0 0 10px #00f2ff, 0 0 20px #00f2ff";
    } else {
        title.style.color = "#ff003c";
        title.style.textShadow = "0 0 10px #ff003c, 0 0 20px #ff003c";
    }

    document.getElementById('result-desc').innerHTML = `
        <p style="margin-top:20px; font-family:monospace;">KEYWORD: <span style="color:#fff; border-bottom: 2px solid;">${secretWord}</span></p>
    `;
}

// --- UTILS ---
function handleMove(l) {
    if(guessedLetters.includes(l)) return;
    guessedLetters.push(l);
    if (conn && !isBot && !amIMaster) conn.send({ type: 'move', letter: l });
    if(!secretWord.includes(l)) {
        if(isGhost) isGhost = false; else mistakes++;
        drawHangman();
    }
    renderWord();
}

function renderWord() {
    const d = document.getElementById('word-display');
    d.innerHTML = secretWord.split("").map(l => `<div class="letter-slot">${guessedLetters.includes(l) ? l : ""}</div>`).join("");
    if(secretWord.split("").every(l => guessedLetters.includes(l))) triggerEnd(true);
    else if(mistakes >= 6) triggerEnd(false);
}

function createKeyboard() {
    const k = document.getElementById('keyboard');
    k.innerHTML = "";
    "QWERTYUIOPASDFGHJKLZXCVBNM".split("").forEach(l => {
        const b = document.createElement('button');
        b.className = "key"; b.innerText = l;
        if(amIMaster) b.disabled = true;
        b.onclick = () => { b.classList.add('used'); b.disabled = true; handleMove(l); };
        k.appendChild(b);
    });
}

function unlockPower(id) {
    const b = document.getElementById(id);
    if(b && !b.hasAttribute('data-used') && !amIMaster) {
        b.disabled = false; b.style.opacity = "1";
        const led = b.querySelector('.led'); if(led) led.classList.add('led-on');
    }
}

function consumePower(id) {
    const b = document.getElementById(id);
    if(b) {
        b.disabled = true; b.setAttribute('data-used', 'true'); b.style.opacity = "0.1";
        const led = b.querySelector('.led'); if(led) led.className = 'led';
    }
}

function useOverclock() { isOverclock = true; consumePower('p-overclock'); setTimeout(() => isOverclock = false, 5000); }
function useRescan() { if(timeLeft <= 10) return; timeLeft -= 10; consumePower('p-rescan'); let m = secretWord.split("").filter(l => !guessedLetters.includes(l)); if(m.length) handleMove(m[0]); }
function useGhost() { isGhost = true; consumePower('p-ghost'); }

function formatTime(s) { const m = Math.floor(s/60); const sec = s%60; return `${m.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`; }
function retry() { if(isBot) startBotGame(); else location.reload(); }
function copyId() { navigator.clipboard.writeText(myId); document.getElementById('copy-btn').innerText = "COPIED!"; setTimeout(() => document.getElementById('copy-btn').innerText = "Copy Code", 2000); }

peer.on('open', id => { 
    document.getElementById('my-id').innerText = id; 
    updateRankUI(); 
});
