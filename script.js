const peerConfig = { config: { 'iceServers': [{ url: 'stun:stun.l.google.com:19302' }] } };
let myId = Math.random().toString(36).substring(2, 7).toUpperCase();
const peer = new Peer(myId, peerConfig);
let conn, secretWord = "", guessedLetters = [], mistakes = 0, amIMaster = false, isBot = false;
let timerInterval, timeLeft = 60, myScore = 0, oppScore = 0, isMuted = false, gameMode = "CLASSIC", powerUsed = false;

const dizionario = ["ALGORITMO", "ASTRONAVE", "ANTIMATERIA", "AUTOMAZIONE", "DATABASE", "DIGITALE", "ENERGIA", "GALASSIA", "INFORMATICA", "INTERFACCIA", "MOLECOLA", "ROBOTICA", "UNIVERSO", "VULCANO", "CRIPTATO", "FIREWALL", "MAINFRAME", "NETWORK"];

// --- INIZIALIZZAZIONE ---
peer.on('open', id => {
    document.getElementById('my-id').innerText = id;
    updateRank();
});

peer.on('connection', c => { conn = c; setupLogic(); });

document.getElementById('connect-btn').onclick = () => {
    const target = document.getElementById('peer-id-input').value.toUpperCase().trim();
    if(target) { 
        conn = peer.connect(target); 
        conn.on('open', () => setupLogic());
    }
};

function setupLogic() {
    isBot = false;
    amIMaster = myId < conn.peer;
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('score-board').classList.remove('hidden');
    
    if(amIMaster) {
        gameMode = confirm("ATTIVARE MODALITÀ HACKER? (Poteri Speciali)") ? "HACKER" : "CLASSIC";
        conn.send({ type: 'SET_MODE', mode: gameMode });
        document.getElementById('host-screen').classList.remove('hidden');
    } else {
        document.getElementById('play-screen').classList.remove('hidden');
        document.getElementById('word-display').innerText = "SINCRONIZZAZIONE...";
    }

    conn.on('data', data => {
        if (data.type === 'SET_MODE') gameMode = data.mode;
        else if (data.type === 'START') { secretWord = data.word; startPlay("SFIDANTE"); }
        else if (data.type === 'GUESS') processMove(data.letter);
        else if (data.type === 'END') end(data.win, true);
        else if (data.type === 'REMATCH') prepareNextRound();
        else if (data.type === 'POWER') { timeLeft = Math.max(0, timeLeft - 15); }
    });
}

// --- BOT ---
document.getElementById('bot-btn').onclick = () => {
    isBot = true; amIMaster = false; gameMode = "CLASSIC";
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('score-board').classList.remove('hidden');
    secretWord = dizionario[Math.floor(Math.random()*dizionario.length)];
    startPlay("A.I. CHALLENGE");
};

// --- CORE GAME ---
function startPlay(role) {
    document.getElementById('host-screen').classList.add('hidden');
    document.getElementById('play-screen').classList.remove('hidden');
    document.getElementById('role-badge').innerText = role;
    guessedLetters = []; mistakes = 0; powerUsed = false;
    document.getElementById('word-display').innerText = "";
    document.getElementById('wrong-letters').innerText = "";
    document.querySelectorAll('.key').forEach(k => k.classList.remove('used'));
    
    // Gestione Poteri UI
    const bar = document.getElementById('emoji-bar');
    bar.querySelectorAll('.power-btn').forEach(b => b.remove());
    if(gameMode === "HACKER") {
        const pBtn = document.createElement('button');
        pBtn.className = 'power-btn';
        if(role === "MASTER") {
            pBtn.innerText = "USE FIREWALL (-15s)";
            pBtn.onclick = () => { if(!powerUsed) { conn.send({type:'POWER'}); powerUsed=true; pBtn.disabled=true; }};
        } else {
            pBtn.innerText = "USE DECRYPTER";
            pBtn.onclick = () => { if(!powerUsed) { useDecrypter(); powerUsed=true; pBtn.disabled=true; }};
        }
        bar.prepend(pBtn);
    }

    const ctx = document.getElementById('hangmanCanvas').getContext('2d');
    ctx.clearRect(0,0,200,200);
    
    if(role !== "MASTER") { 
        document.getElementById('keyboard').classList.remove('hidden'); 
        startTimer(); render(); 
    } else { 
        document.getElementById('word-display').innerText = "AVVERSARIO IN AZIONE..."; 
        clearInterval(timerInterval);
    }
}

function useDecrypter() {
    const unknown = secretWord.split('').filter(l => !guessedLetters.includes(l));
    if(unknown.length > 0) {
        const pick = unknown[Math.floor(Math.random()*unknown.length)];
        processMove(pick);
        if(conn) conn.send({type:'GUESS', letter: pick});
    }
}

