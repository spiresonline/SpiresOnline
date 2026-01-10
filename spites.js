/**
 * SPIRES ONLINE | GRAPHICS LOADER (sprites.js)
 * Alpha 1.3: New Entity Definitions (Quest Giver & Wolf).
 */

export const Sprites = {
    images: {},
    loaded: false,
    
    // Define sources (File paths or just keys for the generator)
    sources: {
        player: 'assets/player.png',
        
        // NPCs
        npc_guard: 'assets/guard.png',
        npc_bartender: 'assets/bartender.png',
        npc_questgiver: 'assets/captain.png', // NEW: Captain Vance

        // Enemies
        goblin: 'assets/goblin.png',
        wolf: 'assets/wolf.png', // NEW: Wolf

        // Environment
        floor_town: 'assets/floor_stone.png',
        floor_grass: 'assets/floor_grass.png',
        wall_brick: 'assets/wall_brick.png'
    },

    init() {
        const promises = [];

        for (const [key, src] of Object.entries(this.sources)) {
            promises.push(this.loadImage(key, src));
        }

        return Promise.all(promises).then(() => {
            this.loaded = true;
            console.log("Graphics: Assets Generated.");
        });
    },

    loadImage(key, src) {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = src;
            
            img.onload = () => {
                this.images[key] = img;
                resolve();
            };

            // If file missing, generate pixel art fallback
            img.onerror = () => {
                this.images[key] = this.generateFallback(key);
                resolve();
            };
        });
    },

    generateFallback(key) {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');

        // --- COLOR PALETTE ---
        let color = '#94a3b8'; // Default Grey
        let symbol = '?';

        // Player
        if (key.includes('player')) { color = '#3b82f6'; symbol = 'P'; } // Blue
        
        // Enemies
        else if (key.includes('goblin')) { color = '#ef4444'; symbol = 'G'; } // Red
        else if (key.includes('wolf')) { color = '#78350f'; symbol = 'W'; }   // Brown
        
        // NPCs
        else if (key.includes('bartender')) { color = '#eab308'; symbol = 'B'; } // Gold
        else if (key.includes('guard')) { color = '#64748b'; symbol = '🛡️'; }    // Slate
        else if (key.includes('questgiver')) { color = '#8b5cf6'; symbol = '!'; } // Purple (Important!)

        // Environment
        else if (key.includes('grass')) { 
            ctx.fillStyle = '#064e3b'; 
            ctx.fillRect(0,0,64,64);
            // Add grass texture details
            ctx.fillStyle = '#059669';
            ctx.fillRect(10, 10, 4, 4);
            ctx.fillRect(40, 50, 4, 4);
            ctx.fillRect(50, 20, 4, 4);
            return this.createImageFromCanvas(canvas);
        }
        else if (key.includes('floor')) { color = '#1e293b'; symbol = ''; }
        else if (key.includes('wall')) { color = '#334155'; symbol = '#'; }

        // --- DRAWING ---
        // Background
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, 64, 64);

        // Border
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 4;
        ctx.strokeRect(0, 0, 64, 64);

        // Symbol (Character)
        if (symbol) {
            ctx.fillStyle = 'rgba(255,255,255,0.9)';
            ctx.font = 'bold 32px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(symbol, 32, 32);
        }

        return this.createImageFromCanvas(canvas);
    },

    createImageFromCanvas(canvas) {
        const img = new Image();
        img.src = canvas.toDataURL();
        return img;
    },

    get(key) {
        return this.images[key] || this.images['floor_town'];
    }
};