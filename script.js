const peerConfig = { config: { 'iceServers': [{ url: 'stun:stun.l.google.com:19302' }] } };
let myId = Math.random().toString(36).substring(2, 7).toUpperCase();
const peer = new Peer(myId, peerConfig);
let conn, secretWord = "", guessedLetters = [], mistakes = 0, amIMaster = false, isBot = false;
let timerInterval, timeLeft = 60, myScore = 0, oppScore = 0, powerUsed = false;
let dizionarioCompleto = [], wordVisible = false, lastSide = 'left';

const vibrate = (ms) => { if(navigator.vibrate) navigator.vibrate(ms); };
const salvaDati = () => localStorage.setItem('masterverbum_stats', JSON.stringify({ score: myScore }));
const caricaDati = () => {
    const s = localStorage.getItem('masterverbum_stats');
    if(s) { myScore = JSON.parse(s).score || 0; }
    document.getElementById('my-score').innerText = myScore;
};

async function caricaDizionario() {
    const backup = ["COMPUTER", "TASTIERA", "HACKER", "SISTEMA", "CODICE", "INTERNET"];
    try {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 1500);
        const r = await fetch('https://raw.githubusercontent.com/napolux/paroleitaliane/master/paroleitaliane.txt', { signal: controller.signal });
        const t = await r.text();
        dizionarioCompleto = t.split('\n').map(p => p.trim().toUpperCase()).filter(p => p.length >= 5 && p.length <= 10 && /^[A-Z]+$/.test(p));
    } catch (e) { dizionarioCompleto = backup; }
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

function updateRankBar() {
    const fill = document.getElementById('rank-bar-fill');
    const label = document.getElementById('rank-label-ingame');
    const rank = getRank(myScore);
    fill.style.width = Math.min((myScore/20)*100, 100) + "%";
    label.innerText = `${rank} (${myScore}/20)`;
}

peer.on('open', id => document.getElementById('my-id').innerText = id);
peer.on('connection', c => { conn = c; setupLogic(); });

document.getElementById('connect-btn').onclick = () => {
    const t = document.getElementById('peer-id-input').value.toUpperCase().trim();
    if(t) { conn = peer.connect(t); conn.on('open', () => setupLogic()); }
};

document.getElementById('bot-btn').onclick = () => {
    isBot = true; amIMaster = false;
    if (!dizionarioCompleto.length) dizionarioCompleto = ["SISTEMA", "LOGICA"];
    secretWord = dizionarioCompleto[Math.floor(Math.random() * dizionarioCompleto.length)];
    startPlay("BOT CHALLENGE");
};

function startPlay(r) {
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('overlay').classList.add('hidden');
    document.getElementById('play-screen').classList.remove('hidden');
    document.getElementById('role-badge').innerText = r;
    
    const isM = (r === "MASTER");
    powerUsed = false;
    document.getElementById('power-btn').disabled = false;
    document.getElementById('power-btn').style.display = isM ? "none" : "block";
    document.getElementById('master-controls').classList.toggle('hidden', !isM);
    
    // FIX BLUR: Solo il Master vede sfocato
    const wordDisplay = document.getElementById('word-display');
    if(!isM) wordDisplay.classList.remove('word-masked');
    else wordDisplay.classList.add('word-masked');

    updateRankBar();
    guessedLetters = []; mistakes = 0;
    document.getElementById('wrong-letters').innerText = "";
    document.querySelectorAll('.key').forEach(k => k.classList.remove('used'));
    if(!isM) startTimer();
    render();
}

document.getElementById('power-btn').onclick = () => {
    if(timeLeft <= 10 || powerUsed) return;
    powerUsed = true;
    document.getElementById('power-btn').disabled = true;
    vibrate(200); timeLeft -= 10; updateTimerUI();
    const remain = secretWord.split('').filter(l => !guessedLetters.includes(l));
    if(remain.length) {
        const p = remain[Math.floor(Math.random()*remain.length)];
        processMove(p); if(conn && !isBot) conn.send({type:'GUESS', letter:p});
    }
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

function end(win, fromRemote = false) {
    clearInterval(timerInterval); vibrate(500);
    if(!fromRemote && !isBot && conn) conn.send({ type: 'END', win: win });
    let ioHoVinto = amIMaster ? !win : win;
    if(!fromRemote) {
        if(ioHoVinto) myScore++; else myScore = Math.max(0, myScore - 1);
        salvaDati();
        if(conn && !isBot) conn.send({ type: 'SYNC_SCORE', score: myScore });
    }
    document.getElementById('overlay').classList.remove('hidden');
    const title = document.getElementById('result-title');
    const rankEl = document.getElementById('rank-display');
    title.innerText = ioHoVinto ? "VITTORIA" : "SCONFITTA";
    title.className = "imposing-text " + (ioHoVinto ? "win-glow" : "lose-glow");
    rankEl.innerText = "GRADO: " + getRank(myScore);
    rankEl.className = "rank-badge " + (ioHoVinto ? "rank-win" : "rank-lose");
    document.getElementById('result-desc').innerText = "PAROLA: " + secretWord;
}

// ... Restanti funzioni (draw, timer, reset account) uguali a prima ...
