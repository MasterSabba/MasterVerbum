// --- CONFIGURAZIONE E VARIABILI ---
let myId = Math.random().toString(36).substring(2, 7).toUpperCase();
const peer = new Peer(myId);
let conn, secretWord = "", guessedLetters = [], mistakes = 0, amIMaster = false, isBot = false;
let timerInterval, timeLeft = 60, myMatchScore = 0, remoteMatchScore = 0, isOverclock = false, isGhost = false;

// [AUTO_SAVE]: Caricamento punti salvati localmente
let myScore = 0;
const savedData = localStorage.getItem('mv_elite_stats');
if(savedData) {
    myScore = JSON.parse(savedData).score || 0;
}

// --- INIZIALIZZAZIONE PEER ---
peer.on('open', id => {
    document.getElementById('my-id').innerText = id;
    document.getElementById('connection-led').className = 'led led-on';
    document.getElementById('status-text').innerText = "SYSTEM_ONLINE";
});
peer.on('connection', c => { conn = c; conn.on('open', () => setupRemote()); });

// --- GESTIONE CONNESSIONE E RUOLI ---
function connectToPeer() {
    const input = document.getElementById('peer-id-input');
    const rId = input.value.toUpperCase().trim();
    if(!rId) return;
    conn = peer.connect(rId);
    conn.on('open', () => {
        setupRemote();
        // [NUOVO]: Lancia la moneta per il primo turno
        const randomRole = Math.random() > 0.5 ? 'MASTER' : 'GUEST';
        amIMaster = (randomRole === 'GUEST'); // Io prendo l'opposto di quello che mando
        conn.send({ type: 'ROLE_ASSIGN', role: randomRole });
        updateRoleUI();
    });
}

function setupRemote() {
    isBot = false;
    // La vecchia riga "amIMaster = myId < conn.peer" è stata rimossa per favorire il random
    
    document.getElementById('connect-section').classList.add('hidden');
    
    conn.on('data', d => {
        // [NUOVO]: Ricezione ruolo iniziale
        if(d.type === 'ROLE_ASSIGN') {
            amIMaster = (d.role === 'MASTER');
            updateRoleUI();
        }
        // [NUOVO]: Gestione Rematch con inversione
        if(d.type === 'REMATCH_REQUEST') {
            amIMaster = !amIMaster;
            updateRoleUI();
        }

        if(d.type === 'START') { secretWord = d.word; initGame(); }
        if(d.type === 'GUESS') remoteMove(d.letter);
        if(d.type === 'FINISH') forceEnd(d.win);
        if(d.type === 'SYNC') { timeLeft = d.time; mistakes = d.mistakes; updateTimerUI(); renderWord(); }
        if(d.type === 'SCORE_SYNC') { myMatchScore = d.yourScore; remoteMatchScore = d.oppScore; updateMatchScoreUI(); }
        if(d.type === 'P_BLACKOUT') triggerBlackout();
        if(d.type === 'P_DISTORT') triggerDistort();
        if(d.type === 'P_CYBERFOG') triggerCyberfog();
    });
}

// [NUOVO]: Funzione per aggiornare l'interfaccia in base al ruolo
function updateRoleUI() {
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('play-screen').classList.add('hidden');
    document.getElementById('setup-screen').classList.remove('hidden');
    if(amIMaster) {
        document.getElementById('master-section').classList.remove('hidden');
        document.getElementById('status-text').innerText = "YOUR_TURN_MASTER";
    } else {
        document.getElementById('master-section').classList.add('hidden');
        document.getElementById('status-text').innerText = "WAITING_FOR_MASTER...";
    }
}

// --- LOGICA CORE GIOCO ---
function initGame() {
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('play-screen').classList.remove('hidden');
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('powers-sfidante').classList.toggle('hidden', amIMaster);
    document.getElementById('powers-master').classList.toggle('hidden', !amIMaster);
    guessedLetters = []; mistakes = 0; timeLeft = 60; isOverclock = false; isGhost = false;
    
    document.querySelectorAll('.btn-pwr').forEach(b => {
        b.disabled = amIMaster ? false : true;
        b.removeAttribute('used'); b.style.opacity = "1";
        b.querySelector('.led').className = 'led';
    });
    
    updateTimerUI(); updateMatchScoreUI(); createKeyboard(); renderWord(); startTimer();
}

