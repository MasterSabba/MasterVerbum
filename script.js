const peerConfig = { config: { 'iceServers': [{ url: 'stun:stun.l.google.com:19302' }] } };
let myId = Math.random().toString(36).substring(2, 7).toUpperCase();
const peer = new Peer(myId, peerConfig);
let conn, secretWord = "", guessedLetters = [], mistakes = 0, amIMaster = false, isBot = false;
let timerInterval, timeLeft = 60, myScore = 0, oppScore = 0;

const dizionario = ["ALGORITMO", "ASTRONAVE", "DATABASE", "SATELLITE", "SISTEMA", "PROGRAMMA", "INTERFACCIA", "DINOSAURO"];

peer.on('open', id => document.getElementById('my-id').innerText = id);
peer.on('connection', c => { conn = c; setupLogic(); });

document.getElementById('connect-btn').onclick = () => {
    const target = document.getElementById('peer-id-input').value.toUpperCase().trim();
    if(target) { conn = peer.connect(target); conn.on('open', () => setupLogic()); }
};

document.getElementById('bot-btn').onclick = () => {
    isBot = true; amIMaster = false;
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('score-board').classList.remove('hidden');
    secretWord = dizionario[Math.floor(Math.random()*dizionario.length)];
    startPlay("BOT CHALLENGE");
};

function setupLogic() {
    isBot = false;
    amIMaster = myId < conn.peer;
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('score-board').classList.remove('hidden');
    if(amIMaster) document.getElementById('host-screen').classList.remove('hidden');
    else { document.getElementById('play-screen').classList.remove('hidden'); document.getElementById('word-display').innerText = "ATTESA MASTER..."; }
    
    conn.on('data', data => {
        if(data.type === 'START') { secretWord = data.word; startPlay("SFIDANTE"); }
        else if(data.type === 'GUESS') processMove(data.letter);
        else if(data.type === 'END') end(data.win, true);
        else if(data.type === 'REMATCH') prepareNextRound();
    });
}

function startPlay(role) {
    document.getElementById('host-screen').classList.add('hidden');
    document.getElementById('play-screen').classList.remove('hidden');
    document.getElementById('role-badge').innerText = role;
    guessedLetters = []; mistakes = 0;
    document.getElementById('word-display').innerText = "";
    document.getElementById('wrong-letters').innerText = "";
    document.querySelectorAll('.key').forEach(k => k.classList.remove('used'));
    const ctx = document.getElementById('hangmanCanvas').getContext('2d');
    ctx.clearRect(0,0,200,200);
    if(role !== "MASTER") { startTimer(); render(); }
    else { document.getElementById('word-display').innerText = "L'AVVERSARIO GIOCA..."; }
}

function processMove(l) {
    if(guessedLetters.includes(l)) return;
    guessedLetters.push(l);
    if(!secretWord.includes(l)) { 
        mistakes++; draw(mistakes); 
        document.getElementById('wrong-letters').innerText += l + " ";
    }
    render();
}

function render() {
    const container = document.getElementById('word-display');
    if(!secretWord || container.innerText.includes("GIOCA")) return;
    container.innerHTML = secretWord.split('').map(l => `<div class="letter-slot">${guessedLetters.includes(l) ? l : ""}</div>`).join('');
    if(secretWord.split('').every(l => guessedLetters.includes(l))) end(true);
    else if(mistakes >= 6) end(false);
}

function end(win, fromRemote = false) {
    clearInterval(timerInterval);
    if(!fromRemote && !isBot && conn) conn.send({ type: 'END', win: win });
    document.getElementById('overlay').classList.remove('hidden');
    let ioHoVinto = amIMaster ? !win : win;
    document.getElementById('result-title').innerText = ioHoVinto ? "MISSIONE COMPIUTA" : "SISTEMA COMPROMESSO";
    if(!fromRemote) {
        if(ioHoVinto) myScore++; else oppScore++;
        document.getElementById('my-score').innerText = myScore;
        document.getElementById('opp-score').innerText = oppScore;
    }
    document.getElementById('result-desc').innerText = "PAROLA: " + secretWord;
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
    else { document.getElementById('play-screen').classList.remove('hidden'); document.getElementById('word-display').innerText = "ATTESA..."; }
}

"QWERTYUIOPASDFGHJKLZXCVBNM".split('').forEach(l => {
    const b = document.createElement('div'); b.className = 'key'; b.innerText = l;
    b.onclick = () => { if(!amIMaster && !b.classList.contains('used')) { b.classList.add('used'); if(conn && !isBot) conn.send({type:'GUESS', letter:l}); processMove(l); } };
    document.getElementById('keyboard').appendChild(b);
});

document.getElementById('copy-btn').onclick = () => { navigator.clipboard.writeText(myId); };
document.getElementById('secret-word').addEventListener('input', function(e) { this.value = this.value.toUpperCase().replace(/[^A-Z]/g, ''); });
