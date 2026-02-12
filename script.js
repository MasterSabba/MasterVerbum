const peerConfig = {
    config: { 'iceServers': [{ url: 'stun:stun.l.google.com:19302' }, { url: 'stun:stun1.l.google.com:19302' }] }
};

let myId = Math.random().toString(36).substring(2, 7).toUpperCase();
const peer = new Peer(myId, peerConfig);
let conn, secretWord = "", guessedLetters = [], mistakes = 0, amIMaster = false, isBot = false;

// --- MEGA DIZIONARIO ITALIANO (Infinite varianti) ---
const superDizionario = [
    "ABITUDINE", "ACQUARIO", "ALBERGO", "ALLENATORE", "AMICIZIA", "ANALOGIA", "ANTENNA", "APERTURA", 
    "ASTRONAVE", "AVVENTURA", "BAMBINO", "BARCA", "BASTONE", "BENESSERE", "BICICLETTA", "BILANCIO", 
    "BISCUTTO", "BOTTIGLIA", "BRACCIALETTO", "BUSSOLA", "CALCIATORE", "CALENDARIO", "CAMMINO", "CAMPANA", 
    "CAPITOLO", "CARATTERE", "CARTOLINA", "CASTELLO", "CERTEZZA", "CHITARRA", "CIMITERO", "CINEMA", 
    "CINTURA", "COGNOME", "COLLOQUIO", "COLORE", "COMANDO", "COMPUTER", "COMUNE", "CONCETTO", 
    "CONDIZIONE", "CONFERMA", "CONSIGLIO", "CONTATTO", "CONTRATTO", "CORAGGIO", "CORRENTE", "COSTRUZIONE", 
    "CUCINA", "CUSCINO", "DESIDERIO", "DESTINO", "DETTAGLIO", "DISEGNO", "DISTANZA", "DIZIONARIO", 
    "DOMENICA", "EDIFICIO", "ELEFANTE", "ELEMENTO", "EMOZIONE", "ENERGIA", "ESEMPIO", "ESERCIZIO", 
    "ESPERIENZA", "ESPRESSIONE", "FAMIGLIA", "FANTASIA", "FINESTRA", "FIORE", "FORCHETTA", "FORMAGGIO", 
    "FORTUNA", "FOTOGRAFO", "FRATELLO", "FULMINE", "FUTURO", "GENTILEZZA", "GIARDINO", "GELATO", 
    "GIORNALE", "GIOIELLO", "GIUDIZIO", "GRADINO", "GUADAGNO", "IDROGENO", "IMMAGINE", "IMPIANTO", 
    "INCONTRO", "INFERNO", "INGRESSO", "INSIEME", "INVERNO", "ISOLA", "LABIRINTO", "LAVORO", 
    "LEGAME", "LIBERTA", "LINGUA", "LIQUIDO", "LONTANO", "LUCE", "LUMACA", "LUNEDI", "MACCHINA", 
    "MAESTRO", "MAGGIO", "MALATTIA", "MANGIARE", "MANIERA", "MAPPA", "MARE", "MARGINE", "MARTEDI", 
    "MASCHERA", "MATERIA", "MATTINA", "MEDAGLIA", "MERCATO", "MESSAGGIO", "METODO", "METRO", 
    "MEZZO", "MIGLIORE", "MINUTO", "MISURA", "MODELLO", "MONDO", "MONETA", "MONTAGNA", "MOVIMENTO", 
    "MUSICA", "NATURA", "NAUFRAGIO", "NEGOZIO", "NEVE", "NOME", "NOTTE", "NUMERO", "OCCHIO", 
    "OGGETTO", "OMBRA", "OMBRELLO", "ONDA", "OPERA", "OPINIONE", "ORDINE", "ORECCHIO", "ORGOGLIO", 
    "ORIZZONTE", "OSPEDALE", "PAGINA", "PAESE", "PALLONE", "PANE", "PANTALONI", "PAROLA", "PASSAGGIO", 
    "PASTURA", "PAURA", "PENSIERO", "PERCORSO", "PERIODO", "PERSONA", "PIACERE", "PIANO", "PIANETA", 
    "PIAZZA", "PIEDE", "PIETRA", "PITTURA", "POESIA", "POLVERE", "POMERIGGIO", "PONTE", "PORTA", 
    "POSTO", "PRANZO", "PRATO", "PRESENTE", "PREZZO", "PROBLEMA", "PROCESSO", "PROGETTO", "PROMESSA", 
    "PROPOSTA", "PROVA", "PUNTO", "QUADERNO", "QUADRATO", "QUALITA", "QUARTIERE", "RAGAZZO", "RAGIONE", 
    "REGOLA", "RELAZIONE", "REPLICA", "RESPIRO", "RICERCA", "RICORDO", "RIFLESSO", "RISTORANTE", 
    "RISPOSTA", "RITMO", "RITORNO", "RIVA", "SABATO", "SABBIA", "SALE", "SALUTE", "SANGUE", 
    "SAPORE", "SCALA", "SCELTA", "SCENA", "SCHERMO", "SCIENZA", "SCOGLIO", "SCOPERTA", "SCRITTURA", 
    "SCUOLA", "SECONDO", "SEGNO", "SEGRETO", "SENSO", "SENTIMENTO", "SERA", "SERVIZIO", "SETTIMANA", 
    "SFIDA", "SGUARDO", "SILENZIO", "SISTEMA", "SOGNO", "SOLDI", "SOLE", "SOLUZIONE", "SORRISO", 
    "SPAZIO", "SPECCHIO", "SPERANZA", "SPETTACOLO", "SPIAGGIA", "SPIRITO", "SQUADRA", "STAGIONE", 
    "STAMPA", "STELLA", "STORIA", "STRADA", "STRUMENTO", "STUDIO", "SUONO", "SVILUPPO", "TAVOLO", 
    "TAVOLETTA", "TEATRO", "TELEFONO", "TEMPO", "TENTATIVO", "TERRA", "TESORO", "TESTA", "TITOLO", 
    "TORRE", "TRAFFICO", "TRAGUARDO", "TRENO", "TURISTA", "UCCELLO", "UFFICIO", "UNIVERSO", "UOMO", 
    "URLO", "USCITA", "VALIGIA", "VALORE", "VAPORE", "VELOCITA", "VENTO", "VERITA", "VESTITO", 
    "VIAGGIO", "VICINO", "VITA", "VOCE", "VOGLIA", "VULCANO", "ZAFFERANO", "ZAINO", "ZUCCHERO"
];

