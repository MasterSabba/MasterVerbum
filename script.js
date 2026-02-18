// --- CONFIGURAZIONE E VARIABILI ---
let myId = Math.random().toString(36).substring(2, 7).toUpperCase();
const peer = new Peer(myId);
let conn, secretWord = "", guessedLetters = [], mistakes = 0, amIMaster = false, isBot = false;
let timerInterval, timeLeft = 60, myMatchScore = 0, remoteMatchScore = 0, isOverclock = false, isGhost = false;
let wordHistory = []; // Cronologia per evitare ripetizioni

const fallback = ["ALBERO","CASA","CANE","GATTO","LIBRO","PENNA","TAVOLO","SEDIA","FINESTRA","PORTA","STRADA","PIAZZA","SCUOLA","MARE","MONTE","FIUME","LAGO","NUVOLA","PIOGGIA","VENTO","FUOCO","TERRA","ARIA","LUCE","OMBRA","SOGNO","TEMPO","SPAZIO","ANIMA","CUORE","MENTE","CORPO","AMORE","ODIO","PACE","GUERRA","FORZA","ENERGIA","MAGIA","STELLA","PIANETA","GALASSIA","UNIVERSO","COMETA","ASTEROIDE","SATELLITE","ORBITA","GRAVITA","MELA","PERA","BANANA","LIMONE","FRAGOLA","CILIEGIA","PESCA","ARANCIA","UVA","PANE","PASTA","PIZZA","LATTE","UOVO","CARNE","PESCE","FORMAGGIO","VINO","BIRRA","ACQUA","SALE","PEPE","OLIO","ACETO","DOLCE","AMARO","SALATO","ACIDO","CALDO","FREDDO","ROSSO","VERDE","BLU","GIALLO","NERO","BIANCO","GRIGIO","AZZURRO","VIOLA","ROSA","MARRONE","ESTATE","INVERNO","PRIMAVERA","AUTUNNO","GENNAIO","FEBBRAIO","MARZO","APRILE","MAGGIO","GIUGNO","LUGLIO","AGOSTO","SETTEMBRE","OTTOBRE","NOVEMBRE","DICEMBRE","LUNEDI","MARTEDI","MERCOLEDI","GIOVEDI","VENERDI","SABATO","DOMENICA","BAMBINO","UOMO","DONNA","PADRE","MADRE","FRATELLO","SORELLA","NONNO","NONNA","AMICO","NEMICO","MEDICO","MAESTRO","STUDENTE","DOTTORE","AVVOCATO","POLIZIOTTO","SOLDATO","RE","REGINA","PRINCIPE","CAVALIERE","CASTELLO","REGNO","GUERRA","BATTAGLIA","PACE","LIBERTA","GIUSTIZIA","LEGGE","ORDINE","CAOS","VERITA","BUGIA","ERRORE","SUCCESSO","FALLIMENTO","RICCHEZZA","POVERTA","LAVORO","GIOCO","SPORT","CALCIO","MUSICA","CANZONE","FILM","TEATRO","QUADRO","STATUA","LIBRO","POESIA","LETTERA","PAROLA","VOCE","SILENZIO","RUMORE","SUONO","MUSICA","CHITARRA","PIANOFORTE","VIOLINO","TAMBURO","TROMBA","RADIO","TELEVISIONE","TELEFONO","COMPUTER","INTERNET","SCHERMO","TASTIERA","MOUSE","CHIAVE","OROLOGIO","SOLDI","BANCO","BORSA","ZAINO","SCARPA","VESTITO","GIACCA","CAPPELLO","OCCHIALI","ANELLO","COLLANA","PROFUMO","SAPONE","CARTA","MATITA","GOMMA","FORBICI","COLLE","LIBRO","GIORNALE","RIVISTA","MAPPA","BUSSOLA","TRENO","AEREO","NAVE","AUTO","MOTO","BICI","CAMMINO","CORSA","VOLO","SALTO","DANZA","RISATA","PIANTO","RABBIA","PAURA","CORAGGIO","GIOIA","TRISTEZZA","SPERANZA","FIDUCIA","DUBBIO","SCELTA","DECISIONE","DESTINO","FORTUNA","DESTINO","MORTE","VITA","NASCITA","SALUTE","MALATTIA","CURA","VELENO","CIBO","BEVANDA","FESTA","VIAGGIO","VACANZA","MONDO","PAESE","CITTA","VILLAGGIO","ISOLA","DESERTO","FORESTA","GIUNGLA","MONTAGNA","COLLINA","VALLE","PIANURA","COSTA","SPIAGGIA","ROCCIA","SABBIA","GROTTA","VULCANO","TERREMOTO","URAGANO","FULMINE","TUONO","NEVE","GHIACCIO","SOLE","LUNA","ALBA","TRAMONTO","NOTTE","GIORNO","POMERIGGIO","MATTINA","ORA","MINUTO","SECONDO","SECOLO","STORIA","PASSATO","PRESENTE","FUTURO","IDEA","MEMORIA","PENSIERO","LOGICA","NUMERO","FORMA","COLORE","SUONO","ODORE","SAPORE","TOCCO","PELLE","SGUARDO","SORRISO","ABBRACCIO","BACIO","MANO","PIEDE","TESTA","BRACCIO","GAMBA","OCCHIO","ORECCHIO","NASO","BOCCA","LINGUA","DENTE","CAPELLI","SANGUE","OSSO","MUSCOLO","CUORE","POLMONE","STOMACO","CERVELLO","NERVO","SPIRITO","FANTASMA","ANGELO","DEMONE","DIO","IDOLO","RELIGIONE","CHIESA","TEMPIO","PREGHIERA","RITO","MIRACOLO","PARADISO","INFERNO","PURGATORIO","PECCATO","VIRTU","MORALE","ETICA","VALORE","SIMBOLO","SEGNO","LINGUA","DIALETTO","SCRITTURA","ALFABETO","FRASE","TESTO","STORIA","RACCONTO","FAVOLA","LEGGENDA","MITO","POEMA","DRAMMA","COMMEDIA","TRAGEDIA","ARTE","DESIGN","MODA","CUCINA","ARCHITETTURA","SCULTURA","PITTURA","FOTOGRAFIA","CINEMA","DANZA","CIRCO","MUSEO","BIBLIOTECA","SCUOLA","UNIVERSITA","LABORATORIO","ESPERIMENTO","SCOPERTA","INVENZIONE","TECNOLOGIA","MACCHINA","ROBOT","CHIMICA","FISICA","BIOLOGIA","ASTRONOMIA","MATEMATICA","GEOMETRIA","ALGEBRA","CALCOLO","LOGICA","FILOSOFIA","PSICOLOGIA","SOCIOLOGIA","ECONOMIA","POLITICA","NAZIONE","STATO","GOVERNO","PARLAMENTO","VOTO","ELEZIONE","DEMOCRAZIA","DITTATURA","IMPERO","COLONIA","CONFINI","BANDIERA","INNO","ESERCITO","MARINA","AVIAZIONE","ARRESA","VITTORIA","SCONFITTA","TRATTATO","ALLEANZA","TRADIMENTO","SPIA","CARCERE","PRIGIONE","LIBERTA","DIRITTO","DOVERE","RESPONSABILITA","ONORE","RISPETTO","UMILTA","ORGOGLIO","INVIDIA","AVIDITA","LUSSURIA","ACCIDIA","GOLA","IRA","SUPERBIA","PUDORE","PECCATO","GRAZIA","SALVEZZA","ETERNITA","INFINITO","NULLA","VUOTO","PIENO","PESO","MISURA","DISTANZA","ALTEZZA","LARGHEZZA","PROFONDITA","VOLUME","AREA","SUPERFICIE","LINEA","PUNTO","ANGOLO","CURVA","CERCHIO","QUADRATO","TRIANGOLO","RETTANGOLO","CUBO","SFERA","PIRAMIDE","CILINDRO","CONO","SPIRALE","FRATTALE","LABIRINTO","ENIGMA","MISTERO","SEGRETO","CODICE","CIFRA","CHIAVE","LUCCHETTO","PORTA","SOGLIA","PONTE","MURO","CONFINE","ORIZZONTE","CIELO","ABISSO","OCEANO","MAREA","ONDA","CORRENTE","VORTICE","FONDO","RIVA","PORTO","FARO","ANCORA","VELA","REMO","TIMONE","BUSSOLA","STELLE","COSTELLAZIONE","ZODIACO","OROSCOPO","DESTINO","COINCIDENZA","CASO","PROBABILITA","RISCHIO","PERICOLO","SICUREZZA","PROTEZIONE","DIFESA","ATTACCO","ASSEDIO","TRINCEA","SCUDO","SPADA","ARCO","FRECCIA","LANCIA","ASCE","MARTELLO","PUGNALE","PISTOLA","FUCILE","CANNONE","BOMBA","MINA","RADIAZIONE","FISSIONE","FUSIONE","ATOMO","MOLECOLA","ELEMENTO","METALLO","FERRO","ORO","ARGENTO","RAME","STAGNO","PIOMBO","ZINCO","MERCURIO","CARBONIO","OSSIGENO","IDROGENO","AZOTO","ELIO","GAS","LIQUIDO","SOLIDO","PLASMA","CALORE","ENERGIA","VIBRAZIONE","ONDA","PARTICELLA","LUCE","FOTONE","ELETTRONE","QUARK","GRAVITA","SPAZIOTEMPO","DIMENSIONE","REALTA","ILLUSIONE","SPECCHIO","RIFLESSO","OMBRA","FANTASMA","SOGNO","INCUBO","VISIONE","ESTASI","TRANCE","MEDITAZIONE","SILENZIO","PACE","ARMONIA","EQUILIBRIO","CAOS","DISORDINE","RUMORE","GRIDO","CANTO","PAROLA","SILENZIO","FINE"];

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
    // AGGIUNTA CRONOLOGIA: Registra la parola per evitare ripetizioni (sia Bot che Master)
    if (secretWord) {
        if (!wordHistory.includes(secretWord)) {
            wordHistory.push(secretWord);
            if (wordHistory.length > 20) wordHistory.shift();
        }
    }

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

