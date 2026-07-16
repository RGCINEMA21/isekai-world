/**
 * AreaMonsterDatabase - Database monster per area.
 * Mengelola daftar monster yang spawn di setiap area.
 * Struktur siap mendukung area baru tanpa ubah kode utama.
 */
const AreaMonsterDatabase = {
    // ===========================
    // AREA DEFINITIONS
    // ===========================
    areas: {
        padang_rumput: {
            id: 'padang_rumput',
            name: '🌱 Padang Rumput Pemula',
            description: 'Padang rumput hijau untuk petarung pemula.',
            levelRange: { min: 1, max: 3 },
            difficulty: 'Mudah',
            monsters: [
                { monsterId: 'carrot_slime', weight: 40, minLevel: 1, maxLevel: 2 },
                { monsterId: 'green_slime',  weight: 35, minLevel: 1, maxLevel: 3 },
                { monsterId: 'wild_rabbit',  weight: 25, minLevel: 2, maxLevel: 3 }
            ],
            bosses: ['carrot_king'],
            maxMonsters: 15,
            spawnRadius: 200,
            bgColor: 0x4a8a3a,
            music: null,
            ambientSounds: null
        },

        ladang_wortel: {
            id: 'ladang_wortel',
            name: '🥕 Ladang Wortel',
            description: 'Ladang penuh wortel ajaib dan monster sayuran.',
            levelRange: { min: 3, max: 6 },
            difficulty: 'Mudah',
            monsters: [], // Akan diisi di prompt berikutnya
            bosses: [],
            maxMonsters: 18,
            spawnRadius: 220,
            bgColor: 0x6a9a3a,
            music: null,
            ambientSounds: null
        },

        hutan_hijau: {
            id: 'hutan_hijau',
            name: '🌳 Hutan Hijau',
            description: 'Hutan lebat dengan monster hutan yang kuat.',
            levelRange: { min: 5, max: 10 },
            difficulty: 'Sedang',
            monsters: [],
            bosses: [],
            maxMonsters: 20,
            spawnRadius: 250,
            bgColor: 0x2d7a1e,
            music: null,
            ambientSounds: null
        },

        pegunungan: {
            id: 'pegunungan',
            name: '⛰ Pegunungan Batu',
            description: 'Pegunungan berbatu dengan monster batu keras.',
            levelRange: { min: 8, max: 15 },
            difficulty: 'Sedang',
            monsters: [],
            bosses: [],
            maxMonsters: 15,
            spawnRadius: 200,
            bgColor: 0x8a7a5a,
            music: null,
            ambientSounds: null
        },

        tambang_mythril: {
            id: 'tambang_mythril',
            name: '💎 Tambang Mythril',
            description: 'Tambang bawah tanha penuh kristal berbahaya.',
            levelRange: { min: 12, max: 20 },
            difficulty: 'Sulit',
            monsters: [],
            bosses: [],
            maxMonsters: 12,
            spawnRadius: 180,
            bgColor: 0x5a4a8a,
            music: null,
            ambientSounds: null
        },

        gunung_api: {
            id: 'gunung_api',
            name: '🔥 Gunung Api',
            description: 'Gunung berapi dengan monster api mematikan.',
            levelRange: { min: 18, max: 30 },
            difficulty: 'Sangat Sulit',
            monsters: [],
            bosses: [],
            maxMonsters: 10,
            spawnRadius: 160,
            bgColor: 0xaa3a1a,
            music: null,
            ambientSounds: null
        }
    },

    /** Dapatkan data area monster */
    getArea(areaId) {
        return this.areas[areaId] || null;
    },

    /** Dapatkan semua area */
    getAllAreas() {
        return Object.values(this.areas);
    },

    /** Dapatkan daftar monster untuk area */
    getMonstersForArea(areaId) {
        const area = this.getArea(areaId);
        if (!area) return [];

        return area.monsters.map(m => {
            const monsterData = MonsterData.getMonster(m.monsterId);
            return {
                ...m,
                data: monsterData
            };
        }).filter(m => m.data);
    },

    /** Dapatkan boss untuk area */
    getBossesForArea(areaId) {
        const area = this.getArea(areaId);
        if (!area) return [];

        return area.bosses.map(bossId => {
            const bossData = MonsterData.getBoss(bossId);
            return bossData;
        }).filter(b => b);
    },

    /** Roll monster spawn berdasarkan weight */
    rollMonsterSpawn(areaId, playerLevel) {
        const area = this.getArea(areaId);
        if (!area) return null;

        // Filter monster yang sesuai level
        const eligible = area.monsters.filter(m => 
            playerLevel >= m.minLevel && playerLevel <= m.maxLevel
        );

        if (eligible.length === 0) return null;

        // Hitung total weight
        const totalWeight = eligible.reduce((sum, m) => sum + m.weight, 0);
        let roll = Math.random() * totalWeight;

        for (const m of eligible) {
            roll -= m.weight;
            if (roll <= 0) {
                return MonsterData.getMonster(m.monsterId);
            }
        }

        return MonsterData.getMonster(eligible[0].monsterId);
    },

    /** Tambah monster ke area */
    addMonsterToArea(areaId, monsterId, weight, minLevel, maxLevel) {
        const area = this.getArea(areaId);
        if (!area) return false;

        area.monsters.push({
            monsterId,
            weight: weight || 25,
            minLevel: minLevel || 1,
            maxLevel: maxLevel || 10
        });
        return true;
    },

    /** Tambah area baru */
    addArea(areaData) {
        if (this.areas[areaData.id]) return false;
        this.areas[areaData.id] = {
            id: areaData.id,
            name: areaData.name,
            description: areaData.description || '',
            levelRange: areaData.levelRange || { min: 1, max: 10 },
            difficulty: areaData.difficulty || 'Mudah',
            monsters: [],
            bosses: [],
            maxMonsters: areaData.maxMonsters || 15,
            spawnRadius: areaData.spawnRadius || 200,
            bgColor: areaData.bgColor || 0x4a8a3a,
            music: null,
            ambientSounds: null
        };
        return true;
    }
};
