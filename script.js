const peerConfig = { config: { 'iceServers': [{ url: 'stun:stun.l.google.com:19302' }] } };
let myId = Math.random().toString(36).substring(2, 7).toUpperCase();
const peer = new Peer(myId, peerConfig);
let conn, secretWord = "", guessedLetters = [], mistakes = 0, amIMaster = false, isBot = false, isProcessing = false;
let timerInterval, timeLeft = 60, myScore = 0, oppScore = 0, isMuted = false, lastSide = 'left';

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// --- MEGA DIZIONARIO ---
const dizionario = [
    "ALGORITMO", "ASTRONAVE", "ANTIMATERIA", "AUTOMAZIONE", "BIOCHIMICA", "BIOSFERA", "BITCOIN", "CIRCUITO", "CRITTOGRAFIA", "CYBERNETICA", "DATABASE", "DIGITALE", "DOMOTICA", "ELETTRODO", "ENERGIA", "GALASSIA", "GENETICA", "GRAVITA", "INFORMATICA", "INTERFACCIA", "IPERSPAZIO", "MAGNETISMO", "MOLECOLA", "NANOTECNOLOGIA", "NEBULOSA", "OLOGRAMMA", "ORBITA", "PROCESSORE", "PROTOCOLLO", "QUANTISTICO", "ROBOTICA", "SATELLITE", "SOFTWARE", "TELESCOPIO", "TRANSISTOR", "UNIVERSO", "VIRTUALE", "ASTROFISICA", "BIOTECNOLOGIA", "COMBUSTIONE", "CONDUTTORE", "CRISTALLOGRAFIA", "DECODER", "DIODO", "ECOSISTEMA", "ELETTROMAGNETISMO", "ESOSCHELETRO", "FISSIONE", "FOTOSINTESI", "INFRAROSSO", "MICROCHIP", "NEUTRINO", "OSSIDAZIONE", "PARADOSSO", "RADIAZIONE", "SEMICONDUTTORE", "SINAPSI", "TELEMETRIA", "TERMODINAMICA", "ULTRASUONI", "VELOCITA", "XENON",
    "ARCIPELAGO", "AURORA", "BOSCO", "CANYON", "CASCATA", "DESERTO", "EQUATORE", "FORESTA", "GHIACCIAIO", "GIUNGLA", "GEYSER", "MONTAGNA", "OCEANO", "ORIZZONTE", "PENISOLA", "PIANURA", "VULCANO", "URAGANO", "TORNADO", "TUNDRA", "ALBATROS", "ARMADILLO", "AVVOLTOIO", "CAMALEONTE", "CAPODOGLIO", "COCCODRILLO", "DINOSAURO", "ELEFANTE", "FENICOTTERO", "GHEPARDO", "GIRAFFA", "IPPOPOTAMO", "ORNITORINCO", "RINOCERONTE", "SALAMANDRA", "TARTARUGA", "TRICHECO", "ANEMONE", "ANTILOPE", "BARACUDA", "BISONTE", "CALAMARO", "CANGURO", "CINCILLA", "CONDOR", "CORALLO", "COYOTE", "DRAGO", "FALCO", "GIAGUARO", "IGUANA", "INSETTO", "KOALA", "LONTRA", "MANATI", "MEDUSA", "NARVALO", "OSTREIDE", "PAPPAGALLO", "PAVONE", "PELLICANO", "PIRANHA", "POLPO", "QUARZO", "RETRATTILE", "SECCUIA", "TIGRE", "UPUPA", "VIPERA", "ZEBRA",
    "ACQUEDOTTO", "ARCHITETTURA", "BIBLIOTECA", "BUSSOLA", "CATTEDRALE", "CHITARRA", "DIRIGIBILE", "DIZIONARIO", "ELICOTTERO", "FORTEZZA", "GRATTACIELO", "LABIRINTO", "LOCOMOTIVA", "MICROSCOPIO", "OROLOGIO", "PIANOFORTE", "PIRAMIDE", "SOTTOMARINO", "STETOSCOPIO", "VIOLINO", "AFFRESCO", "ALAMBICCO", "ANFORA", "ARAZZO", "BALESTRA", "BISTURI", "BRONZO", "CANDELABRO", "CARROZZA", "CLESSIDRA", "COLONNATO", "DIPLOMA", "ELMO", "EREMO", "FALCIONE", "GALEONE", "GEROGLIFICO", "IDROVOLANTE", "INCUDINE", "LANTERNA", "LIUTO", "MANOSCRITTO", "METRONOMO", "MONOLITE", "MOSAICO", "OBELISCO", "ORGANO", "PALAZZO", "PANTOGRAFO", "PARTITURA", "PERGAMENA", "PROIETTORE", "SCULTURA", "SINFONIA", "TEATRO", "TRABUCCO", "TURBINA", "ZAFFIRO", "ZIGGURAT",
    "ABITUDINE", "ADRENALINA", "AVVENTURA", "BELLEZZA", "COSCIENZA", "DESTINO", "DILEMMA", "EMOZIONE", "ESPERIENZA", "FANTASIA", "FILOSOFIA", "GENTILEZZA", "GIUSTIZIA", "INFINITO", "LIBERTA", "MERAVIGLIA", "MISTERO", "NOSTALGIA", "PROSPETTIVA", "RESILIENZA", "SAGGEZZA", "SOLITUDINE", "UTOPIA", "VITTORIA", "ALTRUISMO", "AMBIGUITA", "ANACRONISMO", "ASTRAZIONE", "AUTENTICITA", "BENEVOLENZA", "COERENZA", "COMPRENSIONE", "CONSAPEVOLEZZA", "CONTRADDIZIONE", "CREATIVITA", "DETERMINAZIONE", "DISCIPLINA", "EFFIMERO", "ENTUSIASMO", "EQUILIBRIO", "EUPHORIA", "FRAGILITA", "GENEROSITA", "ILLUSIONE", "IMMAGINAZIONE", "INCERTEZZA", "INGEGNO", "INTEGRITA", "INTUIZIONE", "IRRAZIONALE", "LEALTA", "LOGICA", "LUCIDITA", "MALINCONIA", "METAFORA", "MODERAZIONE", "OSTINAZIONE", "PARADOSSO", "PASSIONE", "PAZIENZA", "PERCEZIONE", "PERSEVERANZA", "PRAGMATISMO", "RAZIONALITA", "RIFLESSIONE", "SENSIBILITA", "SOLIDARIETA", "SPONTANEITA", "SQUILIBRIO", "STUPORE", "TEMPERANZA", "TENACIA", "TRASPARENZA", "UMILTA", "VALORIZZAZIONE", "VULNERABILITA",
    "AMMUTINAMENTO", "ANNICHILIRE", "ANTROPOLOGIA", "APPROSSIMAZIONE", "ARCHETIPO", "ASCENSIONALE", "AVANGUARDIA", "AZZERAMENTO", "BALUGINIO", "BARBAGLIO", "BENEMERITO", "BIVACCO", "BUFFONATA", "CACCOLA", "CALAMITA", "CALIGINE", "CAPARBIETA", "CATACLISMA", "CIRCONLOCUZIONE", "COESISTENZA", "COMMOZIONE", "CONCESSIONARIO", "CONGIUNZIONE", "CONNOTAZIONE", "CONTRAPPUNTO", "DECADENZA", "DEFLAGRAZIONE", "DEMOCRAZIA", "DESOLAZIONE", "DIFFERENZIAZIONE", "DISILLUSIONE", "ECCENTRICITA", "ECCEZIONALE", "EFFERVESCENZA", "EFFIGIE", "EGEMONIA", "ELETTROMAGNETICO", "ELUCUBRAZIONE", "EMANCIPAZIONE", "ENIGMATICO", "EPICENTRO", "ESASPERAZIONE", "ESIBIZIONISMO", "ESORBITANTE", "ESPRESSIONISMO", "ESTEMPORANEO", "ESTETIZZANTE", "ESTRANEAZIONE", "EVANESCENZA", "EVOLUZIONISMO", "FALLIMENTARE", "FASCINAZIONE", "FLUTTUAZIONE", "FRENESIA", "FULGORE", "FUNAMBOLO", "GARGARISMO", "GORGOGLIO", "ILLUMINAZIONE", "IMMAGINARIO", "IMMEDESIMAZIONE", "IMPALCATURE", "IMPERFETTO", "IMPETUOSITA", "IMPLACABILE", "IMPROVVISAZIONE", "INACCETTABILE", "INADAGUATO", "INCANDESCENZA", "INCOERENZA", "INCOMMENSURABILE", "INCOMPRESIBILE", "INCONSAPEVOLE", "INCONTAMINATO", "INCREDULITA", "INDIPENDENZA", "INEFFABILE", "INESORABILE", "INFALLIBILE", "INGEGNOSITA", "INQUIETUDINE", "INSODDISFAZIONE", "INSORMONTABILE", "INTELLETTUALE", "INTEMPERIE", "INTERDIPENDENZA", "INTERPRETAZIONE", "INTRANSIGENTE", "INTROSPEZIONE", "INVULNERABILE", "IRRAGGIUNGIBILE", "IRRICONOSCIBILE", "IRRIPETIBILE", "ISTANTANEITA", "LABIRINTICO", "LACONICO", "LUNGIMIRANZA", "LUMINOSITA", "MAGNIFICENZA", "MANEGGIEVOLE", "MANIFESTAZIONE", "MANIPOLAZIONE", "MANSUETUDINE", "MARGINALITA", "MATERIALISMO", "MATEMATICAMENTE", "MELODRAMMATICO", "METAMORFOSI", "METICOLOSITA", "MITOLOGICO", "MOLTEPLICITA", "MONUMENTALE", "MULTICULTURALE", "MORMORIO", "NAVIGAZIONE", "NEGAZIONISMO", "NEOPLATONISMO", "NEUTRALIZZARE", "NICHILISMO", "NOBILTA", "NOTEVOLE", "NULLACENTESIMO", "OBBIETTIVITA", "OBREZIONE", "OCCULTAMENTO", "OLTRANZISMO", "OMOLOGAZIONE", "ONNIPOTENZA", "ONNISCIENZA", "OPPORTUNISMO", "OPPRESSIONE", "ORCHESTRAZIONE", "ORGOGLIO", "ORIENTAMENTO", "ORIGINALITA", "ORIZZONTALMENTE", "ORNAMENTAZIONE", "OTTUSITA", "OVVIAMENTE", "PALEONTOLOGIA", "PARALLELISMO", "PARTECIPAZIONE", "PARTICOLARITA", "PATERNALISMO", "PATRIMONIO", "PEDAGOGIA", "PERFEZIONISMO", "PERIFERICO", "PERMANENZA", "PERSPICACIA", "PERSONALIZZAZIONE", "PIANIFICAZIONE", "PLURALISMO", "POETICA", "POLITICAMENTE", "POLIZIOTTO", "POPOLAZIONE", "POSITIVISMO", "POTENZIALITA", "PREDESTINAZIONE", "PREDICATO", "PREGIUDIZIO", "PRESTIGIAZIONE", "PRESUMIBILMENTE", "PREVALENZA", "PRIMITIVISMO", "PRIVILEGIO", "PROBABILITA", "PRODUTTIVITA", "PROFESSIONALITA", "PROGRAMMAZIONE", "PROIBIZIONISMO", "PROLIFERAZIONE", "PRONUNCIA", "PROPAGANDA", "PROPORZIONALITA", "PROTAGONISMO", "PROTEZIONISMO", "PROTOCOLLO", "PROVOCAZIONE", "PUBBLICITA", "PUNTUALITA", "QUALSIASI", "QUESTIONARIO", "QUOTIDIANITA", "RADICALISMO", "RAGGIUNGIMENTO", "RAGIONEVOLEZZA", "RAPPRESENTAZIONE", "RAZIONALIZZAZIONE", "REALIZZAZIONE", "RECIPROCITA", "REGOLAMENTAZIONE", "RELATIVISMO", "RELIGIOSITA", "RESPONSABILITA", "RESTAURAZIONE", "RETRICA", "RIVOLUZIONARIO", "ROMANTICISMO", "SAGGIO", "SANGUIGNO", "SARCASMO", "SBALORDITIVO", "SCETTICISMO", "SCIENTIFICAMENTE", "SCOMPOSIZIONE", "SCORREVOLEZZA", "SECONDARIAMENTE", "SEDIMENTAZIONE", "SEMIOTICA", "SENSIBILIZZAZIONE", "SENTIMENTALISMO", "SETTENTRIONALE", "SFIDUCIA", "SIGNIFICATO", "SIMBOLISMO", "SIMMETRIA", "SIMULTANEITA", "SINCERITA", "SINCRONIZZAZIONE", "SINDACATO", "SINGOLARITA", "SISTEMATICAMENTE", "SOCIALISMO", "SOGGETTIVITA", "SOLIDARIETA", "SOPRAVVIVENZA", "SORPRENDENTE", "SOSTENIBILITA", "SOTTOVALUTARE", "SOVRANITA", "SPETTACOLO", "SPIRITUALITA", "SPOPOLAMENTO", "STABILIZZAZIONE", "STRABILIANTE", "STRATEGICAMENTE", "STRATIFICAZIONE", "STRAORDINARIO", "STRUTTURALISMO", "SUPERFICIALITA", "SUPERIORE", "SVILUPPO", "TABELLA", "TACHIMETRO", "TASTIERISTA", "TECNICISMO", "TECNOLOGICAMENTE", "TELECOMUNICAZIONI", "TEMPERAMENTO", "TEMPESTIVITA", "TENDENZIALMENTE", "TEOLOGICO", "TEORICAMENTE", "TERRITORIALITA", "TESTIMONIANZA", "TIPOLOGIA", "TOLLERANZA", "TRADIZIONALMENTE", "TRANQUILLITA", "TRASFERIMENTO", "TRASFORMAZIONE", "TRASGRESSIONE", "TRASMISSIONE", "TRASPARENZA", "TRASVERSALE", "TREMOLIO", "TRIANGOLAZIONE", "TRIBUTARIO", "TRIONFALISMO", "TURBOLENZA", "UBIQUIT_A", "UGUAGLIANZA", "ULTERIORMENTE", "UMANITARIO", "UMANIZZAZIONE", "UNANIMEMENTE", "UNIVERSALITA", "URBANIZZAZIONE", "USUALMENTE", "UTILIZZAZIONE", "UTOPISTICO", "VALUTAZIONE", "VANAGLORIA", "VARIAZIONE", "VATICINIO", "VEOCEMENTE", "VERIDICITA", "VEROSIMIGLIANZA", "VERTICALIZZAZIONE", "VIBRAZIONE", "VICINANZA", "VIGILANZA", "VINCITORE", "VIRTUALIZZAZIONE", "VISIBILITA", "VISUALIZZAZIONE", "VITALITA", "VITTORIOSAMENTE", "VIVACITA", "VOCABOLARIO", "VOLONTARIAMENTE", "VOLOTTA", "VULNERABILE", "XILOFONO", "ZEST", "ZIGZAGARE", "ZOOLATRICO", "ZOROASTRIANISMO"
];

