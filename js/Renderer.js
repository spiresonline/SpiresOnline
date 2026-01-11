import { CONFIG } from './Config.js';

export class Renderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // Cache loaded images so we don't reload them every frame
        this.imageCache = {};
        
        // Disable smoothing for crisp pixel art
        this.ctx.imageSmoothingEnabled = false;
        
        console.log("Renderer Initialized");
    }

    draw(player) {
        // 1. Clear Screen
        this.ctx.fillStyle = "#050505"; // Deep black/grey background
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 2. Calculate Camera Position
        // We want the player to be in the center of the screen.
        const halfWidth = this.canvas.width / 2;
        const halfHeight = this.canvas.height / 2;
        
        // Camera points to the top-left pixel of the view
        const camX = Math.floor((player.x * CONFIG.TILE_SIZE) - halfWidth + (CONFIG.TILE_SIZE / 2));
        const camY = Math.floor((player.y * CONFIG.TILE_SIZE) - halfHeight + (CONFIG.TILE_SIZE / 2));

        // 3. Draw World
        this.drawMap(camX, camY);
        
        // 4. Draw Player
        this.drawPlayer(player, camX, camY);
        
        // 5. Draw Grid Lines (Debug)
        if (CONFIG.DEBUG_DRAW_GRID) {
            this.drawGrid(camX, camY);
        }
    }

    drawMap(camX, camY) {
        // Calculate which tiles are visible on screen to optimize rendering
        const startCol = Math.floor(camX / CONFIG.TILE_SIZE);
        const endCol = startCol + (this.canvas.width / CONFIG.TILE_SIZE) + 1;
        const startRow = Math.floor(camY / CONFIG.TILE_SIZE);
        const endRow = startRow + (this.canvas.height / CONFIG.TILE_SIZE) + 1;

        for (let y = startRow; y <= endRow; y++) {
            for (let x = startCol; x <= endCol; x++) {
                // Check map boundaries
                if (x >= 0 && x < CONFIG.MAP_COLS && y >= 0 && y < CONFIG.MAP_ROWS) {
                    // Draw Floor
                    const screenX = (x * CONFIG.TILE_SIZE) - camX;
                    const screenY = (y * CONFIG.TILE_SIZE) - camY;
                    
                    // Try to draw 'floor_stone.png', fallback to Grey Box
                    this.drawSprite('floor_stone', screenX, screenY, '#222');
                }
            }
        }
    }

    drawPlayer(player, camX, camY) {
        const screenX = (player.x * CONFIG.TILE_SIZE) - camX;
        const screenY = (player.y * CONFIG.TILE_SIZE) - camY;
        
        // Try to draw 'player_male.png', fallback to Cyan Box
        this.drawSprite(player.spriteID, screenX, screenY, '#00ffff');
    }

    drawSprite(assetId, x, y, fallbackColor) {
        const img = this.getImage(assetId);

        if (img && img.complete && img.naturalHeight !== 0) {
            // Draw Image
            this.ctx.drawImage(img, x, y, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
        } else {
            // Draw Fallback Box (if image missing/loading)
            this.ctx.fillStyle = fallbackColor;
            this.ctx.fillRect(x, y, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
            // Draw Border
            this.ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            this.ctx.strokeRect(x, y, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
        }
    }

    drawGrid(camX, camY) {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;

        const offsetX = -camX % CONFIG.TILE_SIZE;
        const offsetY = -camY % CONFIG.TILE_SIZE;

        this.ctx.beginPath();
        // Vertical lines
        for (let x = offsetX; x < this.canvas.width; x += CONFIG.TILE_SIZE) {
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
        }
        // Horizontal lines
        for (let y = offsetY; y < this.canvas.height; y += CONFIG.TILE_SIZE) {
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
        }
        this.ctx.stroke();
    }

    getImage(id) {
        // If we already have it, return it
        if (this.imageCache[id]) return this.imageCache[id];

        // Otherwise, load it
        const img = new Image();
        img.src = `${CONFIG.ASSET_PATH}${id}.png`;
        this.imageCache[id] = img;
        return img;
    }
}