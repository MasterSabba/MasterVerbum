:root {
    --bg-color: #050505;
    --card-bg: #111;
    --neon-blue: #00f2ff;
    --neon-pink: #ff007b;
    --text-color: #ffffff;
}

* { box-sizing: border-box; font-family: 'Segoe UI', sans-serif; -webkit-tap-highlight-color: transparent; }

body {
    background-color: var(--bg-color); color: var(--text-color); margin: 0;
    display: flex; justify-content: center; align-items: center; min-height: 100vh;
    background: radial-gradient(circle at center, #1a1a1a 0%, #050505 100%);
    overflow: hidden;
}

#volume-toggle { position: fixed; top: 15px; left: 15px; font-size: 1.3rem; cursor: pointer; z-index: 3000; opacity: 0.5; }

.panel { width: 100%; max-width: 450px; padding: 20px; text-align: center; position: relative; z-index: 10; }

#score-board { background: rgba(255, 255, 255, 0.05); border: 1px solid #333; padding: 10px; border-radius: 12px; margin-bottom: 10px; font-family: monospace; font-size: 1.1rem; }

.neon-title { font-size: 2.2rem; font-weight: 900; letter-spacing: 5px; margin-bottom: 20px; text-shadow: 0 0 10px var(--neon-blue); }
.neon-title span { color: var(--neon-blue); }

.card { background: var(--card-bg); padding: 25px 20px; border-radius: 20px; border: 1px solid #222; box-shadow: 0 20px 40px rgba(0,0,0,0.7); }

#copy-btn { background: #fff; color: #000; font-size: 0.8rem; font-weight: 900; padding: 10px 20px; width: auto; margin: 0 auto 20px auto; display: block; border-radius: 8px; cursor: pointer; border:none; }

.id-display { font-size: 2.8rem; font-family: monospace; color: var(--neon-blue); margin: 5px 0; letter-spacing: 5px; font-weight: bold; }

input { width: 100%; background: #000; border: 1px solid #333; padding: 15px; color: #fff; border-radius: 10px; text-align: center; margin-bottom: 15px; font-size: 1.1rem; outline: none; }

button { padding: 16px; border: none; border-radius: 12px; font-weight: 900; cursor: pointer; text-transform: uppercase; transition: 0.2s; }
.btn-primary { background: var(--neon-blue); color: #000; width: 100%; }
.btn-bot { background: var(--neon-pink); color: #fff; width: 100%; }
.btn-exit { background: #333; color: #fff; width: 100%; }

#timer-display { font-family: monospace; font-size: 1.8rem; color: var(--neon-pink); }
.role-badge { display: inline-block; padding: 4px 12px; background: var(--neon-pink); color: #fff; font-size: 0.7rem; border-radius: 5px; margin: 10px 0; }

#word-display { display: flex; justify-content: center; flex-wrap: wrap; gap: 8px; font-size: 2.2rem; margin: 20px 0; font-family: monospace; }
.letter-slot { border-bottom: 3px solid var(--neon-blue); min-width: 25px; height: 45px; display: flex; justify-content: center; align-items: center; }

#keyboard { display: grid; grid-template-columns: repeat(10, 1fr); gap: 6px; }
.key { background: #1a1a1a; padding: 12px 0; border-radius: 6px; font-weight: bold; border-bottom: 3px solid #000; color: #fff; }
.key.used { opacity: 0.1; pointer-events: none; }

#emoji-bar { display: flex; justify-content: center; gap: 10px; margin-top: 20px; }
.emoji-btn { width: 50px; height: 50px; background: #1a1a1a; border: 1px solid #333; font-size: 1.4rem; padding: 0; display: flex; align-items: center; justify-content: center; border-radius: 8px; }

/* Emoji Laterali Grandi */
.floating-emoji {
    position: fixed;
    top: 50%;
    transform: translateY(-50%);
    font-size: 8rem;
    pointer-events: none;
    z-index: 5;
    animation: emojiSidePop 1.5s forwards;
}
.emoji-left { left: 5%; }
.emoji-right { right: 5%; }

@keyframes emojiSidePop {
    0% { transform: translateY(-50%) scale(0); opacity: 0; }
    30% { transform: translateY(-50%) scale(1.2); opacity: 1; }
    100% { transform: translateY(-50%) scale(1); opacity: 0; }
}

/* Particelle */
.particle { position: absolute; width: 5px; height: 5px; background: var(--neon-blue); border-radius: 50%; animation: fall linear forwards; z-index: 100; }
@keyframes fall { to { transform: translateY(100vh); opacity: 0; } }

.overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 2000; background: rgba(0,0,0,0.9); backdrop-filter: blur(5px); }
.hidden { display: none !important; }