// --- FUNZIONI CORE ---
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

// --- PEERJS LOGIC ---
peer.on('open', id => document.getElementById('my-id').innerText = id);
peer.on('connection', c => { conn = c; setupLogic(); });

document.getElementById('connect-btn').onclick = () => {
    const target = document.getElementById('peer-id-input').value.toUpperCase();
    if(target) { conn = peer.connect(target); setupLogic(); }
};

function setupLogic() {
    conn.on('open', () => {
        amIMaster = myId < conn.peer;
        document.getElementById('setup-screen').classList.add('hidden');
        document.getElementById('score-board').classList.remove('hidden');
        if(amIMaster) {
            document.getElementById('host-screen').classList.remove('hidden');
        } else {
            document.getElementById('play-screen').classList.remove('hidden');
            document.getElementById('word-display').innerText = "IL MASTER SCEGLIE...";
            document.getElementById('keyboard').classList.add('hidden');
        }
    });

    conn.on('data', data => {
        if (data.type === 'START') { 
            secretWord = data.word; 
            isBot = false; 
            document.getElementById('word-display').innerText = ""; // Pulisce il testo d'attesa
            startPlay("SFIDANTE"); 
        }
        else if (data.type === 'GUESS') processMove(data.letter);
        else if (data.type === 'EMOJI') showEmoji(data.emoji);
        else if (data.type === 'REMATCH') prepareNextRound();
    });
}

