import { FormulaEngine } from './FormulaEngine.js';
import { GameDatabase } from './GameDataModels.js';

export class PlayerManager {
    constructor() {
        // Core Attributes (Dynamic)
        this.attributes = {
            STR: 10, DEX: 10, INT: 10, 
            VIT: 10, END: 10, PER: 10, 
            CHA: 10, FOR: 10, LCK: 10
        };

        // Skills (Dynamic: Level & XP)
        // Format: { "sk_bld": { level: 1, xp: 0 } }
        this.skills = {}; 

        // Derived Stats (Calculated)
        this.maxHP = 80;
        this.currentHP = 80;
        this.maxStamina = 100;
        this.currentStamina = 100;
        this.sanity = 100;

        // Progression
        this.accumulatedXP = 0;
        this.perkPoints = 0;
        this.reputation = 0;

        // Inventory & Gear
        this.inventory = []; // Array of Item IDs
        this.equipment = {
            head: null,
            chest: null,
            legs: null,
            mainHand: null,
            offHand: null
        };

        // Active Status Effects
        this.activeStatusEffects = []; // [{ id: "eff_bleed", duration: 10 }]
    }

    /**
     * Re-runs all FormulaEngine math to update Max HP, Stealth Score, etc.
     * Call this whenever equipment changes or stats increase.
     */
    recalculateStats() {
        // 1. Calculate Base Stats
        this.maxHP = FormulaEngine.calculateMaxHP(this.attributes.VIT, this.attributes.STR);
        
        let athLevel = this.getSkillLevel("sk_ath");
        this.maxStamina = FormulaEngine.calculateMaxStamina(this.attributes.END, this.attributes.VIT, athLevel);

        // 2. Apply Equipment Buffs
        let totalWeight = 0;
        let fashionScore = 0;

        for (let slot in this.equipment) {
            let itemId = this.equipment[slot];
            if (itemId && GameDatabase.Items[itemId]) {
                let itemData = GameDatabase.Items[itemId];
                
                // Add weight & fashion
                if (itemData.Weight_kg) totalWeight += parseFloat(itemData.Weight_kg);
                if (itemData.Fashion_Score) fashionScore += parseInt(itemData.Fashion_Score);

                // Apply Stat Buffs (e.g., "STR:2")
                if (itemData.Buffs) {
                    for (let stat in itemData.Buffs) {
                        // Note: Real implementation would add to a "modifier" list, not base attributes directly
                        // keeping it simple for Alpha.
                    }
                }
            }
        }

        this.currentLoad = totalWeight;
        this.fashionScore = fashionScore;
        
        // 3. Calculate Derived Scores
        let stlLevel = this.getSkillLevel("sk_stl");
        this.stealthScore = FormulaEngine.calculateStealthScore(this.attributes.DEX, stlLevel, totalWeight);
    }

    /**
     * Handles taking damage and checking for Trauma (Horizontal Progression mechanics).
     */
    takeDamage(amount, type) {
        // Apply Damage
        this.currentHP -= amount;
        console.log(`Player took ${amount} damage. HP: ${this.currentHP}/${this.maxHP}`);

        // Check Trauma Threshold
        let threshold = FormulaEngine.calculateTraumaThreshold(this.attributes.VIT, this.attributes.FOR);
        if (amount > threshold) {
            console.warn("Trauma Threshold Exceeded!");
            this.applyTrauma(type);
        }

        if (this.currentHP <= 0) {
            this.die();
        }
    }

    applyTrauma(damageType) {
        // Simple logic: if physical damage > threshold, chance for Fracture or Bleed
        if (damageType === "Physical") {
            let roll = Math.random();
            if (roll > 0.5) this.applyStatusEffect("eff_bleed_01");
            else this.applyStatusEffect("eff_frac_01");
        }
    }

    applyStatusEffect(effectID) {
        let effectData = GameDatabase.Stats[effectID]; // Status effects are in the 'Status' DB
        if (!effectData) return;

        this.activeStatusEffects.push({
            id: effectID,
            duration: effectData.Duration_sec === "Infinite" ? 9999 : parseInt(effectData.Duration_sec)
        });
        console.log(`Applied Status: ${effectData.Name}`);
    }

    getSkillLevel(skillID) {
        if (!this.skills[skillID]) return 0; // Default level 0 if untrain
        return this.skills[skillID].level;
    }
}