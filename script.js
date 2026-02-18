// --- CONFIGURAZIONE E VARIABILI ---
let myId = Math.random().toString(36).substring(2, 7).toUpperCase();
const peer = new Peer(myId);
let conn, secretWord = "", guessedLetters = [], mistakes = 0, amIMaster = false, isBot = false;
let timerInterval, timeLeft = 60, myMatchScore = 0, remoteMatchScore = 0, isOverclock = false, isGhost = false;
let wordHistory = []; 

const fallback = ["ALBERO","CASA","CANE","GATTO","LIBRO","PENNA","TAVOLO","SEDIA","FINESTRA","PORTA","STRADA","PIAZZA","SCUOLA","MARE","MONTE","FIUME","LAGO","NUVOLA","PIOGGIA","VENTO","FUOCO","TERRA","ARIA","LUCE","OMBRA","SOGNO","TEMPO","SPAZIO","ANIMA","CUORE","MENTE","CORPO","AMORE","ODIO","PACE","GUERRA","FORZA","ENERGIA","MAGIA","STELLA","PIANETA","GALASSIA","UNIVERSO","COMETA","ASTEROIDE","SATELLITE","ORBITA","GRAVITA","MELA","PERA","BANANA","LIMONE","FRAGOLA","CILIEGIA","PESCA","ARANCIA","UVA","PANE","PASTA","PIZZA","LATTE","UOVO","CARNE","PESCE","FORMAGGIO","VINO","BIRRA","ACQUA","SALE","PEPE","OLIO","ACETO","DOLCE","AMARO","SALATO","ACIDO","CALDO","FREDDO","ROSSO","VERDE","BLU","GIALLO","NERO","BIANCO","GRIGIO","AZZURRO","VIOLA","ROSA","MARRONE","ESTATE","INVERNO","PRIMAVERA","AUTUNNO","GENNAIO","FEBBRAIO","MARZO","APRILE","MAGGIO","GIUGNO","LUGLIO","AGOSTO","SETTEMBRE","OTTOBRE","NOVEMBRE","DICEMBRE","LUNEDI","MARTEDI","MERCOLEDI","GIOVEDI","VENERDI","SABATO","DOMENICA","BAMBINO","UOMO","DONNA","PADRE","MADRE","FRATELLO","SORELLA","NONNO","NONNA","AMICO","NEMICO","MEDICO","MAESTRO","STUDENTE","DOTTORE","AVVOCATO","POLIZIOTTO","SOLDATO","RE","REGINA","PRINCIPE","CAVALIERE","CASTELLO","REGNO","GUERRA","BATTAGLIA","PACE","LIBERTA","GIUSTIZIA","LEGGE","ORDINE","CAOS","VERITA","BUGIA","ERRORE","SUCCESSO","FALLIMENTO","RICCHEZZA","POVERTA","LAVORO","GIOCO","SPORT","CALCIO","MUSICA","CANZONE","FILM","TEATRO","QUADRO","STATUA","LIBRO","POESIA","LETTERA","PAROLA","VOCE","SILENZIO","RUMORE","SUONO","MUSICA","CHITARRA","PIANOFORTE","VIOLINO","TAMBURO","TROMBA","RADIO","TELEVISIONE","TELEFONO","COMPUTER","INTERNET","SCHERMO","TASTIERA","MOUSE","CHIAVE","OROLOGIO","SOLDI","BANCO","BORSA","ZAINO","SCARPA","VESTITO","GIACCA","CAPPELLO","OCCHIALI","ANELLO","COLLANA","PROFUMO","SAPONE","CARTA","MATITA","GOMMA","FORBICI","COLLE","LIBRO","GIORNALE","RIVISTA","MAPPA","BUSSOLA","TRENO","AEREO","NAVE","AUTO","MOTO","BICI","CAMMINO","CORSA","VOLO","SALTO","DANZA","RISATA","PIANTO","RABBIA","PAURA","CORAGGIO","GIOIA","TRISTEZZA","SPERANZA","FIDUCIA","DUBBIO","SCELTA","DECISIONE","DESTINO","FORTUNA","DESTINO","MORTE","VITA","NASCITA","SALUTE","MALATTIA","CURA","VELENO","CIBO","BEVANDA","FESTA","VIAGGIO","VACANZA","MONDO","PAESE","CITTA","VILLAGGIO","ISOLA","DESERTO","FORESTA","GIUNGLA","MONTAGNA","COLLINA","VALLE","PIANURA","COSTA","SPIAGGIA","ROCCIA","SABBIA","GROTTA","VULCANO","TERREMOTO","URAGANO","FULMINE","TUONO","NEVE","GHIACCIO","SOLE","LUNA","ALBA","TRAMONTO","NOTTE","GIORNO","POMERIGGIO","MATTINA","ORA","MINUTO","SECONDO","SECOLO","STORIA","PASSATO","PRESENTE","FUTURO","IDEA","MEMORIA","PENSIERO","LOGICA","NUMERO","FORMA","COLORE","SUONO","ODORE","SAPORE","TOCCO","PELLE","SGUARDO","SORRISO","ABBRACCIO","BACIO","MANO","PIEDE","TESTA","BRACCIO","GAMBA","OCCHIO","ORECCHIO","NASO","BOCCA","LINGUA","DENTE","CAPELLI","SANGUE","OSSO","MUSCOLO","CUORE","POLMONE","STOMACO","CERVELLO","NERVO","SPIRITO","FANTASMA","ANGELO","DEMONE","DIO","IDOLO","RELIGIONE","CHIESA","TEMPIO","PREGHIERA","RITO","MIRACOLO","PARADISO","INFERNO","PURGATORIO","PECCATO","VIRTU","MORALE","ETICA","VALORE","SIMBOLO","SEGNO","LINGUA","DIALETTO","SCRITTURA","ALFABETO","FRASE","TESTO","STORIA","RACCONTO","FAVOLA","LEGGENDA","MITO","POEMA","DRAMMA","COMMEDIA","TRAGEDIA","ARTE","DESIGN","MODA","CUCINA","ARCHITETTURA","SCULTURA","PITTURA","FOTOGRAFIA","CINEMA","DANZA","CIRCO","MUSEO","BIBLIOTECA","SCUOLA","UNIVERSITA","LABORATORIO","ESPERIMENTO","SCOPERTA","INVENZIONE","TECNOLOGIA","MACCHINA","ROBOT","CHIMICA","FISICA","BIOLOGIA","ASTRONOMIA","MATEMATICA","GEOMETRIA","ALGEBRA","CALCOLO","LOGICA","FILOSOFIA","PSICOLOGIA","SOCIOLOGIA","ECONOMIA","POLITICA","NAZIONE","STATO","GOVERNO","PARLAMENTO","VOTO","ELEZIONE","DEMOCRAZIA","DITTATURA","IMPERO","COLONIA","CONFINI","BANDIERA","INNO","ESERCITO","MARINA","AVIAZIONE","ARRESA","VITTORIA","SCONFITTA","TRATTATO","ALLEANZA","TRADIMENTO","SPIA","CARCERE","PRIGIONE","LIBERTA","DIRITTO","DOVERE","RESPONSABILITA","ONORE","RISPETTO","UMILTA","ORGOGLIO","INVIDIA","AVIDITA","LUSSURIA","ACCIDIA","GOLA","IRA","SUPERBIA","PUDORE","PECCATO","GRAZIA","SALVEZZA","ETERNITA","INFINITO","NULLA","VUOTO","PIENO","PESO","MISURA","DISTANZA","ALTEZZA","LARGHEZZA","PROFONDITA","VOLUME","AREA","SUPERFICIE","LINEA","PUNTO","ANGOLO","CURVA","CERCHIO","QUADRATO","TRIANGOLO","RETTANGOLO","CUBO","SFERA","PIRAMIDE","CILINDRO","CONO","SPIRALE","FRATTALE","LABIRINTO","ENIGMA","MISTERO","SEGRETO","CODICE","CIFRA","CHIAVE","LUCCHETTO","PORTA","SOGLIA","PONTE","MURO","CONFINE","ORIZZONTE","CIELO","ABISSO","OCEANO","MAREA","ONDA","CORRENTE","VORTICE","FONDO","RIVA","PORTO","FARO","ANCORA","VELA","REMO","TIMONE","BUSSOLA","STELLE","COSTELLAZIONE","ZODIACO","OROSCOPO","DESTINO","COINCIDENZA","CASO","PROBABILITA","RISCHIO","PERICOLO","SICUREZZA","PROTEZIONE","DIFESA","ATTACCO","ASSEDIO","TRINCEA","SCUDO","SPADA","ARCO","FRECCIA","LANCIA","ASCE","MARTELLO","PUGNALE","PISTOLA","FUCILE","CANNONE","BOMBA","MINA","RADIAZIONE","FISSIONE","FUSIONE","ATOMO","MOLECOLA","ELEMENTO","METALLO","FERRO","ORO","ARGENTO","RAME","STAGNO","PIOMBO","ZINCO","MERCURIO","CARBONIO","OSSIGENO","IDROGENO","AZOTO","ELIO","GAS","LIQUIDO","SOLIDO","PLASMA","CALORE","ENERGIA","VIBRAZIONE","ONDA","PARTICELLA","LUCE","FOTONE","ELETTRONE","QUARK","GRAVITA","SPAZIOTEMPO","DIMENSIONE","REALTA","ILLUSIONE","SPECCHIO","RIFLESSO","OMBRA","FANTASMA","SOGNO","INCUBO","VISIONE","ESTASI","TRANCE","MEDITAZIONE","SILENZIO","PACE","ARMONIA","EQUILIBRIO","CAOS","DISORDINE","RUMORE","GRIDO","CANTO","PAROLA","SILENZIO","FINE"];

