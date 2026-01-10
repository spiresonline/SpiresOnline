import { StatData, SkillData, ItemData, ActionData, MonsterData, GameDatabase } from './GameDataModels.js';

export class TSVParser {

    /**
     * Main entry point to parse raw text into the Global Database.
     * @param {string} fileContent - The raw string from the file.
     * @param {string} category - The key in GameDatabase (e.g., "Stats", "Items").
     */
    static parseData(fileContent, category) {
        if (!fileContent) return;

        // Detect delimiter (Tab or Comma)
        const firstLine = fileContent.split('\n')[0];
        const delimiter = firstLine.includes('\t') ? '\t' : ',';

        const lines = fileContent.split('\n');
        const headers = lines[0].trim().split(delimiter).map(h => h.trim());

        const parsedObjects = {};

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const values = this.splitLine(line, delimiter);
            const entry = {};

            // Map headers to values
            headers.forEach((header, index) => {
                let value = values[index];

                // Remove quotes if present
                if (value && value.startsWith('"') && value.endsWith('"')) {
                    value = value.slice(1, -1);
                }
                
                entry[header] = value;
            });

            // Post-Processing based on Category
            const processedObject = this.instantiateObject(category, entry);
            if (processedObject && processedObject.ID) {
                parsedObjects[processedObject.ID] = processedObject;
            }
        }

        // Save to Global Database
        GameDatabase[category] = parsedObjects;
        console.log(`[TSVParser] Loaded ${Object.keys(parsedObjects).length} entries into ${category}.`);
    }

    /**
     * Handles splitting lines while respecting quotes (e.g., "text, with, commas").
     */
    static splitLine(line, delimiter) {
        // Regex to split by delimiter but ignore delimiters inside quotes
        const regex = new RegExp(`(\\s*${delimiter}\\s*|\\r?\\n|\\r)`);
        if (delimiter === ',') {
            // Complex CSV splitting regex
            const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
            return matches || line.split(',');
        } else {
            return line.split('\t');
        }
    }

    /**
     * Converts raw dictionary into specific Class Instances.
     */
    static instantiateObject(category, data) {
        switch (category) {
            case 'Stats':
                return new StatData(data.ID, data.Type, data.Name, data.Range_Desc, data.Description);
            
            case 'Skills':
                return new SkillData(data.ID, data.Name, data.Stat_Scaling, data.Description);

            case 'Items':
                // Handles Items, Equipment, and Ammo
                return new ItemData(data.ID, data.Name, data.Type, data.Buffs, data.Unique_ID || data.ID);

            case 'Actions':
                return new ActionData(data.ID, data.Name, data.Skill_ID, data.Time_ms, data.Cost || data.Energy_Cost, data.Description);

            case 'Monsters':
                return new MonsterData(data.ID, data.Name, data.Danger_Tier, data.Stats_Logic, data.Skills_Logic, data.DropTableID);

            default:
                // Fallback for simple generic objects (Quests, Dialogues, etc.)
                return data;
        }
    }
}