// --- GENERATORE AUTOMATICO (BOT) DINAMICO ---
async function startBotGame() {
    isBot = true; amIMaster = false;
    document.getElementById('status-text').innerText = "QUERYING_DATAMUSE...";
    try {
        const length = Math.floor(Math.random() * 4) + 5;
        const pattern = "?".repeat(length);
        const response = await fetch(`https://api.datamuse.com/words?sp=${pattern}&v=it&max=50`);
        const data = await response.json();
        
        if (data && data.length > 0) {
            let raw = data[Math.floor(Math.random() * data.length)].word.toUpperCase();
            secretWord = raw.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Z]/g, "");
            if(secretWord.length < 3) return startBotGame();
            initGame();
        } else { throw new Error(); }
    } catch (e) {
        const fallback = ["ALBERO","CASA","CANE","GATTO","LIBRO","PENNA","TAVOLO","SEDIA","FINESTRA","PORTA","STRADA","PIAZZA","SCUOLA","MARE","MONTE","FIUME","LAGO","NUVOLA","PIOGGIA","VENTO","FUOCO","TERRA","ARIA","LUCE","OMBRA","SOGNO","TEMPO","SPAZIO","ANIMA","CUORE","MENTE","CORPO","AMORE","ODIO","PACE","GUERRA","FORZA","ENERGIA","MAGIA","STELLA","PIANETA","GALASSIA","UNIVERSO","COMETA","ASTEROIDE","SATELLITE","ORBITA","GRAVITA","VELOCE","LENTO","GRANDE","PICCOLO","ALTO","BASSO","LARGO","STRETTO","NUOVO","VECCHIO","GIOCO","SQUADRA","CALCIO","TENNIS","CORSA","SALTO","NUOTO","CICLISMO","ATLETA","MEDAGLIA","CUCINA","FORNO","PIATTO","BICCHIERE","COLTELLO","FORCHETTA","CUCCHIAIO","TOVAGLIA","PENTOLA","RICETTA","PIZZA","PASTA","RISOTTO","LASAGNA","TORTA","BISCOTTO","GELATO","CIOCCOLATO","ZUCCHERO","SALE","PEPE","OLIO","ACQUA","LATTE","CAFFE","TE","SUCCO","VINO","BIRRA","FRUTTA","MELA","PERA","PESCA","ARANCIA","LIMONE","BANANA","CILIEGIA","FRAGOLA","KIWI","ANANAS","VERDURA","CAROTA","PATATA","POMODORO","INSALATA","CIPOLLA","AGLIO","SPINACI","ZUCCHINA","MELANZANA","ANIMALE","LEONE","TIGRE","ELEFANTE","GIRAFFA","ZEBRA","ORSO","LUPO","VOLPE","CERVO","FARFALLA","APE","FORMICA","RAGNO","SERPENTE","LUCERTOLA","TARTARUGA","DELFINO","BALENA","SQUALO","TECNOLOGIA","COMPUTER","TELEFONO","SMARTPHONE","TABLET","STAMPANTE","MONITOR","CUFFIA","MICROFONO","ROUTER","PROGRAMMA","SOFTWARE","HARDWARE","DATABASE","RETE","CLOUD","SICUREZZA","PASSWORD","ACCOUNT","PROFILO","VIAGGIO","TRENO","AEREO","NAVE","AUTOBUS","BICICLETTA","MOTORE","MACCHINA","STRUMENTO","VALIGIA","MAPPA","BUSSOLA","BIGLIETTO","HOTEL","OSTELLO","SPIAGGIA","FORESTA","DESERTO","ISOLA","CITTA","PAESE","REGIONE","PROVINCIA","NAZIONE","CONTINENTE","EUROPA","ASIA","AFRICA","AMERICA","OCEANIA","MUSICA","CANZONE","SUONO","RITMO","MELODIA","CHITARRA","PIANOFORTE","VIOLINO","BATTERIA","TROMBA","ARTE","QUADRO","SCULTURA","TEATRO","CINEMA","FILM","ATTORE","REGISTA","SCENA","PALCO","LIBRERIA","BIBLIOTECA","ROMANZO","POESIA","RACCONTO","CAPITOLO","PAGINA","PAROLA","LETTERA","ALFABETO","NUMERO","CALCOLO","SOMMA","SOTTRAZIONE","MOLTIPLICAZIONE","DIVISIONE","FRAZIONE","RADICE","POTENZA","EQUAZIONE","SCIENZA","FISICA","CHIMICA","BIOLOGIA","ASTRONOMIA","GEOLOGIA","MATEMATICA","FILOSOFIA","STORIA","GEOGRAFIA","LAVORO","UFFICIO","AZIENDA","FABBRICA","NEGOZIO","MERCATO","CLIENTE","PROGETTO","OBIETTIVO","RISULTATO","FAMIGLIA","MADRE","PADRE","FRATELLO","SORELLA","CUGINO","NONNO","NONNA","ZIO","ZIA","AMICO","COLLEGA","VICINO","MAESTRO","STUDENTE","DOTTORE","INFERMIERE","INGEGNERE","AVVOCATO","ARTISTA","GIARDINO","FIORI","ROSA","TULIPANO","MARGHERITA","ALBERGO","CASTELLO","TORRE","PONTE","MUSEO","OROLOGIO","CALENDARIO","MINUTO","SECONDO","ORARIO","ATTIMO","EPOCA","SECOLO","MILLENNIO","TRAMONTO","ALBA","MEZZOGIORNO","NOTTE","SERA","MATTINA","PRIMAVERA","ESTATE","AUTUNNO","INVERNO","STAGIONE"];
        secretWord = fallback[Math.floor(Math.random()*fallback.length)];
        initGame();
    }
}

