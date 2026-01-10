export class FormulaEngine {

    // --- Derived Stats (from Scaling.csv) ---

    static calculateMaxHP(VIT, STR) {
        // Formula: (VIT * 12) + (STR * 4) + 80
        return (VIT * 12) + (STR * 4) + 80;
    }

    static calculateMaxStamina(END, VIT, ATH_Skill) {
        // Formula: (END * 10) + (VIT * 2) + (ATH_Skill * 1)
        return (END * 10) + (VIT * 2) + (ATH_Skill * 1);
    }

    static calculateMaxSanity(FOR, DIS_Skill) {
        // Formula: (FOR * 8) + (DIS_Skill * 12) + 50
        return (FOR * 8) + (DIS_Skill * 12) + 50;
    }

    static calculateCarryWeight(STR, END) {
        // Formula: (STR * 8) + (END * 4) + 30
        return (STR * 8) + (END * 4) + 30;
    }

    static calculateSocialPower(CHA, FSH_Skill, REP) {
        // Formula: (CHA * 3) + (FSH_Skill * 3) + (REP / 5)
        return (CHA * 3) + (FSH_Skill * 3) + (REP / 5);
    }

    static calculateStealthScore(DEX, STL_Skill, GearWeight) {
        // Formula: (DEX * 2) + (STL_Skill * 2) - (Gear_Weight * 3)
        // High gear weight punishes stealth heavily.
        let score = (DEX * 2) + (STL_Skill * 2) - (GearWeight * 3);
        return Math.max(0, score); // Cannot be negative
    }

    // --- Action Mechanics ---

    static calculateSuccessRate(MainStat, SkillLevel) {
        // Formula: (Main_Stat * 3) + (Skill_Lvl * 5)
        // Returns a percentage (0-100)
        let chance = (MainStat * 3) + (SkillLevel * 5);
        return Math.min(100, Math.max(0, chance));
    }

    static calculateActionSpeed(BaseTimeMs, SkillLevel) {
        // Formula: Base_Time * (1 - (Skill_Lvl * 0.005))
        // Max 50% speed reduction at Level 100
        let reduction = Math.min(0.5, SkillLevel * 0.005);
        return Math.floor(BaseTimeMs * (1 - reduction));
    }

    // --- Combat Math ---

    static calculateMeleeDamage(WeaponDmg, STR, SkillLevel) {
        // Formula: Weapon_Dmg * (1 + (STR * 0.08)) + (Skill * 0.5)
        // STR adds 8% damage per point.
        return (WeaponDmg * (1 + (STR * 0.08))) + (SkillLevel * 0.5);
    }

    static calculateRangedDamage(WeaponDmg, DEX, PER) {
        // Formula: Weapon_Dmg * (1 + (DEX * 0.08)) + (PER * 0.5)
        return (WeaponDmg * (1 + (DEX * 0.08))) + (PER * 0.5);
    }

    static calculateTraumaThreshold(VIT, FOR) {
        // Formula: (VIT * 3) + (FOR * 3)
        // If a single hit deals more damage than this, a Status Effect (Bleed/Fracture) is applied.
        return (VIT * 3) + (FOR * 3);
    }
}