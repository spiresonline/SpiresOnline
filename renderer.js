/**
 * SPIRES ONLINE | RENDERER SYSTEM (renderer.js)
 * Professional ES Module Version
 */

import { Game } from './game.js';

export const Renderer = {
    canvas: null,
    ctx: null,

    init() {
        this.canvas = document.getElementById('game-canvas');
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
        const { currentMap, player, entities } = Game.state;
        const { tileSize } = Game.config;

        if (!currentMap) return;

        ctx.fillStyle = '#020617';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const offsetX = (canvas.width / 2) - (player.x * tileSize) - (tileSize / 2);
        const offsetY = (canvas.height / 2) - (player.y * tileSize) - (tileSize / 2);

        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;

        for (let x = 0; x < currentMap.size; x++) {
            for (let y = 0; y < currentMap.size; y++) {
                const posX = offsetX + x * tileSize;
                const posY = offsetY + y * tileSize;

                if (posX + tileSize < 0 || posX > canvas.width || posY + tileSize < 0 || posY > canvas.height) continue;

                ctx.strokeRect(posX, posY, tileSize, tileSize);

                if (x === 0 || x === currentMap.size - 1 || y === 0 || y === currentMap.size - 1) {
                    ctx.fillStyle = 'rgba(59, 130, 246, 0.05)';
                    ctx.fillRect(posX, posY, tileSize, tileSize);
                }

                if (currentMap.walls.some(w => w.x === x && w.y === y)) {
                    ctx.fillStyle = '#1e293b';
                    ctx.fillRect(posX + 4, posY + 4, tileSize - 8, tileSize - 8);
                }
            }
        }

        entities.forEach(en => {
            if (!en.alive) return;
            const enX = offsetX + en.x * tileSize;
            const enY = offsetY + en.y * tileSize;
            ctx.fillStyle = en.type === 'goblin' ? '#f43f5e' : '#f59e0b';
            ctx.shadowBlur = 15;
            ctx.shadowColor = ctx.fillStyle;
            ctx.fillRect(enX + 16, enY + 16, tileSize - 32, tileSize - 32);
            ctx.shadowBlur = 0;

            if (en.hp !== undefined) {
                const barW = tileSize - 20;
                ctx.fillStyle = '#000';
                ctx.fillRect(enX + 10, enY + 5, barW, 4);
                ctx.fillStyle = '#ef4444';
                ctx.fillRect(enX + 10, enY + 5, barW * (en.hp / en.maxHp), 4);
            }
        });

        const pX = offsetX + player.x * tileSize;
        const pY = offsetY + player.y * tileSize;
        const pHeight = tileSize * 1.35;
        ctx.fillStyle = '#3b82f6';
        ctx.shadowBlur = 25;
        ctx.shadowColor = 'rgba(59, 130, 246, 0.5)';
        ctx.fillRect(pX + 12, pY - (pHeight - tileSize) + 12, tileSize - 24, pHeight - 24);
        ctx.shadowBlur = 0;
    }
};