let myId = Math.random().toString(36).substring(2, 7).toUpperCase();
const peer = new Peer(myId);
let conn, secretWord = "", guessedLetters = [], mistakes = 0, amIMaster = false, isBot = false;
let timerInterval, timeLeft = 60, myScore = 0, powerUsed = false;

const dizionario = ["ACQUA", "ALBERO", "AMICO", "ANIMA", "BACIO", "BARCA", "BENE", "BOSCO", "CALCIO", "CUORE", "DIARIO", "DRAGO", "ESTATE", "FIORE", "FIUME", "GATTO", "GIOCO", "ISOLA", "LIBRO", "LUCE", "LUNA", "MARE", "MONDO", "NOTTE", "OCCHIO", "PANE", "PAROLA", "SOLE", "SOGNO", "TERRA", "TRENO", "UOMO", "VITA", "VOCE", "ZAINO"];

// Recupero punti salvati
const saved = localStorage.getItem('mv_stats');
if(saved) myScore = JSON.parse(saved).score || 0;

peer.on('open', id => document.getElementById('my-id').innerText = id);
peer.on('connection', c => { conn = c; setupRemote(); });

function connectToPeer() {
    const rId = document.getElementById('peer-id-input').value.toUpperCase().trim();
    if(!rId) return alert("Inserisci il codice!");
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
        document.getElementById('setup-screen').innerHTML = "<h2 style='color:var(--neon-blue)'>In attesa della parola...</h2>";
    }
    conn.on('data', d => {
        if(d.type === 'START') { secretWord = d.word; amIMaster = false; initGame(); }
        if(d.type === 'GUESS') handleMove(d.letter, true);
        if(d.type === 'FINISH') showEndScreen(d.win);
    });
}

function sendWord() {
    const word = document.getElementById('secret-word-input').value.toUpperCase().trim().replace(/[^A-Z]/g, '');
    if(word.length < 3) return alert("Parola troppo corta!");
    secretWord = word;
    conn.send({ type: 'START', word: secretWord });
    initGame();
}

// FIX: Funzione Bot corretta
function startBotGame() {
    isBot = true;
    amIMaster = false; // Contro il bot sei sempre tu a indovinare
    secretWord = dizionario[Math.floor(Math.random() * dizionario.length)];
    initGame();
}

function initGame() {
    // Nascondi setup e mostra gioco
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('play-screen').classList.remove('hidden');
    document.getElementById('overlay').style.display = 'none';
    
    // Reset variabili
    guessedLetters = [];
    mistakes = 0;
    powerUsed = false;
    timeLeft = 60;
    
    // UI Setup
    const pBtn = document.getElementById('power-btn');
    if(pBtn) {
        pBtn.disabled = false;
        pBtn.style.display = amIMaster ? "none" : "block";
    }
    
    document.getElementById('wrong-letters').innerText = "";
    document.getElementById('keyboard').style.opacity = amIMaster ? "0.3" : "1";
    document.getElementById('keyboard').style.pointerEvents = amIMaster ? "none" : "auto";
    
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
        btn.className = "key";
        btn.innerText = l;
        btn.onclick = () => {
            if(btn.classList.contains('used')) return;
            btn.classList.add('used');
            handleMove(l, false);
            if(conn && !isBot) conn.send({type:'GUESS', letter:l});
        };
        kb.appendChild(btn);
    });
}

function handleMove(l, fromRemote) {
    if(guessedLetters.includes(l)) return;
    guessedLetters.push(l);
    
    if(!secretWord.includes(l)) {
        mistakes++;
        document.getElementById('wrong-letters').innerText += l + " ";
    }
    renderWord();
}

function renderWord() {
    const display = document.getElementById('word-display');
    const wordArr = secretWord.split("");
    display.innerHTML = wordArr.map(l => `<div class="letter-slot">${guessedLetters.includes(l) ? l : ""}</div>`).join("");
    
    drawHangman();

    if(!amIMaster) {
        const win = wordArr.every(l => guessedLetters.includes(l));
        if(win) triggerEnd(true);
        else if(mistakes >= 6) triggerEnd(false);
    }
}

function triggerEnd(win) {
    if(conn && !isBot) conn.send({ type: 'FINISH', win: win });
    showEndScreen(win);
}

function showEndScreen(win) {
    clearInterval(timerInterval);
    
    // Gestione punti (Solo se non sei Master)
    if(!amIMaster) {
        if(win) myScore++; else myScore = Math.max(0, myScore - 1);
        localStorage.setItem('mv_stats', JSON.stringify({score: myScore}));
        updateRankUI();
    }

    const overlay = document.getElementById('overlay');
    overlay.style.display = 'flex';
    overlay.classList.remove('hidden');

    const title = document.getElementById('result-title');
    if(amIMaster) {
        title.innerText = win ? "AMICO HA VINTO" : "AMICO HA PERSO";
        title.className = win ? "lose-glow" : "win-glow";
    } else {
        title.innerText = win ? "VITTORIA" : "SCONFITTA";
        title.className = win ? "win-glow" : "lose-glow";
    }
    
    document.getElementById('result-desc').innerText = "LA PAROLA ERA: " + secretWord;
    document.getElementById('rank-display').innerText = amIMaster ? "MODALITÀ MASTER" : "GRADO: " + getRank(myScore);
}

function startTimer() {
    clearInterval(timerInterval);
    timeLeft = 60;
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('timer-display').innerText = `00:${timeLeft < 10 ? '0'+timeLeft : timeLeft}`;
        if(timeLeft <= 0) triggerEnd(false);
    }, 1000);
}

function usePower() {
    if(powerUsed || timeLeft < 15 || amIMaster) return;
    const hidden = secretWord.split("").filter(l => !guessedLetters.includes(l));
    if(hidden.length) {
        powerUsed = true;
        document.getElementById('power-btn').disabled = true;
        timeLeft -= 10;
        handleMove(hidden[0], false);
        if(conn && !isBot) conn.send({type:'GUESS', letter:hidden[0]});
    }
}

function updateRankUI() {
    const perc = Math.min((myScore / 20) * 100, 100);
    const text = getRank(myScore) + " (" + myScore + "/20)";
    ["rank-bar-fill-setup", "rank-bar-fill"].forEach(id => {
        const el = document.getElementById(id); if(el) el.style.width = perc + "%";
    });
    ["rank-label-setup", "rank-label-ingame"].forEach(id => {
        const el = document.getElementById(id); if(el) el.innerText = text;
    });
}

function getRank(s) {
    if (s >= 20) return "DIO DEL CODICE";
    if (s >= 10) return "HACKER ELITE";
    if (s >= 5) return "ESPERTO";
    return "RECLUTA";
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

function copyId() { navigator.clipboard.writeText(myId); document.getElementById('copy-btn').innerText = "COPIATO!"; }
function retry() { location.reload(); }
function resetAccount() { if(confirm("Resettare tutto?")) { localStorage.clear(); location.reload(); } }

updateRankUI();
