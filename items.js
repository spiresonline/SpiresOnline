/**
 * SPIRES ONLINE | ITEM DATABASE (items.js)
 * Master catalog of all items, gear, and consumables.
 */

export const ItemDatabase = {
    "scrap_metal": {
        id: "scrap_metal",
        name: "Scrap Metal",
        description: "Rusted parts from a fallen machine.",
        value: 10,
        icon: "⚙️",
        type: "misc"
    },
    "health_stim": {
        id: "health_stim",
        name: "Medical Stim",
        description: "Restores 25% HP.",
        value: 50,
        icon: "💉",
        type: "consumable",
        onUse: (player) => {
            player.hp = Math.min(player.maxHp, player.hp + 25);
        }
    },
    "tactical_vest": {
        id: "tactical_vest",
        name: "Tactical Vest",
        description: "Reduces incoming damage.",
        value: 200,
        icon: "🦺",
        type: "gear",
        slot: "body",
        stats: { defense: 15 }
    },
    "power_blade": {
        id: "power_blade",
        name: "Power Blade",
        description: "Increases attack damage.",
        value: 450,
        icon: "⚔️",
        type: "gear",
        slot: "weapon",
        stats: { attack: 10 }
    }
};