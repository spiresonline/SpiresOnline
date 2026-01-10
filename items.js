/**
 * SPIRES ONLINE | ITEM DATABASE (items.js)
 * Alpha 1.3: Expanded Gear, Consumables, and Quest Rewards.
 */

export const ItemDatabase = {
    // --- MISC / TROPHIES ---
    "scrap_metal": {
        id: "scrap_metal",
        name: "Scrap Metal",
        description: "Rusted parts. Worth a few coins.",
        value: 10,
        icon: "⚙️",
        type: "misc"
    },
    "goblin_ear": {
        id: "goblin_ear",
        name: "Goblin Ear",
        description: "A grim trophy from the wilds.",
        value: 15,
        icon: "👂",
        type: "misc"
    },
    "wolf_pelt": {
        id: "wolf_pelt",
        name: "Wolf Pelt",
        description: "Soft fur. Used for crafting.",
        value: 25,
        icon: "🧶",
        type: "misc"
    },

    // --- CONSUMABLES ---
    "health_stim": {
        id: "health_stim",
        name: "Small Stim",
        description: "Restores 30 Health.",
        value: 20,
        icon: "💉",
        type: "consumable",
        onUse: (player) => {
            player.hp = Math.min(player.maxHp, player.hp + 30);
        }
    },
    "medkit": {
        id: "medkit",
        name: "Field Medkit",
        description: "Restores 80 Health.",
        value: 100,
        icon: "❤️",
        type: "consumable",
        onUse: (player) => {
            player.hp = Math.min(player.maxHp, player.hp + 80);
        }
    },
    "mana_crystal": {
        id: "mana_crystal",
        name: "Mana Shard",
        description: "Restores 50 Mana.",
        value: 75,
        icon: "💎",
        type: "consumable",
        onUse: (player) => {
            player.mana = Math.min(player.maxMana, player.mana + 50);
        }
    },

    // --- WEAPONS ---
    "rusty_shiv": {
        id: "rusty_shiv",
        name: "Rusty Shiv",
        description: "Better than nothing.",
        value: 15,
        icon: "🗡️",
        type: "gear",
        slot: "weapon",
        stats: { attack: 3 }
    },
    "steel_sword": {
        id: "steel_sword",
        name: "Steel Sword",
        description: "Standard issue infantry blade.",
        value: 150,
        icon: "⚔️",
        type: "gear",
        slot: "weapon",
        stats: { attack: 10 }
    },
    "plasma_cutter": {
        id: "plasma_cutter",
        name: "Plasma Cutter",
        description: "Industrial tool weaponized.",
        value: 500,
        icon: "⚡",
        type: "gear",
        slot: "weapon",
        stats: { attack: 25 }
    },

    // --- BODY ARMOR ---
    "worn_jacket": {
        id: "worn_jacket",
        name: "Worn Jacket",
        description: "Smells like rain and dirt.",
        value: 40,
        icon: "🧥",
        type: "gear",
        slot: "body",
        stats: { defense: 2 }
    },
    "leather_armor": {
        id: "leather_armor",
        name: "Leather Armor",
        description: "Sturdy hardened leather.",
        value: 120,
        icon: "🦺",
        type: "gear",
        slot: "body",
        stats: { defense: 8 }
    },
    "plate_mail": {
        id: "plate_mail",
        name: "Plate Mail",
        description: "Heavy metal protection.",
        value: 400,
        icon: "🛡️",
        type: "gear",
        slot: "body",
        stats: { defense: 18 }
    },

    // --- HEAD GEAR ---
    "mining_helmet": {
        id: "mining_helmet",
        name: "Mining Helmet",
        description: "Safety first.",
        value: 80,
        icon: "⛑️",
        type: "gear",
        slot: "head",
        stats: { defense: 3 }
    },
    "iron_helm": {
        id: "iron_helm",
        name: "Iron Helm",
        description: "Protects the skull.",
        value: 150,
        icon: "🤺",
        type: "gear",
        slot: "head",
        stats: { defense: 6 }
    },

    // --- LEG GEAR ---
    "cargo_pants": {
        id: "cargo_pants",
        name: "Cargo Pants",
        description: "Lots of pockets.",
        value: 30,
        icon: "👖",
        type: "gear",
        slot: "legs",
        stats: { defense: 1 }
    },
    "alloy_boots": {
        id: "alloy_boots",
        name: "Alloy Boots",
        description: "Magnetic grip soles.",
        value: 200,
        icon: "👢",
        type: "gear",
        slot: "legs",
        stats: { defense: 5, agility: 2 }
    }
};