let myId = Math.random().toString(36).substring(2, 7).toUpperCase();
const peer = new Peer(myId);
let conn, secretWord = "", guessedLetters = [], mistakes = 0, amIMaster = false, isBot = false;
let timerInterval, timeLeft = 60, myScore = 0;

const dizionario = ["ACQUA", "ALBERO", "AMICO", "ANIMA", "BACIO", "BARCA", "BENE", "BOSCO", "CALCIO", "CUORE", "DIARIO", "DRAGO", "ESTATE", "FIORE", "FIUME", "GATTO", "GIOCO", "ISOLA", "LIBRO", "LUCE", "LUNA", "MARE", "MONDO", "NOTTE", "OCCHIO", "PANE", "PAROLA", "SOLE", "SOGNO", "TERRA", "TRENO", "UOMO", "VITA", "VOCE", "ZAINO"];

// Caricamento Punti Automatico
const saved = localStorage.getItem('mv_stats');
if(saved) myScore = JSON.parse(saved).score || 0;

peer.on('open', id => document.getElementById('my-id').innerText = id);
peer.on('connection', c => { conn = c; setupRemote(); });

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
    } else {
        document.getElementById('setup-screen').innerHTML = "<h2>In attesa della parola...</h2>";
    }

    conn.on('data', d => {
        if(d.type === 'START') { secretWord = d.word; amIMaster = false; initGame(); }
        if(d.type === 'GUESS') handleMove(d.letter, true);
        if(d.type === 'FINISH') showEndScreen(d.win);
        if(d.type === 'TIMER_SYNC') { timeLeft = d.time; updateTimerUI(); }
        if(d.type === 'P_GLITCH') triggerGlitch();
        if(d.type === 'P_OVERLOAD') { mistakes = Math.min(5, mistakes + 1); renderWord(); }
    });
}

function sendWord() {
    const val = document.getElementById('secret-word-input').value.toUpperCase().trim();
    if(val.length < 3) return;
    secretWord = val;
    conn.send({ type: 'START', word: secretWord });
    initGame();
}

function startBotGame() {
    isBot = true; amIMaster = false;
    secretWord = dizionario[Math.floor(Math.random()*dizionario.length)];
    initGame();
}

function initGame() {
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('play-screen').classList.remove('hidden');
    document.getElementById('overlay').style.display = 'none';
    
    // UI Poteri
    document.getElementById('powers-sfidante').classList.toggle('hidden', amIMaster);
    document.getElementById('powers-master').classList.toggle('hidden', !amIMaster);
    
    guessedLetters = []; mistakes = 0; timeLeft = 60;
    document.getElementById('wrong-letters').innerText = "";
    
    updateRankUI();
    createKeyboard();
    renderWord();
    startTimer();
}

// --- TIMER SINCRONIZZATO ---
function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if(!amIMaster) {
            timeLeft--;
            if(conn && !isBot) conn.send({ type: 'TIMER_SYNC', time: timeLeft });
            if(timeLeft <= 0) triggerEnd(false);
        }
        updateTimerUI();
    }, 1000);
}

function updateTimerUI() {
    document.getElementById('timer-display').innerText = `00:${timeLeft < 10 ? '0'+timeLeft : timeLeft}`;
}

// --- POTERI ---
function useDecrypter() {
    if(timeLeft < 15) return;
    const hidden = secretWord.split("").filter(l => !guessedLetters.includes(l));
    if(hidden.length) {
        timeLeft -= 10;
        document.getElementById('p-decrypter').disabled = true;
        handleMove(hidden[0], false);
        if(conn && !isBot) conn.send({type:'GUESS', letter:hidden[0]});
    }
}

function useShield() {
    if(mistakes > 0) {
        mistakes--;
        document.getElementById('p-shield').disabled = true;
        renderWord();
    }
}

function useGlitch() {
    document.getElementById('p-glitch').disabled = true;
    if(conn) conn.send({ type: 'P_GLITCH' });
}

function triggerGlitch() {
    const kb = document.getElementById('keyboard');
    kb.classList.add('glitch-active');
    setTimeout(() => kb.classList.remove('glitch-active'), 7000);
}

function useOverload() {
    document.getElementById('p-overload').disabled = true;
    if(conn) conn.send({ type: 'P_OVERLOAD' });
}

// --- CORE ---
function handleMove(l, fromRemote) {
    if(guessedLetters.includes(l)) return;
    guessedLetters.push(l);
    if(!secretWord.includes(l)) mistakes++;
    renderWord();
}

function renderWord() {
    const display = document.getElementById('word-display');
    display.innerHTML = secretWord.split("").map(l => `<div class="letter-slot">${guessedLetters.includes(l) ? l : ""}</div>`).join("");
    drawHangman();
    if(!amIMaster) {
        if(secretWord.split("").every(l => guessedLetters.includes(l))) triggerEnd(true);
        else if(mistakes >= 6) triggerEnd(false);
    }
}

function triggerEnd(win) {
    if(conn && !isBot) conn.send({ type: 'FINISH', win: win });
    showEndScreen(win);
}

function showEndScreen(win) {
    clearInterval(timerInterval);
    if(!amIMaster) {
        if(win) myScore++; else myScore = Math.max(0, myScore - 1);
        localStorage.setItem('mv_stats', JSON.stringify({score: myScore}));
        updateRankUI();
    }
    const overlay = document.getElementById('overlay');
    overlay.style.display = 'flex';
    overlay.classList.remove('hidden');
    document.getElementById('result-title').innerText = win ? (amIMaster ? "L'AMICO HA VINTO" : "VITTORIA") : (amIMaster ? "L'AMICO HA PERSO" : "SCONFITTA");
    document.getElementById('result-desc').innerText = "PAROLA: " + secretWord;
}

function retry() { if(isBot) startBotGame(); else location.reload(); }

function createKeyboard() {
    const kb = document.getElementById('keyboard'); kb.innerHTML = "";
    "QWERTYUIOPASDFGHJKLZXCVBNM".split("").forEach(l => {
        const btn = document.createElement('button'); btn.className = "key"; btn.innerText = l;
        btn.onclick = () => { 
            if(amIMaster) return;
            btn.classList.add('used'); handleMove(l, false); 
            if(conn && !isBot) conn.send({type:'GUESS', letter:l}); 
        };
        kb.appendChild(btn);
    });
}

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

function updateRankUI() {
    const perc = Math.min((myScore/20)*100, 100);
    const label = getRank(myScore) + " (" + myScore + "/20)";
    ["rank-bar-fill-setup", "rank-bar-fill"].forEach(id => {
        let el = document.getElementById(id); if(el) el.style.width = perc + "%";
    });
    ["rank-label-setup", "rank-label-ingame"].forEach(id => {
        let el = document.getElementById(id); if(el) el.innerText = label;
    });
}

function getRank(s) { if(s >= 20) return "DIO DEL CODICE"; if(s >= 10) return "HACKER ELITE"; return "RECLUTA"; }
function copyId() { navigator.clipboard.writeText(myId); document.getElementById('copy-btn').innerText = "COPIATO!"; }
function resetAccount() { if(confirm("Resettare?")) { localStorage.clear(); location.reload(); } }

updateRankUI();