// --- ANTI-BLOCCO ---
function startHeartbeat() {
    setInterval(() => { if (conn && conn.open) conn.send({ type: 'KEEP_ALIVE' }); }, 3000);
}

peer.on('open', id => { document.getElementById('my-id').innerText = id; });
peer.on('connection', c => { conn = c; setupLogic(); });

document.getElementById('connect-btn').onclick = () => {
    const target = document.getElementById('peer-id-input').value.toUpperCase();
    if(target) { conn = peer.connect(target, { reliable: true }); setupLogic(); }
};

function setupLogic() {
    conn.on('open', () => {
        amIMaster = myId < conn.peer;
        startHeartbeat();
        document.getElementById('setup-screen').classList.add('hidden');
        if(amIMaster) {
            document.getElementById('host-screen').classList.remove('hidden');
        } else {
            document.getElementById('play-screen').classList.remove('hidden');
            document.getElementById('role-badge').innerText = "SFIDANTE";
            document.getElementById('word-display').innerText = "IL MASTER SCEGLIE...";
            document.getElementById('keyboard').classList.add('hidden');
        }
    });

    conn.on('data', data => {
        if (data.type === 'KEEP_ALIVE') return;
        if (data.type === 'START') { secretWord = data.word; isBot = false; startPlay("SFIDANTE"); }
        else if (data.type === 'GUESS') processMove(data.letter);
        else if (data.type === 'EMOJI') showEmoji(data.emoji);
    });
    conn.on('close', () => location.reload());
}

// --- LOGICA BOT (CON EFFETTO CARICAMENTO) ---
document.getElementById('bot-btn').onclick = () => {
    const display = document.getElementById('word-display');
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('play-screen').classList.remove('hidden');
    document.getElementById('role-badge').innerText = "BOT CHALLENGE";
    document.getElementById('keyboard').classList.add('hidden');

    // Effetto hacker vorticoso
    let loader = setInterval(() => {
        display.innerText = Math.random().toString(36).substring(2, 9).toUpperCase();
    }, 50);

    setTimeout(() => {
        clearInterval(loader);
        secretWord = superDizionario[Math.floor(Math.random() * superDizionario.length)];
        isBot = true; 
        amIMaster = false;
        startPlay("BOT CHALLENGE");
    }, 800);
};

