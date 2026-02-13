const peerConfig = { config: { 'iceServers': [{ url: 'stun:stun.l.google.com:19302' }] } };
let myId = Math.random().toString(36).substring(2, 7).toUpperCase();
const peer = new Peer(myId, peerConfig);
let conn, secretWord = "", guessedLetters = [], mistakes = 0, amIMaster = false, isBot = false;
let timerInterval, timeLeft = 60, myScore = 0, oppScore = 0;
let dizionarioCompleto = [], wordVisible = false, lastSide = 'left';

const vibrate = (ms) => { if(navigator.vibrate) navigator.vibrate(ms); };
const salvaDati = () => localStorage.setItem('masterverbum_stats', JSON.stringify({ score: myScore }));
const caricaDati = () => {
    const s = localStorage.getItem('masterverbum_stats');
    if(s) { myScore = JSON.parse(s).score || 0; }
    document.getElementById('my-score').innerText = myScore;
};

// Caricamento Vocabolario con Fallback Istantaneo
async function caricaDizionario() {
    const backup = ["COMPUTER", "TASTIERA", "CONNESSIONE", "HACKER", "SCHERMO", "CODICE", "INTERNET", "GIOCO", "SISTEMA", "CIRCUITO"];
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1500); // Se dopo 1.5s non risponde, vai di backup
        
        const r = await fetch('https://raw.githubusercontent.com/napolux/paroleitaliane/master/paroleitaliane.txt', { signal: controller.signal });
        const t = await r.text();
        dizionarioCompleto = t.split('\n').map(p => p.trim().toUpperCase()).filter(p => p.length >= 5 && p.length <= 10 && /^[A-Z]+$/.test(p));
        if(dizionarioCompleto.length === 0) dizionarioCompleto = backup;
    } catch (e) { 
        dizionarioCompleto = backup; 
    }
}

caricaDati(); caricaDizionario();

function getRank(s) {
    if (s >= 20) return "DIO DEL CODICE";
    if (s >= 15) return "ARCHITETTO";
    if (s >= 10) return "HACKER ELITE";
    if (s >= 5)  return "DECRYPTATORE";
    if (s >= 2)  return "ESPERTO";
    return "RECLUTA";
}

peer.on('open', id => document.getElementById('my-id').innerText = id);
peer.on('connection', c => { conn = c; setupLogic(); });

document.getElementById('connect-btn').onclick = () => {
    const t = document.getElementById('peer-id-input').value.toUpperCase().trim();
    if(t) { conn = peer.connect(t); conn.on('open', () => setupLogic()); }
};

document.getElementById('bot-btn').onclick = () => {
    isBot = true; amIMaster = false;
    // Se il dizionario non è ancora pronto, usa il backup subito
    if (!dizionarioCompleto.length) dizionarioCompleto = ["SISTEMA", "RETE", "LOGICA"]; 
    secretWord = dizionarioCompleto[Math.floor(Math.random() * dizionarioCompleto.length)];
    startPlay("BOT CHALLENGE");
};

document.getElementById('reset-data-btn').onclick = () => {
    if(confirm("Cancellare per sempre il tuo Rank?")) {
        localStorage.removeItem('masterverbum_stats');
        location.reload();
    }
};

function setupLogic() {
    isBot = false; amIMaster = myId < conn.peer;
    if(amIMaster) {
        secretWord = (prompt("INSERISCI PAROLA:") || "HANGMAN").toUpperCase().replace(/[^A-Z]/g, '');
        conn.send({ type: 'START', word: secretWord });
        startPlay("MASTER");
    }
    conn.on('data', d => {
        if(d.type === 'START') { secretWord = d.word; startPlay("SFIDANTE"); }
        else if(d.type === 'GUESS') processMove(d.letter);
        else if(d.type === 'END') end(d.win, true);
        else if(d.type === 'SYNC') { timeLeft = d.time; updateTimerUI(); }
        else if(d.type === 'SYNC_SCORE') { oppScore = d.score; document.getElementById('opp-score').innerText = oppScore; }
    });
}

function startPlay(r) {
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('overlay').classList.add('hidden');
    document.getElementById('play-screen').classList.remove('hidden');
    document.getElementById('role-badge').innerText = r;
    const isM = (r === "MASTER");
    document.getElementById('power-btn').style.display = isM ? "none" : "block";
    document.getElementById('master-controls').classList.toggle('hidden', !isM);
    wordVisible = false;
    document.getElementById('word-display').classList.add('word-masked');
    document.getElementById('toggle-word-btn').innerText = "👁️ MOSTRA PAROLA";
    guessedLetters = []; mistakes = 0;
    document.getElementById('wrong-letters').innerText = "";
    document.querySelectorAll('.key').forEach(k => k.classList.remove('used'));
    if(!isM) { startTimer(); render(); } else { render(); }
}

document.getElementById('toggle-word-btn').onclick = () => {
    wordVisible = !wordVisible;
    document.getElementById('word-display').classList.toggle('word-masked', !wordVisible);
    document.getElementById('toggle-word-btn').innerText = wordVisible ? "🕵️ NASCONDI" : "👁️ MOSTRA";
};

