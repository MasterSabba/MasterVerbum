// --- CONFIGURAZIONE CORE ---
let myId = Math.random().toString(36).substring(2, 7).toUpperCase();
const peer = new Peer(myId);
let conn, secretWord = "", guessedLetters = [], mistakes = 0, amIMaster = false, isBot = false;
let timerInterval, timeLeft = 60, isOverclock = false, isGhost = false;

// CARICAMENTO DATI [AUTO_SAVE]
let myScore = JSON.parse(localStorage.getItem('mv_elite_stats'))?.score || 0;
let myHackerTag = localStorage.getItem('mv_hacker_tag') || "GUEST_USER";

const fallback = ["ALBERO","CASA","CANE","GATTO","LIBRO","PENNA","TAVOLO","SEDIA","FINESTRA","PORTA","STRADA","PIAZZA","SCUOLA","MARE","MONTE","FIUME","LAGO","NUVOLA","PIOGGIA","VENTO","FUOCO","TERRA","ARIA","LUCE","OMBRA","SOGNO","TEMPO","SPAZIO","ANIMA","CUORE","MENTE","CORPO","AMORE","ODIO","PACE","GUERRA","FORZA","ENERGIA","MAGIA","STELLA","PIANETA","GALASSIA","UNIVERSO","COMETA","ASTEROIDE","SATELLITE","ORBITA","GRAVITA","MELA","PERA","BANANA","LIMONE","FRAGOLA","CILIEGIA","PESCA","ARANCIA","UVA","PANE","PASTA","PIZZA","LATTE","UOVO","CARNE","PESCE","FORMAGGIO","VINO","BIRRA","ACQUA","SALE","PEPE","OLIO","ACETO","DOLCE","AMARO","SALATO","ACIDO","CALDO","FREDDO","ROSSO","VERDE","BLU","GIALLO","NERO","BIANCO","GRIGIO","AZZURRO","VIOLA","ROSA","MARRONE"];

// --- TASTIERA FISICA ---
document.addEventListener('keydown', (e) => {
    if (document.getElementById('play-screen').classList.contains('hidden')) return;
    if (amIMaster || document.getElementById('overlay').style.display === 'flex') return;
    const l = e.key.toUpperCase();
    if (l >= 'A' && l <= 'Z' && l.length === 1) {
        const btn = Array.from(document.querySelectorAll('.key')).find(b => b.innerText === l && !b.disabled);
        if (btn) { btn.classList.add('used'); btn.disabled = true; handleMove(l); }
    }
});

// --- UI & LED INTERATTIVO ---
function updateRankUI() {
    const progress = Math.min((myScore / 100) * 100, 100);
    let r = "NOVICE", c = "#888";
    if(myScore >= 10) { r = "SCRIPT_KIDDIE"; c = "#00d4ff"; }
    if(myScore >= 50) { r = "ELITE_HACKER"; c = "#39ff14"; }
    if(myScore >= 90) { r = "VOID_ARCHITECT"; c = "#ff003c"; }

    localStorage.setItem('mv_elite_stats', JSON.stringify({score: myScore}));
    
    // Mostra Nickname in alto a destra
    const st = document.getElementById('status-text');
    if(st) st.innerText = `[${myHackerTag}] SYSTEM_READY`;
    
    // LED Verde cliccabile per il manuale
    const mainLed = document.getElementById('connection-led');
    if(mainLed) { 
        mainLed.style.background = "#39ff14"; 
        mainLed.style.boxShadow = "0 0 10px #39ff14";
        mainLed.style.cursor = "pointer";
        mainLed.onclick = toggleManual; 
    }

    const update = (s) => {
        const f = document.getElementById('rank-bar-fill-' + s);
        const l = document.getElementById('rank-label-' + s);
        if(f) { f.style.width = progress + "%"; f.style.background = c; }
        if(l) { l.innerText = `${r} (${myScore}/100)`; l.style.color = c; }
    };
    update('setup'); update('final');
}

