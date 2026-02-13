let myId = Math.random().toString(36).substring(2, 7).toUpperCase();
const peer = new Peer(myId);
let conn, secretWord = "", guessedLetters = [], mistakes = 0, amIMaster = false, isBot = false;
let timerInterval, timeLeft = 60, myScore = 0, powerUsed = false;

const dizionario = ["ACQUA", "ALBERO", "AMICO", "ANIMA", "BACIO", "BARCA", "BENE", "BOSCO", "CALCIO", "CUORE", "DIARIO", "DRAGO", "ESTATE", "FIORE", "FIUME", "GATTO", "GIOCO", "ISOLA", "LIBRO", "LUCE", "LUNA", "MARE", "MONDO", "NOTTE", "OCCHIO", "PANE", "PAROLA", "SOLE", "SOGNO", "TERRA", "TRENO", "UOMO", "VITA", "VOCE", "ZAINO"];

const saved = localStorage.getItem('mv_stats');
if(saved) myScore = JSON.parse(saved).score || 0;

// Segnala quando sei pronto a ricevere connessioni
peer.on('open', id => {
    document.getElementById('my-id').innerText = id;
    console.log("Il tuo ID è pronto:", id);
});

// Quando un amico si connette a TE
peer.on('connection', c => { 
    conn = c; 
    setupRemote(); 
});

function updateRankUI() {
    const perc = Math.min((myScore / 20) * 100, 100);
    const labelText = getRank(myScore) + " (" + myScore + "/20)";
    if(document.getElementById('rank-bar-fill-setup')) document.getElementById('rank-bar-fill-setup').style.width = perc + "%";
    if(document.getElementById('rank-bar-fill')) document.getElementById('rank-bar-fill').style.width = perc + "%";
    if(document.getElementById('rank-label-setup')) document.getElementById('rank-label-setup').innerText = labelText;
    if(document.getElementById('rank-label-ingame')) document.getElementById('rank-label-ingame').innerText = labelText;
}

function getRank(s) {
    if (s >= 20) return "DIO DEL CODICE";
    if (s >= 10) return "HACKER ELITE";
    if (s >= 5) return "ESPERTO";
    return "RECLUTA";
}

// FUNZIONE PER CONNETTERTI ALL'AMICO
function connectToPeer() {
    const rId = document.getElementById('peer-id-input').value.toUpperCase().trim();
    if(!rId) { alert("Inserisci il codice dell'amico!"); return; }
    if(rId === myId) { alert("Non puoi connetterti a te stesso!"); return; }
    
    conn = peer.connect(rId);
    conn.on('open', () => {
        console.log("Connesso a:", rId);
        setupRemote();
    });
    
    conn.on('error', err => alert("Errore di connessione: " + err));
}

function setupRemote() {
    isBot = false;
    // Chi ha l'ID alfabeticamente minore fa il Master
    amIMaster = myId < conn.peer;
    
    if(amIMaster) {
        secretWord = (prompt("SEI IL MASTER. Inserisci la parola per il tuo amico:") || "HACKER").toUpperCase().replace(/[^A-Z]/g, '');
        conn.send({ type: 'START', word: secretWord });
        initGame();
    }
    
    conn.on('data', d => {
        if(d.type === 'START') { 
            secretWord = d.word; 
            amIMaster = false; // Se ricevi la parola, sei tu che indovini
            initGame(); 
        }
        if(d.type === 'GUESS') {
            handleMove(d.letter, true); // Riceve la mossa dell'altro
        }
    });
}

function initGame() {
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('play-screen').classList.remove('hidden');
    document.getElementById('overlay').style.display = 'none';
    
    powerUsed = false;
    const pBtn = document.getElementById('power-btn');
    pBtn.style.display = amIMaster ? "none" : "block";
    
    // Se sei Master, nascondi la tastiera o rendila inattiva
    document.getElementById('keyboard').style.opacity = amIMaster ? "0.3" : "1";
    document.getElementById('keyboard').style.pointerEvents = amIMaster ? "none" : "auto";
    
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
            if(amIMaster) return; // IL MASTER NON PUÒ CLICCARE
            btn.classList.add('used'); 
            handleMove(l, false); 
            if(conn && !isBot) conn.send({type:'GUESS', letter:l}); 
        };
        kb.appendChild(btn);
    });
}

function handleMove(l, fromRemote) {
    if(guessedLetters.includes(l)) return;
    
    // Se non viene da remoto e sei il Master, blocca
    if(!fromRemote && amIMaster) return;

    guessedLetters.push(l);
    if(!secretWord.includes(l)) {
        mistakes++;
        document.getElementById('wrong-letters').innerText += l + " ";
    }
    renderWord();
}

function renderWord() {
    const display = document.getElementById('word-display');
    display.innerHTML = secretWord.split("").map(l => 
        `<div class="letter-slot">${guessedLetters.includes(l) ? l : ""}</div>`
    ).join("");
    
    drawHangman();

    const isWin = secretWord.split("").every(l => guessedLetters.includes(l));
    if(isWin) setTimeout(() => endGame(true), 200);
    else if(mistakes >= 6) setTimeout(() => endGame(false), 200);
}

function startTimer() {
    clearInterval(timerInterval);
    timeLeft = 60;
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('timer-display').innerText = `00:${timeLeft < 10 ? '0'+timeLeft : timeLeft}`;
        if(timeLeft <= 0) endGame(false);
        if(mistakes >= 6 || secretWord.split("").every(l => guessedLetters.includes(l))) clearInterval(timerInterval);
    }, 1000);
}

function endGame(win) {
    clearInterval(timerInterval);
    // Il master vince se l'altro perde
    const won = amIMaster ? !win : win;
    
    if(won) myScore++; else myScore = Math.max(0, myScore - 1);
    localStorage.setItem('mv_stats', JSON.stringify({score: myScore}));
    updateRankUI();

    document.getElementById('overlay').style.display = 'flex';
    document.getElementById('result-title').innerText = won ? "VITTORIA" : "SCONFITTA";
    document.getElementById('result-title').className = won ? "win-glow" : "lose-glow";
    document.getElementById('rank-display').innerText = "GRADO: " + getRank(myScore);
    document.getElementById('result-desc').innerText = "LA PAROLA ERA: " + secretWord;
}

function usePower() {
    if(powerUsed || timeLeft < 15 || amIMaster) return;
    const hidden = secretWord.split("").filter(l => !guessedLetters.includes(l));
    if(hidden.length > 0) {
        powerUsed = true;
        document.getElementById('power-btn').disabled = true;
        timeLeft -= 10;
        handleMove(hidden[0], false);
        if(conn && !isBot) conn.send({type:'GUESS', letter:hidden[0]});
    }
}

function drawHangman() {
    const canvas = document.getElementById('hangmanCanvas');
    if(!canvas) return;
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

function retry() { location.reload(); }
function copyId() {
    navigator.clipboard.writeText(myId);
    document.getElementById('copy-btn').innerText = "COPIATO!";
    setTimeout(() => document.getElementById('copy-btn').innerText = "COPIA CODICE", 2000);
}
function startBotGame() { isBot = true; amIMaster = false; secretWord = dizionario[Math.floor(Math.random() * dizionario.length)]; initGame(); }
updateRankUI();