// --- LOGICA BOT (MODALITA' DIFFICILE ADATTIVA) ---
document.getElementById('bot-btn').onclick = () => {
    if (isProcessing) return; isProcessing = true;
    isBot = true; amIMaster = false;
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('score-board').classList.remove('hidden');
    document.getElementById('play-screen').classList.remove('hidden');
    document.getElementById('keyboard').classList.add('hidden');
    document.getElementById('word-display').innerText = "CALCOLO SFIDA...";
    
    setTimeout(() => {
        let listaFiltrata = dizionario;
        // Se stai vincendo di 3, il Bot pesca solo parole lunghe >= 10 lettere
        if (myScore >= oppScore + 3) {
            listaFiltrata = dizionario.filter(w => w.length >= 10);
        }
        secretWord = listaFiltrata[Math.floor(Math.random()*listaFiltrata.length)];
        isProcessing = false; 
        document.getElementById('word-display').innerText = ""; 
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
        startTimer();
        render(); // Mostra subito i trattini
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
    // Impedisce di sovrascrivere i messaggi di stato
    if(!secretWord || isProcessing || container.innerText.includes("GIOCA") || container.innerText.includes("SCEGLIE") || container.innerText.includes("CALCOLO")) return;
    container.innerHTML = secretWord.split('').map(l => `<div class="letter-slot">${guessedLetters.includes(l) ? l : ""}</div>`).join('');
    if(secretWord.split('').every(l => guessedLetters.includes(l))) end(true);
    else if(mistakes >= 6) end(false);
}

function end(win) {
    clearInterval(timerInterval);
    const ov = document.getElementById('overlay');
    const title = document.getElementById('result-title');
    ov.classList.remove('hidden');
    let ioHoVinto = amIMaster ? !win : win;
    title.classList.remove('win-glow', 'lose-glow');
    if(ioHoVinto) {
        myScore++; spawnParticles(); vibrate([50, 50, 50]);
        title.innerText = "MISSIONE COMPIUTA";
        title.classList.add('win-glow');
    } else {
        oppScore++; vibrate(200);
        title.innerText = "SISTEMA COMPROMESSO";
        title.classList.add('lose-glow');
    }
    document.getElementById('my-score').innerText = myScore;
    document.getElementById('opp-score').innerText = oppScore;
    document.getElementById('result-desc').innerText = "LA PAROLA ERA: " + secretWord;
}

function spawnParticles() {
    for(let i=0; i<30; i++) {
        const p = document.createElement('div'); p.className = 'particle';
        p.style.left = Math.random()*100+"vw"; p.style.top = "-10px";
        p.style.animationDuration = (Math.random()*2+1)+"s";
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

document.getElementById('exit-btn').onclick = () => {
    document.body.style.transition = "opacity 0.6s ease, filter 0.6s ease";
    document.body.style.opacity = "0"; document.body.style.filter = "blur(10px)";
    setTimeout(() => location.reload(), 600);
};

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

// Generazione Tastiera
"QWERTYUIOPASDFGHJKLZXCVBNM".split('').forEach(l => {
    const b = document.createElement('div'); b.className = 'key'; b.innerText = l;
    b.onclick = () => { if(!amIMaster && !b.classList.contains('used') && !isProcessing) { b.classList.add('used'); if(!isBot && conn) conn.send({type:'GUESS', letter:l}); processMove(l); } };
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
