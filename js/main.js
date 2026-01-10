import { GameManager } from './GameManager.js';
import { GameRenderer } from './Renderer.js';

// Global references for debugging
let renderer = null;
let lastTime = 0;

window.addEventListener('load', () => {
    // 1. Initialize the Core Engine
    if (window.Game) {
        window.Game.initialize().then(async () => {
            console.log("Core Systems Loaded. Starting Renderer...");
            
            // 2. Initialize the Visual Engine
            renderer = new GameRenderer('game-canvas');
            
            // 3. Preload Critical Assets
            // These names must match files in your /assets/ folder (e.g., player_male.png)
            // If the files don't exist yet, the renderer handles it gracefully (black/cyan box).
            await renderer.loadAssets([
                'player_male', 
                'floor_stone', 
                'wall_stone',
                'cursor'
            ]);
            
            // 4. Set Initial Player Position (if not saved)
            if (!window.Game.player.x) {
                window.Game.player.x = 5; // Grid Coordinate X
                window.Game.player.y = 5; // Grid Coordinate Y
            }

            // 5. Start the Game Loop
            requestAnimationFrame(gameLoop);
            
            console.log("Visuals Online. 64x64 Grid System Active.");
        });
    }
});

// --- Game Loop ---
function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    if (window.Game.isInitialized && renderer) {
        // Render the current state of the World and Player
        renderer.draw(window.Game.world, window.Game.player);
    }

    requestAnimationFrame(gameLoop);
}

// --- Input Handling (Movement) ---
document.addEventListener('keydown', (e) => {
    const player = window.Game.player;
    if (!player) return;

    // Prevent scrolling with arrows
    if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
        e.preventDefault();
    }

    // Grid Movement Logic
    // In a full game, we would check for walls/collisions here before allowing the change.
    switch(e.key) {
        case 'ArrowUp': 
        case 'w': 
        case 'W':
            player.y -= 1; 
            break;
            
        case 'ArrowDown': 
        case 's': 
        case 'S':
            player.y += 1; 
            break;
            
        case 'ArrowLeft': 
        case 'a': 
        case 'A':
            player.x -= 1; 
            break;
            
        case 'ArrowRight': 
        case 'd': 
        case 'D':
            player.x += 1; 
            break;
    }
});