function getRandomWord() {
    let availableWords = fallback.filter(word => !wordHistory.includes(word));
    if (availableWords.length === 0) { wordHistory = []; availableWords = fallback; }
    return availableWords[Math.floor(Math.random() * availableWords.length)];
}

async function startBotGame() {
    isBot = true; amIMaster = false;
    document.getElementById('status-text').innerText = "QUERYING_DATAMUSE...";
    try {
        const length = Math.floor(Math.random() * 4) + 5;
        const response = await fetch(`https://api.datamuse.com/words?sp=${"?".repeat(length)}&v=it&max=50`);
        const data = await response.json();
        if (data && data.length > 0) {
            // Filtra i risultati Datamuse per non usare parole recenti
            let validChoices = data.map(w => w.word.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Z]/g, ""))
                                  .filter(w => !wordHistory.includes(w));
            
            if (validChoices.length > 0) {
                secretWord = validChoices[Math.floor(Math.random() * validChoices.length)];
            } else {
                secretWord = getRandomWord();
            }
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
    document.getElementById('overlay').style.display = 'flex';
    if (amIMaster) {
        resTitle.innerText = win ? "UPLINK COMPROMISED" : "UPLINK SECURED";
        resTitle.className = win ? "lose-glow" : "win-glow";
    } else {
        resTitle.innerText = win ? "SYSTEM BYPASSED" : "CONNECTION LOST";
        resTitle.className = win ? "win-glow" : "lose-glow";
    }
    document.getElementById('result-desc').innerHTML = `PAROLA: <span style="color:white; font-weight:bold; letter-spacing:3px;">${secretWord}</span>`;
}

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

