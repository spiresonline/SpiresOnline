// js/TSVParser.js
import { 
    StatData, SkillData, ScalingData, ProgressionData, PerkData, TalentData,
    ItemData, DropTableData, ActionData, StatusEffectData,
    MonsterData, MapData, NPCData, ContainerData, QuestData, DialogueData,
    GameDatabase 
} from './GameDataModels.js';

export class TSVParser {

    static parseData(fileContent, category) {
        if (!fileContent) return;

        const lines = fileContent.split('\n');
        
        // Find first non-empty line (Headers)
        let headerIndex = 0;
        while (headerIndex < lines.length && lines[headerIndex].trim().replace(/,/g, '') === '') {
            headerIndex++;
        }
        
        if (headerIndex >= lines.length) return; // Empty file

        const delimiter = lines[headerIndex].includes('\t') ? '\t' : ',';
        const headers = lines[headerIndex].trim().split(delimiter).map(h => h.trim());

        const parsedObjects = (category === 'Levels' || category === 'DropTables') ? [] : {};

        for (let i = headerIndex + 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line || line.replace(/,/g, '') === '') continue;

            const values = this.splitLine(line, delimiter);
            const entry = {};

            headers.forEach((header, index) => {
                if (!header) return;
                let val = values[index];
                // Remove quotes
                entry[header] = (val && val.startsWith('"') && val.endsWith('"')) ? val.slice(1, -1) : val;
            });

            // Convert to specific Class
            const obj = this.instantiateObject(category, entry);

            // Store in Dict or Array
            if (Array.isArray(parsedObjects)) {
                parsedObjects.push(obj);
            } else if (obj && obj.ID) {
                parsedObjects[obj.ID] = obj;
            }
        }

        // Assign to Global DB
        if (Array.isArray(GameDatabase[category])) {
            // Concatenate if it's an array (useful if splitting drop tables across files, though unlikely here)
            GameDatabase[category] = parsedObjects; 
        } else {
            // Merge objects (useful for Items + Equipment)
            GameDatabase[category] = { ...GameDatabase[category], ...parsedObjects };
        }
        
        console.log(`[Parser] Loaded ${Object.keys(parsedObjects).length} entries into ${category}.`);
    }

    static splitLine(line, delimiter) {
        if (delimiter === ',') {
            const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
            return matches || line.split(',');
        }
        return line.split('\t');
    }

    static instantiateObject(category, data) {
        switch (category) {
            case 'Stats': return new StatData(data.ID, data.Type, data.Name, data.Range_Desc, data.Description);
            case 'Skills': return new SkillData(data.ID, data.Name, data.Stat_Scaling, data.Description);
            case 'Scaling': return new ScalingData(data.Type, data.ID, data.Formula_Logic, data.Description);
            case 'Levels': return new ProgressionData(data.Type, data.Level, data.Total_XP_Req, data.Points_Reward, data.Tier_Title);
            case 'Perks': return new PerkData(data.ID, data.Category, data.Name, data.Unlock_Condition, data.Effect_Logic, data.Description);
            case 'Talents': return new TalentData(data.ID, data.Tree, data.Tier, data.Name, data.Req_Primary, data.Effect_Logic, data.Description);
            
            case 'Items': return new ItemData(data.ID, data.Name, data.Type, data.Buffs, data.Unique_ID || data.ID);
            case 'Equipment': return new ItemData(data.ID, data.Name, data.Type, data.Buffs, data.Unique_ID || data.ID); // Equipment treated as ItemData
            
            case 'Actions': return new ActionData(data.ID, data.Category, data.Name, data.Skill_ID, data.Time_ms, data.Cost, data.Description);
            case 'Combat': return new ActionData(data.ID, 'Combat', data.Name, data.Skill_ID, data.Time_ms, data.Cost, data.Description); // Combat treated as ActionData
            
            case 'Status': return new StatusEffectData(data.ID, data.Name, data.Type, data.Duration_sec, data.Effect_Logic, data.Cure_Action);
            case 'Monsters': return new MonsterData(data.ID, data.Name, data.Danger_Tier, data.Stats_Logic, data.Skills_Logic, data.DropTableID);
            case 'Maps': return new MapData(data.ID, data.Name, data.Type, data.Accessibility_Req, data.Description);
            case 'NPCs': return new NPCData(data.ID, data.Name, data.LocationID, data.Role, data.Description);
            case 'Containers': return new ContainerData(data.ID, data.Name, data.Type, data.Skill_Required, data.Difficulty, data.DropTableID);
            case 'Quests': return new QuestData(data.ID, data.NPC_ID, data.Title, data.Requirement, data.Reward, data.Description);
            case 'Dialogues': return new DialogueData(data.ID, data.NPC_ID, data.Trigger_Tag, data.Condition, data.Text_Content, data.Effect_On_Select);
            case 'DropTables': return new DropTableData(data.TableID, data.ItemID, data.Chance_Percent, data.Min_Qty, data.Max_Qty);
            
            default: return data;
        }
    }
}