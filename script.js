let myId = Math.random().toString(36).substring(2, 7).toUpperCase();
const peer = new Peer(myId);
let conn, secretWord = "", guessedLetters = [], mistakes = 0, amIMaster = false, isBot = false;
let timerInterval, timeLeft = 60, myScore = 0;
let isOverclock = false, isGhost = false;

const dizionario = ["AMORE", "CASA", "SOLE", "LUNA", "MARE", "VENTO", "FUOCO", "ACQUA", "TERRA", "CIELO", "STELLA", "PIETRA", "FIORE", "ALBERO", "RADICE", "FOGLIA", "FRUTTO", "SEME", "PRATO", "BOSCO", "MONTE", "FIUME", "LAGO", "ISOLA", "SPIAGGIA", "DESERTO", "VALLE", "COLLINA", "NEVE", "PIOGGIA", "TEMPO", "NOTTE", "GIORNO", "LUCE", "OMBRA", "SOGNO", "RICORDO", "SPERANZA", "PAURA", "FORZA", "PACE", "GUERRA", "ONDA", "VENTAGLIO", "PORTA", "FINESTRA", "STRADA", "PONTE", "TORRE", "CASTELLO", "CITTA", "PAESE", "PIAZZA", "SCUOLA", "LIBRO", "PAGINA", "PAROLA", "LETTERA", "VOCE", "SUONO", "CANTO", "MUSICA", "ARTE", "COLORE", "QUADRO", "PENNELLO", "TEATRO", "FILM", "STORIA", "LEGGENDA", "FAVOLA", "MITO", "EROE", "REGINA", "RE", "PRINCIPE", "CAVALIERE", "DRAGO", "SPADA", "SCUDO", "AMICO", "NEMICO", "FRATELLO", "SORELLA", "MADRE", "PADRE", "FIGLIO", "FIGLIA", "NONNO", "NONNA", "CUORE", "MENTE", "CORPO", "ANIMA", "VOLTO", "MANO", "OCCHIO", "SGUARDO", "PASSO", "CORSA", "VIAGGIO", "TRENO", "AEREO", "NAVE", "AUTO", "BICICLETTA", "STRUMENTO", "GIOCO", "SQUADRA", "VITTORIA", "SCONFITTA", "RISATA", "LACRIMA", "ABBRACCIO", "BACIO", "SORRISO", "DESIDERIO", "SEGRETO", "MISTERO", "MAGIA", "ENERGIA", "NATURA", "ANIMALE", "CANE", "GATTO", "CAVALLO", "LEONE", "TIGRE", "AQUILA", "FALCO", "PESCE", "BALENA", "DELFINO", "FARFALLA", "FORMICA", "APE", "LUPO", "VOLPE", "ORSO", "CERVO", "PANE", "ACQUA", "LATTE", "FORMAGGIO", "FRUTTA", "VERDURA", "SALE", "ZUCCHERO", "MIELE", "CAFFE", "TAVOLO", "SEDIA", "LETTO", "ARMADIO", "SPECCHIO", "OROLOGIO", "TAPPETO", "TENDA", "LAMPADA", "CUSCINO"];

const saved = localStorage.getItem('mv_stats');
if(saved) myScore = JSON.parse(saved).score || 0;

peer.on('open', id => {
    document.getElementById('my-id').innerText = id;
    document.getElementById('connection-led').className = 'led led-on';
    document.getElementById('status-text').innerText = "SISTEMA_ONLINE";
});

peer.on('connection', c => { conn = c; setupRemote(); });

function connectToPeer() {
    const rId = document.getElementById('peer-id-input').value.toUpperCase().trim();
    if(!rId) return;
    conn = peer.connect(rId);
    conn.on('open', () => setupRemote());
}