function processMove(l) {
    if(guessedLetters.includes(l)) return;
    guessedLetters.push(l);
    if(!secretWord.includes(l)) { 
        mistakes++; draw(mistakes); 
        document.getElementById('wrong-letters').innerText += l + " ";
        document.querySelector('.card').classList.add('glitch-error');
        setTimeout(()=> document.querySelector('.card').classList.remove('glitch-error'), 200);
    }
    render();
}

function render() {
    const container = document.getElementById('word-display');
    if(!secretWord || container.innerText.includes("AZIONE")) return;
    container.innerHTML = secretWord.split('').map(l => `<div class="letter-slot">${guessedLetters.includes(l) ? l : ""}</div>`).join('');
    if(secretWord.split('').every(l => guessedLetters.includes(l))) end(true);
    else if(mistakes >= 6) end(false);
}

function end(win, fromRemote = false) {
    clearInterval(timerInterval);
    if(!fromRemote && !isBot && conn) conn.send({ type: 'END', win: win });
    document.getElementById('overlay').classList.remove('hidden');
    let ioHoVinto = amIMaster ? !win : win;
    document.getElementById('result-title').innerText = ioHoVinto ? "SISTEMA VIOLATO" : "ACCESSO NEGATO";
    document.getElementById('result-title').className = ioHoVinto ? "win-glow" : "lose-glow";
    if(!fromRemote) {
        if(ioHoVinto) myScore++; else oppScore++;
        document.getElementById('my-score').innerText = myScore;
        document.getElementById('opp-score').innerText = oppScore;
        updateRank();
    }
    document.getElementById('result-desc').innerText = "KEYWORD: " + secretWord;
}

function updateRank() {
    let r = "SCRIPT KIDDIE";
    if(myScore > 5) r = "INFILTRATOR";
    if(myScore > 15) r = "ARCHITECT";
    if(myScore > 30) r = "GOD MODE";
    const rb = document.getElementById('rank-badge') || document.createElement('div');
    rb.id = 'rank-badge'; rb.className = 'rank-display';
    rb.innerText = "RANK: " + r;
    if(!document.getElementById('rank-badge')) document.querySelector('.neon-title').after(rb);
}

function startTimer() {
    clearInterval(timerInterval); timeLeft = 60;
    timerInterval = setInterval(() => {
        timeLeft--; 
        document.getElementById('timer-display').innerText = `00:${timeLeft < 10 ? '0' : ''}${timeLeft}`;
        if(timeLeft <= 0) end(false);
    }, 1000);
}

function draw(s) {
    const ctx = document.getElementById('hangmanCanvas').getContext('2d');
    ctx.strokeStyle = "#00f2ff"; ctx.lineWidth = 4; ctx.beginPath();
    if(s>=1) ctx.arc(100, 40, 20, 0, Math.PI*2);
    if(s>=2) { ctx.moveTo(100, 60); ctx.lineTo(100, 110); }
    if(s>=3) { ctx.moveTo(100, 75); ctx.lineTo(75, 95); }
    if(s>=4) { ctx.moveTo(100, 75); ctx.lineTo(125, 95); }
    if(s>=5) { ctx.moveTo(100, 110); ctx.lineTo(75, 150); }
    if(s>=6) { ctx.moveTo(100, 110); ctx.lineTo(125, 150); }
    ctx.stroke();
}

// --- EVENTS ---
document.getElementById('start-btn').onclick = () => {
    secretWord = document.getElementById('secret-word').value.trim().toUpperCase();
    if(secretWord.length < 3) return;
    if(conn) conn.send({ type: 'START', word: secretWord });
    startPlay("MASTER");
};

document.getElementById('retry-btn').onclick = () => {
    document.getElementById('overlay').classList.add('hidden');
    if(isBot) document.getElementById('bot-btn').click();
    else if(conn) { conn.send({ type: 'REMATCH' }); prepareNextRound(); }
};

function prepareNextRound() {
    amIMaster = !amIMaster;
    document.getElementById('play-screen').classList.add('hidden');
    if(amIMaster) document.getElementById('host-screen').classList.remove('hidden');
    else { document.getElementById('play-screen').classList.remove('hidden'); document.getElementById('word-display').innerText = "IN ATTESA..."; }
}

"QWERTYUIOPASDFGHJKLZXCVBNM".split('').forEach(l => {
    const b = document.createElement('div'); b.className = 'key'; b.innerText = l;
    b.onclick = () => { if(!amIMaster && !b.classList.contains('used')) { b.classList.add('used'); if(conn && !isBot) conn.send({type:'GUESS', letter:l}); processMove(l); } };
    document.getElementById('keyboard').appendChild(b);
});

document.getElementById('copy-btn').onclick = () => { navigator.clipboard.writeText(myId); };
document.getElementById('exit-btn').onclick = () => location.reload();
document.getElementById('secret-word').addEventListener('input', function(e) { this.value = this.value.toUpperCase().replace(/[^A-Z]/g, ''); });
function sendEmoji(e) { if(conn) conn.send({ type: 'EMOJI', emoji: e }); }
function toggleMute() {}
