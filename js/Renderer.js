// js/Renderer.js
export class GameRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.tileSize = 64; // 64-bit Grid
        this.viewWidth = 15; // How many tiles wide we see
        this.viewHeight = 11;
        
        // Resize canvas
        this.canvas.width = this.viewWidth * this.tileSize;
        this.canvas.height = this.viewHeight * this.tileSize;
        
        this.assets = {}; // Image Cache
    }

    async loadAssets(assetList) {
        // Simple loader that expects assets in /assets/ folder
        const promises = assetList.map(id => {
            return new Promise((resolve) => {
                const img = new Image();
                img.src = `assets/${id}.png`;
                img.onload = () => { this.assets[id] = img; resolve(); };
                img.onerror = () => { console.warn(`Missing sprite: ${id}`); resolve(); }; // Don't crash on missing art
            });
        });
        await Promise.all(promises);
    }

    draw(world, player) {
        // Clear Screen
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 1. Draw Map Layers (Floor)
        // In a real implementation, you'd calculate a "Camera Offset" based on player position.
        // For Alpha 2.0, we'll center the player.
        const centerX = Math.floor(this.viewWidth / 2);
        const centerY = Math.floor(this.viewHeight / 2);

        // Draw Visible Tiles
        for (let y = 0; y < this.viewHeight; y++) {
            for (let x = 0; x < this.viewWidth; x++) {
                // Calculate world coordinates relative to player
                // (Assuming player is at 0,0 for now, logic needs WorldState update for coordinates)
                this.drawTile(x, y, 'floor_stone'); // Default floor
            }
        }

        // 2. Draw Player (Center of Screen)
        // Use the loaded player asset or a fallback box
        if (this.assets['player_male']) {
            this.ctx.drawImage(this.assets['player_male'], centerX * 64, centerY * 64);
        } else {
            this.ctx.fillStyle = '#00bcd4'; // Cyan box fallback
            this.ctx.fillRect(centerX * 64, centerY * 64, 64, 64);
        }

        // 3. Draw NPCs/Monsters
        world.activeEntities.forEach(ent => {
            // Calculate relative position logic here
            // this.drawSprite(ent.ID, ent.x, ent.y);
        });
    }

    drawTile(gridX, gridY, assetId) {
        if (this.assets[assetId]) {
            this.ctx.drawImage(this.assets[assetId], gridX * 64, gridY * 64);
        } else {
            // Grid Lines Fallback
            this.ctx.strokeStyle = '#222';
            this.ctx.strokeRect(gridX * 64, gridY * 64, 64, 64);
        }
    }
}