function setupRemote() {
    isBot = false;
    amIMaster = myId < conn.peer;
    if(amIMaster) {
        document.getElementById('connect-section').classList.add('hidden');
        document.getElementById('master-section').classList.remove('hidden');
    } else {
        document.getElementById('setup-screen').innerHTML = "<h2>HACKING...</h2>";
    }
    conn.on('data', d => {
        if(d.type === 'START') { secretWord = d.word; amIMaster = false; initGame(); }
        if(d.type === 'GUESS') remoteMove(d.letter);
        if(d.type === 'FINISH') forceEnd(d.win);
        if(d.type === 'P_BLACKOUT') triggerBlackout();
        if(d.type === 'P_DISTORT') triggerDistort();
        if(d.type === 'P_CYBERFOG') triggerCyberfog();
        if(d.type === 'SYNC') { timeLeft = d.time; mistakes = d.mistakes; updateTimerUI(); renderWord(); }
    });
}

function sendWord() {
    const val = document.getElementById('secret-word-input').value.toUpperCase().trim();
    if(val.length < 3) return;
    secretWord = val;
    if(conn) conn.send({ type: 'START', word: secretWord });
    initGame();
}

function startBotGame() {
    isBot = true; amIMaster = false;
    secretWord = dizionario[Math.floor(Math.random()*dizionario.length)];
    initGame();
}

function initGame() {
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('play-screen').classList.remove('hidden');
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('powers-sfidante').classList.toggle('hidden', amIMaster);
    document.getElementById('powers-master').classList.toggle('hidden', !amIMaster);
    guessedLetters = []; mistakes = 0; timeLeft = 60;
    updateTimerUI(); createKeyboard(); renderWord(); startTimer();
}

function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if(!amIMaster) {
            if(!isOverclock) timeLeft--;
            if(timeLeft <= 45) unlock('p-overclock');
            if(timeLeft <= 30) unlock('p-rescan');
            if(timeLeft <= 15) unlock('p-ghost');
            if(timeLeft <= 0) triggerEnd(false);
            if(conn && !isBot && timeLeft % 2 === 0) conn.send({type:'SYNC', time:timeLeft, mistakes:mistakes});
        }
        updateTimerUI();
    }, 1000);
}

function updateTimerUI() { document.getElementById('timer-display').innerText = `00:${timeLeft < 10 ? '0'+timeLeft : timeLeft}`; }

// POTERI
function useOverclock() { isOverclock = true; consume('p-overclock'); logAction("OVERCLOCK ATTIVO"); setTimeout(() => { isOverclock = false; logAction("OVERCLOCK FINITO"); }, 5000); }
function useRescan() { timeLeft -= 10; consume('p-rescan'); let m = secretWord.split("").filter(l => !guessedLetters.includes(l)); if(m.length) handleMove(m[0]); }
function useGhost() { isGhost = true; consume('p-ghost'); logAction("GHOST: SCUDO ATTIVO"); }

function useBlackout() { if(conn) conn.send({type:'P_BLACKOUT'}); consume('p-blackout'); }
function useDistort() { if(conn) conn.send({type:'P_DISTORT'}); consume('p-distort'); }
function useCyberfog() { if(conn) conn.send({type:'P_CYBERFOG'}); consume('p-cyberfog'); }

function triggerBlackout() {
    const ps = document.getElementById('play-screen');
    ps.classList.add('blackout-mode');
    const mv = (e) => {
        let r = ps.getBoundingClientRect();
        ps.style.setProperty('--x', ((e.touches?e.touches[0].clientX:e.clientX)-r.left)+'px');
        ps.style.setProperty('--y', ((e.touches?e.touches[0].clientY:e.clientY)-r.top)+'px');
    };
    window.addEventListener('mousemove', mv); window.addEventListener('touchmove', mv);
    setTimeout(() => { ps.classList.remove('blackout-mode'); window.removeEventListener('mousemove', mv); }, 5000);
}
function triggerDistort() { document.body.classList.add('distort-active'); setTimeout(() => document.body.classList.remove('distort-active'), 4000); }
function triggerCyberfog() { document.getElementById('word-display').classList.add('cyberfog-active'); setTimeout(() => document.getElementById('word-display').classList.remove('cyberfog-active'), 6000); }