// --- INVIO PAROLA (MASTER) ---
function sendWord() {
    const val = document.getElementById('secret-word-input').value.toUpperCase().trim();
    const cleanWord = val.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Z]/g, "");

    if(cleanWord.length < 3) return alert("MIN_3_CHARS");
    
    secretWord = cleanWord;
    if(conn) conn.send({ type: 'START', word: secretWord });
    initGame();
}

// --- LOGICA PARTITA E PUNTEGGI ---
function forceEnd(win) {
    clearInterval(timerInterval);
    if (!amIMaster) {
        if (win) { myScore++; myMatchScore++; } 
        else { myScore = Math.max(0, myScore - 1); remoteMatchScore++; }
        if(conn && !isBot) conn.send({type:'SCORE_SYNC', yourScore: remoteMatchScore, oppScore: myMatchScore});
    } else {
        if (!win) myMatchScore++; else remoteMatchScore++;
    }
    updateMatchScoreUI(); updateRankUI();
    
    const resTitle = document.getElementById('result-title');
    const resDesc = document.getElementById('result-desc');
    document.getElementById('overlay').style.display = 'flex';
    
    if (amIMaster) {
        resTitle.innerText = win ? "UPLINK COMPROMISED" : "UPLINK SECURED";
        resTitle.className = win ? "lose-glow" : "win-glow";
    } else {
        resTitle.innerText = win ? "SYSTEM BYPASSED" : "CONNECTION LOST";
        resTitle.className = win ? "win-glow" : "lose-glow";
    }
    resDesc.innerHTML = `PAROLA: <span style="color:white; font-weight:bold; letter-spacing:3px;">${secretWord}</span>`;
}

// --- TIMER E MOVIMENTI ---
function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if(!amIMaster) {
            if(!isOverclock) timeLeft--;
            if(timeLeft <= 45) unlock('p-overclock', 'led-on');
            if(timeLeft <= 30) unlock('p-rescan', 'led-on');
            if(timeLeft <= 15) unlock('p-ghost', 'led-on');
            if(timeLeft <= 0) triggerEnd(false);
            if(conn && !isBot && timeLeft % 2 === 0) conn.send({type:'SYNC', time:timeLeft, mistakes:mistakes});
        }
        updateTimerUI();
    }, 1000);
}

function handleMove(l) {
    if(guessedLetters.includes(l) || amIMaster) return;
    guessedLetters.push(l);
    if(!secretWord.includes(l)) { if(isGhost) isGhost = false; else mistakes++; }
    if(conn && !isBot) conn.send({type:'GUESS', letter:l});
    renderWord();
}

