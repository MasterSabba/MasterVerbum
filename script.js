// --- CONFIGURAZIONE E VARIABILI ---
let myId = Math.random().toString(36).substring(2, 7).toUpperCase();
const peer = new Peer(myId);
let conn, secretWord = "", guessedLetters = [], mistakes = 0, amIMaster = false, isBot = false;
let timerInterval, timeLeft = 60, myMatchScore = 0, remoteMatchScore = 0, isOverclock = false, isGhost = false;
let wordHistory = []; 

// [AUTO_SAVE] Caricamento Punti e Nome
let myScore = JSON.parse(localStorage.getItem('mv_elite_stats'))?.score || 0;
let myHackerTag = localStorage.getItem('mv_hacker_tag') || "";

const fallback = ["ALBERO","CASA","CANE","GATTO","LIBRO","PENNA","TAVOLO","SEDIA","FINESTRA","PORTA","STRADA","PIAZZA","SCUOLA","MARE","MONTE","FIUME","LAGO","NUVOLA","PIOGGIA","VENTO","FUOCO","TERRA","ARIA","LUCE","OMBRA","SOGNO","TEMPO","SPAZIO","ANIMA","CUORE","MENTE","CORPO","AMORE","ODIO","PACE","GUERRA","FORZA","ENERGIA","MAGIA","STELLA","PIANETA","GALASSIA","UNIVERSO","COMETA","ASTEROIDE","SATELLITE","ORBITA","GRAVITA","MELA","PERA","BANANA","LIMONE","FRAGOLA","CILIEGIA","PESCA","ARANCIA","UVA","PANE","PASTA","PIZZA","LATTE","UOVO","CARNE","PESCE","FORMAGGIO","VINO","BIRRA","ACQUA","SALE","PEPE","OLIO","ACETO","DOLCE","AMARO","SALATO","ACIDO","CALDO","FREDDO","ROSSO","VERDE","BLU","GIALLO","NERO","BIANCO","GRIGIO","AZZURRO","VIOLA","ROSA","MARRONE","ESTATE","INVERNO","PRIMAVERA","AUTUNNO","GENNAIO","FEBBRAIO","MARZO","APRILE","MAGGIO","GIUGNO","LUGLIO","AGOSTO","SETTEMBRE","OTTOBRE","NOVEMBRE","DICEMBRE","LUNEDI","MARTEDI","MERCOLEDI","GIOVEDI","VENERDI","SABATO","DOMENICA","BAMBINO","UOMO","DONNA","PADRE","MADRE","FRATELLO","SORELLA","NONNO","NONNA","AMICO","NEMICO","MEDICO","MAESTRO","STUDENTE","DOTTORE","AVVOCATO","POLIZIOTTO","SOLDATO","RE","REGINA","PRINCIPE","CAVALIERE","CASTELLO","REGNO","GUERRA","BATTAGLIA","PACE","LIBERTA","GIUSTIZIA","LEGGE","ORDINE","CAOS","VERITA","BUGIA","ERRORE","SUCCESSO","FALLIMENTO","RICCHEZZA","POVERTA","LAVORO","GIOCO","SPORT","CALCIO","MUSICA","CANZONE","FILM","TEATRO","QUADRO","STATUA","LIBRO","POESIA","LETTERA","PAROLA","VOCE","SILENZIO","RUMORE","SUONO","MUSICA","CHITARRA","PIANOFORTE","VIOLINO","TAMBURO","TROMBA","RADIO","TELEVISIONE","TELEFONO","COMPUTER","INTERNET","SCHERMO","TASTIERA","MOUSE","CHIAVE","OROLOGIO","SOLDI","BANCO","BORSA","ZAINO","SCARPA","VESTITO","GIACCA","CAPPELLO","OCCHIALI","ANELLO","COLLANA","PROFUMO","SAPONE","CARTA","MATITA","GOMMA","FORBICI","COLLE","LIBRO","GIORNALE","RIVISTA","MAPPA","BUSSOLA","TRENO","AEREO","NAVE","AUTO","MOTO","BICI","CAMMINO","CORSA","VOLO","SALTO","DANZA","RISATA","PIANTO","RABBIA","PAURA","CORAGGIO","GIOIA","TRISTEZZA","SPERANZA","FIDUCIA","DUBBIO","SCELTA","DECISIONE","DESTINO","FORTUNA","DESTINO","MORTE","VITA","NASCITA","SALUTE","MALATTIA","CURA","VELENO","CIBO","BEVANDA","FESTA","VIAGGIO","VACANZA","MONDO","PAESE","CITTA","VILLAGGIO","ISOLA","DESERTO","FORESTA","GIUNGLA","MONTAGNA","COLLINA","VALLE","PIANURA","COSTA","SPIAGGIA","ROCCIA","SABBIA","GROTTA","VULCANO","TERREMOTO","URAGANO","FULMINE","TUONO","NEVE","GHIACCIO","SOLE","LUNA","ALBA","TRAMONTO","NOTTE","GIORNO","POMERIGGIO","MATTINA","ORA","MINUTO","SECONDO","SECOLO","STORIA","PASSATO","PRESENTE","FUTURO","IDEA","MEMORIA","PENSIERO","LOGICA","NUMERO","FORMA","COLORE","SUONO","ODORE","SAPORE","TOCCO","PELLE","SGUARDO","SORRISO","ABBRACCIO","BACIO","MANO","PIEDE","TESTA","BRACCIO","GAMBA","OCCHIO","ORECCHIO","NASO","BOCCA","LINGUA","DENTE","CAPELLI","SANGUE","OSSO","MUSCOLO","CUORE","POLMONE","STOMACO","CERVELLO","NERVO","SPIRITO","FANTASMA","ANGELO","DEMONE","DIO","IDOLO","RELIGIONE","CHIESA","TEMPIO","PREGHIERA","RITO","MIRACOLO","PARADISO","INFERNO","PURGATORIO","PECCATO","VIRTU","MORALE","ETICA","VALORE","SIMBOLO","SEGNO","LINGUA","DIALETTO","SCRITTURA","ALFABETO","FRASE","TESTO","STORIA","RACCONTO","FAVOLA","LEGGENDA","MITO","POEMA","DRAMMA","COMMEDIA","TRAGEDIA","ARTE","DESIGN","MODA","CUCINA","ARCHITETTURA","SCULTURA","PITTURA","FOTOGRAFIA","CINEMA","DANZA","CIRCO","MUSEO","BIBLIOTECA","SCUOLA","UNIVERSITA","LABORATORIO","ESPERIMENTO","SCOPERTA","INVENZIONE","TECNOLOGIA","MACCHINA","ROBOT","CHIMICA","FISICA","BIOLOGIA","ASTRONOMIA","MATEMATICA","GEOMETRIA","ALGEBRA","CALCOLO","LOGICA","FILOSOFIA","PSICOLOGIA","SOCIOLOGIA","ECONOMIA","POLITICA","NAZIONE","STATO","GOVERNO","PARLAMENTO","VOTO","ELEZIONE","DEMOCRAZIA","DITTATURA","IMPERO","COLONIA","CONFINI","BANDIERA","INNO","ESERCITO","MARINA","AVIAZIONE","ARRESA","VITTORIA","SCONFITTA","TRATTATO","ALLEANZA","TRADIMENTO","SPIA","CARCERE","PRIGIONE","LIBERTA","DIRITTO","DOVERE","RESPONSABILITA","ONORE","RISPETTO","UMILTA","ORGOGLIO","INVIDIA","AVIDITA","LUSSURIA","ACCIDIA","GOLA","IRA","SUPERBIA","PUDORE","PECCATO","GRAZIA","SALVEZZA","ETERNITA","INFINITO","NULLA","VUOTO","PIENO","PESO","MISURA","DISTANZA","ALTEZZA","LARGHEZZA","PROFONDITA","VOLUME","AREA","SUPERFICIE","LINEA","PUNTO","ANGOLO","CURVA","CERCHIO","QUADRATO","TRIANGOLO","RETTANGOLO","CUBO","SFERA","PIRAMIDE","CILINDRO","CONO","SPIRALE","FRATTALE","LABIRINTO","ENIGMA","MISTERO","SEGRETO","CODICE","CIFRA","CHIAVE","LUCCHETTO","PORTA","SOGLIA","PONTE","MURO","CONFINE","ORIZZONTE","CIELO","ABISSO","OCEANO","MAREA","ONDA","CORRENTE","VORTICE","FONDO","RIVA","PORTO","FARO","ANCORA","VELA","REMO","TIMONE","BUSSOLA","STELLE","COSTELLAZIONE","ZODIACO","OROSCOPO","DESTINO","COINCIDENZA","CASO","PROBABILITA","RISCHIO","PERICOLO","SICUREZZA","PROTEZIONE","DIFESA","ATTACCO","ASSEDIO","TRINCEA","SCUDO","SPADA","ARCO","FRECCIA","LANCIA","ASCE","MARTELLO","PUGNALE","PISTOLA","FUCILE","CANNONE","BOMBA","MINA","RADIAZIONE","FISSIONE","FUSIONE","ATOMO","MOLECOLA","ELEMENTO","METALLO","FERRO","ORO","ARGENTO","RAME","STAGNO","PIOMBO","ZINCO","MERCURIO","CARBONIO","OSSIGENO","IDROGENO","AZOTO","ELIO","GAS","LIQUIDO","SOLIDO","PLASMA","CALORE","ENERGIA","VIBRAZIONE","ONDA","PARTICELLA","LUCE","FOTONE","ELETTRONE","QUARK","GRAVITA","SPAZIOTEMPO","DIMENSIONE","REALTA","ILLUSIONE","SPECCHIO","RIFLESSO","OMBRA","FANTASMA","SOGNO","INCUBO","VISIONE","ESTASI","TRANCE","MEDITAZIONE","SILENZIO","PACE","ARMONIA","EQUILIBRIO","CAOS","DISORDINE","RUMORE","GRIDO","CANTO","PAROLA","SILENZIO","FINE"];

