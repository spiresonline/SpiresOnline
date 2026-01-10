import { TSVParser } from './TSVParser.js';
import { GameDatabase } from './GameDataModels.js';
import { PlayerManager } from './PlayerManager.js';
import { WorldState } from './WorldState.js';
import { ActionController } from './ActionController.js';

export class GameManager {
    constructor() {
        this.player = null;
        this.world = null;
        this.actions = null;
        this.isInitialized = false;
        
        // Configuration
        this.dataFiles = [
            { url: 'data/SO DATABASE.xlsx - Stats.csv', category: 'Stats' },
            { url: 'data/SO DATABASE.xlsx - Skills.csv', category: 'Skills' },
            { url: 'data/SO DATABASE.xlsx - Items.csv', category: 'Items' },
            { url: 'data/SO DATABASE.xlsx - Actions.csv', category: 'Actions' },
            { url: 'data/SO DATABASE.xlsx - Monsters.csv', category: 'Monsters' },
            { url: 'data/SO DATABASE.xlsx - Maps.csv', category: 'Maps' },
            { url: 'data/SO DATABASE.xlsx - NPCs.csv', category: 'NPCs' },
            { url: 'data/SO DATABASE.xlsx - Dialogues.csv', category: 'Dialogues' },
            { url: 'data/SO DATABASE.xlsx - Quests.csv', category: 'Quests' }
        ];
    }

    /**
     * Step 1: Boot Sequence
     * Loads all text files and parses them into GameDatabase.
     */
    async initialize() {
        console.log("Starting System Initialization...");

        const loadPromises = this.dataFiles.map(file => {
            return fetch(file.url)
                .then(response => {
                    if (!response.ok) throw new Error(`Failed to load ${file.url}`);
                    return response.text();
                })
                .then(text => {
                    TSVParser.parseData(text, file.category);
                })
                .catch(err => console.error(err));
        });

        // Wait for all files to load
        await Promise.all(loadPromises);
        
        console.log("Database Loaded Successfully.");
        this.setupGameSystems();
    }

    /**
     * Step 2: System Setup
     * Initialize the managers now that data exists.
     */
    setupGameSystems() {
        // Create Player
        this.player = new PlayerManager();
        this.player.recalculateStats(); // Apply base stats

        // Create World
        this.world = new WorldState();
        this.world.spawnEntitiesForMap(this.world.currentMapID);

        // Connect Actions
        this.actions = new ActionController(this.player);

        this.isInitialized = true;
        console.log("Systems Online. Alpha 2.0 Ready.");
        
        // Notify UI (if exists) that we are ready
        if (window.onGameReady) window.onGameReady();
    }

    /**
     * Debug Helper: Print status to console
     */
    debugStatus() {
        if (!this.isInitialized) return "Loading...";
        return `
        Location: ${this.world.currentMapID} | Time: ${this.world.timeOfDay}
        HP: ${this.player.currentHP}/${this.player.maxHP} | STM: ${this.player.currentStamina}
        Active Effects: ${this.player.activeStatusEffects.length}
        Nearby Entities: ${this.world.activeEntities.length}
        `;
    }
}

// Global Access Point
window.Game = new GameManager();
// Usage in HTML: Game.initialize();