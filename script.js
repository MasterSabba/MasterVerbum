// --- VARIABILI E LOGICA ---
let myId = Math.random().toString(36).substring(2, 7).toUpperCase();
const peer = new Peer(myId);
let conn, secretWord = "", guessedLetters = [], mistakes = 0, amIMaster = false, isBot = false;
let timerInterval, timeLeft = 60, myMatchScore = 0, remoteMatchScore = 0, isOverclock = false, isGhost = false;
let wordHistory = []; 

// [AUTO_SAVE]
let myScore = JSON.parse(localStorage.getItem('mv_elite_stats'))?.score || 0;
let myHackerTag = localStorage.getItem('mv_hacker_tag') || "";

// --- FUNZIONE MANUALE (PALLINO VERDE HOME) ---
function showManual() {
    const board = JSON.parse(localStorage.getItem('mv_leaderboard')) || [
        {name: "ARCHITECT", score: 95}, {name: "GHOST_88", score: 80}, {name: "ZERO_COOL", score: 65}
    ];
    const boardHTML = board.map((e, i) => `<div style="display:flex; justify-content:space-between;"><span>${i+1}. ${e.name}</span> <span style="color:var(--neon-blue)">${e.score} PTS</span></div>`).join("");

    const manualHTML = `
        <div style="text-align:left; font-size:12px; font-family:monospace; line-height:1.5;">
            <p style="color:var(--neon-blue); border-bottom:1px solid #333; margin-bottom:5px;">[ CLASSIFICA ]</p>
            ${boardHTML}
            <br>
            <p style="color:var(--neon-blue); border-bottom:1px solid #333; margin-bottom:5px;">[ POTENZIAMENTI ]</p>
            <p>• OVERCLOCK: Ferma il tempo 5s.</p>
            <p>• RE-SCAN: Rivela lettera (-10s).</p>
            <p>• GHOST: Protegge da 1 errore.</p>
            <p style="color:var(--neon-pink); margin-top:5px;">> I Bot attaccano dal Livello 60.</p>
        </div>
    `;
    document.getElementById('result-title').innerText = "INFO_SISTEMA";
    document.getElementById('result-desc').innerHTML = manualHTML;
    document.getElementById('overlay').style.display = 'flex';
    document.querySelector('#overlay button').innerText = "CHIUDI";
}

// --- LOGICA DIFFICOLTÀ & BOT ---
function getDifficultySettings() {
    let s = { minL: 3, time: 60, shake: false, aggro: 0 };
    if (myScore >= 30) s.minL = 6;
    if (myScore >= 60) { s.minL = 8; s.time = 45; s.aggro = 0.05; }
    if (myScore >= 85) { s.minL = 10; s.time = 35; s.shake = true; s.aggro = 0.12; }
    if (myScore >= 95) { s.minL = 12; s.time = 25; s.shake = true; s.aggro = 0.20; }
    return s;
}

function updateLeaderboard(name, score) {
    let board = JSON.parse(localStorage.getItem('mv_leaderboard')) || [
        {name: "ARCHITECT", score: 95}, {name: "GHOST_88", score: 80}, {name: "ZERO_COOL", score: 65}
    ];
    let existing = board.find(e => e.name === name);
    if(existing) { if(score > existing.score) existing.score = score; }
    else { board.push({name, score}); }
    board.sort((a, b) => b.score - a.score);
    localStorage.setItem('mv_leaderboard', JSON.stringify(board.slice(0, 5)));
}

// --- CORE GAME ---
function startBotGame() {
    isBot = true; amIMaster = false;
    const config = getDifficultySettings();
    const available = fallback.filter(w => w.length >= config.minL);
    secretWord = available[Math.floor(Math.random() * available.length)];
    initGame();
}

function initGame() {
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('play-screen').classList.remove('hidden');
    document.getElementById('overlay').style.display = 'none';
    
    guessedLetters = []; mistakes = 0;
    const config = getDifficultySettings();
    timeLeft = config.time;
    
    isOverclock = false; isGhost = false;
    document.querySelectorAll('.btn-pwr').forEach(b => {
        b.disabled = true; b.removeAttribute('used'); b.style.opacity = "1";
        b.querySelector('.led').className = 'led';
    });
    createKeyboard(); renderWord(); startTimer();
}

function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if(!amIMaster) {
            if(!isOverclock) timeLeft--;
            const config = getDifficultySettings();
            if (isBot && Math.random() < config.aggro) {
                const atk = [triggerBlackout, triggerDistort, triggerCyberfog];
                atk[Math.floor(Math.random()*atk.length)]();
            }
            if(timeLeft <= 45) unlock('p-overclock', 'led-on');
            if(timeLeft <= 30) unlock('p-rescan', 'led-on');
            if(timeLeft <= 15) unlock('p-ghost', 'led-on');
            if(timeLeft <= 0) triggerEnd(false);
        }
        updateTimerUI();
    }, 1000);
}

