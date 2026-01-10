/**
 * SPIRES ONLINE | GRAPHICS LOADER (sprites.js)
 * מטפל בטעינת תמונות וביצירת גרפיקה זמנית (Placeholders)
 * כדי שהמשחק יעבוד גם בלי קבצי PNG חיצוניים.
 */

export const Sprites = {
    images: {},
    loaded: false,
    
    // הגדרת מקורות התמונה (נתיב לקובץ)
    // ברגע שיהיו לך תמונות אמיתיות, שים אותן בתיקיית assets ושנה את הנתיבים כאן
    sources: {
        player: 'assets/player.png',
        goblin: 'assets/goblin.png',
        npc_guard: 'assets/guard.png',
        npc_bartender: 'assets/bartender.png',
        floor_town: 'assets/floor_stone.png',
        floor_grass: 'assets/floor_grass.png',
        wall_brick: 'assets/wall_brick.png',
        item_sword: 'assets/sword.png',
        item_potion: 'assets/potion.png'
    },

    init() {
        const promises = [];

        // מעבר על כל המקורות וניסיון טעינה
        for (const [key, src] of Object.entries(this.sources)) {
            promises.push(this.loadImage(key, src));
        }

        return Promise.all(promises).then(() => {
            this.loaded = true;
            console.log("Graphics System: All Assets Loaded (or generated fallback).");
        });
    },

    loadImage(key, src) {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = src;
            
            // הצלחה: התמונה קיימת
            img.onload = () => {
                this.images[key] = img;
                resolve();
            };

            // כישלון: התמונה לא קיימת -> צור גרפיקה זמנית
            img.onerror = () => {
                this.images[key] = this.generateFallback(key);
                resolve();
            };
        });
    },

    // יצירת ריבוע צבעוני עם טקסט במקום תמונה חסרה
    generateFallback(key) {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');

        // בחירת צבע לפי סוג האובייקט
        let color = '#94a3b8'; // אפור ברירת מחדל
        if (key.includes('player')) color = '#3b82f6'; // כחול
        if (key.includes('goblin')) color = '#ef4444'; // אדום
        if (key.includes('npc')) color = '#eab308'; // זהב
        if (key.includes('grass')) color = '#064e3b'; // ירוק כהה
        if (key.includes('floor')) color = '#1e293b'; // כחול כהה לרצפה
        if (key.includes('wall')) color = '#334155'; // אפור קיר

        // ציור הרקע
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, 64, 64);

        // הוספת מסגרת
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, 64, 64);

        // הוספת אות ראשונה לזיהוי
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(key.charAt(0).toUpperCase(), 32, 32);

        const img = new Image();
        img.src = canvas.toDataURL();
        return img;
    },

    get(key) {
        return this.images[key] || this.images['floor_town']; // החזרת ברירת מחדל אם מפתח לא נמצא
    }
};