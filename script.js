// --- CONFIGURAZIONE E VARIABILI ---
let myId = Math.random().toString(36).substring(2, 7).toUpperCase();
const peer = new Peer(myId);
let conn, secretWord = "", guessedLetters = [], mistakes = 0, amIMaster = false, isBot = false;
let timerInterval, timeLeft = 60, myMatchScore = 0, remoteMatchScore = 0, isOverclock = false, isGhost = false;
let wordHistory = []; 

// [PERSONALIZZAZIONE] Nickname e Rank
let myHackerTag = localStorage.getItem('mv_hacker_tag') || "GUEST_USER";
let myScore = 0;
let lastRank = ""; // Per monitorare il passaggio di grado
const savedData = localStorage.getItem('mv_elite_stats');
if(savedData) {
    myScore = JSON.parse(savedData).score || 0;
}

const fallback = ["ALBERO","CASA","CANE","GATTO","LIBRO","PENNA","TAVOLO","SEDIA","FINESTRA","PORTA","STRADA","PIAZZA","SCUOLA","MARE","MONTE","FIUME","LAGO","NUVOLA","PIOGGIA","VENTO","FUOCO","TERRA","ARIA","LUCE","OMBRA","SOGNO","TEMPO","SPAZIO","ANIMA","CUORE","MENTE","CORPO","AMORE","ODIO","PACE","GUERRA","FORZA","ENERGIA","MAGIA","STELLA","PIANETA","GALASSIA","UNIVERSO","COMETA","ASTEROIDE","SATELLITE","ORBITA","GRAVITA","MELA","PERA","BANANA","LIMONE","FRAGOLA","CILIEGIA","PESCA","ARANCIA","UVA","PANE","PASTA","PIZZA","LATTE","UOVO","CARNE","PESCE","FORMAGGIO","VINO","BIRRA","ACQUA","SALE","PEPE","OLIO","ACETO","DOLCE","AMARO","SALATO","ACIDO","CALDO","FREDDO","ROSSO","VERDE","BLU","GIALLO","NERO","BIANCO","GRIGIO","AZZURRO","VIOLA","ROSA","MARRONE"];

// --- INIZIALIZZAZIONE PEER ---
peer.on('open', id => {
    document.getElementById('my-id').innerText = id;
    document.getElementById('connection-led').className = 'led led-on';
    updateRankUI(); 
    lastRank = getRankName(myScore); // Inizializza il rank attuale
});

peer.on('connection', c => { 
    conn = c; 
    conn.on('open', () => setupRemote()); 
});

// --- GESTIONE CONNESSIONE E RUOLI ---
function connectToPeer() {
    const input = document.getElementById('peer-id-input');
    const rId = input.value.toUpperCase().trim();
    if(!rId) return;
    conn = peer.connect(rId);
    conn.on('open', () => {
        setupRemote();
        const randomRole = Math.random() > 0.5 ? 'MASTER' : 'GUEST';
        amIMaster = (randomRole === 'GUEST'); 
        conn.send({ type: 'ROLE_ASSIGN', role: randomRole });
        updateRoleUI();
    });
}

function setupRemote() {
    isBot = false;
    document.getElementById('connect-section').classList.add('hidden');
    conn.on('data', d => {
        if(d.type === 'ROLE_ASSIGN') { amIMaster = (d.role === 'MASTER'); updateRoleUI(); }
        if(d.type === 'REMATCH_REQUEST') { amIMaster = !amIMaster; updateRoleUI(); }
        if(d.type === 'START') { secretWord = d.word; initGame(); }
        if(d.type === 'GUESS') remoteMove(d.letter);
        if(d.type === 'FINISH') forceEnd(d.win);
        if(d.type === 'SYNC') { timeLeft = d.time; mistakes = d.mistakes; updateTimerUI(); renderWord(); }
        if(d.type === 'SCORE_SYNC') { myMatchScore = d.yourScore; remoteMatchScore = d.oppScore; updateMatchScoreUI(); }
        if(d.type === 'P_BLACKOUT') triggerBlackout();
        if(d.type === 'P_DISTORT') triggerDistort();
        if(d.type === 'P_CYBERFOG') triggerCyberfog();
    });
}

function updateRoleUI() {
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('play-screen').classList.add('hidden');
    document.getElementById('setup-screen').classList.remove('hidden');
    if(amIMaster) {
        document.getElementById('master-section').classList.remove('hidden');
        document.getElementById('status-text').innerText = "YOUR_TURN_MASTER";
    } else {
        document.getElementById('master-section').classList.add('hidden');
        document.getElementById('status-text').innerText = "WAITING_FOR_MASTER...";
    }
}

