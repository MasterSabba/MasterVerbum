// --- CORE CONFIGURATION ---
let myId = Math.random().toString(36).substring(2, 7).toUpperCase();
const peer = new Peer(myId);
let conn, secretWord = "", guessedLetters = [], mistakes = 0, amIMaster = false, isBot = false;
let timerInterval, timeLeft = 60, isOverclock = false, isGhost = false;
let wordHistory = [];

// [AUTO_SAVE] Data Loading
let myScore = JSON.parse(localStorage.getItem('mv_elite_stats'))?.score || 0;
let myHackerTag = localStorage.getItem('mv_hacker_tag') || "";

// Words kept in Italian as requested
const fallback = ["ALBERO","CASA","CANE","GATTO","LIBRO","PENNA","TAVOLO","SEDIA","FINESTRA","PORTA","STRADA","PIAZZA","SCUOLA","MARE","MONTE","FIUME","LAGO","NUVOLA","PIOGGIA","VENTO","FUOCO","TERRA","ARIA","LUCE","OMBRA","SOGNO","TEMPO","SPAZIO","ANIMA","CUORE","MENTE","CORPO","AMORE","ODIO","PACE","GUERRA","FORZA","ENERGIA","MAGIA","STELLA","PIANETA","GALASSIA","UNIVERSO","COMETA","ASTEROIDE","SATELLITE","ORBITA","GRAVITA","MELA","PERA","BANANA","LIMONE","FRAGOLA","CILIEGIA","PESCA","ARANCIA","UVA","PANE","PASTA","PIZZA","LATTE","UOVO","CARNE","PESCE","FORMAGGIO","VINO","BIRRA","ACQUA","SALE","PEPE","OLIO","ACETO","DOLCE","AMARO","SALATO","ACIDO","CALDO","FREDDO","ROSSO","VERDE","BLU","GIALLO","NERO","BIANCO","GRIGIO","AZZURRO","VIOLA","ROSA","MARRONE"];

// --- ADAPTIVE DIFFICULTY ---
function getDifficultySettings() {
    let s = { minL: 3, maxL: 7, time: 60, shake: false };
    if (myScore >= 30) { s.minL = 5; s.maxL = 10; }
    if (myScore >= 60) { s.minL = 7; s.maxL = 12; s.time = 45; }
    if (myScore >= 85) { s.minL = 9; s.maxL = 15; s.time = 35; s.shake = true; }
    if (myScore >= 95) { s.minL = 10; s.maxL = 20; s.time = 25; s.shake = true; }
    return s;
}

function getRandomWord() {
    const config = getDifficultySettings();
    let av = fallback.filter(w => !wordHistory.includes(w) && w.length >= config.minL && w.length <= config.maxL);
    if (av.length === 0) { wordHistory = []; av = fallback.filter(w => w.length >= config.minL); }
    const picked = av[Math.floor(Math.random() * av.length)];
    wordHistory.push(picked);
    return picked;
}

// --- INTERFACE & RANK ---
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

    const updateElements = (suffix) => {
        const fill = document.getElementById('rank-bar-fill-' + suffix);
        const label = document.getElementById('rank-label-' + suffix);
        if(fill) { fill.style.width = progress + "%"; fill.style.background = c; }
        if(label) { label.innerText = `${r} (${myScore}/100)`; label.style.color = c; }
    };

    updateElements('setup');
    updateElements('final');
    if (myScore >= 100) triggerGodEnding();
}

// --- HANGMAN DRAWING ---
function drawHangman() {
    const canvas = document.getElementById('hangmanCanvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#00f2ff";
    ctx.lineWidth = 2;
    if (mistakes > 0) { ctx.beginPath(); ctx.moveTo(20, 80); ctx.lineTo(140, 80); ctx.stroke(); } 
    if (mistakes > 1) { ctx.beginPath(); ctx.moveTo(40, 80); ctx.lineTo(40, 10); ctx.lineTo(100, 10); ctx.lineTo(100, 20); ctx.stroke(); } 
    if (mistakes > 2) { ctx.beginPath(); ctx.arc(100, 30, 10, 0, Math.PI * 2); ctx.stroke(); } 
    if (mistakes > 3) { ctx.beginPath(); ctx.moveTo(100, 40); ctx.lineTo(100, 60); ctx.stroke(); } 
    if (mistakes > 4) { ctx.beginPath(); ctx.moveTo(100, 45); ctx.lineTo(85, 55); ctx.moveTo(100, 45); ctx.lineTo(115, 55); ctx.stroke(); } 
    if (mistakes > 5) { ctx.beginPath(); ctx.moveTo(100, 60); ctx.lineTo(85, 75); ctx.moveTo(100, 60); ctx.lineTo(115, 75); ctx.stroke(); } 
}

// --- GAME LOGIC ---
function startBotGame() {
    isBot = true; amIMaster = false;
    secretWord = getRandomWord();
    initGame();
}

function initGame() {
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('play-screen').classList.remove('hidden');
    document.getElementById('overlay').style.display = 'none';
    guessedLetters = []; mistakes = 0;
    timeLeft = getDifficultySettings().time;
    isOverclock = false; isGhost = false;
    
    document.querySelectorAll('.btn-pwr').forEach(b => {
        b.disabled = true; b.style.opacity = "0.3";
        b.removeAttribute('data-used');
        const led = b.querySelector('.led');
        if(led) led.className = 'led';
    });

    createKeyboard();
    renderWord();
    drawHangman();
    startTimer();
}

function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if(!amIMaster) {
            if(!isOverclock) timeLeft--;
            if(timeLeft <= 45) unlockPower('p-overclock');
            if(timeLeft <= 30) unlockPower('p-rescan');
            if(timeLeft <= 15) unlockPower('p-ghost');
            if(timeLeft <= 0) triggerEnd(false);
        }
        document.getElementById('timer-display').innerText = formatTime(timeLeft);
    }, 1000);
}