// --- START MASTER ---
document.getElementById('start-btn').onclick = () => {
    secretWord = document.getElementById('secret-word').value.trim().toUpperCase();
    if(secretWord.length < 3) return;
    if(conn) conn.send({ type: 'START', word: secretWord });
    startPlay("MASTER");
};

function startPlay(role) {
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('host-screen').classList.add('hidden');
    document.getElementById('play-screen').classList.remove('hidden');
    document.getElementById('role-badge').innerText = role;
    guessedLetters = []; mistakes = 0;
    document.getElementById('wrong-letters').innerText = "";
    const ctx = document.getElementById('hangmanCanvas').getContext('2d');
    ctx.clearRect(0,0,200,200);

    if(role === "MASTER") {
        document.getElementById('keyboard').classList.add('hidden');
    } else {
        document.getElementById('keyboard').classList.remove('hidden');
    }
    render();
}

function processMove(l) {
    if(!guessedLetters.includes(l)) {
        guessedLetters.push(l);
        if(!secretWord.includes(l)) { 
            mistakes++; draw(mistakes); 
            document.getElementById('wrong-letters').innerText += l + " "; 
        }
        render();
    }
}

function render() {
    if(!secretWord || document.getElementById('word-display').innerText.includes("SCEGLIE")) return;
    
    let content = "";
    if (amIMaster) {
        // Il Master vede le lettere indovinate ma senza span (più semplice)
        content = secretWord.split('').map(l => guessedLetters.includes(l) ? l : "_").join('\u00A0');
    } else {
        // Lo sfidante vede le lettere con l'effetto neon
        content = secretWord.split('').map(l => 
            guessedLetters.includes(l) ? `<span>${l}</span>` : "_"
        ).join('\u00A0');
    }
    document.getElementById('word-display').innerHTML = content;

    const win = secretWord.split('').every(l => guessedLetters.includes(l));
    if(win) end(true);
    else if(mistakes >= 6) end(false);
}

function end(wordGuessed) {
    document.getElementById('overlay').classList.remove('hidden');
    let title = document.getElementById('result-title');
    if (amIMaster) {
        title.innerText = wordGuessed ? "HAI PERSO!" : "HAI VINTO!";
    } else {
        title.innerText = wordGuessed ? "HAI VINTO!" : "HAI PERSO!";
    }
    document.getElementById('result-desc').innerText = "La parola era: " + secretWord;
    title.style.color = title.innerText.includes("VINTO") ? "var(--neon-blue)" : "var(--neon-pink)";
}

// --- TASTIERA ---
const kb = document.getElementById('keyboard');
kb.innerHTML = "";
"QWERTYUIOPASDFGHJKLZXCVBNM".split('').forEach(l => {
    const b = document.createElement('div'); b.className = 'key'; b.innerText = l;
    b.onclick = () => {
        if(amIMaster || b.classList.contains('used')) return;
        b.classList.add('used');
        if(!isBot && conn) conn.send({ type: 'GUESS', letter: l });
        processMove(l);
    };
    kb.appendChild(b);
});

function draw(s) {
    const ctx = document.getElementById('hangmanCanvas').getContext('2d');
    ctx.strokeStyle = "#00f2ff"; ctx.lineWidth = 4; ctx.beginPath();
    if(s==1) ctx.arc(100, 40, 20, 0, Math.PI*2);
    if(s==2) { ctx.moveTo(100, 60); ctx.lineTo(100, 120); }
    if(s==3) { ctx.moveTo(100, 80); ctx.lineTo(70, 100); }
    if(s==4) { ctx.moveTo(100, 80); ctx.lineTo(130, 100); }
    if(s==5) { ctx.moveTo(100, 120); ctx.lineTo(70, 160); }
    if(s==6) { ctx.moveTo(100, 120); ctx.lineTo(130, 160); }
    ctx.stroke();
}

function sendEmoji(e) { if(conn && conn.open) conn.send({ type: 'EMOJI', emoji: e }); showEmoji(e); }
function showEmoji(e) {
    const el = document.createElement('div'); el.className = 'floating-emoji'; el.innerText = e;
    document.getElementById('emoji-area').appendChild(el);
    setTimeout(() => el.remove(), 2000);
}

document.getElementById('copy-btn').onclick = () => {
    navigator.clipboard.writeText(myId);
    document.getElementById('copy-btn').innerText = "COPIATO!";
    setTimeout(() => document.getElementById('copy-btn').innerText = "COPIA CODICE", 2000);
};

document.getElementById('retry-btn').onclick = () => location.reload();