// --- LOGICA CORE GIOCO ---
function initGame() {
    if (secretWord) {
        if (!wordHistory.includes(secretWord)) {
            wordHistory.push(secretWord);
            if (wordHistory.length > 20) wordHistory.shift();
        }
    }
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('play-screen').classList.remove('hidden');
    document.getElementById('overlay').style.display = 'none';
    
    const pSfidante = document.getElementById('powers-sfidante');
    const pMaster = document.getElementById('powers-master');
    if(pSfidante) pSfidante.classList.toggle('hidden', amIMaster);
    if(pMaster) pMaster.classList.toggle('hidden', !amIMaster);

    // DIFFICOLTÀ DINAMICA
    timeLeft = 60;
    if(myScore >= 10 && myScore < 50) timeLeft = 45;
    if(myScore >= 50 && myScore < 100) timeLeft = 40;
    if(myScore >= 100) timeLeft = 35;

    guessedLetters = []; mistakes = 0; isOverclock = false; isGhost = false;
    document.querySelectorAll('.btn-pwr').forEach(b => {
        b.disabled = amIMaster ? false : true;
        b.removeAttribute('used'); b.style.opacity = "1";
        const led = b.querySelector('.led');
        if(led) led.className = 'led';
    });
    updateTimerUI(); updateMatchScoreUI(); createKeyboard(); renderWord(); startTimer();
}

async function startBotGame() {
    isBot = true; amIMaster = false;
    document.getElementById('status-text').innerText = "QUERYING_DATAMUSE...";
    try {
        const length = Math.floor(Math.random() * 4) + 5;
        const response = await fetch(`https://api.datamuse.com/words?sp=${"?".repeat(length)}&v=it&max=50`);
        const data = await response.json();
        if (data && data.length > 0) {
            let validChoices = data.map(w => w.word.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Z]/g, ""))
                .filter(w => !wordHistory.includes(w));
            secretWord = validChoices.length > 0 ? validChoices[Math.floor(Math.random() * validChoices.length)] : getRandomWord();
            initGame();
        } else { throw new Error(); }
    } catch (e) {
        secretWord = getRandomWord();
        initGame();
    }
}

function getRandomWord() {
    let availableWords = fallback.filter(word => !wordHistory.includes(word));
    if (availableWords.length === 0) { wordHistory = []; availableWords = fallback; }
    return availableWords[Math.floor(Math.random() * availableWords.length)];
}

function sendWord() {
    const val = document.getElementById('secret-word-input').value.toUpperCase().trim();
    const cleanWord = val.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Z]/g, "");
    if(cleanWord.length < 3) return alert("MIN_3_CHARS");
    secretWord = cleanWord;
    if(conn) conn.send({ type: 'START', word: secretWord });
    initGame();
}

function forceEnd(win) {
    clearInterval(timerInterval);
    if (!amIMaster) {
        if (win) { 
            myScore++; myMatchScore++; 
            if (myHackerTag === "GUEST_USER") {
                let n = prompt("SISTEMA VIOLATO. INSERIRE HACKER_TAG:");
                if(n) { myHackerTag = n.toUpperCase(); localStorage.setItem('mv_hacker_tag', myHackerTag); }
            }
        } 
        else { 
            if(myScore < 100) myScore = Math.max(0, myScore - 1); 
            remoteMatchScore++; 
        }
        if(conn && !isBot) conn.send({type:'SCORE_SYNC', yourScore: remoteMatchScore, oppScore: myMatchScore});
    } else {
        if (!win) myMatchScore++; else remoteMatchScore++;
    }
    
    updateMatchScoreUI(); 
    checkRankUp(); // Controlla se il rank è cambiato dopo l'aggiornamento punti
    updateRankUI();

    const resTitle = document.getElementById('result-title');
    document.getElementById('overlay').style.display = 'flex';
    
    if (win) {
        if (myScore >= 100) {
            resTitle.innerText = "GOD_MODE_ACTIVE";
            resTitle.style.color = "#ff00ff";
            resTitle.style.textShadow = "0 0 20px #ff00ff";
        } else if (myScore >= 50) {
            resTitle.innerText = "PHANTOM_UPLINK_SECURED";
            resTitle.style.color = "#ffcc00";
        } else {
            resTitle.innerText = amIMaster ? "UPLINK SECURED" : "SYSTEM BYPASSED";
            resTitle.style.color = "#00f2ff";
        }
        resTitle.className = "win-glow";
    } else {
        resTitle.innerText = amIMaster ? "UPLINK COMPROMISED" : "CONNECTION LOST";
        resTitle.className = "lose-glow";
        resTitle.style.color = "#ff003c";
    }
    document.getElementById('result-desc').innerHTML = `PAROLA: <span style="color:white; font-weight:bold; letter-spacing:3px;">${secretWord}</span>`;
}