// LOGICA CORE
function handleMove(l) {
    if(guessedLetters.includes(l) || amIMaster) return;
    guessedLetters.push(l);
    if(!secretWord.includes(l)) {
        if(isGhost) { isGhost = false; logAction("SCUDO USATO!"); } else { mistakes++; }
    }
    if(conn && !isBot) conn.send({type:'GUESS', letter:l});
    renderWord();
}

function remoteMove(l) { guessedLetters.push(l); if(!secretWord.includes(l)) mistakes++; renderWord(); }

function renderWord() {
    const d = document.getElementById('word-display');
    d.innerHTML = secretWord.split("").map(l => `<div class="letter-slot">${guessedLetters.includes(l)?l:""}</div>`).join("");
    drawHangman();
    if(!amIMaster) {
        if(secretWord.split("").every(l => guessedLetters.includes(l))) triggerEnd(true);
        else if(mistakes >= 6) triggerEnd(false);
    }
}

function triggerEnd(win) { if(conn && !isBot) conn.send({type:'FINISH', win:win}); forceEnd(win); }

function forceEnd(win) {
    clearInterval(timerInterval);
    if(!amIMaster) {
        if(win) myScore++; else myScore = Math.max(0, myScore - 1);
        localStorage.setItem('mv_stats', JSON.stringify({score: myScore}));
    }
    document.getElementById('overlay').style.display = 'flex';
    const t = document.getElementById('result-title');
    // CORREZIONE LOGICA MESSAGGI
    if(amIMaster) {
        t.innerText = win ? "LO SFIDANTE HA VINTO" : "HAI VINTO!";
    } else {
        t.innerText = win ? "HAI VINTO!" : "SCONFITTA!";
    }
    document.getElementById('result-desc').innerText = "LA PAROLA ERA: " + secretWord;
    updateRankUI();
}

function createKeyboard() {
    const k = document.getElementById('keyboard'); k.innerHTML = "";
    "QWERTYUIOPASDFGHJKLZXCVBNM".split("").forEach(l => {
        const b = document.createElement('button'); b.className="key"; b.innerText=l;
        b.onclick = () => { b.classList.add('used'); handleMove(l); };
        k.appendChild(b);
    });
}

function drawHangman() {
    const c = document.getElementById('hangmanCanvas'); const ctx = c.getContext('2d');
    ctx.clearRect(0,0,160,90); ctx.strokeStyle = "#00f2ff"; ctx.lineWidth = 2; ctx.beginPath();
    if(mistakes>0) ctx.arc(80, 15, 7, 0, Math.PI*2);
    if(mistakes>1) { ctx.moveTo(80, 22); ctx.lineTo(80, 50); }
    if(mistakes>2) { ctx.moveTo(80, 30); ctx.lineTo(65, 45); }
    if(mistakes>3) { ctx.moveTo(80, 30); ctx.lineTo(95, 45); }
    if(mistakes>4) { ctx.moveTo(80, 50); ctx.lineTo(70, 75); }
    if(mistakes>5) { ctx.moveTo(80, 50); ctx.lineTo(90, 75); }
    ctx.stroke();
}

function updateRankUI() {
    const p = Math.min((myScore/20)*100, 100);
    const r = myScore>=20?"DIO DEL CODICE":myScore>=10?"HACKER ELITE":"RECLUTA";
    document.querySelectorAll('.rank-bar-fill').forEach(el => el.style.width = p+"%");
    document.querySelectorAll('.rank-label').forEach(el => el.innerText = `${r} (${myScore}/20)`);
}

function unlock(id) { let b = document.getElementById(id); if(b && !b.getAttribute('used')) { b.disabled = false; b.querySelector('.led').className = 'led led-blue'; } }
function consume(id) { let b = document.getElementById(id); b.disabled = true; b.setAttribute('used', 'true'); b.querySelector('.led').className = 'led led-off'; }
function logAction(m) { document.getElementById('action-log').innerText = "> " + m; }
function copyId() { navigator.clipboard.writeText(myId); document.getElementById('copy-btn').innerText = "COPIATO!"; }
function retry() { location.reload(); }
updateRankUI();