// --- HOME & MANUALE (PALLINO VERDE) ---
function showManual() {
    const board = JSON.parse(localStorage.getItem('mv_leaderboard')) || [
        {name: "ARCHITECT", score: 95}, {name: "GHOST_88", score: 80}, {name: "ZERO_COOL", score: 65}
    ];
    const boardHTML = board.map((e, i) => `<div style="display:flex; justify-content:space-between;"><span>${i+1}. ${e.name}</span> <span style="color:var(--neon-blue)">${e.score} PTS</span></div>`).join("");

    const manualHTML = `
        <div style="text-align:left; font-size:12px; font-family:monospace;">
            <p style="color:var(--neon-blue); border-bottom:1px solid #333;">[ ELITE_RANKING_TOP_5 ]</p>
            ${boardHTML}
            <br>
            <p style="color:var(--neon-blue); border-bottom:1px solid #333;">[ SYSTEM_COMMANDS ]</p>
            <p>> OVERCLOCK: Ferma il tempo per 5s.</p>
            <p>> RE-SCAN: Rivela lettera casuale (-10s).</p>
            <p>> GHOST_PROT: Protegge dal prossimo errore.</p>
            <p style="color:var(--neon-pink)">> ATTENZIONE: Bot aggressivi dal LV. 60.</p>
        </div>
    `;
    document.getElementById('result-title').innerText = "SYSTEM_INFO";
    document.getElementById('result-desc').innerHTML = manualHTML;
    document.getElementById('overlay').style.display = 'flex';
    document.querySelector('#overlay button').innerText = "CLOSE";
}

