import { CONFIG } from './Config.js';
import { Input } from './Input.js';
import { DataLoader } from './DataLoader.js';
import { Player } from './Player.js';
import { Renderer } from './Renderer.js';

// --- GLOBAL SYSTEMS ---
const renderer = new Renderer('gameCanvas');
const loader = new DataLoader();
const player = new Player();

// --- GAME STATE ---
let lastTime = 0;
let moveTimer = 0;

async function init() {
    console.log("--- System Start ---");

    // 1. Load Data (Wait for it!)
    const dataLoaded = await loader.loadAll();
    if (!dataLoaded) {
        alert("Critical Error: Failed to load game data. Check console.");
        return;
    }

    // 2. Initialize Input
    Input.init();

    // 3. Hide Loading Screen
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) loadingScreen.style.display = 'none';

    // 4. Start the Loop
    requestAnimationFrame(gameLoop);
}

function gameLoop(timestamp) {
    // Calculate Delta Time (time passed since last frame)
    const dt = timestamp - lastTime;
    lastTime = timestamp;

    update(dt);
    draw();
    updateUI();

    // Loop
    requestAnimationFrame(gameLoop);
}

function update(dt) {
    // --- MOVEMENT LOGIC ---
    // We throttle movement so you don't fly across the screen at lightspeed.
    // CONFIG.TICK_RATE (100ms) determines how fast you walk.
    moveTimer += dt;
    
    if (moveTimer > CONFIG.TICK_RATE) {
        const input = Input.getMovementVector();
        
        // If player is pressing keys
        if (input.x !== 0 || input.y !== 0) {
            // Attempt move
            const moved = player.move(input.x, input.y);
            
            if (moved) {
                // Reset timer only if we actually moved
                moveTimer = 0; 
                
                // Debug Log
                // console.log(`Player at ${player.x}, ${player.y}`);
            }
        }
    }
}

function draw() {
    renderer.draw(player);
}

function updateUI() {
    // Update HTML Overlay
    document.getElementById('val-hp').innerText = `${player.stats.hp}/${player.stats.maxHp}`;
    document.getElementById('val-mana').innerText = `${player.stats.mana}/${player.stats.maxMana}`;
    document.getElementById('val-stamina').innerText = `${player.stats.stamina}/${player.stats.maxStamina}`;
    
    // Update Widths
    document.getElementById('hp-bar').style.width = `${(player.stats.hp / player.stats.maxHp) * 100}%`;
    document.getElementById('mana-bar').style.width = `${(player.stats.mana / player.stats.maxMana) * 100}%`;
    document.getElementById('stamina-bar').style.width = `${(player.stats.stamina / player.stats.maxStamina) * 100}%`;
}

// Boot the Game
init();