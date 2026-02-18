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

// --- LOGICA DIFFICOLTÀ & BOT AGGRESSIVI ---
function getDifficultySettings() {
    let settings = { minL: 3, maxL: 20, time: 60, shake: false, aggro: 0 };
    if (myScore >= 30) { settings.minL = 6; } 
    if (myScore >= 60) { settings.minL = 8; settings.time = 45; settings.aggro = 0.05; }
    if (myScore >= 85) { settings.minL = 10; settings.time = 35; settings.shake = true; settings.aggro = 0.12; }
    if (myScore >= 95) { settings.minL = 12; settings.time = 25; settings.shake = true; settings.aggro = 0.20; }
    return settings;
}

function botAttackLogic() {
    const config = getDifficultySettings();
    if (isBot && !amIMaster && Math.random() < config.aggro) {
        const attacks = [triggerBlackout, triggerDistort, triggerCyberfog];
        attacks[Math.floor(Math.random() * attacks.length)]();
    }
}

// --- LEADERBOARD LOGIC ---
function updateLeaderboard(newName, newScore) {
    let board = JSON.parse(localStorage.getItem('mv_leaderboard')) || [
        {name: "BOT_X", score: 95}, {name: "GHOST", score: 80}, {name: "RECRUIT", score: 10}
    ];
    board.push({name: newName, score: newScore});
    board.sort((a, b) => b.score - a.score);
    board = board.slice(0, 5);
    localStorage.setItem('mv_leaderboard', JSON.stringify(board));
    renderLeaderboardUI(board);
}

function renderLeaderboardUI(board) {
    const list = document.getElementById('leaderboard-list');
    if(!list) return;
    list.innerHTML = board.map((e, i) => `<div>${i+1}. ${e.name} - ${e.score}</div>`).join("");
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

// --- GAME LOGIC ---
function initGame() {
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('play-screen').classList.remove('hidden');
    document.getElementById('overlay').style.display = 'none';
    
    guessedLetters = []; mistakes = 0;
    const config = getDifficultySettings();
    timeLeft = config.time;
    
    isOverclock = false; isGhost = false;
    document.querySelectorAll('.btn-pwr').forEach(b => {
        b.disabled = amIMaster ? false : true;
        b.removeAttribute('used'); b.style.opacity = "1";
    });
    updateTimerUI(); updateMatchScoreUI(); createKeyboard(); renderWord(); startTimer();
}

function getRandomWord() {
    const config = getDifficultySettings();
    let available = fallback.filter(w => !wordHistory.includes(w) && w.length >= config.minL);
    if (available.length === 0) { wordHistory = []; available = fallback; }
    return available[Math.floor(Math.random() * available.length)];
}

async function startBotGame() {
    isBot = true; amIMaster = false;
    secretWord = getRandomWord();
    initGame();
}

function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if(!amIMaster) {
            if(!isOverclock) timeLeft--;
            botAttackLogic(); 
            const config = getDifficultySettings();
            if(config.shake) document.getElementById('word-display').classList.add('effect-shake');
            else document.getElementById('word-display').classList.remove('effect-shake');
            if(timeLeft <= 0) triggerEnd(false);
        }
        updateTimerUI();
    }, 1000);
}

function handleMove(l) {
    if(guessedLetters.includes(l) || amIMaster) return;
    guessedLetters.push(l);
    if(!secretWord.includes(l)) mistakes++;
    renderWord();
}

function renderWord() {
    const d = document.getElementById('word-display');
    d.innerHTML = secretWord.split("").map(l => `<div class="letter-slot">${guessedLetters.includes(l)?l:""}</div>`).join("");
    if(!amIMaster) {
        if(secretWord.split("").every(l => guessedLetters.includes(l))) triggerEnd(true);
        else if(mistakes >= 6) triggerEnd(false);
    }
}

function updateRankUI() {
    const progress = Math.min((myScore / 100) * 100, 100);
    localStorage.setItem('mv_elite_stats', JSON.stringify({score: myScore}));
    document.querySelectorAll('.rank-bar-fill').forEach(el => el.style.width = progress + "%");
    document.querySelectorAll('.rank-label').forEach(el => el.innerText = `LEVEL: ${myScore}/100`);
    if (myScore >= 100) triggerGodEnding();
    
    // Aggiorna anche la mini-classifica
    const board = JSON.parse(localStorage.getItem('mv_leaderboard')) || [];
    renderLeaderboardUI(board);
}

function forceEnd(win) {
    clearInterval(timerInterval);
    if (!amIMaster) {
        if (win) { myScore++; updateLeaderboard("YOU", myScore); } 
        else { myScore = Math.max(0, myScore - 1); }
    }
    updateRankUI();
    document.getElementById('overlay').style.display = 'flex';
    document.getElementById('result-title').innerText = win ? "BYPASSED" : "LOST";
}

// --- REBOOT & UTILS ---
function triggerGodEnding() {
    if(document.getElementById('god-ending-overlay')) return;
    const end = document.createElement('div');
    end.id = 'god-ending-overlay';
    end.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:black;z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#39ff14;font-family:monospace;";
    end.innerHTML = `<h1>GOD_MODE_ACTIVE</h1><button onclick="location.reload()" style="background:#39ff14; padding:20px; border:none; cursor:pointer;">REBOOT SYSTEM</button>`;
    document.body.appendChild(end);
}

function triggerEnd(win) { if(conn && !isBot) conn.send({type:'FINISH', win:win}); forceEnd(win); }
function updateTimerUI() { document.getElementById('timer-display').innerText = timeLeft; }
function updateMatchScoreUI() { document.getElementById('score-me').innerText = myMatchScore; }
function createKeyboard() {
    const k = document.getElementById('keyboard'); k.innerHTML = "";
    "QWERTYUIOPASDFGHJKLZXCVBNM".split("").forEach(l => {
        const b = document.createElement('button'); b.className="key"; b.innerText=l;
        b.onclick = () => { b.classList.add('used'); handleMove(l); };
        k.appendChild(b);
    });
}

// Powers Trigger
function triggerBlackout() { document.getElementById('play-screen').style.opacity = "0.1"; setTimeout(()=>document.getElementById('play-screen').style.opacity="1", 3000); }
function triggerDistort() { document.getElementById('keyboard').style.filter = "hue-rotate(90deg) blur(2px)"; setTimeout(()=>document.getElementById('keyboard').style.filter="none", 3000); }
function triggerCyberfog() { document.getElementById('word-display').style.filter = "blur(10px)"; setTimeout(()=>document.getElementById('word-display').style.filter="none", 3000); }

// Inizializzazione
updateRankUI();
