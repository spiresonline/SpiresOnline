/**
 * SPIRES ONLINE | TALENT SYSTEM (talents.js)
 * Alpha 1.2: Neural Network Visualization and Stat Upgrades.
 */

import { Game } from './game.js';

export const Talents = {
    // Starting Points (for Alpha testing)
    availablePoints: 3, 

    // The Tree Definition
    nodes: [
        // TIER 1 (Center)
        { 
            id: 'core_resilience', 
            name: 'Core Resilience', 
            desc: 'Increases Max HP by 20.', 
            x: 450, y: 300, 
            cost: 1, 
            unlocked: false,
            effect: (p) => { p.maxHp += 20; p.hp += 20; }
        },
        
        // TIER 2 (Wings)
        { 
            id: 'muscle_fiber', 
            name: 'Muscle Density', 
            desc: 'Increases Strength by 5.', 
            x: 300, y: 200, 
            cost: 1, 
            req: 'core_resilience', 
            unlocked: false,
            effect: (p) => { p.stats.str += 5; }
        },
        { 
            id: 'synaptic_speed', 
            name: 'Synaptic Speed', 
            desc: 'Increases Agility by 5.', 
            x: 600, y: 200, 
            cost: 1, 
            req: 'core_resilience', 
            unlocked: false,
            effect: (p) => { p.stats.agi += 5; }
        },
        { 
            id: 'mental_fortitude', 
            name: 'Mental Fortitude', 
            desc: 'Increases Max Mana by 30.', 
            x: 450, y: 150, 
            cost: 1, 
            req: 'core_resilience', 
            unlocked: false,
            effect: (p) => { p.maxMana += 30; }
        },

        // TIER 3 (Advanced)
        { 
            id: 'adrenal_glands', 
            name: 'Adrenal Glands', 
            desc: 'Passive Health Regen increased.', 
            x: 200, y: 100, 
            cost: 2, 
            req: 'muscle_fiber', 
            unlocked: false,
            effect: (p) => { p.stats.sta += 10; }
        },
        { 
            id: 'neural_plasticity', 
            name: 'Neural Plasticity', 
            desc: 'Gain more XP per kill.', 
            x: 700, y: 100, 
            cost: 2, 
            req: 'synaptic_speed', 
            unlocked: false,
            effect: (p) => { p.stats.int += 10; }
        }
    ],

    init() {
        console.log("Talent System: Neural Interface Ready.");
        this.render();
    },

    unlock(nodeId) {
        const node = this.nodes.find(n => n.id === nodeId);
        if (!node || node.unlocked) return;

        // Check Costs & Requirements
        if (this.availablePoints < node.cost) {
            Game.ui.log("System: Insufficient Neural Points.");
            return;
        }

        if (node.req) {
            const parent = this.nodes.find(n => n.id === node.req);
            if (!parent.unlocked) {
                Game.ui.log("System: Neural Pathway locked. Unlock previous node first.");
                return;
            }
        }

        // Success: Unlock
        this.availablePoints -= node.cost;
        node.unlocked = true;
        
        // Apply Effect
        node.effect(Game.state.player);
        Game.ui.log(`Upgrade: ${node.name} installed.`);
        Game.ui.updateVitals();

        // Re-render
        this.render();
    },

    render() {
        const container = document.getElementById('talents-container');
        if (!container) return;

        container.innerHTML = ''; // Clear

        // 1. Draw Connections (SVG Layer)
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("class", "absolute inset-0 w-full h-full pointer-events-none");
        
        this.nodes.forEach(node => {
            if (node.req) {
                const parent = this.nodes.find(n => n.id === node.req);
                const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                
                // Adjust for center of 64x64 node
                line.setAttribute("x1", parent.x + 32); 
                line.setAttribute("y1", parent.y + 32);
                line.setAttribute("x2", node.x + 32);
                line.setAttribute("y2", node.y + 32);
                
                const color = node.unlocked ? "#3b82f6" : "#334155"; // Blue if unlocked, gray if not
                line.setAttribute("stroke", color);
                line.setAttribute("stroke-width", "4");
                
                svg.appendChild(line);
            }
        });
        container.appendChild(svg);

        // 2. Draw Nodes (HTML Layer)
        this.nodes.forEach(node => {
            const el = document.createElement('div');
            // Positioning
            el.style.left = `${node.x}px`;
            el.style.top = `${node.y}px`;
            el.style.position = 'absolute';
            
            // Styling
            let bgClass = node.unlocked ? "bg-blue-600 border-white" : "bg-slate-900 border-slate-700";
            if (!node.unlocked && this.availablePoints >= node.cost && (!node.req || this.nodes.find(n => n.id === node.req).unlocked)) {
                bgClass = "bg-slate-800 border-yellow-500 animate-pulse"; // Available to buy
            }

            el.className = `w-16 h-16 rounded-full border-4 flex items-center justify-center cursor-pointer transition hover:scale-110 z-10 ${bgClass}`;
            el.innerHTML = `<span class="text-xs font-bold">${node.icon || '🧠'}</span>`;
            
            // Tooltip via standard HTML title for now
            el.title = `${node.name}\n${node.desc}\nCost: ${node.cost} Pt`;

            el.onclick = () => this.unlock(node.id);

            container.appendChild(el);
        });

        // Update UI Text
        const txtPoints = document.getElementById('txt-talent-points');
        if (txtPoints) txtPoints.innerText = this.availablePoints;
    }
};