function processMove(l) {
    if(guessedLetters.includes(l)) return;
    guessedLetters.push(l);
    if(!secretWord.includes(l)) { mistakes++; document.getElementById('wrong-letters').innerText += l + " "; vibrate([80,40,80]); }
    render();
}

function render() {
    const c = document.getElementById('word-display');
    c.innerHTML = secretWord.split('').map(l => `<div class="letter-slot">${guessedLetters.includes(l) ? l : ""}</div>`).join('');
    draw(mistakes);
    if(!amIMaster) {
        if(secretWord.split('').every(l => guessedLetters.includes(l))) end(true);
        else if(mistakes >= 6) end(false);
    }
}

document.getElementById('power-btn').onclick = () => {
    if(timeLeft <= 10) return;
    vibrate(200); timeLeft -= 10; updateTimerUI();
    const remain = secretWord.split('').filter(l => !guessedLetters.includes(l));
    if(remain.length) {
        const p = remain[Math.floor(Math.random()*remain.length)];
        processMove(p); if(conn && !isBot) conn.send({type:'GUESS', letter:p});
    }
};

function triggerEmoji(e) {
    vibrate(30); const side = lastSide === 'left' ? 'emoji-left' : 'emoji-right';
    const c = document.getElementById(side); c.innerHTML = `<span class="float-anim">${e}</span>`;
    lastSide = lastSide === 'left' ? 'right' : 'left';
    setTimeout(() => c.innerHTML = '', 1200);
}

function startTimer() {
    clearInterval(timerInterval); timeLeft = 60;
    timerInterval = setInterval(() => {
        timeLeft--; updateTimerUI();
        if(conn && !isBot) conn.send({ type: 'SYNC', time: timeLeft });
        if(timeLeft <= 0) end(false);
    }, 1000);
}

function updateTimerUI() {
    const tEl = document.getElementById('timer-display');
    tEl.innerText = `00:${timeLeft < 10 ? '0' : ''}${timeLeft}`;
    if(timeLeft <= 10) { tEl.classList.add('timer-panic'); if(timeLeft > 0) vibrate(50); }
    else tEl.classList.remove('timer-panic');
}

function end(win, fromRemote = false) {
    clearInterval(timerInterval); vibrate(500);
    if(!fromRemote && !isBot && conn) conn.send({ type: 'END', win: win });
    let ioHoVinto = amIMaster ? !win : win;
    if(!fromRemote) {
        if(ioHoVinto) myScore++; else myScore = Math.max(0, myScore - 1);
        salvaDati();
        if(conn && !isBot) conn.send({ type: 'SYNC_SCORE', score: myScore });
    }
    document.getElementById('my-score').innerText = myScore;
    document.getElementById('overlay').classList.remove('hidden');
    const title = document.getElementById('result-title');
    const rankEl = document.getElementById('rank-display');
    title.innerText = ioHoVinto ? "MISSIONE COMPIUTA" : "SISTEMA COMPROMESSO";
    title.className = "imposing-text " + (ioHoVinto ? "win-glow" : "lose-glow");
    rankEl.innerText = "GRADO: " + getRank(myScore);
    rankEl.className = "rank-badge " + (ioHoVinto ? "rank-win" : "rank-lose");
    document.getElementById('result-desc').innerText = "LA CHIAVE ERA: " + secretWord;
}

document.getElementById('retry-btn').onclick = () => {
    if(isBot) {
        secretWord = dizionarioCompleto[Math.floor(Math.random()*dizionarioCompleto.length)];
        startPlay("BOT CHALLENGE");
    } else if(conn) {
        amIMaster = !amIMaster;
        if(amIMaster) {
            secretWord = (prompt("NUOVA PAROLA:") || "HANGMAN").toUpperCase().replace(/[^A-Z]/g, '');
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
    ctx.strokeStyle = "#00f2ff"; ctx.lineWidth = 5; ctx.beginPath(); ctx.clearRect(0,0,200,200);
    if(s>=1) ctx.arc(100, 35, 15, 0, Math.PI*2);
    if(s>=2) { ctx.moveTo(100, 50); ctx.lineTo(100, 90); }
    if(s>=3) { ctx.moveTo(100, 60); ctx.lineTo(75, 80); }
    if(s>=4) { ctx.moveTo(100, 60); ctx.lineTo(125, 80); }
    if(s>=5) { ctx.moveTo(100, 90); ctx.lineTo(80, 120); }
    if(s>=6) { ctx.moveTo(100, 90); ctx.lineTo(120, 120); }
    ctx.stroke();
}

"QWERTYUIOPASDFGHJKLZXCVBNM".split('').forEach(l => {
    const b = document.createElement('div'); b.className = 'key'; b.innerText = l;
    b.onclick = () => { if(!amIMaster && !b.classList.contains('used')) { b.classList.add('used'); if(conn && !isBot) conn.send({type:'GUESS', letter:l}); processMove(l); } };
    document.getElementById('keyboard').appendChild(b);
});

document.getElementById('copy-btn').onclick = () => {
    navigator.clipboard.writeText(myId); document.getElementById('copy-btn').innerText = "COPIATO";
    setTimeout(() => document.getElementById('copy-btn').innerText = "COPIA CODICE", 2000);
};