function renderWord() {
    const d = document.getElementById('word-display');
    d.innerHTML = secretWord.split("").map(l => `<div class="letter-slot">${guessedLetters.includes(l)?l:""}</div>`).join("");
    drawHangman();
    if(!amIMaster) {
        if(secretWord.split("").every(l => guessedLetters.includes(l))) triggerEnd(true);
        else if(mistakes >= 6) triggerEnd(false);
    }
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

// --- POTERI E UTILITY ---
function useOverclock() { isOverclock = true; consume('p-overclock'); setTimeout(() => isOverclock = false, 5000); }
function useRescan() { if(timeLeft <= 10) return; timeLeft -= 10; updateTimerUI(); consume('p-rescan'); let m = secretWord.split("").filter(l => !guessedLetters.includes(l)); if(m.length) handleMove(m[Math.floor(Math.random()*m.length)]); }
function useGhost() { isGhost = true; consume('p-ghost'); }
function useBlackout() { if(conn) conn.send({type:'P_BLACKOUT'}); consume('p-blackout'); }
function useDistort() { if(conn) conn.send({type:'P_DISTORT'}); consume('p-distort'); }
function useCyberfog() { if(conn) conn.send({type:'P_CYBERFOG'}); consume('p-cyberfog'); }
function triggerBlackout() { const ps = document.getElementById('play-screen'); ps.classList.add('effect-blackout'); setTimeout(() => ps.classList.remove('effect-blackout'), 5000); }
function triggerDistort() { document.getElementById('keyboard').classList.add('effect-glitch'); setTimeout(() => document.getElementById('keyboard').classList.remove('effect-glitch'), 4000); }
function triggerCyberfog() { document.getElementById('word-display').classList.add('effect-fog'); setTimeout(() => document.getElementById('word-display').classList.remove('effect-fog'), 6000); }

function updateTimerUI() { const mins = Math.floor(timeLeft / 60); const secs = timeLeft % 60; document.getElementById('timer-display').innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`; }
function updateMatchScoreUI() { document.getElementById('score-me').innerText = myMatchScore; document.getElementById('score-remote').innerText = remoteMatchScore; }
function unlock(id, colorClass) { let b = document.getElementById(id); if(b && !b.getAttribute('used')) { b.disabled = false; b.querySelector('.led').className = 'led ' + colorClass; } }
function consume(id) { let b = document.getElementById(id); b.disabled = true; b.setAttribute('used', 'true'); b.querySelector('.led').className = 'led'; b.style.opacity="0.1"; }
function triggerEnd(win) { if(conn && !isBot) conn.send({type:'FINISH', win:win}); forceEnd(win); }

// [MODIFICATO]: Retry gestisce ora lo scambio ruoli fluido
function retry() { 
    if(isBot) {
        startBotGame();
    } else if (conn) {
        amIMaster = !amIMaster; // Inverte ruolo localmente
        conn.send({ type: 'REMATCH_REQUEST' });
        updateRoleUI();
    } else {
        location.reload(); 
    }
}

function remoteMove(l) { guessedLetters.push(l); if(!secretWord.includes(l)) mistakes++; renderWord(); }

function toggleManual() { const m = document.getElementById('manual-overlay'); m.style.display = (m.style.display === 'flex') ? 'none' : 'flex'; }
function resetAccount() { if(confirm("SURE? All system data will be wiped.")) { localStorage.clear(); location.reload(); } }
function copyId() { const id = document.getElementById('my-id').innerText; navigator.clipboard.writeText(id); document.getElementById('copy-btn').innerText = "COPIED"; setTimeout(() => document.getElementById('copy-btn').innerText = "Copy Code", 2000); }

// --- [AUTO_SAVE]: Aggiornamento Rank e Salvataggio Permanente ---
function updateRankUI() {
    const p = Math.min((myScore/20)*100, 100);
    let r = "HACKER", c = "var(--neon-blue)"; 
    if(myScore >= 10) { r = "ELITE_HACKER"; c = "#39ff14"; }
    if(myScore >= 20) { r = "GOD_MODE"; c = "var(--neon-pink)"; }
    
    // Salvataggio nel browser
    localStorage.setItem('mv_elite_stats', JSON.stringify({score: myScore}));
    
    document.querySelectorAll('.rank-bar-fill').forEach(el => { el.style.width = p+"%"; el.style.background = c; });
    document.querySelectorAll('.rank-label').forEach(el => { el.innerText = `${r} (${myScore}/20)`; el.style.color = c; });
}
// --- [NEW] SUPPORTO TASTIERA ESTERNA ---
window.addEventListener('keydown', (e) => {
    // 1. Verifichiamo che il gioco sia attivo e che non siamo il Master
    // (Il Master non deve poter indovinare la propria parola)
    if (document.getElementById('play-screen').classList.contains('hidden') || amIMaster) return;

    // 2. Prendiamo il tasto premuto e trasformiamolo in MAIUSCOLO
    const key = e.key.toUpperCase();

    // 3. Controlliamo che sia una singola lettera tra A e Z
    if (key.length === 1 && key >= 'A' && key <= 'Z') {
        
        // Controlliamo se la lettera è già stata usata per evitare doppie penalità
        if (guessedLetters.includes(key)) return;

        // 4. Troviamo il tasto corrispondente nella tastiera a schermo per "spegnerlo" visivamente
        const buttons = document.querySelectorAll('.key');
        buttons.forEach(btn => {
            if (btn.innerText === key) {
                btn.classList.add('used'); // Lo rende grigio/disattivato come se fosse cliccato
            }
        });

        // 5. Eseguiamo la mossa
        handleMove(key);
    }
});

// Avvio UI iniziale
updateRankUI();
