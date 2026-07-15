/**
 * MonsterAreaDatabase - Database semua 10 Area Monster.
 * Struktur modular: tambah area baru cukup dengan menambah data.
 * Unlock berdasarkan Level Karakter.
 */
const MonsterAreaDatabase = {
    areas: [
        {
            id: 'beginner_grassland',
            name: 'Beginner Grassland',
            icon: '🌱',
            description: 'Padang rumput hijau untuk petarung pemula.',
            levelRequired: 1,
            recommendedLevel: 1,
            mapWidth: 25,
            mapHeight: 25,
            spawnX: 12,
            spawnY: 22,
            theme: 'grassland',
            bgColor: 0x5a9a3a,
            monsters: [
                { id: 'green_slime', name: 'Green Slime', level: [1,2], weight: 40 },
                { id: 'carrot_slime', name: 'Carrot Slime', level: [1,3], weight: 35 },
                { id: 'wild_rabbit', name: 'Wild Rabbit', level: [2,3], weight: 25 }
            ],
            boss: { id: 'big_slime', name: 'Big Slime', level: 5, respawnTime: 300000 },
            drops: [
                { itemId: 'bibit_wortel', min: 1, max: 3, rate: 0.5 },
                { itemId: 'kayu', min: 1, max: 5, rate: 0.4 },
                { itemId: 'batu', min: 1, max: 3, rate: 0.3 }
            ],
            goldReward: [5, 15],
            expReward: [8, 20]
        },
        {
            id: 'carrot_valley',
            name: 'Carrot Valley',
            icon: '🥕',
            description: 'Ladang wortel ajaib dengan monster sayuran.',
            levelRequired: 3,
            recommendedLevel: 4,
            mapWidth: 25,
            mapHeight: 25,
            spawnX: 12,
            spawnY: 22,
            theme: 'valley',
            bgColor: 0x7aaa3a,
            monsters: [
                { id: 'giant_carrot', name: 'Giant Carrot', level: [3,5], weight: 35 },
                { id: 'angry_rabbit', name: 'Angry Rabbit', level: [3,6], weight: 35 },
                { id: 'carrot_golem', name: 'Carrot Golem', level: [4,6], weight: 30 }
            ],
            boss: { id: 'carrot_king', name: 'Carrot King', level: 8, respawnTime: 300000 },
            drops: [
                { itemId: 'bibit_tomat', min: 1, max: 2, rate: 0.4 },
                { itemId: 'bibit_gandum', min: 1, max: 3, rate: 0.45 },
                { itemId: 'wortel', min: 2, max: 5, rate: 0.6 }
            ],
            goldReward: [10, 25],
            expReward: [15, 35]
        },
        {
            id: 'mystic_forest',
            name: 'Mystic Forest',
            icon: '🌲',
            description: 'Hutan ajaib dipenuhi roh dan makhluk mistis.',
            levelRequired: 6,
            recommendedLevel: 7,
            mapWidth: 25,
            mapHeight: 25,
            spawnX: 12,
            spawnY: 22,
            theme: 'forest',
            bgColor: 0x2d6a1e,
            monsters: [
                { id: 'tree_spirit', name: 'Tree Spirit', level: [6,8], weight: 30 },
                { id: 'mushroom_beast', name: 'Mushroom Beast', level: [6,9], weight: 40 },
                { id: 'forest_wolf', name: 'Forest Wolf', level: [7,10], weight: 30 }
            ],
            boss: { id: 'ancient_treant', name: 'Ancient Treant', level: 12, respawnTime: 420000 },
            drops: [
                { itemId: 'bibit_apel', min: 1, max: 2, rate: 0.35 },
                { itemId: 'kayu', min: 3, max: 8, rate: 0.6 },
                { itemId: 'rumput', min: 2, max: 5, rate: 0.5 }
            ],
            goldReward: [15, 35],
            expReward: [25, 50]
        },
        {
            id: 'rocky_canyon',
            name: 'Rocky Canyon',
            icon: '⛰',
            description: 'Pegunungan berbatu dengan golem batu.',
            levelRequired: 10,
            recommendedLevel: 12,
            mapWidth: 25,
            mapHeight: 25,
            spawnX: 12,
            spawnY: 22,
            theme: 'canyon',
            bgColor: 0x8a7a5a,
            monsters: [
                { id: 'rock_golem', name: 'Rock Golem', level: [10,13], weight: 35 },
                { id: 'stone_beetle', name: 'Stone Beetle', level: [10,14], weight: 35 },
                { id: 'mountain_boar', name: 'Mountain Boar', level: [11,15], weight: 30 }
            ],
            boss: { id: 'stone_titan', name: 'Stone Titan', level: 18, respawnTime: 480000 },
            drops: [
                { itemId: 'iron', min: 1, max: 4, rate: 0.4 },
                { itemId: 'batu', min: 3, max: 8, rate: 0.6 },
                { itemId: 'gold_ore', min: 1, max: 2, rate: 0.15 }
            ],
            goldReward: [25, 50],
            expReward: [40, 75]
        },
        {
            id: 'frost_mountain',
            name: 'Frost Mountain',
            icon: '❄',
            description: 'Gunung salju yang membeku dan berbahaya.',
            levelRequired: 15,
            recommendedLevel: 17,
            mapWidth: 25,
            mapHeight: 25,
            spawnX: 12,
            spawnY: 22,
            theme: 'frost',
            bgColor: 0x88aacc,
            monsters: [
                { id: 'frost_slime', name: 'Frost Slime', level: [15,17], weight: 35 },
                { id: 'ice_wolf', name: 'Ice Wolf', level: [15,18], weight: 35 },
                { id: 'snow_spirit', name: 'Snow Spirit', level: [16,20], weight: 30 }
            ],
            boss: { id: 'frost_giant', name: 'Frost Giant', level: 22, respawnTime: 480000 },
            drops: [
                { itemId: 'ice_crystal', min: 1, max: 3, rate: 0.3 },
                { itemId: 'frost_core', min: 1, max: 2, rate: 0.2 }
            ],
            goldReward: [35, 70],
            expReward: [60, 110]
        },
        {
            id: 'volcano_crater',
            name: 'Volcano Crater',
            icon: '🌋',
            description: 'Gunung berapi dengan monster api mematikan.',
            levelRequired: 20,
            recommendedLevel: 22,
            mapWidth: 25,
            mapHeight: 25,
            spawnX: 12,
            spawnY: 22,
            theme: 'volcano',
            bgColor: 0xcc4422,
            monsters: [
                { id: 'fire_salamander', name: 'Fire Salamander', level: [20,23], weight: 35 },
                { id: 'lava_slime', name: 'Lava Slime', level: [20,24], weight: 35 },
                { id: 'flame_bat', name: 'Flame Bat', level: [21,25], weight: 30 }
            ],
            boss: { id: 'volcano_dragon', name: 'Volcano Dragon', level: 28, respawnTime: 600000 },
            drops: [
                { itemId: 'lava_core', min: 1, max: 3, rate: 0.3 },
                { itemId: 'fire_crystal', min: 1, max: 2, rate: 0.2 }
            ],
            goldReward: [50, 100],
            expReward: [80, 150]
        },
        {
            id: 'mythril_cave',
            name: 'Mythril Cave',
            icon: '💎',
            description: 'Gua Mythril penuh kristal berbahaya.',
            levelRequired: 25,
            recommendedLevel: 27,
            mapWidth: 25,
            mapHeight: 25,
            spawnX: 12,
            spawnY: 22,
            theme: 'cave',
            bgColor: 0x443366,
            monsters: [
                { id: 'mythril_golem', name: 'Mythril Golem', level: [25,28], weight: 35 },
                { id: 'crystal_spider', name: 'Crystal Spider', level: [25,29], weight: 35 },
                { id: 'cave_bat', name: 'Cave Bat', level: [26,30], weight: 30 }
            ],
            boss: { id: 'mythril_guardian', name: 'Mythril Guardian', level: 35, respawnTime: 600000 },
            drops: [
                { itemId: 'iron', min: 3, max: 8, rate: 0.4 },
                { itemId: 'gold_ore', min: 2, max: 4, rate: 0.25 },
                { itemId: 'crystal', min: 1, max: 3, rate: 0.15 }
            ],
            goldReward: [60, 120],
            expReward: [100, 180]
        },
        {
            id: 'crystal_ruins',
            name: 'Crystal Ruins',
            icon: '🌌',
            description: 'Reruntuhan kuno dipenuhi kristal ajaib.',
            levelRequired: 30,
            recommendedLevel: 32,
            mapWidth: 25,
            mapHeight: 25,
            spawnX: 12,
            spawnY: 22,
            theme: 'ruins',
            bgColor: 0x554488,
            monsters: [
                { id: 'crystal_slime', name: 'Crystal Slime', level: [30,33], weight: 35 },
                { id: 'magic_golem', name: 'Magic Golem', level: [30,34], weight: 35 },
                { id: 'crystal_fairy', name: 'Crystal Fairy', level: [31,35], weight: 30 }
            ],
            boss: { id: 'crystal_emperor', name: 'Crystal Emperor', level: 40, respawnTime: 720000 },
            drops: [
                { itemId: 'mythril', min: 1, max: 3, rate: 0.2 },
                { itemId: 'crystal', min: 2, max: 5, rate: 0.35 },
                { itemId: 'gold_ore', min: 2, max: 5, rate: 0.3 }
            ],
            goldReward: [80, 160],
            expReward: [130, 220]
        },
        {
            id: 'dark_swamp',
            name: 'Dark Swamp',
            icon: '☠',
            description: 'Rawa gelap beracun dan penuh bayangan.',
            levelRequired: 35,
            recommendedLevel: 37,
            mapWidth: 25,
            mapHeight: 25,
            spawnX: 12,
            spawnY: 22,
            theme: 'swamp',
            bgColor: 0x2a3a2a,
            monsters: [
                { id: 'poison_slime', name: 'Poison Slime', level: [35,38], weight: 35 },
                { id: 'dark_frog', name: 'Dark Frog', level: [35,39], weight: 35 },
                { id: 'shadow_beast', name: 'Shadow Beast', level: [36,40], weight: 30 }
            ],
            boss: { id: 'swamp_hydra', name: 'Swamp Hydra', level: 45, respawnTime: 720000 },
            drops: [
                { itemId: 'iron', min: 3, max: 8, rate: 0.3 },
                { itemId: 'gold_ore', min: 3, max: 6, rate: 0.25 },
                { itemId: 'crystal', min: 2, max: 4, rate: 0.2 }
            ],
            goldReward: [100, 200],
            expReward: [160, 280]
        },
        {
            id: 'dragon_sanctuary',
            name: 'Dragon Sanctuary',
            icon: '🐉',
            description: 'Sarang naga kuno, area paling berbahaya.',
            levelRequired: 40,
            recommendedLevel: 42,
            mapWidth: 25,
            mapHeight: 25,
            spawnX: 12,
            spawnY: 22,
            theme: 'dragon',
            bgColor: 0x3a1a2a,
            monsters: [
                { id: 'baby_dragon', name: 'Baby Dragon', level: [40,43], weight: 30 },
                { id: 'dragon_soldier', name: 'Dragon Soldier', level: [40,44], weight: 40 },
                { id: 'dragon_mage', name: 'Dragon Mage', level: [41,45], weight: 30 }
            ],
            boss: { id: 'ancient_dragon', name: 'Ancient Dragon', level: 50, respawnTime: 900000 },
            drops: [
                { itemId: 'mythril', min: 2, max: 5, rate: 0.3 },
                { itemId: 'crystal', min: 3, max: 6, rate: 0.35 },
                { itemId: 'gold_ore', min: 3, max: 8, rate: 0.3 }
            ],
            goldReward: [150, 300],
            expReward: [200, 400]
        }
    ],

    getArea(areaId) {
        return this.areas.find(a => a.id === areaId) || null;
    },

    getAllAreas() {
        return this.areas;
    },

    isUnlocked(areaId, playerLevel) {
        const area = this.getArea(areaId);
        if (!area) return false;
        return playerLevel >= area.levelRequired;
    },

    getUnlockedAreas(playerLevel) {
        return this.areas.filter(a => playerLevel >= a.levelRequired);
    },

    getNextLockedArea(playerLevel) {
        return this.areas.find(a => playerLevel < a.levelRequired);
    },

    getAreaConfig(areaId) {
        const area = this.getArea(areaId);
        if (!area) return null;
        return {
            areaId: area.id,
            areaName: area.name,
            mapWidth: area.mapWidth,
            mapHeight: area.mapHeight,
            spawnX: area.spawnX,
            spawnY: area.spawnY,
            theme: area.theme
        };
    }
};