// [AUTO_SAVE] Caricamento punti
let myScore = 0;
const savedData = localStorage.getItem('mv_elite_stats');
if(savedData) {
    myScore = JSON.parse(savedData).score || 0;
}

// --- LOGICA DIFFICOLTÀ ---
function getDifficultySettings() {
    let settings = { minL: 3, maxL: 20, time: 60, shake: false };
    if (myScore >= 30) { settings.minL = 6; } 
    if (myScore >= 60) { settings.minL = 8; settings.time = 45; }
    if (myScore >= 85) { settings.minL = 10; settings.time = 35; settings.shake = true; }
    if (myScore >= 95) { settings.minL = 12; settings.time = 25; settings.shake = true; }
    return settings;
}

function getRandomWord() {
    const config = getDifficultySettings();
    let availableWords = fallback.filter(word => 
        !wordHistory.includes(word) && 
        word.length >= config.minL && 
        word.length <= config.maxL
    );
    if (availableWords.length === 0) {
        wordHistory = [];
        availableWords = fallback.filter(word => word.length >= config.minL);
    }
    return availableWords[Math.floor(Math.random() * availableWords.length)];
}

// --- PEERJS SETUP ---
peer.on('open', id => {
    document.getElementById('my-id').innerText = id;
    document.getElementById('connection-led').className = 'led led-on';
    document.getElementById('status-text').innerText = "SYSTEM_ONLINE";
});
peer.on('connection', c => { conn = c; conn.on('open', () => setupRemote()); });