// --- OMINO NITIDO ---
function drawHangman() {
    const canvas = document.getElementById('hangmanCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#00f2ff";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";

    ctx.beginPath();
    if (mistakes > 0) { ctx.arc(75, 20, 10, 0, Math.PI * 2); } // Testa
    if (mistakes > 1) { ctx.moveTo(75, 30); ctx.lineTo(75, 60); } // Busto
    if (mistakes > 2) { ctx.moveTo(75, 40); ctx.lineTo(55, 50); } // Braccio SX
    if (mistakes > 3) { ctx.moveTo(75, 40); ctx.lineTo(95, 50); } // Braccio DX
    if (mistakes > 4) { ctx.moveTo(75, 60); ctx.lineTo(60, 80); } // Gamba SX
    if (mistakes > 5) { ctx.moveTo(75, 60); ctx.lineTo(90, 80); } // Gamba DX
    ctx.stroke();
}

// --- MULTIPLAYER FIXED ---
function connectToPeer() {
    const tid = document.getElementById('peer-id-input').value.toUpperCase();
    if (!tid) return;
    document.getElementById('status-text').innerText = "LINKING...";
    conn = peer.connect(tid);
    amIMaster = false; 
    setupConn();
}

peer.on('connection', (c) => { 
    conn = c; 
    amIMaster = true; 
    setupConn(); 
});

function setupConn() {
    conn.on('open', () => {
        document.getElementById('status-text').innerText = "CONNECTED";
        if (amIMaster) {
            let w = prompt("CHOOSE WORD:").toUpperCase();
            secretWord = w || "HACK";
            conn.send({ type: 'start', word: secretWord });
            initGame();
        }
    });
    conn.on('data', (d) => {
        if (d.type === 'start') { secretWord = d.word; initGame(); }
        else if (d.type === 'move') { handleMove(d.letter); }
    });
}

// --- ABILITÀ (AZZURRO NEON) ---
function unlockPower(id) {
    const b = document.getElementById(id);
    if(b && !b.hasAttribute('data-used') && !amIMaster) {
        b.disabled = false;
        b.style.opacity = "1";
        b.style.color = "#00f2ff";
        b.style.borderColor = "#00f2ff";
        b.style.boxShadow = "0 0 15px #00f2ff";
    }
}

function useOverclock() { 
    isOverclock = true; 
    consumePower('p-overclock');
    setTimeout(() => isOverclock = false, 5000); 
}

function useRescan() { 
    if(timeLeft <= 10) return;
    timeLeft -= 10;
    consumePower('p-rescan');
    let m = secretWord.split("").filter(l => !guessedLetters.includes(l));
    if(m.length > 0) handleMove(m[0]);
}

function useGhost() { 
    isGhost = true; 
    consumePower('p-ghost');
}

function consumePower(id) {
    const b = document.getElementById(id);
    b.setAttribute('data-used', 'true');
    b.disabled = true; b.style.opacity = "0.1"; b.style.boxShadow = "none";
}

// --- LOGICA GIOCO ---
function startBotGame() { isBot = true; amIMaster = false; secretWord = fallback[Math.floor(Math.random()*fallback.length)]; initGame(); }

function initGame() {
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('play-screen').classList.remove('hidden');
    document.getElementById('overlay').style.display = 'none';
    guessedLetters = []; mistakes = 0; timeLeft = 60;
    
    document.querySelectorAll('.btn-pwr').forEach(b => {
        b.disabled = true; b.style.opacity = "0.2"; b.style.boxShadow = "none";
        b.style.color = "#444"; b.style.borderColor = "#444"; b.removeAttribute('data-used');
    });

    createKeyboard(); renderWord(); drawHangman();
    if (!amIMaster) startTimer();
    else document.getElementById('timer-display').innerText = "LOCK";
}

function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if(!isOverclock) timeLeft--;
        if(timeLeft <= 45) unlockPower('p-overclock');
        if(timeLeft <= 30) unlockPower('p-rescan');
        if(timeLeft <= 15) unlockPower('p-ghost');
        if(timeLeft <= 0) triggerEnd(false);
        document.getElementById('timer-display').innerText = formatTime(timeLeft);
    }, 1000);
}

// --- OVERLAY STYLE VERBUM (FIX LAYOUT) ---
function triggerEnd(win) {
    clearInterval(timerInterval);
    if (!amIMaster) {
        if (win) {
            myScore++;
            if (myHackerTag === "GUEST_USER") {
                let n = prompt("NEW TAG:"); if(n) { myHackerTag = n; localStorage.setItem('mv_hacker_tag', n); }
            }
        } else { myScore = Math.max(0, myScore - 1); }
        updateRankUI();
    }
    const ov = document.getElementById('overlay');
    ov.style.display = 'flex';
    const t = document.getElementById('result-title');
    t.innerText = win ? "ACCESS_GRANTED" : "CONNECTION_TERMINATED";
    
    // Font fluido per non uscire dai bordi
    t.style.fontSize = "clamp(1rem, 5vw, 2.2rem)";
    t.style.width = "90%";
    t.style.textAlign = "center";

    if (win) { t.style.color = "#00f2ff"; t.style.textShadow = "0 0 15px #00f2ff"; } 
    else { t.style.color = "#ff003c"; t.style.textShadow = "0 0 15px #ff003c"; }
    document.getElementById('result-desc').innerHTML = `<p style="margin-top:15px; font-family:monospace;">KEY: <span style="color:#fff;">${secretWord}</span></p>`;
}

function handleMove(l) {
    if(guessedLetters.includes(l)) return;
    guessedLetters.push(l);
    if (conn && !isBot && !amIMaster) conn.send({ type: 'move', letter: l });
    if(!secretWord.includes(l)) { if(isGhost) isGhost = false; else mistakes++; drawHangman(); }
    renderWord();
}

function renderWord() {
    const d = document.getElementById('word-display');
    d.innerHTML = secretWord.split("").map(l => `<div class="letter-slot">${guessedLetters.includes(l) ? l : ""}</div>`).join("");
    if(secretWord.split("").every(l => guessedLetters.includes(l))) triggerEnd(true);
    else if(mistakes >= 6) triggerEnd(false);
}

function createKeyboard() {
    const k = document.getElementById('keyboard'); k.innerHTML = "";
    "QWERTYUIOPASDFGHJKLZXCVBNM".split("").forEach(l => {
        const b = document.createElement('button'); b.className = "key"; b.innerText = l;
        if(amIMaster) b.disabled = true;
        b.onclick = () => { b.classList.add('used'); b.disabled = true; handleMove(l); };
        k.appendChild(b);
    });
}

function toggleManual() {
    const m = document.getElementById('manual-overlay');
    if(m) m.style.display = (m.style.display === 'flex') ? 'none' : 'flex';
}

function resetAccount() { if(confirm("WIPE DATA?")) { localStorage.clear(); location.reload(); } }
function formatTime(s) { const m = Math.floor(s/60); const sec = s%60; return `${m.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`; }
function retry() { if(isBot) startBotGame(); else location.reload(); }
function copyId() { navigator.clipboard.writeText(myId); document.getElementById('copy-btn').innerText = "COPIED!"; setTimeout(() => document.getElementById('copy-btn').innerText = "Copy", 2000); }

peer.on('open', (id) => { document.getElementById('my-id').innerText = id; updateRankUI(); });