function useOverclock() { isOverclock = true; consume('p-overclock'); setTimeout(() => isOverclock = false, 5000); }
function useRescan() { if(timeLeft <= 10) return; timeLeft -= 10; updateTimerUI(); consume('p-rescan'); let m = secretWord.split("").filter(l => !guessedLetters.includes(l)); if(m.length) handleMove(m[Math.floor(Math.random()*m.length)]); }
function useGhost() { isGhost = true; consume('p-ghost'); }
function useBlackout() { if(conn) conn.send({type:'P_BLACKOUT'}); consume('p-blackout'); }
function useDistort() { if(conn) conn.send({type:'P_DISTORT'}); consume('p-distort'); }
function useCyberfog() { if(conn) conn.send({type:'P_CYBERFOG'}); consume('p-cyberfog'); }
function triggerBlackout() { const ps = document.getElementById('play-screen'); ps.classList.add('effect-blackout'); setTimeout(() => ps.classList.remove('effect-blackout'), 5000); }
function triggerDistort() { document.getElementById('keyboard').classList.add('effect-glitch'); setTimeout(() => document.getElementById('keyboard').classList.remove('effect-glitch'), 4000); }
function triggerCyberfog() { document.getElementById('word-display').classList.add('effect-fog'); setTimeout(() => document.getElementById('word-display').classList.remove('effect-fog'), 6000); }

