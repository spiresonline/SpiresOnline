import { GameManager } from './GameManager.js';

// 1. Initialize Game on Window Load
window.addEventListener('load', () => {
    // The Game instance was attached to window in GameManager.js
    if (window.Game) {
        window.Game.initialize().then(() => {
            setupUI();
            updateUI();
            logMessage("System: Alpha 2.0 Loaded. Welcome to Spires Online.");
        });
    } else {
        console.error("Game Core not found!");
    }
});

// 2. UI Setup & Event Listeners
function setupUI() {
    // Action Buttons
    document.getElementById('btn-action').addEventListener('click', () => {
        handleActionClick();
    });

    document.getElementById('btn-rest').addEventListener('click', () => {
        // Simple Rest Logic
        window.Game.player.currentStamina = window.Game.player.maxStamina;
        window.Game.world.advanceTime(100); // 1 Hour
        logMessage("You rest for a while. Stamina restored.");
        updateUI();
    });
    
    // Debug / Test Buttons
    document.getElementById('btn-debug-dmg').addEventListener('click', () => {
        window.Game.player.takeDamage(10, "Physical");
        updateUI();
    });
}

// 3. Handle Player Actions
function handleActionClick() {
    const actionInput = document.getElementById('action-input').value; // e.g., "act_min_pick"
    
    // Call the Action Controller
    const result = window.Game.actions.attemptAction(actionInput, null);
    
    logMessage(result.message);
    
    if (result.success) {
        window.Game.world.advanceTime(50); // Advance time on action
    }
    
    updateUI();
}

// 4. Update the Screen
function updateUI() {
    const player = window.Game.player;
    const world = window.Game.world;

    // Update Stats Bars
    updateBar('hp-bar', player.currentHP, player.maxHP);
    updateBar('stm-bar', player.currentStamina, player.maxStamina);
    updateBar('san-bar', player.sanity, 100);

    // Update Text Stats
    document.getElementById('stat-str').innerText = player.attributes.STR;
    document.getElementById('stat-dex').innerText = player.attributes.DEX;
    document.getElementById('stat-int').innerText = player.attributes.INT;
    
    // Update World Info
    document.getElementById('location-text').innerText = world.currentMapID;
    document.getElementById('time-text').innerText = formatTime(world.timeOfDay);
    
    // Debug Info
    document.getElementById('debug-info').innerText = window.Game.debugStatus();
}

// Helper: Log to the game console window
function logMessage(msg) {
    const logEl = document.getElementById('game-log');
    const entry = document.createElement('div');
    entry.innerText = `> ${msg}`;
    logEl.appendChild(entry);
    logEl.scrollTop = logEl.scrollHeight; // Auto-scroll to bottom
}

// Helper: Update CSS Width of bars
function updateBar(elementId, current, max) {
    const el = document.getElementById(elementId);
    const pct = Math.max(0, Math.min(100, (current / max) * 100));
    el.style.width = `${pct}%`;
    el.innerText = `${Math.floor(current)}/${Math.floor(max)}`;
}

// Helper: Format 800 to "08:00"
function formatTime(val) {
    let str = val.toString().padStart(4, '0');
    return `${str.substring(0,2)}:${str.substring(2,4)}`;
}