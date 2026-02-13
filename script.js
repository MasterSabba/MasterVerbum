let myId = Math.random().toString(36).substring(2, 7).toUpperCase();
const peer = new Peer(myId);
let conn, secretWord = "", guessedLetters = [], mistakes = 0, amIMaster = false, isBot = false;
let timerInterval, timeLeft = 60, myScore = 0;

// Caricamento Punteggio (Solo per chi gioca)
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
        document.getElementById('setup-screen').innerHTML = "<h2 style='color:var(--neon-blue)'>In attesa della parola...</h2>";
    }

    conn.on('data', d => {
        if(d.type === 'START') { secretWord = d.word; amIMaster = false; initGame(); }
        if(d.type === 'GUESS') handleMove(d.letter, true);
        if(d.type === 'FINISH') showEndScreen(d.win); // Riceve segnale di chiusura
    });
}

function sendWord() {
    const word = document.getElementById('secret-word-input').value.toUpperCase().trim();
    if(word.length < 3) return;
    secretWord = word;
    conn.send({ type: 'START', word: secretWord });
    initGame();
}

function initGame() {
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('play-screen').classList.remove('hidden');
    document.getElementById('overlay').style.display = 'none';
    
    document.getElementById('keyboard').style.pointerEvents = amIMaster ? "none" : "auto";
    document.getElementById('keyboard').style.opacity = amIMaster ? "0.4" : "1";

    guessedLetters = []; mistakes = 0;
    updateRankUI();
    createKeyboard();
    renderWord();
    if(!amIMaster) startTimer();
}

function handleMove(l, fromRemote) {
    if(guessedLetters.includes(l)) return;
    guessedLetters.push(l);
    if(!secretWord.includes(l)) mistakes++;
    renderWord();
}

function renderWord() {
    const display = document.getElementById('word-display');
    const wordArr = secretWord.split("");
    display.innerHTML = wordArr.map(l => `<div class="letter-slot">${guessedLetters.includes(l) ? l : ""}</div>`).join("");
    drawHangman();
    
    // Solo chi gioca (o il bot) controlla la fine locale
    if(!amIMaster) {
        const win = wordArr.every(l => guessedLetters.includes(l));
        if(win) triggerEnd(true);
        else if(mistakes >= 6) triggerEnd(false);
    }
}

// Funzione che scatta quando il gioco finisce per chi indovina
function triggerEnd(win) {
    if(conn && !isBot) conn.send({ type: 'FINISH', win: win }); // Avvisa il Master
    showEndScreen(win);
}

function showEndScreen(win) {
    clearInterval(timerInterval);
    
    // Aggiorna punteggio SOLO se non sei il Master
    if(!amIMaster) {
        if(win) myScore++; else myScore = Math.max(0, myScore - 1);
        localStorage.setItem('mv_stats', JSON.stringify({score: myScore}));
        updateRankUI();
    }

    const overlay = document.getElementById('overlay');
    overlay.style.display = 'flex';
    overlay.classList.remove('hidden');

    const title = document.getElementById('result-title');
    // Se sei Master, il titolo deve dirti se il tuo amico ha perso o vinto
    if(amIMaster) {
        title.innerText = win ? "HA VINTO L'AMICO" : "L'AMICO HA PERSO";
        title.className = win ? "lose-glow" : "win-glow";
    } else {
        title.innerText = win ? "VITTORIA" : "SCONFITTA";
        title.className = win ? "win-glow" : "lose-glow";
    }
    
    document.getElementById('result-desc').innerText = "LA PAROLA ERA: " + secretWord;
    document.getElementById('rank-display').innerText = amIMaster ? "SEI IL MASTER" : "GRADO: " + getRank(myScore);
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

function createKeyboard() {
    const kb = document.getElementById('keyboard'); kb.innerHTML = "";
    "QWERTYUIOPASDFGHJKLZXCVBNM".split("").forEach(l => {
        const btn = document.createElement('button'); btn.className = "key"; btn.innerText = l;
        btn.onclick = () => { 
            if(amIMaster) return;
            btn.classList.add('used'); 
            handleMove(l, false); 
            if(conn && !isBot) conn.send({type:'GUESS', letter:l}); 
        };
        kb.appendChild(btn);
    });
}

function startTimer() {
    clearInterval(timerInterval); timeLeft = 60;
    timerInterval = setInterval(() => {
        timeLeft--; 
        document.getElementById('timer-display').innerText = `00:${timeLeft<10?'0':''}${timeLeft}`;
        if(timeLeft <= 0) triggerEnd(false);
    }, 1000);
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
function startBotGame() { isBot = true; amIMaster = false; secretWord = dizionario[Math.floor(Math.random()*dizionario.length)]; initGame(); }
function retry() { location.reload(); }
function resetAccount() { if(confirm("Resettare?")) { localStorage.clear(); location.reload(); } }

updateRankUI();