function connectToPeer() {
    const rId = document.getElementById('peer-id-input').value.toUpperCase().trim();
    if(!rId) return;
    conn = peer.connect(rId);
    conn.on('open', () => {
        setupRemote();
        const randomRole = Math.random() > 0.5 ? 'MASTER' : 'GUEST';
        amIMaster = (randomRole === 'GUEST'); 
        conn.send({ type: 'ROLE_ASSIGN', role: randomRole });
        updateRoleUI();
    });
}

function setupRemote() {
    isBot = false;
    document.getElementById('connect-section').classList.add('hidden');
    conn.on('data', d => {
        if(d.type === 'ROLE_ASSIGN') { amIMaster = (d.role === 'MASTER'); updateRoleUI(); }
        if(d.type === 'REMATCH_REQUEST') { amIMaster = !amIMaster; updateRoleUI(); }
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

// --- GAME CORE ---
function initGame() {
    if (secretWord && !wordHistory.includes(secretWord)) {
        wordHistory.push(secretWord);
        if (wordHistory.length > 20) wordHistory.shift();
    }
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('play-screen').classList.remove('hidden');
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('powers-sfidante').classList.toggle('hidden', amIMaster);
    document.getElementById('powers-master').classList.toggle('hidden', !amIMaster);
    
    guessedLetters = []; mistakes = 0; 
    const config = getDifficultySettings();
    timeLeft = config.time;
    
    isOverclock = false; isGhost = false;
    document.querySelectorAll('.btn-pwr').forEach(b => {
        b.disabled = amIMaster ? false : true;
        b.removeAttribute('used'); b.style.opacity = "1";
        b.querySelector('.led').className = 'led';
    });
    updateTimerUI(); updateMatchScoreUI(); createKeyboard(); renderWord(); startTimer();
}

async function startBotGame() {
    isBot = true; amIMaster = false;
    document.getElementById('status-text').innerText = "QUERYING_DATAMUSE...";
    try {
        const config = getDifficultySettings();
        const response = await fetch(`https://api.datamuse.com/words?sp=${"?".repeat(config.minL)}&v=it&max=50`);
        const data = await response.json();
        if (data && data.length > 0) {
            let valid = data.map(w => w.word.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Z]/g, ""))
                            .filter(w => !wordHistory.includes(w) && w.length >= config.minL);
            secretWord = valid.length > 0 ? valid[Math.floor(Math.random() * valid.length)] : getRandomWord();
            initGame();
        } else { throw new Error(); }
    } catch (e) {
        secretWord = getRandomWord();
        initGame();
    }
}

function sendWord() {
    const val = document.getElementById('secret-word-input').value.toUpperCase().trim();
    const cleanWord = val.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Z]/g, "");
    if(cleanWord.length < 3) return alert("MIN_3_CHARS");
    secretWord = cleanWord;
    if(conn) conn.send({ type: 'START', word: secretWord });
    initGame();
}

