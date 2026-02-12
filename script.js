const peerConfig = { config: { 'iceServers': [{ url: 'stun:stun.l.google.com:19302' }] } };
let myId = Math.random().toString(36).substring(2, 7).toUpperCase();
const peer = new Peer(myId, peerConfig);
let conn, secretWord = "", guessedLetters = [], mistakes = 0, amIMaster = false, isBot = false, isProcessing = false;
let timerInterval, timeLeft = 60, myScore = 0, oppScore = 0, isMuted = false, lastSide = 'left';

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// --- DIZIONARIO (Invariato) ---
const dizionario = ["ALGORITMO", "ASTRONAVE", "ANTIMATERIA", "AUTOMAZIONE", "BIOCHIMICA", "BIOSFERA", "BITCOIN", "CIRCUITO", "CRITTOGRAFIA", "CYBERNETICA", "DATABASE", "DIGITALE", "DOMOTICA", "ELETTRODO", "ENERGIA", "GALASSIA", "GENETICA", "GRAVITA", "INFORMATICA", "INTERFACCIA", "IPERSPAZIO", "MAGNETISMO", "MOLECOLA", "NANOTECNOLOGIA", "NEBULOSA", "OLOGRAMMA", "ORBITA", "PROCESSORE", "PROTOCOLLO", "QUANTISTICO", "ROBOTICA", "SATELLITE", "SOFTWARE", "TELESCOPIO", "TRANSISTOR", "UNIVERSO", "VIRTUALE", "ARCIPELAGO", "AURORA", "BOSCO", "CANYON", "CASCATA", "DESERTO", "EQUATORE", "FORESTA", "GHIACCIAIO", "GIUNGLA", "GEYSER", "MONTAGNA", "OCEANO", "ORIZZONTE", "PENISOLA", "PIANURA", "VULCANO", "URAGANO", "TORNADO", "TUNDRA", "ALBATROS", "ARMADILLO", "AVVOLTOIO", "CAMALEONTE", "CAPODOGLIO", "COCCODRILLO", "DINOSAURO", "ELEFANTE", "FENICOTTERO", "GHEPARDO", "GIRAFFA", "IPPOPOTAMO", "ORNITORINCO", "RINOCERONTE", "SALAMANDRA", "TARTARUGA", "TRICHECO", "ACQUEDOTTO", "ARCHITETTURA", "BIBLIOTECA", "BUSSOLA", "CATTEDRALE", "CHITARRA", "DIRIGIBILE", "DIZIONARIO", "ELICOTTERO", "FORTEZZA", "GRATTACIELO", "LABIRINTO", "LOCOMOTIVA", "MICROSCOPIO", "OROLOGIO", "PIANOFORTE", "PIRAMIDE", "SOTTOMARINO", "STETOSCOPIO", "VIOLINO", "AFFRESCO", "ALCHIMIA", "BELLEZZA", "COSCIENZA", "DESTINO", "DILEMMA", "EMOZIONE", "ESPERIENZA", "FANTASIA", "FILOSOFIA", "GENTILEZZA", "GIUSTIZIA", "INFINITO", "LIBERTA", "MERAVIGLIA", "MISTERO", "NOSTALGIA", "PROSPETTIVA", "RESILIENZA", "SAGGEZZA", "SOLITUDINE", "UTOPIA", "VITTORIA"];