function triggerEnd(win) {
    clearInterval(timerInterval);
    if (win) {
        myScore++;
        if (!myHackerTag) {
            myHackerTag = prompt("NEW RECORD! ENTER HACKER_TAG:", "USER_" + myId);
            if(myHackerTag) localStorage.setItem('mv_hacker_tag', myHackerTag);
        }
    } else {
        myScore = Math.max(0, myScore - 1);
    }
    updateRankUI();

    const ov = document.getElementById('overlay');
    ov.style.display = 'flex';
    
    // NEON LED EFFECT ON TEXT
    const title = document.getElementById('result-title');
    title.innerText = win ? "ACCESS_GRANTED" : "CONNECTION_TERMINATED";
    title.style.color = "#fff";
    title.style.textShadow = "0 0 10px #00f2ff, 0 0 20px #00f2ff, 0 0 40px #00f2ff";

    let ledHTML = win ? `<div class="led led-on" style="margin: 0 auto 15px; background: #39ff14; box-shadow: 0 0 15px #39ff14;"></div>` : "";

    document.getElementById('result-desc').innerHTML = `
        ${ledHTML}
        <p style="margin-top:10px;">KEYWORD: <span style="color:#00f2ff; font-weight:bold; letter-spacing:2px;">${secretWord}</span></p>
    `;
}

// --- POWERS ---
function unlockPower(id) {
    const b = document.getElementById(id);
    if(b && !b.hasAttribute('data-used')) {
        b.disabled = false; b.style.opacity = "1";
        const led = b.querySelector('.led');
        if(led) led.classList.add('led-on');
    }
}

function consumePower(id) {
    const b = document.getElementById(id);
    if(b) {
        b.disabled = true; b.setAttribute('data-used', 'true');
        b.style.opacity = "0.1";
        const led = b.querySelector('.led');
        if(led) led.className = 'led';
    }
}

function useOverclock() { isOverclock = true; consumePower('p-overclock'); setTimeout(() => isOverclock = false, 5000); }
function useRescan() { 
    if(timeLeft <= 10) return;
    timeLeft -= 10; consumePower('p-rescan');
    let m = secretWord.split("").filter(l => !guessedLetters.includes(l));
    if(m.length) handleMove(m[0]);
}
function useGhost() { isGhost = true; consumePower('p-ghost'); }

// --- UTILS ---
function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

function renderWord() {
    const d = document.getElementById('word-display');
    d.innerHTML = secretWord.split("").map(l => `<div class="letter-slot">${guessedLetters.includes(l) ? l : ""}</div>`).join("");
    if(!amIMaster) {
        if(secretWord.split("").every(l => guessedLetters.includes(l))) triggerEnd(true);
        else if(mistakes >= 6) triggerEnd(false);
    }
}

function handleMove(l) {
    if(guessedLetters.includes(l)) return;
    guessedLetters.push(l);
    if(!secretWord.includes(l)) {
        if(isGhost) { isGhost = false; } else {
            mistakes++; drawHangman();
        }
    }
    renderWord();
}

function createKeyboard() {
    const k = document.getElementById('keyboard');
    k.innerHTML = "";
    "QWERTYUIOPASDFGHJKLZXCVBNM".split("").forEach(l => {
        const b = document.createElement('button');
        b.className = "key"; b.innerText = l;
        b.onclick = () => { b.classList.add('used'); b.disabled = true; handleMove(l); };
        k.appendChild(b);
    });
}

function toggleManual() {
    const m = document.getElementById('manual-overlay');
    m.style.display = m.style.display === 'flex' ? 'none' : 'flex';
}

function retry() {
    document.getElementById('overlay').style.display = 'none';
    if(isBot) startBotGame(); else location.reload();
}

function resetAccount() {
    if(confirm("WIPE ALL LOCAL DATA?")) { localStorage.clear(); location.reload(); }
}

function copyId() {
    navigator.clipboard.writeText(myId);
    document.getElementById('copy-btn').innerText = "COPIED!";
    setTimeout(() => document.getElementById('copy-btn').innerText = "Copy Code", 2000);
}

function triggerGodEnding() {
    document.body.innerHTML = `<div style="background:black; color:#ff00ff; height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; font-family:monospace; text-align:center;">
        <h1 style="text-shadow: 0 0 20px #ff00ff;">GOD_MODE_ACTIVE</h1><button onclick="localStorage.clear();location.reload();">REBOOT</button>
    </div>`;
}

// --- INITIALIZATION ---
peer.on('open', id => { 
    document.getElementById('my-id').innerText = id; 
    document.getElementById('connection-led').className = 'led led-on';
    document.getElementById('status-text').innerText = "SYSTEM_READY";
});
updateRankUI();
