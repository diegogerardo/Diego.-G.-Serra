// ═══════════════════════════════════════════
//  MINIGAME.JS — BUG HUNT 8-BIT
//  CV Diego. Gerardo. Serra
// ═══════════════════════════════════════════

const GAME_DURATION = 30; // segundos

const BUG_TYPES = [
    { emoji: '🐛', points: 10, speed: 2200, label: 'BUG' },
    { emoji: '🪲', points: 20, speed: 1800, label: 'BEETLE' },
    { emoji: '🦟', points: 30, speed: 1400, label: 'MOSQUITO' },
    { emoji: '💀', points: 50, speed: 1000, label: 'SKULL' },
    { emoji: '👾', points: 100, speed: 800, label: '!GLITCH!' },
];

const COMBO_THRESHOLDS = [3, 6, 10, 15];

const POPUPS = [
    'NICE!', 'CRUSH!', 'ZAP!', 'HIT!', 'SMASH!', 'POW!', 'YES!', 'BOOM!', 'GG!'
];

class BugHuntGame {
    constructor() {
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.bugsKilled = 0;
        this.timeLeft = GAME_DURATION;
        this.running = false;
        this.spawnTimer = null;
        this.countTimer = null;
        this.activeBugs = [];

        // DOM refs
        this.arena = document.getElementById('game-arena');
        this.scoreEl = document.getElementById('game-score');
        this.timerEl = document.getElementById('game-timer');
        this.comboEl = document.getElementById('game-combo');
        this.startBtn = document.getElementById('game-start-btn');
        this.overlay = document.getElementById('game-overlay');
        this.resultEl = document.getElementById('game-result');
        this.timerBar = document.getElementById('game-timer-bar');

        this.startBtn.addEventListener('click', () => this.start());

        // Miss-click penalizza combo
        this.arena.addEventListener('click', (e) => {
            if (e.target === this.arena && this.running) {
                this.resetCombo();
                this.showMiss(e.clientX, e.clientY);
            }
        });
    }

    start() {
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.bugsKilled = 0;
        this.timeLeft = GAME_DURATION;
        this.running = true;

        this.overlay.style.display = 'none';
        this.updateHUD();
        this.clearBugs();

        // Countdown timer
        this.countTimer = setInterval(() => {
            this.timeLeft--;
            this.updateHUD();
            if (this.timeLeft <= 0) this.end();
        }, 1000);

        // Spawn bugs (increasing rate)
        this.scheduleSpawn();
    }

    scheduleSpawn() {
        if (!this.running) return;
        const elapsed = GAME_DURATION - this.timeLeft;
        // Faster spawns as time progresses: 1200ms → 450ms
        const delay = Math.max(450, 1200 - elapsed * 25);
        this.spawnTimer = setTimeout(() => {
            this.spawnBug();
            this.scheduleSpawn();
        }, delay);
    }

