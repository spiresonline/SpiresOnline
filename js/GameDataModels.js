// --- 1. Core Stats & Skills ---
export class StatData {
    constructor(id, type, name, rangeDesc, description) {
        this.ID = id;               // e.g., "STR"
        this.Type = type;           // "Core", "Skill"
        this.Name = name;
        this.Range_Desc = rangeDesc ? rangeDesc.split('|') : []; // ["Weak", "Average"...]
        this.Description = description;
        this.Value = 0;             // Current value in runtime
    }
}

export class SkillData {
    constructor(id, name, statScaling, description) {
        this.ID = id;               // e.g., "sk_bld"
        this.Name = name;
        this.Stat_Scaling = this.parseScaling(statScaling); // { "DEX": 0.6, "STR": 0.2 }
        this.Description = description;
        this.Level = 1;             // Runtime level
        this.XP = 0;                // Runtime XP
    }

    parseScaling(scalingStr) {
        let map = {};
        if (!scalingStr) return map;
        // Example: "DEX:0.6|STR:0.2"
        scalingStr.split('|').forEach(part => {
            let [stat, val] = part.split(':');
            map[stat] = parseFloat(val);
        });
        return map;
    }
}

// --- 2. Items & Equipment ---
export class ItemData {
    constructor(id, name, type, buffs, effectId) {
        this.ID = id;
        this.Name = name;
        this.Type = type;           // "tool", "consumable", "junk"
        this.Buffs = this.parseBuffs(buffs);
        this.Unique_ID = effectId;
    }

    parseBuffs(buffStr) {
        // "VIT:1|bleed_stop"
        let buffs = {};
        if(!buffStr || buffStr === "none") return buffs;
        buffStr.split('|').forEach(b => {
            let [key, val] = b.split(':');
            buffs[key] = isNaN(val) ? val : parseFloat(val);
        });
        return buffs;
    }
}

// --- 3. Actions ---
export class ActionData {
    constructor(id, name, skillId, timeMs, cost, description) {
        this.ID = id;
        this.Name = name;
        this.Skill_ID = skillId;
        this.Time_ms = parseInt(timeMs);
        this.Cost = this.parseCost(cost);
        this.Description = description;
    }

    parseCost(costStr) {
        // "Energy:10"
        if(!costStr || costStr === "none") return null;
        let [type, val] = costStr.split(':');
        return { type: type, value: parseFloat(val) };
    }
}

// --- 4. Monsters ---
export class MonsterData {
    constructor(id, name, tier, statsLogic, skillsLogic, dropTableId) {
        this.ID = id;
        this.Name = name;
        this.Tier = tier;
        this.Stats = this.parseLogic(statsLogic);
        this.Skills = this.parseLogic(skillsLogic);
        this.DropTableID = dropTableId;
    }

    parseLogic(str) {
        // "DEX:15|VIT:10"
        let map = {};
        if(!str) return map;
        str.split('|').forEach(s => {
            let [key, val] = s.split(':');
            map[key] = parseInt(val);
        });
        return map;
    }
}

// --- 5. Global Registry ---
// This will hold all the loaded data from TSVs
export const GameDatabase = {
    Stats: {},
    Skills: {},
    Items: {},
    Actions: {},
    Monsters: {},
    LootTables: {},
    Quests: {},
    Dialogues: {}
};