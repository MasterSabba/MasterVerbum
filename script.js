const peerConfig = { config: { 'iceServers': [{ url: 'stun:stun.l.google.com:19302' }] } };
let myId = Math.random().toString(36).substring(2, 7).toUpperCase();
const peer = new Peer(myId, peerConfig);
let conn, secretWord = "", guessedLetters = [], mistakes = 0, amIMaster = false, isBot = false, isProcessing = false;
let timerInterval, timeLeft = 60;

// Dizionario reale potenziato
const dizionarioReale = ["ABITUDINE", "ASTRONAVE", "BICICLETTA", "BOTTIGLIA", "BUSSOLA", "CHITARRA", "DIZIONARIO", "ELEFANTE", "EMOZIONE", "ESPERIENZA", "GENTILEZZA", "GIARDINO", "LABIRINTO", "MONTAGNA", "ORIZZONTE", "PANTALONI", "QUADERNO", "RISTORANTE", "SETTIMANA", "TELEFONO", "UNIVERSO", "VELOCITA", "ZAFFERANO", "ZUCCHERO", "CANCELLERIA", "DIPLOMAZIA", "AVVENTURA", "MERAVIGLIA", "PIRAMIDE", "ORCHESTRA", "VULCANO", "TELEVISIONE", "SATELLITE"];

peer.on('open', id => document.getElementById('my-id').innerText = id);
peer.on('connection', c => { conn = c; setupLogic(); });

document.getElementById('connect-btn').onclick = () => {
    const target = document.getElementById('peer-id-input').value.toUpperCase();
    if(target) { conn = peer.connect(target); setupLogic(); }
};

function setupLogic() {
    conn.on('open', () => {
        amIMaster = myId < conn.peer;
        document.getElementById('setup-screen').classList.add('hidden');
        if(amIMaster) document.getElementById('host-screen').classList.remove('hidden');
        else {
            document.getElementById('play-screen').classList.remove('hidden');
            document.getElementById('word-display').innerText = "IL MASTER SCEGLIE...";
        }
    });
    conn.on('data', data => {
        if (data.type === 'START') { secretWord = data.word; isBot = false; startPlay("SFIDANTE"); }
        else if (data.type === 'GUESS') processMove(data.letter);
        else if (data.type === 'EMOJI') showEmoji(data.emoji);
    });
}

document.getElementById('bot-btn').onclick = () => {
    if (isProcessing) return; isProcessing = true;
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('play-screen').classList.remove('hidden');
    document.getElementById('keyboard').classList.add('hidden');
    document.getElementById('word-display').innerText = "CALCOLO...";
    
    setTimeout(() => {
        secretWord = dizionarioReale[Math.floor(Math.random()*dizionarioReale.length)];
        isBot = true; amIMaster = false; isProcessing = false;
        startPlay("BOT CHALLENGE");
    }, 1000);
};

document.getElementById('start-btn').onclick = () => {
    secretWord = document.getElementById('secret-word').value.trim().toUpperCase();
    if(secretWord.length < 3) return;
    if(conn) conn.send({ type: 'START', word: secretWord });
    startPlay("MASTER");
};

function startTimer() {
    clearInterval(timerInterval); timeLeft = 60;
    timerInterval = setInterval(() => {
        timeLeft--; 
        const s = timeLeft % 60;
        document.getElementById('timer-display').innerText = `00:${s < 10 ? '0' : ''}${s}`;
        if(timeLeft <= 0) { clearInterval(timerInterval); end(false); }
    }, 1000);
}

function startPlay(role) {
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('host-screen').classList.add('hidden');
    document.getElementById('play-screen').classList.remove('hidden');
    document.getElementById('role-badge').innerText = role;
    guessedLetters = []; mistakes = 0;
    document.getElementById('wrong-letters').innerText = "";
    const ctx = document.getElementById('hangmanCanvas').getContext('2d');
    ctx.clearRect(0,0,200,200);
    if(role !== "MASTER") { document.getElementById('keyboard').classList.remove('hidden'); startTimer(); }
    else { document.getElementById('word-display').innerText = "L'AMICO GIOCA..."; clearInterval(timerInterval); }
    render();
}

function processMove(l) {
    if(isProcessing || guessedLetters.includes(l)) return;
    guessedLetters.push(l);
    if(!secretWord.includes(l)) { 
        mistakes++; draw(mistakes); 
        document.getElementById('wrong-letters').innerText += l + " "; 
    }
    render();
}

function render() {
    const container = document.getElementById('word-display');
    if(!secretWord || isProcessing || container.innerText.includes("GIOCA")) return;
    
    container.innerHTML = secretWord.split('').map(l => {
        return `<div class="letter-slot">${guessedLetters.includes(l) ? l : ""}</div>`;
    }).join('');

    if(secretWord.split('').every(l => guessedLetters.includes(l))) end(true);
    else if(mistakes >= 6) end(false);
}

function end(win) {
    clearInterval(timerInterval);
    const ov = document.getElementById('overlay');
    ov.classList.remove('hidden');
    let v = amIMaster ? !win : win;
    document.getElementById('result-title').innerText = v ? "MISSIONE COMPIUTA" : "SISTEMA COMPROMESSO";
    document.getElementById('result-title').style.color = v ? "var(--neon-blue)" : "var(--neon-pink)";
    document.getElementById('result-desc').innerText = "LA PAROLA ERA: " + secretWord;
}

const kb = document.getElementById('keyboard');
kb.innerHTML = "";
"QWERTYUIOPASDFGHJKLZXCVBNM".split('').forEach(l => {
    const b = document.createElement('div'); b.className = 'key'; b.innerText = l;
    b.onclick = () => { if(!amIMaster && !b.classList.contains('used') && !isProcessing) { b.classList.add('used'); if(!isBot && conn) conn.send({type:'GUESS', letter:l}); processMove(l); } };
    kb.appendChild(b);
});

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

function sendEmoji(e) { if(conn && conn.open) conn.send({ type: 'EMOJI', emoji: e }); showEmoji(e); }
function showEmoji(e) {
    const el = document.createElement('div'); el.className = 'floating-emoji'; el.innerText = e;
    document.getElementById('emoji-area').appendChild(el);
    setTimeout(() => el.remove(), 1200);
}

document.getElementById('copy-btn').onclick = () => {
    navigator.clipboard.writeText(myId);
    const b = document.getElementById('copy-btn'); b.innerText = "COPIATO!";
    setTimeout(() => b.innerText = "COPIA CODICE", 2000);
};
document.getElementById('retry-btn').onclick = () => location.reload();
