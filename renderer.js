/**
 * SPIRES ONLINE | RENDERER SYSTEM (renderer.js)
 * Handles Canvas drawing, camera offsets, and visual updates.
 */

import { Game } from './game.js';
import { ItemDatabase } from './items.js';

export const Renderer = {
    canvas: null,
    ctx: null,

    init() {
        this.canvas = document.getElementById('game-canvas');
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d', { alpha: false });
        this.resize();

        window.addEventListener('resize', () => this.resize());
    },

    resize() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.ctx.imageSmoothingEnabled = false;
    },

    draw() {
        const { ctx, canvas } = this;
        const { currentMap, player, entities, worldItems } = Game.state;
        const { tileSize } = Game.config;

        if (!currentMap) return;

        // 1. Clear Screen
        ctx.fillStyle = '#020617';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 2. Camera Logic (Centered on Player)
        const offsetX = (canvas.width / 2) - (player.x * tileSize) - (tileSize / 2);
        const offsetY = (canvas.height / 2) - (player.y * tileSize) - (tileSize / 2);

        // 3. Render World Grid
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        for (let x = 0; x < currentMap.size; x++) {
            for (let y = 0; y < currentMap.size; y++) {
                const posX = offsetX + x * tileSize;
                const posY = offsetY + y * tileSize;

                // Optimization: Don't draw if off-screen
                if (posX + tileSize < 0 || posX > canvas.width || posY + tileSize < 0 || posY > canvas.height) {
                    continue;
                }

                ctx.strokeRect(posX, posY, tileSize, tileSize);
            }
        }

        // 4. Render World Items (Ground Loot)
        worldItems.forEach(item => {
            const data = ItemDatabase[item.itemId];
            const iX = offsetX + item.x * tileSize;
            const iY = offsetY + item.y * tileSize;

            if (data && data.icon) {
                ctx.font = "24px serif";
                ctx.textAlign = "center";
                ctx.fillText(data.icon, iX + tileSize / 2, iY + tileSize / 2 + 8);
            }
        });

        // 5. Render Entities (Enemies/NPCs)
        entities.forEach(en => {
            if (!en.alive) return;
            const enX = offsetX + en.x * tileSize;
            const enY = offsetY + en.y * tileSize;

            ctx.fillStyle = en.type === 'goblin' ? '#f43f5e' : '#f59e0b';
            
            // Draw square for entity
            ctx.fillRect(enX + 10, enY + 10, tileSize - 20, tileSize - 20);

            // Simple HP bar above head
            if (en.hp !== undefined) {
                ctx.fillStyle = '#000';
                ctx.fillRect(enX + 10, enY + 2, tileSize - 20, 4);
                ctx.fillStyle = '#ef4444';
                ctx.fillRect(enX + 10, enY + 2, (tileSize - 20) * (en.hp / en.maxHp), 4);
            }
        });

        // 6. Render Player
        const pX = offsetX + player.x * tileSize;
        const pY = offsetY + player.y * tileSize;

        ctx.fillStyle = '#3b82f6';
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(59, 130, 246, 0.5)';
        ctx.fillRect(pX + 12, pY + 12, tileSize - 24, tileSize - 24);
        ctx.shadowBlur = 0;
    }
};