    spawnBug() {
        if (!this.running) return;

        // Weighted random bug type (harder bugs appear more later)
        const elapsed = GAME_DURATION - this.timeLeft;
        const maxTier = Math.min(BUG_TYPES.length - 1, Math.floor(elapsed / 8));
        const tierIndex = Math.floor(Math.random() * (maxTier + 1));
        const bugType = BUG_TYPES[tierIndex];

        const bug = document.createElement('div');
        bug.className = 'game-bug';
        bug.textContent = bugType.emoji;
        bug.title = bugType.label;

        // Random position inside arena (avoid edges)
        const arenaRect = this.arena.getBoundingClientRect();
        const margin = 48;
        const x = margin + Math.random() * (arenaRect.width - margin * 2);
        const y = margin + Math.random() * (arenaRect.height - margin * 2);

        bug.style.left = `${x}px`;
        bug.style.top = `${y}px`;

        // Click handler
        bug.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!this.running) return;
            this.hitBug(bug, bugType, e.clientX, e.clientY);
        });

        this.arena.appendChild(bug);
        this.activeBugs.push(bug);

        // Auto-remove after lifespan
        setTimeout(() => {
            if (bug.parentNode) {
                bug.classList.add('bug-escape');
                setTimeout(() => bug.remove(), 300);
                this.activeBugs = this.activeBugs.filter(b => b !== bug);
                if (this.running) this.resetCombo();
            }
        }, bugType.speed);
    }

    hitBug(bug, bugType, cx, cy) {
        this.combo++;
        this.bugsKilled++;
        if (this.combo > this.maxCombo) this.maxCombo = this.combo;

        const multiplier = this.getMultiplier();
        const earned = bugType.points * multiplier;
        this.score += earned;

        // Remove bug with hit animation
        bug.classList.add('bug-hit');
        setTimeout(() => bug.remove(), 250);
        this.activeBugs = this.activeBugs.filter(b => b !== bug);

        this.showPopup(cx, cy, `+${earned}`, multiplier > 1);
        this.updateHUD();
    }

    resetCombo() {
        if (this.combo > 0) {
            this.combo = 0;
            this.updateHUD();
        }
    }

    getMultiplier() {
        for (let i = COMBO_THRESHOLDS.length - 1; i >= 0; i--) {
            if (this.combo >= COMBO_THRESHOLDS[i]) return i + 2;
        }
        return 1;
    }

    showPopup(cx, cy, text, highlight) {
        const pop = document.createElement('div');
        pop.className = 'score-popup' + (highlight ? ' score-popup-combo' : '');
        pop.textContent = text;
        // Position relative to arena
        const rect = this.arena.getBoundingClientRect();
        pop.style.left = `${cx - rect.left}px`;
        pop.style.top = `${cy - rect.top}px`;
        this.arena.appendChild(pop);
        setTimeout(() => pop.remove(), 700);
    }

    showMiss(cx, cy) {
        const pop = document.createElement('div');
        pop.className = 'score-popup score-popup-miss';
        pop.textContent = 'MISS';
        const rect = this.arena.getBoundingClientRect();
        pop.style.left = `${cx - rect.left}px`;
        pop.style.top = `${cy - rect.top}px`;
        this.arena.appendChild(pop);
        setTimeout(() => pop.remove(), 600);
    }

    updateHUD() {
        const multiplier = this.getMultiplier();
        this.scoreEl.textContent = this.score;
        this.timerEl.textContent = this.timeLeft;
        this.timerEl.style.color = this.timeLeft <= 8 ? '#ff2244' : '#00ffff';

        if (this.combo >= COMBO_THRESHOLDS[0]) {
            this.comboEl.textContent = `x${multiplier} COMBO (${this.combo})`;
            this.comboEl.style.display = 'block';
        } else {
            this.comboEl.style.display = 'none';
        }

        // Timer bar
        const pct = (this.timeLeft / GAME_DURATION) * 100;
        this.timerBar.style.width = `${pct}%`;
        this.timerBar.style.background =
            pct > 50 ? '#39ff14' : pct > 25 ? '#ffe600' : '#ff2244';
    }

    clearBugs() {
        this.activeBugs.forEach(b => b.remove());
        this.activeBugs = [];
        // Remove any stray score popups
        this.arena.querySelectorAll('.score-popup, .game-bug').forEach(el => el.remove());
    }

    end() {
        this.running = false;
        clearTimeout(this.spawnTimer);
        clearInterval(this.countTimer);
        this.clearBugs();

        // Rank
        let rank, color;
        if (this.score >= 2000) { rank = 'S+  LEGENDARY'; color = '#ffe600'; }
        else if (this.score >= 1200) { rank = 'A+  EXPERT'; color = '#39ff14'; }
        else if (this.score >= 700) { rank = 'B   PRO HUNTER'; color = '#00ffff'; }
        else if (this.score >= 300) { rank = 'C   APPRENTICE'; color = '#ff00ff'; }
        else { rank = 'D   ROOKIE'; color = '#ff2244'; }

        this.resultEl.innerHTML = `
      <div class="result-row">SCORE</div>
      <div class="result-score">${this.score}</div>
      <div class="result-row" style="color:${color};">${rank}</div>
      <div class="result-stats">
        BUGS KILLED: ${this.bugsKilled}<br>
        MAX COMBO  : x${this.getMultiplierFor(this.maxCombo)}  (${this.maxCombo})
      </div>
    `;

        this.overlay.style.display = 'flex';
        this.startBtn.textContent = '▶ PLAY AGAIN';
    }

    getMultiplierFor(combo) {
        for (let i = COMBO_THRESHOLDS.length - 1; i >= 0; i--) {
            if (combo >= COMBO_THRESHOLDS[i]) return i + 2;
        }
        return 1;
    }
}

// ── Init ──────────────────────────────────
function initMinigame() {
    const modal = document.getElementById('minigame-modal');
    const openBtn = document.getElementById('open-minigame-btn');
    const closeBtn = document.getElementById('minigame-close');

    if (!modal || !openBtn) return;

    openBtn.addEventListener('click', () => {
        modal.classList.add('visible');
    });

    closeBtn?.addEventListener('click', () => {
        modal.classList.remove('visible');
    });

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('visible');
    });

    new BugHuntGame();
}

document.addEventListener('DOMContentLoaded', initMinigame);
