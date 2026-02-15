// --- CONFIGURAZIONE E VARIABILI ---
let myId = Math.random().toString(36).substring(2, 7).toUpperCase();
const peer = new Peer(myId);
let conn, secretWord = "", guessedLetters = [], mistakes = 0, amIMaster = false, isBot = false;
let timerInterval, timeLeft = 60;
let myMatchScore = 0, remoteMatchScore = 0;
let isOverclock = false, isGhost = false;

// [LOCAL_STORAGE]: Punteggio globale (Rank)
let myScore = 0;
const saved = localStorage.getItem('mv_elite_stats');
if(saved) myScore = JSON.parse(saved).score || 0;

const dizionario = ["AMORE", "CASA", "SOLE", "LUNA", "MARE", "VENTO", "FUOCO", "ACQUA", "TERRA", "CIELO", "STELLA", "PIETRA", "FIORE", "ALBERO", "RADICE", "FOGLIA", "FRUTTO", "SEME", "PRATO", "BOSCO", "MONTE", "FIUME", "LAGO", "ISOLA", "SPIAGGIA", "DESERTO", "VALLE", "COLLINA", "NEVE", "PIOGGIA", "TEMPO", "NOTTE", "GIORNO", "LUCE", "OMBRA", "SOGNO", "RICORDO", "SPERANZA", "PAURA", "FORZA", "PACE", "GUERRA", "ONDA", "VENTAGLIO", "PORTA", "FINESTRA", "STRADA", "PONTE", "TORRE", "CASTELLO", "CITTA", "PAESE", "PIAZZA", "SCUOLA", "LIBRO", "PAGINA", "PAROLA", "LETTERA", "VOCE", "SUONO", "CANTO", "MUSICA", "ARTE", "COLORE", "QUADRO", "PENNELLO", "TEATRO", "FILM", "STORIA", "LEGGENDA", "FAVOLA", "MITO", "EROE", "REGINA", "RE", "PRINCIPE", "CAVALIERE", "DRAGO", "SPADA", "SCUDO", "AMICO", "NEMICO", "FRATELLO", "SORELLA", "MADRE", "PADRE", "FIGLIO", "FIGLIA", "NONNO", "NONNA", "CUORE", "MENTE", "CORPO", "ANIMA", "VOLTO", "MANO", "OCCHIO", "SGUARDO", "PASSO", "CORSA", "VIAGGIO", "TRENO", "AEREO", "NAVE", "AUTO", "BICICLETTA", "STRUMENTO", "GIOCO", "SQUADRA", "VITTORIA", "SCONFITTA", "RISATA", "LACRIMA", "ABBRACCIO", "BACIO", "SORRISO", "DESIDERIO", "SEGRETO", "MISTERO", "MAGIA", "ENERGIA", "NATURA", "ANIMALE", "CANE", "GATTO", "CAVALLO", "LEONE", "TIGRE", "AQUILA", "FALCO", "PESCE", "BALENA", "DELFINO", "FARFALLA", "FORMICA", "APE", "LUPO", "VOLPE", "ORSO", "CERVO", "PANE", "ACQUA", "LATTE", "FORMAGGIO", "FRUTTA", "VERDURA", "SALE", "ZUCCHERO", "MIELE", "CAFFE", "TAVOLO", "SEDIA", "LETTO", "ARMADIO", "SPECCHIO", "OROLOGIO", "TAPPETO", "TENDA", "LAMPADA", "CUSCINO"];

// --- INIZIALIZZAZIONE PEER ---
peer.on('open', id => {
    document.getElementById('my-id').innerText = id;
    document.getElementById('connection-led').className = 'led led-on';
    document.getElementById('status-text').innerText = "SYSTEM_ONLINE";
});

