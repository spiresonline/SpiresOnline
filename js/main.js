import { GameManager } from './GameManager.js';
import { GameDatabase } from './GameDataModels.js';

window.addEventListener('load', () => {
    if (window.Game) {
        window.Game.initialize().then(() => {
            log("Core Systems Loaded.");
            log("Welcome to Spires Online Alpha 2.0.");
            
            // Give player starting items for testing
            window.Game.player.addItem("it_med_01", 3);
            window.Game.player.addItem("wpn_1h_01", 1);
            
            updateUI();
        });
    }
});

// Setup Inputs
document.getElementById('btn-act').addEventListener('click', () => {
    const input = document.getElementById('cmd-input');
    handleInput(input.value);
});

document.getElementById('cmd-input').addEventListener('keypress', (e) => {
    if(e.key === 'Enter') handleInput(e.target.value);
});

function handleInput(cmd) {
    const result = window.Game.actions.attemptAction(cmd, null);
    log(result.message, result.success ? "normal" : "error");
    
    if (result.success) {
        window.Game.world.advanceTime(50);
        updateUI();
    }
}

// UI Loop
function updateUI() {
    const p = window.Game.player;
    
    // Bars
    setBar('hp', p.currentHP, p.maxHP);
    setBar('stm', p.currentStamina, p.maxStamina);
    
    // Info
    document.getElementById('loc-id').innerText = window.Game.world.currentMapID;
    document.getElementById('time-val').innerText = window.Game.world.timeOfDay;

    // Inventory Rendering
    renderInventory(p.inventory);
}

function renderInventory(inv) {
    const grid = document.getElementById('inv-grid');
    grid.innerHTML = ""; // Clear current

    // Group items (simple logic)
    const counts = {};
    inv.forEach(id => counts[id] = (counts[id] || 0) + 1);

    for (let id in counts) {
        const itemData = GameDatabase.Items[id];
        const el = document.createElement('div');
        el.className = 'inv-slot';
        el.title = itemData ? itemData.Name : id;
        
        // Image
        const img = document.createElement('img');
        img.src = `assets/${id}.png`;
        img.onerror = () => { img.src = ''; }; // Hide broken links
        el.appendChild(img);

        // Qty
        if(counts[id] > 1) {
            const qty = document.createElement('span');
            qty.className = 'inv-qty';
            qty.innerText = counts[id];
            el.appendChild(qty);
        }

        grid.appendChild(el);
    }
}

function setBar(id, cur, max) {
    const pct = Math.min(100, Math.max(0, (cur/max)*100));
    document.getElementById(`${id}-bar`).style.width = `${pct}%`;
    document.getElementById(`${id}-txt`).innerText = `${Math.floor(cur)}/${Math.floor(max)}`;
}

function log(msg, type="normal") {
    const box = document.getElementById('game-log');
    const div = document.createElement('div');
    div.className = `log-entry ${type}`;
    div.innerText = `> ${msg}`;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
}