// --- GESTIONE AVANZAMENTO RANK (SCHERMATA NUOVA) ---
function getRankName(score) {
    if(score >= 100) return "GOD_MODE";
    if(score >= 50) return "CYBER_PHANTOM";
    if(score >= 10) return "ELITE_HACKER";
    return "HACKER";
}

function checkRankUp() {
    let currentRank = getRankName(myScore);
    if (currentRank !== lastRank && myScore > 0) {
        showRankUpOverlay(currentRank);
        lastRank = currentRank;
    }
}

function showRankUpOverlay(newRank) {
    const overlay = document.createElement('div');
    overlay.className = 'overlay-rank-up';
    let info = "";
    let color = "#00f2ff";

    if(newRank === "ELITE_HACKER") {
        color = "#39ff14";
        info = "TIMER: 45s | RISCHIO: Perdita Punti attiva.";
    } else if(newRank === "CYBER_PHANTOM") {
        color = "#ffcc00";
        info = "TIMER: 40s | FIRMA: Digitale criptata.";
    } else if(newRank === "GOD_MODE") {
        color = "#ff00ff";
        info = "TIMER: 35s | PRIVILEGIO: Immunità al Downgrade sbloccata.";
    }

    overlay.innerHTML = `
        <div class="rank-up-content" style="border: 2px solid ${color}; box-shadow: 0 0 20px ${color}">
            <h2 style="color: ${color}; text-shadow: 0 0 10px ${color}">RANK_UP: ${newRank}</h2>
            <p style="color: white; font-family: monospace; letter-spacing: 1px;">SISTEMA AGGIORNATO CON SUCCESSO.</p>
            <p style="color: ${color}; font-size: 0.8em;">${info}</p>
            <button onclick="this.parentElement.parentElement.remove()" class="btn-pwr" style="margin-top: 20px; border-color: ${color}; color: ${color}">ACCETTA PROTOCOLLO</button>
        </div>
    `;
    document.body.appendChild(overlay);
}

function updateRankUI() {
    const p = Math.min((myScore / 100) * 100, 100);
    let r = getRankName(myScore);
    let c = "#00f2ff"; 
    
    if(r === "ELITE_HACKER") c = "#39ff14";
    if(r === "CYBER_PHANTOM") c = "#ffcc00";
    if(r === "GOD_MODE") c = "#ff00ff";

    localStorage.setItem('mv_elite_stats', JSON.stringify({score: myScore}));
    document.getElementById('status-text').innerText = `[${myHackerTag}] SYSTEM_ONLINE`;
    
    document.querySelectorAll('.rank-bar-fill').forEach(el => { 
        el.style.width = p + "%"; 
        el.style.background = c; 
        el.style.boxShadow = `0 0 10px ${c}`;
    });
    document.querySelectorAll('.rank-label').forEach(el => { 
        el.innerText = `${r} (${myScore}/100)`; 
        el.style.color = c; 
    });
}

// --- FUNZIONI TIMER E POTERI ---
function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if(!amIMaster) {
            if(!isOverclock) timeLeft--;
            if(timeLeft <= 45) unlock('p-overclock', 'led-on');
            if(timeLeft <= 30) unlock('p-rescan', 'led-on');
            if(timeLeft <= 15) unlock('p-ghost', 'led-on');
            if(timeLeft <= 0) triggerEnd(false);
            if(conn && !isBot && timeLeft % 2 === 0) conn.send({type:'SYNC', time:timeLeft, mistakes:mistakes});
        }
        updateTimerUI();
    }, 1000);
}

function handleMove(l) {
    if(guessedLetters.includes(l) || amIMaster) return;
    guessedLetters.push(l);
    if(!secretWord.includes(l)) { if(isGhost) isGhost = false; else mistakes++; }
    if(conn && !isBot) conn.send({type:'GUESS', letter:l});
    renderWord();
}

function renderWord() {
    const d = document.getElementById('word-display');
    if(d) d.innerHTML = secretWord.split("").map(l => `<div class="letter-slot">${guessedLetters.includes(l)?l:""}</div>`).join("");
    drawHangman();
    if(!amIMaster) {
        if(secretWord.split("").every(l => guessedLetters.includes(l))) triggerEnd(true);
        else if(mistakes >= 6) triggerEnd(false);
    }
}

function createKeyboard() {
    const k = document.getElementById('keyboard'); k.innerHTML = "";
    "QWERTYUIOPASDFGHJKLZXCVBNM".split("").forEach(l => {
        const b = document.createElement('button'); b.className="key"; b.innerText=l;
        b.onclick = () => { if(amIMaster) return; b.classList.add('used'); b.disabled = true; handleMove(l); };
        k.appendChild(b);
    });
}