peer.on('connection', c => { 
    conn = c; 
    conn.on('open', () => setupRemote()); 
});

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
        document.getElementById('connect-section').classList.add('hidden');
        document.getElementById('master-section').classList.remove('hidden');
    }
    conn.on('data', d => {
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

// --- LOGICA DI GIOCO ---
function initGame() {
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('play-screen').classList.remove('hidden');
    document.getElementById('overlay').style.display = 'none';
    
    document.getElementById('powers-sfidante').classList.toggle('hidden', amIMaster);
    document.getElementById('powers-master').classList.toggle('hidden', !amIMaster);
    
    guessedLetters = []; mistakes = 0; timeLeft = 60;
    isOverclock = false; isGhost = false;
    
    document.querySelectorAll('.btn-pwr').forEach(b => {
        b.disabled = amIMaster ? false : true;
        b.removeAttribute('used'); 
        b.style.opacity = "1";
        b.querySelector('.led').className = 'led';
    });
    
    updateTimerUI(); updateMatchScoreUI(); createKeyboard(); renderWord(); startTimer();
}

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

// --- GESTIONE POTERI ---
function useBlackout() { if(conn) conn.send({type:'P_BLACKOUT'}); consume('p-blackout'); }
function useDistort() { if(conn) conn.send({type:'P_DISTORT'}); consume('p-distort'); }
function useCyberfog() { if(conn) conn.send({type:'P_CYBERFOG'}); consume('p-cyberfog'); }

function triggerBlackout() {
    const ps = document.getElementById('play-screen');
    ps.classList.add('effect-blackout');
    setTimeout(() => ps.classList.remove('effect-blackout'), 5000);
}

function triggerDistort() { 
    document.getElementById('keyboard').classList.add('effect-glitch'); 
    setTimeout(() => document.getElementById('keyboard').classList.remove('effect-glitch'), 4000); 
}

function triggerCyberfog() { 
    document.getElementById('word-display').classList.add('effect-fog'); 
    setTimeout(() => document.getElementById('word-display').classList.remove('effect-fog'), 6000); 
}

// --- RANK E SALVATAGGIO ---
function updateRankUI() {
    const p = Math.min((myScore/20)*100, 100);
    let r = "HACKER"; let c = "var(--neon-blue)"; 
    if(myScore >= 10) { r = "ELITE_HACKER"; c = "#39ff14"; }
    if(myScore >= 20) { r = "GOD_MODE"; c = "var(--neon-pink)"; }
    
    localStorage.setItem('mv_elite_stats', JSON.stringify({score: myScore}));

    document.querySelectorAll('.rank-bar-fill').forEach(el => { 
        el.style.width = p+"%"; 
        el.style.background = c; 
        el.style.boxShadow = `0 0 10px ${c}`; 
    });
    document.querySelectorAll('.rank-label').forEach(el => { 
        el.innerText = `${r} (${myScore}/20)`; 
        el.style.color = c; 
    });
}

// --- CORE GAMEPLAY FUNCTIONS ---
function handleMove(l) {
    if(guessedLetters.includes(l) || amIMaster) return;
    guessedLetters.push(l);
    if(!secretWord.includes(l)) { if(isGhost) isGhost = false; else mistakes++; }
    if(conn && !isBot) conn.send({type:'GUESS', letter:l});
    renderWord();
}

function renderWord() {
    const d = document.getElementById('word-display');
    d.innerHTML = secretWord.split("").map(l => `<div class="letter-slot">${guessedLetters.includes(l)?l:""}</div>`).join("");
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
        b.onclick = () => { b.classList.add('used'); handleMove(l); };
        k.appendChild(b);
    });
}

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

// --- UTILITY ---
function updateTimerUI() { 
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    document.getElementById('timer-display').innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`; 
}
function updateMatchScoreUI() { document.getElementById('score-me').innerText = myMatchScore; document.getElementById('score-remote').innerText = remoteMatchScore; }
function unlock(id, colorClass) { let b = document.getElementById(id); if(b && !b.getAttribute('used')) { b.disabled = false; b.querySelector('.led').classList.add(colorClass); } }
function consume(id) { let b = document.getElementById(id); b.disabled = true; b.setAttribute('used', 'true'); b.querySelector('.led').className = 'led'; b.style.opacity="0.1"; }
function sendWord() {
    const val = document.getElementById('secret-word-input').value.toUpperCase().trim();
    if(val.length < 3) return;
    secretWord = val;
    if(conn) conn.send({ type: 'START', word: secretWord });
    initGame();
}
function triggerEnd(win) { if(conn && !isBot) conn.send({type:'FINISH', win:win}); forceEnd(win); }
function forceEnd(win) {
    clearInterval(timerInterval);
    if (!amIMaster) {
        if (win) { myScore++; myMatchScore++; } 
        else { myScore = Math.max(0, myScore - 1); remoteMatchScore++; }
        if(conn) conn.send({type:'SCORE_SYNC', yourScore: remoteMatchScore, oppScore: myMatchScore});
    } else {
        if (!win) myMatchScore++; else remoteMatchScore++;
    }
    updateMatchScoreUI(); updateRankUI();
    document.getElementById('overlay').style.display = 'flex';
    document.getElementById('result-title').innerText = amIMaster ? (win ? "UPLINK COMPROMISED" : "UPLINK SECURED") : (win ? "SYSTEM BYPASSED" : "CONNECTION LOST");
    document.getElementById('result-desc').innerText = "DATA: " + secretWord;
}
function retry() { if(isBot) initGame(); else location.reload(); }
function startBotGame() { isBot = true; amIMaster = false; secretWord = dizionario[Math.floor(Math.random()*dizionario.length)]; initGame(); }
function remoteMove(l) { guessedLetters.push(l); if(!secretWord.includes(l)) mistakes++; renderWord(); }
function useOverclock() { isOverclock = true; consume('p-overclock'); setTimeout(() => isOverclock = false, 5000); }
function useRescan() { if(timeLeft <= 10) return; timeLeft -= 10; updateTimerUI(); consume('p-rescan'); let m = secretWord.split("").filter(l => !guessedLetters.includes(l)); if(m.length) handleMove(m[Math.floor(Math.random()*m.length)]); }
function useGhost() { isGhost = true; consume('p-ghost'); }

// Avvio iniziale
updateRankUI();