// --- LOGICA DIFFICOLTÀ & BOT AGGRESSIVI ---
function getDifficultySettings() {
    let s = { minL: 3, time: 60, shake: false, aggro: 0 };
    if (myScore >= 30) { s.minL = 6; } 
    if (myScore >= 60) { s.minL = 8; s.time = 45; s.aggro = 0.05; }
    if (myScore >= 85) { s.minL = 10; s.time = 35; s.shake = true; s.aggro = 0.12; }
    if (myScore >= 95) { s.minL = 12; s.time = 25; s.shake = true; s.aggro = 0.20; }
    return s;
}

// --- GESTIONE CLASSIFICA ---
function updateLeaderboard(name, score) {
    let board = JSON.parse(localStorage.getItem('mv_leaderboard')) || [
        {name: "ARCHITECT", score: 95}, {name: "GHOST_88", score: 80}, {name: "ZERO_COOL", score: 65}
    ];
    // Se il nome esiste già, aggiorna il punteggio se è migliore
    let existing = board.find(e => e.name === name);
    if(existing) { if(score > existing.score) existing.score = score; }
    else { board.push({name, score}); }
    
    board.sort((a, b) => b.score - a.score);
    board = board.slice(0, 5);
    localStorage.setItem('mv_leaderboard', JSON.stringify(board));
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
    document.querySelector('#overlay button').innerText = "RETRY_UPLINK";
    
    guessedLetters = []; mistakes = 0;
    const config = getDifficultySettings();
    timeLeft = config.time;
    
    isOverclock = false; isGhost = false;
    document.querySelectorAll('.btn-pwr').forEach(b => {
        b.disabled = true; 
        b.removeAttribute('used'); b.style.opacity = "1";
        b.querySelector('.led').className = 'led';
    });
    createKeyboard(); renderWord(); startTimer();
}

