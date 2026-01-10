// js/GameDataModels.js

// --- 1. Core Stats, Skills & Scaling ---
export class StatData {
    constructor(id, type, name, rangeDesc, description) {
        this.ID = id;
        this.Type = type;
        this.Name = name;
        this.Range_Desc = rangeDesc ? rangeDesc.split('|') : [];
        this.Description = description;
        this.Value = 0; // Runtime
    }
}

export class SkillData {
    constructor(id, name, statScaling, description) {
        this.ID = id;
        this.Name = name;
        this.Stat_Scaling = statScaling;
        this.Description = description;
        this.Level = 1; // Runtime
        this.XP = 0;    // Runtime
    }
}

export class ScalingData {
    constructor(type, id, formula, description) {
        this.Type = type;
        this.ID = id;
        this.Formula = formula;
        this.Description = description;
    }
}

export class ProgressionData { // Corresponds to Levels.csv
    constructor(type, level, xpReq, reward, tierTitle) {
        this.Type = type;
        this.Level = parseInt(level);
        this.Total_XP_Req = parseInt(xpReq);
        this.Reward = reward;
        this.Tier_Title = tierTitle;
    }
}

export class PerkData {
    constructor(id, category, name, condition, effect, description) {
        this.ID = id;
        this.Category = category;
        this.Name = name;
        this.Unlock_Condition = condition;
        this.Effect_Logic = effect;
        this.Description = description;
    }
}

export class TalentData {
    constructor(id, tree, tier, name, reqPrimary, effect, description) {
        this.ID = id;
        this.Tree = tree;
        this.Tier = parseInt(tier);
        this.Name = name;
        this.Req_Primary = reqPrimary;
        this.Effect_Logic = effect;
        this.Description = description;
    }
}

// --- 2. Items & Equipment ---
export class ItemData {
    constructor(id, name, type, buffs, effectId) {
        this.ID = id;
        this.Name = name;
        this.Type = type;
        this.Buffs = buffs;
        this.Unique_ID = effectId;
    }
}

export class DropTableData {
    constructor(tableId, itemId, chance, min, max) {
        this.TableID = tableId;
        this.ItemID = itemId;
        this.Chance = parseInt(chance);
        this.Min = parseInt(min);
        this.Max = parseInt(max);
    }
}

// --- 3. Actions & Status ---
export class ActionData {
    constructor(id, category, name, skillId, timeMs, cost, description) {
        this.ID = id;
        this.Category = category;
        this.Name = name;
        this.Skill_ID = skillId;
        this.Time_ms = parseInt(timeMs);
        this.Cost = cost;
        this.Description = description;
    }
}

export class StatusEffectData {
    constructor(id, name, type, duration, logic, cure) {
        this.ID = id;
        this.Name = name;
        this.Type = type;
        this.Duration = duration;
        this.Effect_Logic = logic;
        this.Cure_Action = cure;
    }
}

// --- 4. World & Entities ---
export class MonsterData {
    constructor(id, name, tier, stats, skills, dropTable) {
        this.ID = id;
        this.Name = name;
        this.Tier = tier;
        this.Stats = stats;
        this.Skills = skills;
        this.DropTableID = dropTable;
    }
}

export class MapData {
    constructor(id, name, type, accessReq, desc) {
        this.ID = id;
        this.Name = name;
        this.Type = type;
        this.Accessibility_Req = accessReq;
        this.Description = desc;
    }
}

export class NPCData {
    constructor(id, name, locId, role, desc) {
        this.ID = id;
        this.Name = name;
        this.LocationID = locId;
        this.Role = role;
        this.Description = desc;
    }
}

export class ContainerData {
    constructor(id, name, type, skillReq, difficulty, dropTable) {
        this.ID = id;
        this.Name = name;
        this.Type = type;
        this.Skill_Required = skillReq;
        this.Difficulty = parseInt(difficulty);
        this.DropTableID = dropTable;
    }
}

export class QuestData {
    constructor(id, npcId, title, req, reward, desc) {
        this.ID = id;
        this.NPC_ID = npcId;
        this.Title = title;
        this.Requirement = req;
        this.Reward = reward;
        this.Description = desc;
    }
}

export class DialogueData {
    constructor(id, npcId, trigger, condition, text, effect) {
        this.ID = id;
        this.NPC_ID = npcId;
        this.Trigger_Tag = trigger;
        this.Condition = condition;
        this.Text_Content = text;
        this.Effect_On_Select = effect;
    }
}

// --- 5. Global Registry ---
export const GameDatabase = {
    Stats: {},
    Skills: {},
    Scaling: {},
    Levels: [], // Array, not dict
    Items: {},
    Actions: {},
    Status: {},
    Monsters: {},
    Maps: {},
    NPCs: {},
    Dialogues: {},
    Quests: {},
    Containers: {},
    DropTables: [], // Array, because one TableID has multiple rows
    Perks: {},
    Talents: {}
};