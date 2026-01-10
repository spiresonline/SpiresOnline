/**
 * SPIRES ONLINE | ITEM DATABASE (items.js)
 * Alpha 1.2: Expanded Catalog with Full Gear Sets.
 */

export const ItemDatabase = {
    // --- MISC / LOOT ---
    "scrap_metal": {
        id: "scrap_metal",
        name: "Scrap Metal",
        description: "Rusted parts. Can be sold for Gold.",
        value: 10,
        icon: "⚙️",
        type: "misc"
    },
    "wolf_pelt": {
        id: "wolf_pelt",
        name: "Wolf Pelt",
        description: "Soft fur from a wild beast.",
        value: 25,
        icon: "🧶",
        type: "misc"
    },

    // --- CONSUMABLES ---
    "health_stim": {
        id: "health_stim",
        name: "Medical Stim",
        description: "Restores 50 Health.",
        value: 50,
        icon: "💉",
        type: "consumable",
        onUse: (player) => {
            const oldHp = player.hp;
            player.hp = Math.min(player.maxHp, player.hp + 50);
            // Return true/false or handle sound here in future
        }
    },
    "mana_crystal": {
        id: "mana_crystal",
        name: "Mana Crystal",
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
        description: "Better than fists, but barely.",
        value: 15,
        icon: "🗡️",
        type: "gear",
        slot: "weapon",
        stats: { attack: 5 }
    },
    "power_blade": {
        id: "power_blade",
        name: "Power Blade",
        description: "Vibrating edge that cuts steel.",
        value: 450,
        icon: "⚔️",
        type: "gear",
        slot: "weapon",
        stats: { attack: 15 }
    },

    // --- BODY ARMOR ---
    "worn_jacket": {
        id: "worn_jacket",
        name: "Worn Jacket",
        description: "Offers minimal protection.",
        value: 40,
        icon: "🧥",
        type: "gear",
        slot: "body",
        stats: { defense: 5 }
    },
    "tactical_vest": {
        id: "tactical_vest",
        name: "Tactical Vest",
        description: "Ballistic weave armor.",
        value: 200,
        icon: "🦺",
        type: "gear",
        slot: "body",
        stats: { defense: 15 }
    },

    // --- HEAD GEAR ---
    "mining_helmet": {
        id: "mining_helmet",
        name: "Mining Helmet",
        description: "Protects the noggin.",
        value: 80,
        icon: "⛑️",
        type: "gear",
        slot: "head",
        stats: { defense: 5 }
    },
    "cyber_visor": {
        id: "cyber_visor",
        name: "Cyber Visor",
        description: "Enhances aim and protects eyes.",
        value: 300,
        icon: "🥽",
        type: "gear",
        slot: "head",
        stats: { defense: 8, attack: 2 } // Multi-stat item
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
        stats: { defense: 2 }
    },
    "reinforced_boots": {
        id: "reinforced_boots",
        name: "Alloy Boots",
        description: "Heavy boots for heavy steps.",
        value: 150,
        icon: "👢",
        type: "gear",
        slot: "legs",
        stats: { defense: 8 }
    }
};