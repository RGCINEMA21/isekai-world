/**
 * MonsterData - Definisi semua monster di ISEKAI WORLD.
 * Setiap monster memiliki: stats, drop table, animasi, dan spawn area.
 * Struktur siap mendukung monster baru tanpa ubah kode utama.
 */
const MonsterData = {
    monsters: {
        // ===========================
        // AREA 1: PADANG RUMPUT PEMULA
        // ===========================
        carrot_slime: {
            id: 'carrot_slime',
            name: 'Carrot Slime',
            description: 'Slime berbentuk wortel yang lembut namun mengejutkan.',
            type: 'slime',
            level: 1,
            rarity: 'common',
            sprite: '🟢', // placeholder emoji

            // Base stats (sebelum scaling)
            baseStats: {
                hp: 20,
                damage: 5,
                attackSpeed: 1.0,
                moveSpeed: 40
            },

            // Rewards
            expReward: 10,
            goldReward: 8,
            diamondReward: 0,

            // Drop table
            dropTable: [
                { itemId: 'wortel',        minQty: 1, maxQty: 2, dropRate: 0.6, rarity: 'common' },
                { itemId: 'bibit_wortel',  minQty: 1, maxQty: 1, dropRate: 0.3, rarity: 'common' },
                { itemId: 'rumput',        minQty: 1, maxQty: 3, dropRate: 0.5, rarity: 'common' },
                { itemId: 'potion_h',      minQty: 1, maxQty: 1, dropRate: 0.05, rarity: 'uncommon' }
            ],

            // Spawn info
            spawnAreas: ['padang_rumput'],
            spawnWeight: 40, // kemunculan relatif
            isBoss: false,
            isActive: true,

            // Animation placeholders
            animations: {
                idle: 'carrot_slime_idle',
                walk: 'carrot_slime_walk',
                attack: 'carrot_slime_attack',
                hurt: 'carrot_slime_hurt',
                death: 'carrot_slime_death'
            },

            // Sound placeholders
            sounds: {
                spawn: null,
                attack: null,
                hurt: null,
                death: null
            },

            // Visual config
            visual: {
                baseColor: 0xff8844,
                eyeColor: 0x224422,
                size: 12,
                bounceSpeed: 2
            }
        },

        green_slime: {
            id: 'green_slime',
            name: 'Green Slime',
            description: 'Slime hijau klasik yang sering ditemui di padang rumput.',
            type: 'slime',
            level: 2,
            rarity: 'common',
            sprite: '🟢',

            baseStats: {
                hp: 30,
                damage: 7,
                attackSpeed: 0.8,
                moveSpeed: 35
            },

            expReward: 15,
            goldReward: 10,
            diamondReward: 0,

            dropTable: [
                { itemId: 'rumput',        minQty: 1, maxQty: 3, dropRate: 0.6, rarity: 'common' },
                { itemId: 'kapas',         minQty: 1, maxQty: 2, dropRate: 0.3, rarity: 'common' },
                { itemId: 'potion_h',      minQty: 1, maxQty: 1, dropRate: 0.08, rarity: 'uncommon' },
                { itemId: 'potion_m',      minQty: 1, maxQty: 1, dropRate: 0.05, rarity: 'uncommon' }
            ],

            spawnAreas: ['padang_rumput'],
            spawnWeight: 35,
            isBoss: false,
            isActive: true,

            animations: {
                idle: 'green_slime_idle',
                walk: 'green_slime_walk',
                attack: 'green_slime_attack',
                hurt: 'green_slime_hurt',
                death: 'green_slime_death'
            },

            sounds: {
                spawn: null,
                attack: null,
                hurt: null,
                death: null
            },

            visual: {
                baseColor: 0x44aa44,
                eyeColor: 0x224422,
                size: 14,
                bounceSpeed: 1.8
            }
        },

        wild_rabbit: {
            id: 'wild_rabbit',
            name: 'Wild Rabbit',
            description: 'Kelinci liar yang cepat dan sulit ditangkap.',
            type: 'beast',
            level: 2,
            rarity: 'uncommon',
            sprite: '🐰',

            baseStats: {
                hp: 25,
                damage: 8,
                attackSpeed: 1.5,
                moveSpeed: 80
            },

            expReward: 20,
            goldReward: 12,
            diamondReward: 0,

            dropTable: [
                { itemId: 'daging',        minQty: 1, maxQty: 1, dropRate: 0.4, rarity: 'common' },
                { itemId: 'rumput',        minQty: 1, maxQty: 2, dropRate: 0.5, rarity: 'common' },
                { itemId: 'roti',          minQty: 1, maxQty: 1, dropRate: 0.08, rarity: 'uncommon' },
                { itemId: 'kain',          minQty: 1, maxQty: 1, dropRate: 0.05, rarity: 'uncommon' }
            ],

            spawnAreas: ['padang_rumput'],
            spawnWeight: 25,
            isBoss: false,
            isActive: true,

            animations: {
                idle: 'wild_rabbit_idle',
                walk: 'wild_rabbit_walk',
                attack: 'wild_rabbit_attack',
                hurt: 'wild_rabbit_hurt',
                death: 'wild_rabbit_death'
            },

            sounds: {
                spawn: null,
                attack: null,
                hurt: null,
                death: null
            },

            visual: {
                baseColor: 0xddccaa,
                eyeColor: 0xcc4444,
                size: 10,
                bounceSpeed: 3
            }
        },

        // Placeholder untuk area lain (akan diisi di prompt berikutnya)
        placeholder_monster: {
            id: 'placeholder_monster',
            name: '???',
            description: 'Monster belum tersedia.',
            type: 'slime',
            level: 1,
            rarity: 'common',
            sprite: '❓',

            baseStats: {
                hp: 10,
                damage: 1,
                attackSpeed: 1.0,
                moveSpeed: 30
            },

            expReward: 1,
            goldReward: 1,
            diamondReward: 0,

            dropTable: [],

            spawnAreas: [],
            spawnWeight: 0,
            isBoss: false,
            isActive: false,

            animations: {},
            sounds: {},
            visual: { baseColor: 0x888888, eyeColor: 0x444444, size: 12, bounceSpeed: 1 }
        }
    },

    // ===========================
    // BOSS DATA
    // ===========================
    bosses: {
        // Placeholder boss untuk area 1
        carrot_king: {
            id: 'carrot_king',
            name: '🥕 Carrot King',
            description: 'Raja wortel yang menguasai padang rumput.',
            type: 'plant',
            level: 5,
            rarity: 'rare',
            sprite: '👑',

            baseStats: {
                hp: 200,
                damage: 20,
                attackSpeed: 0.6,
                moveSpeed: 30
            },

            expReward: 100,
            goldReward: 80,
            diamondReward: 2,

            dropTable: [
                { itemId: 'wortel',        minQty: 5, maxQty: 10, dropRate: 0.8, rarity: 'common' },
                { itemId: 'bibit_wortel',  minQty: 2, maxQty: 5, dropRate: 0.5, rarity: 'uncommon' },
                { itemId: 'potion_besar',  minQty: 1, maxQty: 2, dropRate: 0.3, rarity: 'uncommon' },
                { itemId: 'kain',          minQty: 1, maxQty: 3, dropRate: 0.2, rarity: 'uncommon' }
            ],

            spawnAreas: ['padang_rumput'],
            spawnWeight: 0, // Boss tidak spawn random
            isBoss: true,
            isActive: false, // Belum aktif

            bossConfig: {
                respawnTime: 300000, // 5 menit
                skills: ['carrot_throw', 'heal'],
                music: null,
                maxPlayers: 1
            },

            animations: {},
            sounds: {},
            visual: { baseColor: 0xff6600, eyeColor: 0x224422, size: 24, bounceSpeed: 1 }
        }
    },

    /** Dapatkan monster berdasarkan ID */
    getMonster(monsterId) {
        return this.monsters[monsterId] || null;
    },

    /** Dapatkan boss berdasarkan ID */
    getBoss(bossId) {
        return this.bosses[bossId] || null;
    },

    /** Dapatkan semua monster aktif */
    getActiveMonsters() {
        return Object.values(this.monsters).filter(m => m.isActive);
    },

    /** Dapatkan monster berdasarkan area */
    getMonstersByArea(areaId) {
        return Object.values(this.monsters).filter(m => 
            m.isActive && m.spawnAreas.includes(areaId)
        );
    },

    /** Dapatkan monster berdasarkan rarity */
    getMonstersByRarity(rarity) {
        return Object.values(this.monsters).filter(m => 
            m.isActive && m.rarity === rarity
        );
    }
};