window.addEventListener('keydown', (e) => {
    if (document.getElementById('play-screen').classList.contains('hidden') || amIMaster || document.getElementById('overlay').style.display === 'flex') return;
    const key = e.key.toUpperCase();
    if (key.length === 1 && key >= 'A' && key <= 'Z') {
        if (guessedLetters.includes(key)) return;
        const buttons = document.querySelectorAll('.key');
        buttons.forEach(btn => { if (btn.innerText === key) { btn.classList.add('used'); btn.disabled = true; } });
        handleMove(key);
    }
});

function drawHangman() {
    const c = document.getElementById('hangmanCanvas'); const ctx = c.getContext('2d');
    ctx.clearRect(0,0,160,90); ctx.strokeStyle = "#00f2ff"; ctx.lineWidth = 2; ctx.beginPath();
    if(mistakes>0) ctx.arc(80, 15, 7, 0, Math.PI*2);
    if(mistakes>1) { ctx.moveTo(80, 22); ctx.lineTo(80, 50); }
    if(mistakes>2) { ctx.moveTo(80, 30); ctx.lineTo(65, 45); }
    if(mistakes>3) { ctx.moveTo(80, 30); ctx.lineTo(95, 45); }
    if(mistakes>4) { ctx.moveTo(80, 50); ctx.lineTo(70, 75); }
    if(mistakes>5) { ctx.moveTo(80, 50); ctx.lineTo(90, 75); }
    ctx.stroke();
}

// Poteri e Trigger Effetti
function useOverclock() { isOverclock = true; consume('p-overclock'); setTimeout(() => isOverclock = false, 5000); }
function useRescan() { if(timeLeft <= 10) return; timeLeft -= 10; updateTimerUI(); consume('p-rescan'); let m = secretWord.split("").filter(l => !guessedLetters.includes(l)); if(m.length) handleMove(m[Math.floor(Math.random()*m.length)]); }
function useGhost() { isGhost = true; consume('p-ghost'); }
function useBlackout() { if(conn) conn.send({type:'P_BLACKOUT'}); consume('p-blackout'); }
function useDistort() { if(conn) conn.send({type:'P_DISTORT'}); consume('p-distort'); }
function useCyberfog() { if(conn) conn.send({type:'P_CYBERFOG'}); consume('p-cyberfog'); }

function triggerBlackout() { const ps = document.getElementById('play-screen'); ps.classList.add('effect-blackout'); setTimeout(() => ps.classList.remove('effect-blackout'), 5000); }
function triggerDistort() { document.getElementById('keyboard').classList.add('effect-glitch'); setTimeout(() => document.getElementById('keyboard').classList.remove('effect-glitch'), 4000); }
function triggerCyberfog() { document.getElementById('word-display').classList.add('effect-fog'); setTimeout(() => document.getElementById('word-display').classList.remove('effect-fog'), 6000); }

function updateTimerUI() { const mins = Math.floor(timeLeft / 60); const secs = timeLeft % 60; document.getElementById('timer-display').innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`; }
function updateMatchScoreUI() { document.getElementById('score-me').innerText = myMatchScore; document.getElementById('score-remote').innerText = remoteMatchScore; }
function unlock(id, colorClass) { let b = document.getElementById(id); if(b && !b.getAttribute('used')) { b.disabled = false; let led = b.querySelector('.led'); if(led) led.className = 'led ' + colorClass; } }
function consume(id) { let b = document.getElementById(id); if(b) { b.disabled = true; b.setAttribute('used', 'true'); let led = b.querySelector('.led'); if(led) led.className = 'led'; b.style.opacity="0.1"; } }
function triggerEnd(win) { if(conn && !isBot) conn.send({type:'FINISH', win:win}); forceEnd(win); }
function retry() { if(isBot) startBotGame(); else if(conn) { amIMaster = !amIMaster; conn.send({type:'REMATCH_REQUEST'}); updateRoleUI(); } else location.reload(); }
function remoteMove(l) { guessedLetters.push(l); if(!secretWord.includes(l)) mistakes++; renderWord(); }
function toggleManual() { const m = document.getElementById('manual-overlay'); m.style.display = (m.style.display === 'flex') ? 'none' : 'flex'; }
function resetAccount() { if(confirm("SURE? All system data will be wiped.")) { localStorage.clear(); location.reload(); } }
function copyId() { const id = document.getElementById('my-id').innerText; navigator.clipboard.writeText(id); document.getElementById('copy-btn').innerText = "COPIED"; setTimeout(() => document.getElementById('copy-btn').innerText = "Copy Code", 2000); }