function startTimer() {
    const config = getDifficultySettings();
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if(!amIMaster) {
            if(!isOverclock) timeLeft--;
            
            if(config.shake) document.getElementById('word-display').classList.add('effect-shake');
            else document.getElementById('word-display').classList.remove('effect-shake');

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

// --- UI & RANKING ---
function updateRankUI() {
    const progressPercent = Math.min((myScore / 100) * 100, 100);
    let r = "NOVICE", c = "#888";

    if(myScore >= 10) { r = "SCRIPT_KIDDIE"; c = "#00d4ff"; }
    if(myScore >= 30) { r = "CYBER_GHOST"; c = "#00f2ff"; }
    if(myScore >= 50) { r = "ELITE_HACKER"; c = "#39ff14"; }
    if(myScore >= 75) { r = "SYSTEM_BREACHER"; c = "#ffea00"; }
    if(myScore >= 90) { r = "VOID_ARCHITECT"; c = "#ff003c"; }
    if(myScore >= 100) { r = "GOD_MODE"; c = "var(--neon-pink)"; }

    localStorage.setItem('mv_elite_stats', JSON.stringify({score: myScore}));

    document.querySelectorAll('.rank-bar-fill').forEach(el => { 
        el.style.width = progressPercent + "%"; 
        el.style.background = c;
        el.style.boxShadow = `0 0 15px ${c}`;
    });

    document.querySelectorAll('.rank-label').forEach(el => { 
        el.innerText = `${r} (${myScore}/100)`; 
        el.style.color = c; 
    });

    if (myScore >= 100) setTimeout(triggerGodEnding, 1500);
}

function triggerGodEnding() {
    if(document.getElementById('god-ending-overlay')) return;
    const endOverlay = document.createElement('div');
    endOverlay.id = 'god-ending-overlay';
    endOverlay.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:black;z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#39ff14;font-family:monospace;padding:20px;text-align:center;";
    endOverlay.innerHTML = `
        <h1 style="text-shadow:0 0 10px #39ff14;">SYSTEM_OVERRRIDE_SUCCESS</h1>
        <div style="max-width:600px; border:1px solid #39ff14; padding:20px; background:#050505;">
            <p>> ACCESSO ROOT OTTENUTO...</p>
            <p>> ANALISI SOGGETTO: ARCHITETTO RILEVATO.</p>
            <p>> HAI SUPERATO IL LIVELLO 100. LA REALTÀ È ORA SOTTO IL TUO CONTROLLO.</p>
            <hr border="1" color="#39ff14">
            <p style="color:white">Il database delle parole è stato saturato. Il sistema deve essere riavviato per mantenere l'integrità.</p>
            <button onclick="resetEverything()" style="background:#39ff14; color:black; border:none; padding:15px; cursor:pointer; width:100%; font-weight:bold; margin-top:20px;">REBOOT_SYSTEM (PRESTIGE)</button>
        </div>
    `;
    document.body.appendChild(endOverlay);
}

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
    document.getElementById('overlay').style.display = 'flex';
    const resTitle = document.getElementById('result-title');
    resTitle.innerText = amIMaster ? (win ? "UPLINK COMPROMISED" : "UPLINK SECURED") : (win ? "SYSTEM BYPASSED" : "CONNECTION LOST");
    resTitle.className = (amIMaster ? !win : win) ? "win-glow" : "lose-glow";
    document.getElementById('result-desc').innerHTML = `PAROLA: <span style="color:white; font-weight:bold; letter-spacing:3px;">${secretWord}</span>`;
}

// --- UTILS ---
function resetEverything() { myScore = 0; localStorage.clear(); location.reload(); }
function triggerEnd(win) { if(conn && !isBot) conn.send({type:'FINISH', win:win}); forceEnd(win); }
function updateTimerUI() { const mins = Math.floor(timeLeft / 60); const secs = timeLeft % 60; document.getElementById('timer-display').innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`; }
function updateMatchScoreUI() { document.getElementById('score-me').innerText = myMatchScore; document.getElementById('score-remote').innerText = remoteMatchScore; }
function unlock(id, colorClass) { let b = document.getElementById(id); if(b && !b.getAttribute('used')) { b.disabled = false; b.querySelector('.led').className = 'led ' + colorClass; } }
function consume(id) { let b = document.getElementById(id); b.disabled = true; b.setAttribute('used', 'true'); b.querySelector('.led').className = 'led'; b.style.opacity="0.1"; }
function createKeyboard() {
    const k = document.getElementById('keyboard'); k.innerHTML = "";
    "QWERTYUIOPASDFGHJKLZXCVBNM".split("").forEach(l => {
        const b = document.createElement('button'); b.className="key"; b.innerText=l;
        b.onclick = () => { if(amIMaster) return; b.classList.add('used'); handleMove(l); };
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

// Powers
function useOverclock() { isOverclock = true; consume('p-overclock'); setTimeout(() => isOverclock = false, 5000); }
function useRescan() { if(timeLeft <= 10) return; timeLeft -= 10; updateTimerUI(); consume('p-rescan'); let m = secretWord.split("").filter(l => !guessedLetters.includes(l)); if(m.length) handleMove(m[Math.floor(Math.random()*m.length)]); }
function useGhost() { isGhost = true; consume('p-ghost'); }
function useBlackout() { if(conn) conn.send({type:'P_BLACKOUT'}); consume('p-blackout'); }
function useDistort() { if(conn) conn.send({type:'P_DISTORT'}); consume('p-distort'); }
function useCyberfog() { if(conn) conn.send({type:'P_CYBERFOG'}); consume('p-cyberfog'); }
function triggerBlackout() { const ps = document.getElementById('play-screen'); ps.classList.add('effect-blackout'); setTimeout(() => ps.classList.remove('effect-blackout'), 5000); }
function triggerDistort() { document.getElementById('keyboard').classList.add('effect-glitch'); setTimeout(() => document.getElementById('keyboard').classList.remove('effect-glitch'), 4000); }
function triggerCyberfog() { document.getElementById('word-display').classList.add('effect-fog'); setTimeout(() => document.getElementById('word-display').classList.remove('effect-fog'), 6000); }

// Events
window.addEventListener('keydown', (e) => {
    const key = e.key.toUpperCase();
    if (key.length === 1 && key >= 'A' && key <= 'Z') {
        const btn = Array.from(document.querySelectorAll('.key')).find(b => b.innerText === key);
        if(btn && !btn.classList.contains('used')) { btn.classList.add('used'); handleMove(key); }
    }
});

updateRankUI();
