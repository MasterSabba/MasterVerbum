const peerConfig = { config: { 'iceServers': [{ url: 'stun:stun.l.google.com:19302' }] } };
let myId = Math.random().toString(36).substring(2, 7).toUpperCase();
const peer = new Peer(myId, peerConfig);
let conn, secretWord = "", guessedLetters = [], mistakes = 0, amIMaster = false, isBot = false;
let timerInterval, timeLeft = 60, myScore = 0, oppScore = 0, powerUsed = false;

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
    startPlay("BOT CHALLENGE");
};

function setupLogic() {
    isBot = false;
    amIMaster = myId < conn.peer;
    if(amIMaster) {
        secretWord = prompt("PAROLA SEGRETA:").toUpperCase().replace(/[^A-Z]/g, '') || "HANGMAN";
        conn.send({ type: 'START', word: secretWord });
        startPlay("MASTER");
    }
    conn.on('data', data => {
        if(data.type === 'START') { secretWord = data.word; startPlay("SFIDANTE"); }
        else if(data.type === 'GUESS') { processMove(data.letter); }
        else if(data.type === 'END') end(data.win, true);
        else if(data.type === 'SYNC_TIME') { timeLeft = data.time; updateTimerUI(); }
        else if(data.type === 'EMOJI') { showFloatingEmoji(data.emoji); }
        else if(data.type === 'POWER_HIT') { timeLeft = Math.max(0, timeLeft - 10); }
    });
}

function startPlay(role) {
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('overlay').classList.add('hidden');
    document.getElementById('play-screen').classList.remove('hidden');
    document.getElementById('role-badge').innerText = role;
    guessedLetters = []; mistakes = 0; powerUsed = false;
    document.getElementById('wrong-letters').innerText = "";
    document.getElementById('power-btn').disabled = false;
    document.getElementById('power-btn').innerText = amIMaster ? "FIREWALL (-10s)" : "DECRYPTER (Lente)";
    document.querySelectorAll('.key').forEach(k => k.classList.remove('used'));
    
    if(role !== "MASTER") { startTimer(); render(); }
    else { render(); }
}

function processMove(l) {
    if(guessedLetters.includes(l)) return;
    guessedLetters.push(l);
    if(!secretWord.includes(l)) {
        mistakes++;
        document.getElementById('wrong-letters').innerText += l + " ";
    }
    render();
}

function render() {
    const container = document.getElementById('word-display');
    container.innerHTML = secretWord.split('').map(l => `<div class="letter-slot">${guessedLetters.includes(l) ? l : ""}</div>`).join('');
    draw(mistakes);
    if(!amIMaster) {
        if(secretWord.split('').every(l => guessedLetters.includes(l))) end(true);
        else if(mistakes >= 6) end(false);
    }
}

function end(win, fromRemote = false) {
    clearInterval(timerInterval);
    if(!fromRemote && !isBot && conn) conn.send({ type: 'END', win: win });
    
    let ioHoVinto = amIMaster ? !win : win;
    if(!fromRemote) { if(ioHoVinto) myScore++; else oppScore++; }
    
    document.getElementById('my-score').innerText = myScore;
    document.getElementById('opp-score').innerText = oppScore;
    document.getElementById('overlay').classList.remove('hidden');
    const title = document.getElementById('result-title');
    title.innerText = ioHoVinto ? "MISSIONE COMPIUTA" : "SISTEMA COMPROMESSO";
    title.className = "imposing-text " + (ioHoVinto ? "win-glow" : "lose-glow");
    document.getElementById('result-desc').innerText = "LA CHIAVE ERA: " + secretWord;
}

function startTimer() {
    clearInterval(timerInterval); timeLeft = 60;
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerUI();
        if(conn && !isBot) conn.send({ type: 'SYNC_TIME', time: timeLeft });
        if(timeLeft <= 0) end(false);
    }, 1000);
}

function updateTimerUI() {
    document.getElementById('timer-display').innerText = `00:${timeLeft < 10 ? '0' : ''}${timeLeft}`;
}

document.getElementById('power-btn').onclick = () => {
    if(powerUsed) return;
    powerUsed = true;
    document.getElementById('power-btn').disabled = true;
    if(amIMaster) { if(conn) conn.send({type:'POWER_HIT'}); }
    else {
        const remaining = secretWord.split('').filter(l => !guessedLetters.includes(l));
        if(remaining.length > 0) {
            const pick = remaining[Math.floor(Math.random()*remaining.length)];
            if(conn && !isBot) conn.send({type:'GUESS', letter:pick});
            processMove(pick);
        }
    }
};

function sendEmoji(e) { if(conn) conn.send({type:'EMOJI', emoji:e}); showFloatingEmoji(e); }

function showFloatingEmoji(e) {
    const div = document.createElement('div');
    div.innerText = e; div.style.cssText = `position:fixed; bottom:20px; left:${Math.random()*80}%; font-size:3rem; animation: floatUp 2s forwards; z-index:10000; pointer-events:none;`;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 2000);
}

document.getElementById('retry-btn').onclick = () => {
    if(isBot) { document.getElementById('bot-btn').click(); }
    else if(conn) {
        amIMaster = !amIMaster; // Inverte i ruoli
        if(amIMaster) {
            secretWord = prompt("NUOVA PAROLA SEGRETA:").toUpperCase().replace(/[^A-Z]/g, '') || "HANGMAN";
            conn.send({ type: 'START', word: secretWord });
            startPlay("MASTER");
        } else {
            document.getElementById('overlay').classList.add('hidden');
            document.getElementById('play-screen').classList.remove('hidden');
            document.getElementById('word-display').innerText = "ATTESA MASTER...";
        }
    }
};

function draw(s) {
    const ctx = document.getElementById('hangmanCanvas').getContext('2d');
    ctx.strokeStyle = "#00f2ff"; ctx.lineWidth = 5; ctx.beginPath();
    ctx.clearRect(0,0,200,200);
    if(s>=1) ctx.arc(100, 40, 20, 0, Math.PI*2);
    if(s>=2) { ctx.moveTo(100, 60); ctx.lineTo(100, 110); }
    if(s>=3) { ctx.moveTo(100, 75); ctx.lineTo(75, 95); }
    if(s>=4) { ctx.moveTo(100, 75); ctx.lineTo(125, 95); }
    if(s>=5) { ctx.moveTo(100, 110); ctx.lineTo(75, 140); }
    if(s>=6) { ctx.moveTo(100, 110); ctx.lineTo(125, 140); }
    ctx.stroke();
}

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