function forceEnd(win) {
    clearInterval(timerInterval);
    if (!amIMaster) {
        if (win) { 
            myScore++; 
            if (!myHackerTag) {
                myHackerTag = prompt("NUOVO RECORD! INSERISCI IL TUO NOME:", "HACKER_" + myId);
                if(myHackerTag) localStorage.setItem('mv_hacker_tag', myHackerTag);
            }
            updateLeaderboard(myHackerTag || "TU", myScore);
        } else { myScore = Math.max(0, myScore - 1); }
    }
    updateRankUI();
    
    document.getElementById('overlay').style.display = 'flex';
    document.querySelector('#overlay button').innerText = "RETRY"; // Tasto Retry semplice
    
    const resTitle = document.getElementById('result-title');
    resTitle.innerText = win ? "VITTORIA" : "SCONFITTA";
    resTitle.className = win ? "win-glow" : "lose-glow";
    
    // Solo parola e LED azzurro, niente pallino verde qui
    document.getElementById('result-desc').innerHTML = `
        <div class="led led-on" style="margin: 10px auto; box-shadow: 0 0 10px var(--neon-blue);"></div>
        <p>PAROLA: <span style="color:white; letter-spacing:2px;">${secretWord}</span></p>
    `;
}

function updateRankUI() {
    const progress = Math.min((myScore / 100) * 100, 100);
    localStorage.setItem('mv_elite_stats', JSON.stringify({score: myScore}));
    document.querySelectorAll('.rank-bar-fill').forEach(el => el.style.width = progress + "%");
    document.querySelectorAll('.rank-label').forEach(el => el.innerText = `LEVEL: ${myScore}/100`);
}

function retry() {
    const btnText = document.querySelector('#overlay button').innerText;
    if(btnText === "CHIUDI") {
        document.getElementById('overlay').style.display = 'none';
    } else {
        document.getElementById('overlay').style.display = 'none';
        if(isBot) startBotGame(); else location.reload();
    }
}

// --- UTILITY TASTIERA E POTERI ---
function unlock(id, c) { let b = document.getElementById(id); if(b && !b.getAttribute('used')) { b.disabled = false; b.querySelector('.led').className = 'led ' + c; } }
function consume(id) { let b = document.getElementById(id); b.disabled = true; b.setAttribute('used', 'true'); b.querySelector('.led').className = 'led'; b.style.opacity="0.1"; }
function handleMove(l) { if(guessedLetters.includes(l) || amIMaster) return; guessedLetters.push(l); if(!secretWord.includes(l)) { if(isGhost) isGhost = false; else mistakes++; } renderWord(); }
function renderWord() { 
    const d = document.getElementById('word-display');
    d.innerHTML = secretWord.split("").map(l => `<div class="letter-slot">${guessedLetters.includes(l)?l:""}</div>`).join("");
    if(!amIMaster) { if(secretWord.split("").every(l => guessedLetters.includes(l))) triggerEnd(true); else if(mistakes >= 6) triggerEnd(false); }
}
function updateTimerUI() { document.getElementById('timer-display').innerText = timeLeft; }
function triggerEnd(win) { forceEnd(win); }
function createKeyboard() {
    const k = document.getElementById('keyboard'); k.innerHTML = "";
    "QWERTYUIOPASDFGHJKLZXCVBNM".split("").forEach(l => {
        const b = document.createElement('button'); b.className="key"; b.innerText=l;
        b.onclick = () => { if(!amIMaster) { b.classList.add('used'); handleMove(l); } };
        k.appendChild(b);
    });
}

// Poteri
function useOverclock() { isOverclock = true; consume('p-overclock'); setTimeout(() => isOverclock = false, 5000); }
function useRescan() { if(timeLeft <= 10) return; timeLeft -= 10; consume('p-rescan'); let m = secretWord.split("").filter(l => !guessedLetters.includes(l)); if(m.length) handleMove(m[0]); }
function useGhost() { isGhost = true; consume('p-ghost'); }

// Attacchi
function triggerBlackout() { document.getElementById('play-screen').style.opacity = "0"; setTimeout(()=>document.getElementById('play-screen').style.opacity="1", 3000); }
function triggerDistort() { document.getElementById('keyboard').style.filter = "invert(1)"; setTimeout(()=>document.getElementById('keyboard').style.filter="none", 3000); }
function triggerCyberfog() { document.getElementById('word-display').style.filter = "blur(15px)"; setTimeout(()=>document.getElementById('word-display').style.filter="none", 4000); }

// INIT
peer.on('open', id => { document.getElementById('my-id').innerText = id; });
updateRankUI();
