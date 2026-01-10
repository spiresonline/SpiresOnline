// js/GameManager.js
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
        
        // The Big 18: Exact Clean Filenames
        this.dataFiles = [
            // Core
            { url: 'data/Stats.csv', category: 'Stats' },
            { url: 'data/Skills.csv', category: 'Skills' },
            { url: 'data/Scaling.csv', category: 'Scaling' },
            { url: 'data/Levels.csv', category: 'Levels' },
            { url: 'data/Perks.csv', category: 'Perks' },
            { url: 'data/Talents.csv', category: 'Talents' },
            // Items
            { url: 'data/Items.csv', category: 'Items' },
            { url: 'data/Equipment.csv', category: 'Equipment' }, // Parser merges this into Items or keeps separate
            { url: 'data/DropTables.csv', category: 'DropTables' },
            // Actions & Effects
            { url: 'data/Actions.csv', category: 'Actions' },
            { url: 'data/Combat.csv', category: 'Combat' },
            { url: 'data/Status.csv', category: 'Status' },
            // World
            { url: 'data/Monsters.csv', category: 'Monsters' },
            { url: 'data/Maps.csv', category: 'Maps' },
            { url: 'data/NPCs.csv', category: 'NPCs' },
            { url: 'data/Containers.csv', category: 'Containers' },
            { url: 'data/Quests.csv', category: 'Quests' },
            { url: 'data/Dialogues.csv', category: 'Dialogues' }
        ];
    }

    async initialize() {
        console.log("Starting Alpha 2.0 Initialization...");
        console.log(`Loading ${this.dataFiles.length} database files...`);

        const loadPromises = this.dataFiles.map(file => {
            return fetch(file.url)
                .then(response => {
                    if (!response.ok) throw new Error(`HTTP Error ${response.status}: Failed to load ${file.url}`);
                    return response.text();
                })
                .then(text => {
                    TSVParser.parseData(text, file.category);
                })
                .catch(err => console.error("Loader Error:", err));
        });

        await Promise.all(loadPromises);
        
        console.log("All Databases Loaded Successfully.");
        this.setupGameSystems();
    }

    setupGameSystems() {
        // Initialize Managers
        this.player = new PlayerManager();
        this.player.recalculateStats();

        this.world = new WorldState();
        // Spawns entities based on data loaded from Maps/NPCs/Monsters
        if (this.world.currentMapID && GameDatabase.Maps[this.world.currentMapID]) {
             this.world.spawnEntitiesForMap(this.world.currentMapID);
        } else {
            console.warn("Starting map ID not found in database.");
        }

        this.actions = new ActionController(this.player);

        this.isInitialized = true;
        console.log("Systems Online.");
        
        if (window.onGameReady) window.onGameReady();
    }

    debugStatus() {
        if (!this.isInitialized) return "Loading...";
        return `
        Location: ${this.world.currentMapID}
        HP: ${this.player.currentHP}/${this.player.maxHP} | STM: ${this.player.currentStamina}
        Entities Nearby: ${this.world.activeEntities.length}
        `;
    }
}

window.Game = new GameManager();