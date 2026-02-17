// --- CONFIGURAZIONE CORE ---
let myId = Math.random().toString(36).substring(2, 7).toUpperCase();
const peer = new Peer(myId);
let conn, secretWord = "", guessedLetters = [], mistakes = 0, amIMaster = false, isBot = false;
let timerInterval, timeLeft = 60, myMatchScore = 0, remoteMatchScore = 0;

// [AUTO_SAVE] Carica punti
let myScore = JSON.parse(localStorage.getItem('mv_elite_stats') || '{"score":0}').score;

// --- GESTIONE PEER & TASTI (LED) ---
peer.on('open', id => {
    const led = document.getElementById('connection-led');
    if(led) led.classList.add('led-on');
    const st = document.getElementById('status-text');
    if(st) st.innerText = "SYSTEM_READY";
    const myIdEl = document.getElementById('my-id');
    if(myIdEl) myIdEl.innerText = id;
});

peer.on('connection', c => { conn = c; conn.on('open', () => setupRemote()); });

// --- FUNZIONI TASTI ---
function connectToPeer() {
    const rId = document.getElementById('peer-id-input').value.toUpperCase().trim();
    if(!rId) return alert("MISSING_ID");
    conn = peer.connect(rId);
    conn.on('open', () => setupRemote());
}

// --- GENERATORE INTELLIGENTE (INTERNET FIRST) ---
async function startBotGame() {
    isBot = true; amIMaster = false;
    document.getElementById('status-text').innerText = "SEARCHING_DATABASE...";
    
    try {
        // Cerchiamo parole italiane reali (v=it) legate alla tecnologia (topics=tech) 
        // Lunghezza tra 5 e 9 lettere
        const L = Math.floor(Math.random() * 5) + 5;
        const res = await fetch(`https://api.datamuse.com/words?sp=${"?".repeat(L)}&v=it&topics=technology&max=40`);
        const data = await res.json();
        
        if(data && data.length > 0) {
            // Sceglie una parola "pesata" (Datamuse mette le più comuni all'inizio)
            let wordObj = data[Math.floor(Math.random() * data.length)];
            secretWord = wordObj.word.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Z]/g, "");
            console.log("Bot Word from Internet:", secretWord);
            initGame();
        } else { throw new Error(); }
    } catch (e) {
        // Se internet fallisce, usa una lista interna "Cyber-Vera" invece di quelle composte
        const backup = ["SCHERMO", "TASTIERA", "MEMORIA", "SISTEMA", "INTERNET", "FIREWALL", "SERVER", "CODICE", "PROCESSO", "BACKUP"];
        secretWord = backup[Math.floor(Math.random()*backup.length)];
        initGame();
    }
}

// --- LOGICA GIOCO ---
function setupRemote() {
    isBot = false;
    amIMaster = myId < conn.peer;
    document.getElementById('connect-section').classList.add('hidden');
    if(amIMaster) document.getElementById('master-section').classList.remove('hidden');
    
    conn.on('data', d => {
        if(d.type === 'START') { secretWord = d.word; initGame(); }
        if(d.type === 'GUESS') { guessedLetters.push(d.letter); if(!secretWord.includes(d.letter)) mistakes++; renderWord(); }
        if(d.type === 'FINISH') forceEnd(d.win);
    });
}

function sendWord() {
    const val = document.getElementById('secret-word-input').value.toUpperCase().trim();
    if(val.length < 3) return alert("TOO_SHORT");
    secretWord = val.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Z]/g, "");
    if(conn) conn.send({ type: 'START', word: secretWord });
    initGame();
}

function initGame() {
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('play-screen').classList.remove('hidden');
    document.getElementById('overlay').style.display = 'none';
    guessedLetters = []; mistakes = 0; timeLeft = 60;
    createKeyboard(); renderWord(); startTimer();
    updateMatchScoreUI();
}

// --- UI & RENDER ---
function renderWord() {
    const d = document.getElementById('word-display');
    d.innerHTML = secretWord.split("").map(l => `<div class="letter-slot">${guessedLetters.includes(l)?l:""}</div>`).join("");
    if(!amIMaster) {
        if(secretWord.split("").every(l => guessedLetters.includes(l))) triggerEnd(true);
        else if(mistakes >= 6) triggerEnd(false);
    }
}

function createKeyboard() {
    const k = document.getElementById('keyboard'); k.innerHTML = "";
    "QWERTYUIOPASDFGHJKLZXCVBNM".split("").forEach(l => {
        const b = document.createElement('button'); b.className="key"; b.innerText=l;
        b.onclick = () => { if(!amIMaster) { b.classList.add('used'); handleMove(l); } };
        k.appendChild(b);
    });
}

function handleMove(l) {
    if(guessedLetters.includes(l)) return;
    guessedLetters.push(l);
    if(!secretWord.includes(l)) mistakes++;
    if(conn && !isBot) conn.send({type:'GUESS', letter:l});
    renderWord();
}

function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if(!amIMaster) {
            timeLeft--;
            if(timeLeft <= 0) triggerEnd(false);
        }
        const mins = Math.floor(timeLeft / 60);
        const secs = timeLeft % 60;
        document.getElementById('timer-display').innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, 1000);
}

function triggerEnd(win) {
    if(conn && !isBot) conn.send({type:'FINISH', win:win});
    forceEnd(win);
}

function forceEnd(win) {
    clearInterval(timerInterval);
    if(!amIMaster) {
        if(win) { myScore++; myMatchScore++; } else { myScore = Math.max(0, myScore-1); remoteMatchScore++; }
    } else {
        if(!win) myMatchScore++; else remoteMatchScore++;
    }
    localStorage.setItem('mv_elite_stats', JSON.stringify({score: myScore}));
    updateRankUI();
    document.getElementById('overlay').style.display = 'flex';
    document.getElementById('result-title').innerText = win ? "ACCESS_GRANTED" : "ACCESS_DENIED";
}

function updateMatchScoreUI() {
    document.getElementById('score-me').innerText = myMatchScore;
    document.getElementById('score-remote').innerText = remoteMatchScore;
}

function updateRankUI() {
    const p = Math.min((myScore/20)*100, 100);
    document.querySelectorAll('.rank-bar-fill').forEach(el => el.style.width = p+"%");
    document.querySelectorAll('.rank-label').forEach(el => el.innerText = `RANK: ${myScore}/20`);
}

function copyId() {
    const id = document.getElementById('my-id').innerText;
    navigator.clipboard.writeText(id);
    alert("ID_COPIED");
}

function retry() { if(isBot) startBotGame(); else location.reload(); }

updateRankUI();
