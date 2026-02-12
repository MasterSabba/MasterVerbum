const peer = new Peer();
let conn;
let secretWord = "";
let guessedLetters = [];
let mistakes = 0;
let iamMaster = false;

const statusText = document.getElementById('status');

// 1. Mostra il tuo ID
peer.on('open', id => {
    document.getElementById('my-id').innerText = id;
});

// 2. COPIA ID
document.getElementById('copy-btn').onclick = () => {
    navigator.clipboard.writeText(document.getElementById('my-id').innerText);
    statusText.innerText = "✅ Codice Copiato!";
};

// 3. SE RICEVI UNA CONNESSIONE (Diventi il Master)
peer.on('connection', c => {
    conn = c;
    iamMaster = true;
    setupGame();
});

// 4. SE TI CONNETTI TU (Diventi lo Sfidante)
document.getElementById('connect-btn').onclick = () => {
    const remoteId = document.getElementById('peer-id-input').value;
    if(!remoteId) return alert("Inserisci un codice!");
    conn = peer.connect(remoteId);
    iamMaster = false;
    setupGame();
};

function setupGame() {
    conn.on('open', () => {
        document.getElementById('setup-screen').classList.add('hidden');
        if(iamMaster) {
            document.getElementById('host-screen').classList.remove('hidden');
        } else {
            statusText.innerText = "Connesso! Attendi la parola...";
            document.getElementById('setup-screen').classList.remove('hidden');
            document.getElementById('my-id-container').classList.add('hidden');
        }
    });

    conn.on('data', data => {
        if (data.type === 'START') {
            secretWord = data.word.toUpperCase();
            showPlayScreen("SFIDANTE (Indovina)");
        } else if (data.type === 'MOVE') {
            handleMove(data.letter);
        }
    });
}

// 5. IL MASTER INVIA LA PAROLA
document.getElementById('start-btn').onclick = () => {
    const word = document.getElementById('secret-word').value.trim();
    if(word.length < 2) return alert("Parola troppo corta!");
    secretWord = word.toUpperCase();
    conn.send({ type: 'START', word: secretWord });
    showPlayScreen("MASTER (Osserva)");
};

function showPlayScreen(role) {
    document.getElementById('host-screen').classList.add('hidden');
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('play-screen').classList.remove('hidden');
    document.getElementById('role-tag').innerText = role;
    
    if(iamMaster) {
        document.getElementById('keyboard').classList.add('hidden');
    }
    updateDisplay();
}

function handleMove(letter) {
    if(!guessedLetters.includes(letter)) {
        guessedLetters.push(letter);
        if(!secretWord.includes(letter)) {
            mistakes++;
            drawHangman(mistakes);
        }
        updateDisplay();
    }
}

function updateDisplay() {
    const display = secretWord.split('').map(l => guessedLetters.includes(l) ? l : "_").join(' ');
    document.getElementById('word-display').innerText = display;
    
    if(!display.includes('_') && secretWord !== "") {
        document.getElementById('message').innerText = "VITTORIA!";
    }
    if(mistakes >= 6) {
        document.getElementById('message').innerText = "GAME OVER! Parola: " + secretWord;
    }
}

// TASTIERA
const kb = document.getElementById('keyboard');
"QWERTYUIOPASDFGHJKLZXCVBNM".split('').forEach(l => {
    const b = document.createElement('div');
    b.className = 'key';
    b.innerText = l;
    b.onclick = () => {
        if(iamMaster) return;
        b.classList.add('used');
        conn.send({ type: 'MOVE', letter: l });
        handleMove(l);
    };
    kb.appendChild(b);
});

function drawHangman(s) {
    const ctx = document.getElementById('hangmanCanvas').getContext('2d');
    ctx.strokeStyle = "#00d4ff"; ctx.lineWidth = 4; ctx.lineCap = "round";
    if(s==1){ctx.beginPath();ctx.arc(100,40,20,0,Math.PI*2);ctx.stroke();}
    if(s==2){ctx.moveTo(100,60);ctx.lineTo(100,130);ctx.stroke();}
    if(s==3){ctx.moveTo(100,80);ctx.lineTo(70,100);ctx.stroke();}
    if(s==4){ctx.moveTo(100,80);ctx.lineTo(130,100);ctx.stroke();}
    if(s==5){ctx.moveTo(100,130);ctx.lineTo(70,170);ctx.stroke();}
    if(s==6){ctx.moveTo(100,130);ctx.lineTo(130,170);ctx.stroke();}
}