window.addEventListener('keydown', (e) => {
    const playScreen = document.getElementById('play-screen');
    const overlay = document.getElementById('overlay');
    if (playScreen.classList.contains('hidden') || amIMaster || overlay.style.display === 'flex') return;
    const key = e.key.toUpperCase();
    if (key.length === 1 && key >= 'A' && key <= 'Z') {
        if (guessedLetters.includes(key)) return;
        const buttons = document.querySelectorAll('.key');
        buttons.forEach(btn => { if (btn.innerText === key) btn.classList.add('used'); });
        handleMove(key);
    }
});

function updateTimerUI() { const mins = Math.floor(timeLeft / 60); const secs = timeLeft % 60; document.getElementById('timer-display').innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`; }
function updateMatchScoreUI() { document.getElementById('score-me').innerText = myMatchScore; document.getElementById('score-remote').innerText = remoteMatchScore; }
function unlock(id, colorClass) { let b = document.getElementById(id); if(b && !b.getAttribute('used')) { b.disabled = false; b.querySelector('.led').className = 'led ' + colorClass; } }
function consume(id) { let b = document.getElementById(id); b.disabled = true; b.setAttribute('used', 'true'); b.querySelector('.led').className = 'led'; b.style.opacity="0.1"; }
function triggerEnd(win) { if(conn && !isBot) conn.send({type:'FINISH', win:win}); forceEnd(win); }
function retry() { if(isBot) startBotGame(); else if(conn) { amIMaster = !amIMaster; conn.send({type:'REMATCH_REQUEST'}); updateRoleUI(); } else location.reload(); }
function remoteMove(l) { guessedLetters.push(l); if(!secretWord.includes(l)) mistakes++; renderWord(); }
function toggleManual() { const m = document.getElementById('manual-overlay'); m.style.display = (m.style.display === 'flex') ? 'none' : 'flex'; }
function resetAccount() { if(confirm("SURE? All system data will be wiped.")) { localStorage.clear(); location.reload(); } }
function copyId() { const id = document.getElementById('my-id').innerText; navigator.clipboard.writeText(id); document.getElementById('copy-btn').innerText = "COPIED"; setTimeout(() => document.getElementById('copy-btn').innerText = "Copy Code", 2000); }

// --- SISTEMA DI RANKING AGGIORNATO (Versione 100 Livelli) ---

function updateRankUI() {
    // Calcolo della percentuale basata su 100 come obiettivo finale
    const progressPercent = Math.min((myScore / 100) * 100, 100);
    
    let rankTitle = "NOVICE_USER";
    let rankColor = "#888"; // Grigio per i principianti

    // Scala dei titoli basata sul punteggio (myScore)
    if (myScore >= 5) { rankTitle = "SCRIPT_KIDDIE"; rankColor = "#00d4ff"; }
    if (myScore >= 15) { rankTitle = "CYBER_GHOST"; rankColor = "#00f2ff"; }
    if (myScore >= 30) { rankTitle = "ELITE_HACKER"; rankColor = "#39ff14"; }
    if (myScore >= 50) { rankTitle = "SYSTEM_BREACHER"; rankColor = "#ffea00"; }
    if (myScore >= 75) { rankTitle = "MAINFRAME_LORD"; rankColor = "#ff8c00"; }
    if (myScore >= 90) { rankTitle = "ARCHITECT_OF_VOID"; rankColor = "#ff003c"; }
    if (myScore >= 100) { rankTitle = "GOD_MODE"; rankColor = "var(--neon-pink)"; }

    // Salvataggio automatico (già presente nel tuo sistema, lo manteniamo)
    localStorage.setItem('mv_elite_stats', JSON.stringify({score: myScore}));

    // Aggiornamento grafico della barra e delle etichette
    document.querySelectorAll('.rank-bar-fill').forEach(el => { 
        el.style.width = progressPercent + "%"; 
        el.style.background = rankColor;
        // Aggiungiamo un effetto bagliore quando si avvicina al God Mode
        el.style.boxShadow = `0 0 15px ${rankColor}`;
    });

    document.querySelectorAll('.rank-label').forEach(el => { 
        // Aggiornata la label per mostrare il progresso su 100
        el.innerText = `${rankTitle} (${myScore}/100)`; 
        el.style.color = rankColor; 
        el.style.textShadow = `0 0 10px ${rankColor}`;
    });
}

// Inizializzazione al caricamento
updateRankUI();
