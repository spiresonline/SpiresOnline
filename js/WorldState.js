import { GameDatabase } from './GameDataModels.js';
import { MonsterData } from './GameDataModels.js';

export class WorldState {
    constructor() {
        this.currentMapID = "map_bar_01"; // Starting location
        this.timeOfDay = 800; // 08:00 AM (Scale: 0 - 2400)
        this.activeEntities = []; // NPCs/Monsters currently in the scene
    }

    /**
     * Moves the player to a new map, checking requirements.
     */
    changeMap(mapID, player) {
        const mapData = GameDatabase.Maps[mapID];
        if (!mapData) return { success: false, message: "Map does not exist." };

        // Check Accessibility (e.g., "sk_stl:15" or "STR:20")
        if (mapData.Accessibility_Req && mapData.Accessibility_Req !== "none") {
            const reqs = mapData.Accessibility_Req.split('|');
            for (let r of reqs) {
                let [type, val] = r.split(':');
                
                // Skill Check
                if (type.startsWith("sk_")) {
                    if (player.getSkillLevel(type) < parseInt(val)) {
                        return { success: false, message: `Locked. Requires ${type} level ${val}.` };
                    }
                }
                // Stat Check
                else if (["STR","DEX","INT","PER","CHA"].includes(type)) {
                    if (player.attributes[type] < parseInt(val)) {
                        return { success: false, message: `Locked. Requires ${type} ${val}.` };
                    }
                }
                // Reputation/Fashion Check
                else if (type === "REP") {
                    if (player.reputation < parseInt(val)) {
                        return { success: false, message: `Locked. Reputation too low.` };
                    }
                }
            }
        }

        this.currentMapID = mapID;
        this.spawnEntitiesForMap(mapID);
        return { success: true, message: `Entered ${mapData.Name}.` };
    }

    /**
     * Populates the activeEntities array based on the database.
     */
    spawnEntitiesForMap(mapID) {
        this.activeEntities = [];

        // 1. Find static NPCs assigned to this location
        for (const npcID in GameDatabase.NPCs) {
            const npc = GameDatabase.NPCs[npcID];
            if (npc.LocationID === mapID) {
                this.activeEntities.push({
                    type: "NPC",
                    data: npc,
                    currentHP: 100 // NPCs are abstract usually, but give HP just in case
                });
            }
        }

        // 2. Randomly spawn Monsters based on Map Type (Simplified for Alpha)
        // In a full game, Maps would have a "SpawnTableID".
        // Here we just check if it's wilderness or alley.
        const mapType = GameDatabase.Maps[mapID].Type;
        if (mapType === "Wilderness" || mapType === "Alleyway") {
            this.spawnRandomMonster(mapID);
        }
    }

    spawnRandomMonster(mapID) {
        // Find a monster suitable for this area (Logic simplified)
        // In real implementation: Filter monsters by Danger Tier vs Player Power
        const monsterKeys = Object.keys(GameDatabase.Monsters);
        if (monsterKeys.length > 0) {
            const randomKey = monsterKeys[Math.floor(Math.random() * monsterKeys.length)];
            const mobData = GameDatabase.Monsters[randomKey];
            
            // Create a runtime instance of the monster
            this.activeEntities.push({
                type: "Monster",
                data: mobData,
                currentHP: mobData.HP,
                maxHP: mobData.HP,
                isHostile: true
            });
        }
    }

    /**
     * Advances time. 100 = 1 hour.
     */
    advanceTime(amount) {
        this.timeOfDay += amount;
        if (this.timeOfDay >= 2400) {
            this.timeOfDay -= 2400;
            // Trigger Daily Reset logic here (vendors restock, etc.)
        }
    }

    isNight() {
        return this.timeOfDay > 2000 || this.timeOfDay < 500;
    }
}