import { CONFIG } from './Config.js';

export const GameDatabase = {
    items: {},
    monsters: {},
    maps: {},
    skills: {},
    perks: {}
};

export class DataLoader {
    constructor() {
        this.filesToLoad = [
            { key: 'items', file: 'Items.csv' },
            { key: 'monsters', file: 'Monsters.csv' },
            { key: 'maps', file: 'Maps.csv' },
            { key: 'skills', file: 'Skills.csv' },
            { key: 'perks', file: 'Perks.csv' }
        ];
    }

    async loadAll() {
        console.log("--- Loading Game Data ---");
        const promises = this.filesToLoad.map(entry => this.loadCSV(entry.key, entry.file));
        
        try {
            await Promise.all(promises);
            console.log("--- Data Loading Complete ---");
            return true;
        } catch (error) {
            console.error("CRITICAL: Failed to load game data.", error);
            return false;
        }
    }

    async loadCSV(key, filename) {
        const url = CONFIG.DATA_PATH + filename;
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const text = await response.text();
            
            const data = this.parseCSV(text);
            
            // Index data by ID for fast lookup (e.g., items['wpn_sword'])
            data.forEach(item => {
                if (item.ID) {
                    GameDatabase[key][item.ID] = item;
                }
            });
            
            console.log(`Loaded ${data.length} entries from ${filename} into ${key}`);

        } catch (e) {
            console.warn(`Could not load ${filename}: ${e.message}. Game continues with empty ${key}.`);
        }
    }

    parseCSV(text) {
        // Handle Windows (\r\n) and Unix (\n) line endings
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
        
        if (lines.length < 2) return [];

        // Detect delimiter (Comma or Tab)
        const firstLine = lines[0];
        const separator = firstLine.includes('\t') ? '\t' : ',';
        
        // Parse Headers
        const headers = firstLine.split(separator).map(h => h.trim().replace(/^"|"$/g, ''));

        const result = [];

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            
            // Regex to handle commas inside quotes: "Sword, Iron", 10, ...
            let columns;
            if (separator === ',') {
                columns = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
            } else {
                columns = line.split(separator);
            }

            if (!columns) continue;

            const obj = {};
            headers.forEach((header, index) => {
                let val = columns[index] ? columns[index].trim() : '';
                // Remove quotes from values
                val = val.replace(/^"|"$/g, '');
                
                // Auto-convert numbers
                if (!isNaN(val) && val !== '') {
                    val = Number(val);
                }
                
                obj[header] = val;
            });

            if (obj.ID) {
                result.push(obj);
            }
        }

        return result;
    }
}