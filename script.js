let myId = Math.random().toString(36).substring(2, 7).toUpperCase();
const peer = new Peer(myId);
let conn, secretWord = "", guessedLetters = [], mistakes = 0, amIMaster = false, isBot = false;
let timerInterval, timeLeft = 60, myScore = 0, powerUsed = false;

const dizionario = ["ACQUA", "ALBERO", "AMICO", "ANIMA", "BACIO", "BARCA", "BENE", "BOSCO", "CALCIO", "CUORE", "DIARIO", "DRAGO", "ESTATE", "FIORE", "FIUME", "GATTO", "GIOCO", "ISOLA", "LIBRO", "LUCE", "LUNA", "MARE", "MONDO", "NOTTE", "OCCHIO", "PANE", "PAROLA", "SOLE", "SOGNO", "TERRA", "TRENO", "UOMO", "VITA", "VOCE", "ZAINO"];

// Caricamento Punteggio
const saved = localStorage.getItem('mv_stats');
if(saved) myScore = JSON.parse(saved).score || 0;

peer.on('open', id => document.getElementById('my-id').innerText = id);
peer.on('connection', c => { conn = c; setupRemote(); });

function getRank(s) {
    if (s >= 20) return "DIO DEL CODICE";
    if (s >= 10) return "HACKER ELITE";
    if (s >= 5) return "ESPERTO";
    return "RECLUTA";
}

function updateRankUI() {
    const perc = Math.min((myScore / 20) * 100, 100);
    const labelText = getRank(myScore) + " (" + myScore + "/20)";

    // Aggiorna Home
    const fSetup = document.getElementById('rank-bar-fill-setup');
    if(fSetup) fSetup.style.width = perc + "%";
    if(document.getElementById('rank-label-setup')) 
        document.getElementById('rank-label-setup').innerText = labelText;

    // Aggiorna Gioco
    const fGame = document.getElementById('rank-bar-fill');
    if(fGame) fGame.style.width = perc + "%";
    if(document.getElementById('rank-label-ingame')) 
        document.getElementById('rank-label-ingame').innerText = labelText;
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
        secretWord = (prompt("PAROLA:") || "HACKER").toUpperCase().replace(/[^A-Z]/g, '');
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
    document.getElementById('overlay').style.display = 'none';
    
    powerUsed = false;
    document.getElementById('power-btn').disabled = false;
    document.getElementById('power-btn').style.display = amIMaster ? "none" : "block";
    
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
        btn.onclick = () => { btn.classList.add('used'); handleMove(l); if(conn && !isBot) conn.send({type:'GUESS', letter:l}); };
        kb.appendChild(btn);
    });
}

function handleMove(l) {
    if(mistakes >= 6 || secretWord.split("").every(c => guessedLetters.includes(c))) return;
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
    display.innerHTML = secretWord.split("").map(l => `<div class="letter-slot">${guessedLetters.includes(l) ? l : ""}</div>`).join("");
    drawHangman();
    if(!amIMaster) {
        if(secretWord.split("").every(l => guessedLetters.includes(l))) endGame(true);
        else if(mistakes >= 6) endGame(false);
    }
}

function startTimer() {
    clearInterval(timerInterval);
    timeLeft = 60;
    timerInterval = setInterval(() => {
        if(mistakes >= 6 || secretWord.split("").every(c => guessedLetters.includes(c))) { clearInterval(timerInterval); return; }
        timeLeft--;
        document.getElementById('timer-display').innerText = `00:${timeLeft < 10 ? '0'+timeLeft : timeLeft}`;
        if(timeLeft <= 0) endGame(false);
    }, 1000);
}

function endGame(win) {
    clearInterval(timerInterval);
    const won = amIMaster ? !win : win;
    if(won) myScore++; else myScore = Math.max(0, myScore - 1);
    localStorage.setItem('mv_stats', JSON.stringify({score: myScore}));
    updateRankUI();

    const overlay = document.getElementById('overlay');
    overlay.style.display = 'flex';
    const title = document.getElementById('result-title');
    title.innerText = won ? "VITTORIA" : "SCONFITTA";
    title.className = won ? "win-glow" : "lose-glow";
    document.getElementById('rank-display').innerText = "GRADO: " + getRank(myScore);
    document.getElementById('result-desc').innerText = "LA PAROLA ERA: " + secretWord;
}

function retry() { if(isBot) startBotGame(); else location.reload(); }
function resetAccount() { if(confirm("Resettare?")) { localStorage.clear(); location.reload(); } }

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

updateRankUI();
