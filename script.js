const peerConfig = { config: { 'iceServers': [{ url: 'stun:stun.l.google.com:19302' }] } };
let myId = Math.random().toString(36).substring(2, 7).toUpperCase();
const peer = new Peer(myId, peerConfig);
let conn, secretWord = "", guessedLetters = [], mistakes = 0, amIMaster = false, isBot = false;
let timerInterval, timeLeft = 60;

peer.on('open', id => document.getElementById('my-id').innerText = id);
peer.on('connection', c => { conn = c; setupLogic(); });

document.getElementById('connect-btn').onclick = () => {
    const target = document.getElementById('peer-id-input').value.toUpperCase().trim();
    if(target) { conn = peer.connect(target); conn.on('open', () => setupLogic()); }
};

document.getElementById('bot-btn').onclick = () => {
    isBot = true; amIMaster = false;
    const diz = ["ALGORITMO", "ASTRONAVE", "DATABASE", "SATELLITE", "SISTEMA", "PROGRAMMA", "DINOSAURO"];
    secretWord = diz[Math.floor(Math.random()*diz.length)];
    startPlay("BOT");
};

function setupLogic() {
    isBot = false;
    amIMaster = myId < conn.peer;
    if(amIMaster) {
        let p = prompt("INSERISCI PAROLA SEGRETA:").toUpperCase().replace(/[^A-Z]/g, '');
        secretWord = p || "HANGMAN";
        conn.send({ type: 'START', word: secretWord });
        startPlay("MASTER");
    }
    conn.on('data', data => {
        if(data.type === 'START') { secretWord = data.word; startPlay("SFIDANTE"); }
        else if(data.type === 'GUESS') processMove(data.letter);
        else if(data.type === 'END') end(data.win, true);
    });
}

function startPlay(role) {
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('play-screen').classList.remove('hidden');
    guessedLetters = []; mistakes = 0;
    if(role !== "MASTER") { startTimer(); render(); }
    else { document.getElementById('word-display').innerText = "AVVERSARIO IN AZIONE..."; }
}

function processMove(l) {
    if(guessedLetters.includes(l)) return;
    guessedLetters.push(l);
    if(!secretWord.includes(l)) mistakes++;
    render();
}

function render() {
    const container = document.getElementById('word-display');
    if(!secretWord || container.innerText.includes("AZIONE")) return;
    container.innerHTML = secretWord.split('').map(l => `<div class="letter-slot">${guessedLetters.includes(l) ? l : ""}</div>`).join('');
    draw(mistakes);
    if(secretWord.split('').every(l => guessedLetters.includes(l))) end(true);
    else if(mistakes >= 6) end(false);
}

function end(win, fromRemote = false) {
    clearInterval(timerInterval);
    if(!fromRemote && !isBot && conn) conn.send({ type: 'END', win: win });
    
    const ov = document.getElementById('overlay');
    const title = document.getElementById('result-title');
    ov.classList.remove('hidden');
    
    let ioHoVinto = amIMaster ? !win : win;
    if(ioHoVinto) { title.innerText = "MISSIONE COMPIUTA"; title.className = "imposing-text win-glow"; }
    else { title.innerText = "SISTEMA COMPROMESSO"; title.className = "imposing-text lose-glow"; }
    
    document.getElementById('result-desc').innerText = "LA CHIAVE ERA: " + secretWord;
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
    ctx.strokeStyle = "#00f2ff"; ctx.lineWidth = 5; ctx.beginPath();
    ctx.clearRect(0,0,200,200);
    if(s>=1) ctx.arc(100, 40, 20, 0, Math.PI*2);
    if(s>=2) { ctx.moveTo(100, 60); ctx.lineTo(100, 110); }
    if(s>=3) { ctx.moveTo(100, 75); ctx.lineTo(75, 95); }
    if(s>=4) { ctx.moveTo(100, 75); ctx.lineTo(125, 95); }
    if(s>=5) { ctx.moveTo(100, 110); ctx.lineTo(75, 150); }
    if(s>=6) { ctx.moveTo(100, 110); ctx.lineTo(125, 150); }
    ctx.stroke();
}

document.getElementById('retry-btn').onclick = () => location.reload();

"QWERTYUIOPASDFGHJKLZXCVBNM".split('').forEach(l => {
    const b = document.createElement('div'); b.className = 'key'; b.innerText = l;
    b.onclick = () => { if(!amIMaster && !b.classList.contains('used')) { b.classList.add('used'); if(conn && !isBot) conn.send({type:'GUESS', letter:l}); processMove(l); } };
    document.getElementById('keyboard').appendChild(b);
});

document.getElementById('copy-btn').onclick = () => {
    navigator.clipboard.writeText(myId);
    document.getElementById('copy-btn').innerText = "COPIATO";
    setTimeout(() => document.getElementById('copy-btn').innerText = "COPIA CODICE", 2000);
};