function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if(!amIMaster) {
            if(!isOverclock) timeLeft--;
            
            // Attacco Bot
            const config = getDifficultySettings();
            if (isBot && Math.random() < config.aggro) {
                const atk = [triggerBlackout, triggerDistort, triggerCyberfog];
                atk[Math.floor(Math.random()*atk.length)]();
            }

            if(config.shake) document.getElementById('word-display').classList.add('effect-shake');
            else document.getElementById('word-display').classList.remove('effect-shake');

            if(timeLeft <= 45) unlock('p-overclock', 'led-on');
            if(timeLeft <= 30) unlock('p-rescan', 'led-on');
            if(timeLeft <= 15) unlock('p-ghost', 'led-on');
            if(timeLeft <= 0) triggerEnd(false);
        }
        updateTimerUI();
    }, 1000);
}

// --- FINE PARTITA & RANKING ---
function forceEnd(win) {
    clearInterval(timerInterval);
    if (!amIMaster) {
        if (win) { 
            myScore++; myMatchScore++;
            if (!myHackerTag) {
                myHackerTag = prompt("NUOVO RECORD! INSERISCI IL TUO HACKER_TAG:", "HACKER_" + myId);
                if(myHackerTag) localStorage.setItem('mv_hacker_tag', myHackerTag);
            }
            updateLeaderboard(myHackerTag || "YOU", myScore);
        } else { 
            myScore = Math.max(0, myScore - 1); remoteMatchScore++; 
        }
    }
    updateRankUI();
    
    const ov = document.getElementById('overlay');
    ov.style.display = 'flex';
    const resTitle = document.getElementById('result-title');
    resTitle.innerText = win ? "SYSTEM BYPASSED" : "CONNECTION LOST";
    resTitle.className = win ? "win-glow" : "lose-glow";
    
    document.getElementById('result-desc').innerHTML = `
        <div class="led led-on" style="margin: 10px auto; box-shadow: 0 0 10px var(--neon-blue);"></div>
        <p>PAROLA: <span style="color:white; letter-spacing:2px;">${secretWord}</span></p>
    `;
}

// --- FUNZIONI UTILITY ---
function showPowerInfo(type) {
    const info = {
        'overclock': "OVERCLOCK: Ferma il tempo per 5s.",
        'rescan': "RE-SCAN: Rivela lettera (-10s).",
        'ghost': "GHOST_PROTOCOL: Immunità prossimo errore.",
        'blackout': "BLACKOUT: Oscura schermo nemico.",
        'distort': "DISTORT: Confonde tastiera nemica.",
        'cyberfog': "CYBER_FOG: Nebbia su parola nemica."
    };
    document.getElementById('status-text').innerText = info[type] || "SYSTEM_READY";
}

function unlock(id, colorClass) { 
    let b = document.getElementById(id); 
    if(b && !b.getAttribute('used')) { 
        b.disabled = false; b.querySelector('.led').className = 'led ' + colorClass; 
    } 
}

function consume(id) { 
    let b = document.getElementById(id); b.disabled = true; 
    b.setAttribute('used', 'true'); b.querySelector('.led').className = 'led'; b.style.opacity="0.1"; 
}

function handleMove(l) {
    if(guessedLetters.includes(l) || amIMaster) return;
    guessedLetters.push(l);
    if(!secretWord.includes(l)) { if(isGhost) isGhost = false; else mistakes++; }
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
}

function retry() {
    document.getElementById('overlay').style.display = 'none';
    if(isBot) startBotGame();
    else if(conn) { amIMaster = !amIMaster; conn.send({type:'REMATCH_REQUEST'}); }
    else location.reload();
}

function copyId() {
    navigator.clipboard.writeText(document.getElementById('my-id').innerText);
    const btn = document.getElementById('copy-btn'); btn.innerText = "COPIED";
    setTimeout(() => btn.innerText = "Copy Code", 2000);
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

// --- POTERI ---
function useOverclock() { isOverclock = true; consume('p-overclock'); setTimeout(() => isOverclock = false, 5000); }
function useRescan() { if(timeLeft <= 10) return; timeLeft -= 10; consume('p-rescan'); let m = secretWord.split("").filter(l => !guessedLetters.includes(l)); if(m.length) handleMove(m[0]); }
function useGhost() { isGhost = true; consume('p-ghost'); }

// --- EFFETTI ATTACCO ---
function triggerBlackout() { document.getElementById('play-screen').style.opacity = "0"; setTimeout(()=>document.getElementById('play-screen').style.opacity="1", 3000); }
function triggerDistort() { document.getElementById('keyboard').style.filter = "invert(1)"; setTimeout(()=>document.getElementById('keyboard').style.filter="none", 3000); }
function triggerCyberfog() { document.getElementById('word-display').style.filter = "blur(15px)"; setTimeout(()=>document.getElementById('word-display').style.filter="none", 4000); }

// --- INIT PEER ---
peer.on('open', id => { 
    document.getElementById('my-id').innerText = id; 
    document.getElementById('connection-led').className = 'led led-on';
});

updateRankUI();