// --- AUDIO & VIBRAZIONE ---
function playSound(type) {
    if (isMuted) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    if (type === 'click') {
        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        osc.start(); osc.stop(audioCtx.currentTime + 0.1);
    } else if (type === 'error') {
        osc.type = 'square'; osc.frequency.setValueAtTime(120, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start(); osc.stop(audioCtx.currentTime + 0.3);
    }
}
function vibrate(ms = 50) { if ("vibrate" in navigator) navigator.vibrate(ms); }
function toggleMute() { isMuted = !isMuted; document.getElementById('volume-toggle').innerText = isMuted ? "🔇" : "🔊"; }

// --- PEER LOGIC (FIXED) ---
peer.on('open', id => document.getElementById('my-id').innerText = id);

// Ricezione chiamata in entrata
peer.on('connection', c => { 
    conn = c; 
    setupLogic(); 
});

// Invio chiamata (Tasto Connetti)
document.getElementById('connect-btn').onclick = () => {
    const target = document.getElementById('peer-id-input').value.toUpperCase().trim();
    if(target) { 
        conn = peer.connect(target); 
        // Importante: Aspettiamo che la connessione sia aperta prima di attaccare i listener
        conn.on('open', () => {
            setupLogic();
        });
    }
};

function setupLogic() {
    if(!conn) return;

    // Determina chi è il Master in base all'ordine alfabetico degli ID
    amIMaster = myId < conn.peer;
    
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('score-board').classList.remove('hidden');
    
    if(amIMaster) {
        document.getElementById('host-screen').classList.remove('hidden');
    } else {
        document.getElementById('play-screen').classList.remove('hidden');
        document.getElementById('word-display').innerText = "IN ATTESA DEL MASTER...";
        document.getElementById('keyboard').classList.add('hidden');
    }

    // Gestione dati in arrivo
    conn.on('data', data => {
        if (data.type === 'START') { 
            secretWord = data.word; 
            isBot = false; 
            document.getElementById('word-display').innerText = ""; 
            startPlay("SFIDANTE"); 
        }
        else if (data.type === 'GUESS') processMove(data.letter);
        else if (data.type === 'EMOJI') showEmoji(data.emoji);
        else if (data.type === 'REMATCH') prepareNextRound();
    });
}

// --- RESTO DEL CODICE (Invariato ma pulito) ---
document.getElementById('bot-btn').onclick = () => {
    if (isProcessing) return; isProcessing = true;
    isBot = true; amIMaster = false;
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('score-board').classList.remove('hidden');
    document.getElementById('play-screen').classList.remove('hidden');
    document.getElementById('keyboard').classList.add('hidden');
    document.getElementById('word-display').innerText = "CALCOLO SFIDA...";
    setTimeout(() => {
        let lista = (myScore >= oppScore + 3) ? dizionario.filter(w => w.length >= 10) : dizionario;
        secretWord = lista[Math.floor(Math.random()*lista.length)];
        isProcessing = false; document.getElementById('word-display').innerText = ""; 
        startPlay("BOT CHALLENGE");
    }, 1000);
};

document.getElementById('start-btn').onclick = () => {
    secretWord = document.getElementById('secret-word').value.trim().toUpperCase();
    if(secretWord.length < 3) return;
    if(conn) conn.send({ type: 'START', word: secretWord });
    startPlay("MASTER");
};

function startPlay(role) {
    document.getElementById('host-screen').classList.add('hidden');
    document.getElementById('play-screen').classList.remove('hidden');
    document.getElementById('role-badge').innerText = role;
    guessedLetters = []; mistakes = 0;
    document.getElementById('wrong-letters').innerText = "";
    document.querySelectorAll('.key').forEach(k => k.classList.remove('used'));
    const ctx = document.getElementById('hangmanCanvas').getContext('2d');
    ctx.clearRect(0,0,200,200);
    if(role !== "MASTER") { 
        document.getElementById('keyboard').classList.remove('hidden'); 
        startTimer(); render(); 
    } else { 
        document.getElementById('word-display').innerText = "L'AMICO GIOCA..."; 
        clearInterval(timerInterval); 
    }
}

function startTimer() {
    clearInterval(timerInterval); timeLeft = 60;
    timerInterval = setInterval(() => {
        timeLeft--; 
        document.getElementById('timer-display').innerText = `00:${timeLeft < 10 ? '0' : ''}${timeLeft}`;
        if(timeLeft <= 0) end(false);
    }, 1000);
}

function processMove(l) {
    if(isProcessing || guessedLetters.includes(l)) return;
    guessedLetters.push(l);
    if(!secretWord.includes(l)) { 
        mistakes++; draw(mistakes); 
        document.getElementById('wrong-letters').innerText += l + " ";
        playSound('error'); vibrate(100);
    } else { playSound('click'); }
    render();
}

function render() {
    const container = document.getElementById('word-display');
    if(!secretWord || isProcessing || container.innerText.includes("GIOCA") || container.innerText.includes("ATTESA")) return;
    container.innerHTML = secretWord.split('').map(l => `<div class="letter-slot">${guessedLetters.includes(l) ? l : ""}</div>`).join('');
    if(secretWord.split('').every(l => guessedLetters.includes(l))) end(true);
    else if(mistakes >= 6) end(false);
}

function end(win) {
    clearInterval(timerInterval);
    const ov = document.getElementById('overlay');
    ov.classList.remove('hidden');
    let ioHoVinto = amIMaster ? !win : win;
    document.getElementById('result-title').innerText = ioHoVinto ? "MISSIONE COMPIUTA" : "SISTEMA COMPROMESSO";
    document.getElementById('result-title').className = ioHoVinto ? "win-glow" : "lose-glow";
    if(ioHoVinto) { myScore++; spawnParticles(); } else { oppScore++; }
    document.getElementById('my-score').innerText = myScore;
    document.getElementById('opp-score').innerText = oppScore;
    document.getElementById('result-desc').innerText = "LA PAROLA ERA: " + secretWord;
}

function spawnParticles() {
    for(let i=0; i<30; i++) {
        const p = document.createElement('div'); p.className = 'particle';
        p.style.left = Math.random()*100+"vw"; p.style.top = "-10px";
        document.getElementById('particles-container').appendChild(p);
        setTimeout(()=>p.remove(), 3000);
    }
}

function sendEmoji(e) { if(conn) conn.send({ type: 'EMOJI', emoji: e }); showEmoji(e); }
function showEmoji(e) {
    const el = document.createElement('div'); el.className = `floating-emoji emoji-${lastSide}`; el.innerText = e;
    document.getElementById('emoji-area').appendChild(el);
    lastSide = (lastSide === 'left') ? 'right' : 'left';
    setTimeout(() => el.remove(), 1500);
}

document.getElementById('retry-btn').onclick = () => {
    document.getElementById('overlay').classList.add('hidden');
    if(isBot) document.getElementById('bot-btn').click();
    else if(conn) { conn.send({ type: 'REMATCH' }); prepareNextRound(); }
};

document.getElementById('exit-btn').onclick = () => location.reload();

function prepareNextRound() {
    amIMaster = !amIMaster;
    document.getElementById('play-screen').classList.add('hidden');
    if(amIMaster) { 
        document.getElementById('host-screen').classList.remove('hidden'); 
        document.getElementById('secret-word').value = ""; 
    } else { 
        document.getElementById('play-screen').classList.remove('hidden');
        document.getElementById('word-display').innerText = "L'AMICO SCEGLIE...";
        document.getElementById('keyboard').classList.add('hidden');
    }
}

"QWERTYUIOPASDFGHJKLZXCVBNM".split('').forEach(l => {
    const b = document.createElement('div'); b.className = 'key'; b.innerText = l;
    b.onclick = () => { if(!amIMaster && !b.classList.contains('used')) { b.classList.add('used'); if(!isBot && conn) conn.send({type:'GUESS', letter:l}); processMove(l); } };
    document.getElementById('keyboard').appendChild(b);
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

document.getElementById('copy-btn').onclick = () => {
    navigator.clipboard.writeText(myId);
    document.getElementById('copy-btn').innerText = "COPIATO!";
    setTimeout(() => document.getElementById('copy-btn').innerText = "COPIA CODICE", 2000);
};
