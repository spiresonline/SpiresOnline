/**
 * SPIRES ONLINE | RENDERER SYSTEM (renderer.js)
 * Alpha 1.2: Sprite rendering, Camera logic, and Crash Prevention.
 */

import { Game } from './game.js';
import { Sprites } from './sprites.js';
import { ItemDatabase } from './items.js';

export const Renderer = {
    canvas: null,
    ctx: null,
    ready: false, // NEW FLAG

    async init() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d', { alpha: false });
        
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Wait for sprites, then set ready flag
        await Sprites.init();
        this.ready = true; 
        console.log("Renderer: Graphics Engine Ready.");
    },

    resize() {
        if (this.canvas) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.ctx.imageSmoothingEnabled = false; 
        }
    },

    draw() {
        // SAFETY CHECK: Stop if context missing or sprites not loaded
        if (!this.ctx || !this.ready) return;

        const { ctx, canvas } = this;
        const { currentMap, player, entities, worldItems } = Game.state;
        const { tileSize } = Game.config;

        if (!currentMap) return;

        // 1. Camera Calculation
        const cameraX = (canvas.width / 2) - (player.x * tileSize) - (tileSize / 2);
        const cameraY = (canvas.height / 2) - (player.y * tileSize) - (tileSize / 2);

        // 2. Clear Screen
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 3. Render Map
        const startCol = Math.floor(-cameraX / tileSize);
        const endCol = startCol + (canvas.width / tileSize) + 1;
        const startRow = Math.floor(-cameraY / tileSize);
        const endRow = startRow + (canvas.height / tileSize) + 1;

        let floorKey = 'floor_town';
        if (currentMap.id === 'forest') floorKey = 'floor_grass';

        // Get sprite safely
        const floorSprite = Sprites.get(floorKey);
        
        if (floorSprite) {
            for (let c = startCol; c <= endCol; c++) {
                for (let r = startRow; r <= endRow; r++) {
                    if (c >= 0 && c < currentMap.width && r >= 0 && r < currentMap.height) {
                        ctx.drawImage(floorSprite, Math.round(cameraX + c * tileSize), Math.round(cameraY + r * tileSize), tileSize, tileSize);
                    }
                }
            }
        }

        // 4. Render Portals
        if (currentMap.portals) {
            ctx.fillStyle = 'rgba(147, 51, 234, 0.3)';
            currentMap.portals.forEach(p => {
                const px = Math.round(cameraX + p.x * tileSize);
                const py = Math.round(cameraY + p.y * tileSize);
                ctx.fillRect(px, py, tileSize, tileSize);
                ctx.fillStyle = '#fff';
                ctx.font = '10px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText("PORTAL", px + tileSize/2, py + tileSize/2);
            });
        }

        // 5. Render Items
        worldItems.forEach(item => {
            const data = ItemDatabase[item.itemId];
            const ix = Math.round(cameraX + item.x * tileSize);
            const iy = Math.round(cameraY + item.y * tileSize);
            
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.beginPath();
            ctx.ellipse(ix + tileSize/2, iy + tileSize - 10, 15, 5, 0, 0, Math.PI*2);
            ctx.fill();

            ctx.font = "24px serif";
            ctx.textAlign = "center";
            ctx.fillText(data.icon, ix + tileSize/2, iy + tileSize/2 + 5);
        });

        // 6. Render Entities
        entities.forEach(en => {
            if (en.hp !== undefined && !en.alive) return;
            
            const ex = Math.round(cameraX + en.x * tileSize);
            const ey = Math.round(cameraY + en.y * tileSize);

            // Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            ctx.beginPath();
            ctx.ellipse(ex + tileSize/2, ey + tileSize - 5, 20, 8, 0, 0, Math.PI*2);
            ctx.fill();

            // Sprite Selection
            let spriteKey = 'goblin';
            if (en.type === 'npc') {
                if (en.id === 'guard') spriteKey = 'npc_guard';
                else spriteKey = 'npc_bartender';
            }
            
            const enSprite = Sprites.get(spriteKey);
            if (enSprite) {
                ctx.drawImage(enSprite, ex, ey, tileSize, tileSize);
            }

            // Name Tag
            if (en.name) {
                ctx.fillStyle = '#fff';
                ctx.font = '10px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(en.name, ex + tileSize/2, ey - 10);
            }

            // Health Bar
            if (en.type === 'goblin') {
                ctx.fillStyle = '#ef4444';
                ctx.fillRect(ex + 10, ey - 5, (tileSize - 20) * (en.hp / en.maxHp), 4);
            }
        });

        // 7. Render Player
        const px = Math.round(cameraX + player.x * tileSize);
        const py = Math.round(cameraY + player.y * tileSize);
        
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.beginPath();
        ctx.ellipse(px + tileSize/2, py + tileSize - 5, 20, 8, 0, 0, Math.PI*2);
        ctx.fill();

        const pSprite = Sprites.get('player');
        if (pSprite) {
            ctx.drawImage(pSprite, px, py, tileSize, tileSize);
        }
    }
};