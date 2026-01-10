import { FormulaEngine } from './FormulaEngine.js';
import { GameDatabase } from './GameDataModels.js';

export class ActionController {
    constructor(playerManager) {
        this.player = playerManager;
    }

    /**
     * Main entry point to try doing something.
     * @param {string} actionID - The ID from Actions.csv (e.g., "act_min_pick")
     * @param {object} target - Optional (Monster, NPC, or null)
     * @returns {object} Result - { success: boolean, message: string, data: any }
     */
    attemptAction(actionID, target = null) {
        const action = GameDatabase.Actions[actionID];
        if (!action) return { success: false, message: "Action not found." };

        // 1. Validation Checks
        const validation = this.validateAction(action);
        if (!validation.allowed) {
            return { success: false, message: validation.reason };
        }

        // 2. Calculate Costs & Time
        const skillLevel = this.player.getSkillLevel(action.Skill_ID);
        const actualTime = FormulaEngine.calculateActionSpeed(action.Time_ms, skillLevel);
        
        // 3. Pay Costs (Energy/Mana/Items)
        this.payCosts(action);

        // 4. Calculate Success
        // Get the Main Stat for the skill (e.g., MIN uses STR)
        // For Alpha, we default to STR if unknown, but this should come from Skill DB
        const mainStatVal = this.player.attributes.STR; // Placeholder: Fetch dynamically in real logic
        const successChance = FormulaEngine.calculateSuccessRate(mainStatVal, skillLevel);
        const roll = Math.random() * 100;

        if (roll > successChance) {
            return { success: false, message: "Failed! (Rolled " + Math.floor(roll) + " vs " + Math.floor(successChance) + ")" };
        }

        // 5. Execute Logic based on Category
        return this.executeSuccess(action, target, skillLevel);
    }

    validateAction(action) {
        // Check Tools
        if (action.Req_Tool && action.Req_Tool !== "none") {
            // Logic to check inventory for tool ID
            // For Alpha 2.0 prototype, we assume true if not implemented
            // if (!this.player.hasItem(action.Req_Tool)) return { allowed: false, reason: "Missing Tool: " + action.Req_Tool };
        }

        // Check Energy
        if (action.Cost && action.Cost.type === "Energy") {
            if (this.player.currentStamina < action.Cost.value) {
                return { allowed: false, reason: "Not enough Stamina." };
            }
        }

        return { allowed: true };
    }

    payCosts(action) {
        if (action.Cost && action.Cost.type === "Energy") {
            this.player.currentStamina -= action.Cost.value;
        }
        // Handle other costs (Gold, Items) here
    }

    executeSuccess(action, target, skillLevel) {
        let resultMsg = "";
        
        switch (action.Category) {
            case "Gather":
            case "Search":
                // Loot Logic
                // In a real game, the Target (Node) would have a DropTable. 
                // Here we simulate finding a generic item for testing.
                const lootItem = "it_jnk_stone"; 
                this.player.inventory.push(lootItem);
                resultMsg = `Success! Gathered ${lootItem}.`;
                break;

            case "Combat":
                if (!target) return { success: false, message: "No target for combat action!" };
                // Calculate Damage
                const weaponDmg = 5; // Base fist damage
                const dmg = FormulaEngine.calculateMeleeDamage(weaponDmg, this.player.attributes.STR, skillLevel);
                target.currentHP -= dmg;
                resultMsg = `Hit ${target.Name} for ${Math.floor(dmg)} damage!`;
                
                // Check for Status Effects (Bleed/Stun) based on Action definition
                break;

            case "Social":
                // Social Check Logic
                const socialPower = FormulaEngine.calculateSocialPower(this.player.attributes.CHA, this.player.getSkillLevel("sk_fsh"), this.player.reputation);
                resultMsg = `Persuaded ${target ? target.Name : "NPC"}. (Social Power: ${socialPower})`;
                break;

            default:
                resultMsg = "Action completed.";
        }

        // Grant XP (Simplified)
        this.grantXP(action.Skill_ID, 10);

        return { success: true, message: resultMsg };
    }

    grantXP(skillID, amount) {
        if (!this.player.skills[skillID]) {
            this.player.skills[skillID] = { level: 1, xp: 0 };
        }
        this.player.skills[skillID].xp += amount;
        // Check Level Up Logic would go here
    }
}