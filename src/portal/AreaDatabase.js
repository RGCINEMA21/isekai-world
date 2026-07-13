/**
 * AreaDatabase - Database semua area monster di Portal.
 * Setiap area memiliki: nama, level req, monster, drop, status.
 * Struktur siap mendukung area baru tanpa ubah UI.
 */
const AreaDatabase = {
    areas: [
        {
            id: 'padang_rumput',
            name: '🌱 Padang Rumput Pemula',
            description: 'Padang rumput hijau untuk petarung pemula.',
            levelRequired: 1,
            recommendedLevel: 1,
            status: 'unlocked',
            monsterCount: 0,
            monsterTypes: [],
            dropTypes: [],
            difficulty: 'Mudah',
            bgColor: 0x4a8a3a,
            icon: '🌱'
        },
        {
            id: 'ladang_wortel',
            name: '🥕 Ladang Wortel',
            description: 'Ladang penuh wortel ajaib dan monster sayuran.',
            levelRequired: 3,
            recommendedLevel: 4,
            status: 'locked',
            monsterCount: 0,
            monsterTypes: [],
            dropTypes: [],
            difficulty: 'Mudah',
            bgColor: 0x6a9a3a,
            icon: '🥕'
        },
        {
            id: 'hutan_hijau',
            name: '🌳 Hutan Hijau',
            description: 'Hutan lebat dengan monster hutan yang kuat.',
            levelRequired: 5,
            recommendedLevel: 6,
            status: 'locked',
            monsterCount: 0,
            monsterTypes: [],
            dropTypes: [],
            difficulty: 'Sedang',
            bgColor: 0x2d7a1e,
            icon: '🌳'
        },
        {
            id: 'pegunungan',
            name: '⛰ Pegunungan Batu',
            description: 'Pegunungan berbatu dengan monster batu keras.',
            levelRequired: 8,
            recommendedLevel: 10,
            status: 'locked',
            monsterCount: 0,
            monsterTypes: [],
            dropTypes: [],
            difficulty: 'Sedang',
            bgColor: 0x8a7a5a,
            icon: '⛰'
        },
        {
            id: 'tambang_mythril',
            name: '💎 Tambang Mythril',
            description: 'Tambang bawah tanha penuh kristal berbahaya.',
            levelRequired: 12,
            recommendedLevel: 14,
            status: 'locked',
            monsterCount: 0,
            monsterTypes: [],
            dropTypes: [],
            difficulty: 'Sulit',
            bgColor: 0x5a4a8a,
            icon: '💎'
        },
        {
            id: 'gunung_api',
            name: '🔥 Gunung Api',
            description: 'Gunung berapi dengan monster api mematikan.',
            levelRequired: 18,
            recommendedLevel: 20,
            status: 'locked',
            monsterCount: 0,
            monsterTypes: [],
            dropTypes: [],
            difficulty: 'Sangat Sulit',
            bgColor: 0xaa3a1a,
            icon: '🔥'
        }
    ],

    /** Dapatkan area berdasarkan ID */
    getArea(areaId) {
        return this.areas.find(a => a.id === areaId);
    },

    /** Dapatkan semua area */
    getAllAreas() {
        return this.areas;
    },

    /** Cek apakah area terbuka berdasarkan level pemain */
    isAreaUnlocked(areaId, playerLevel) {
        const area = this.getArea(areaId);
        if (!area) return false;
        return playerLevel >= area.levelRequired;
    },

    /** Unlock area berdasarkan level */
    checkUnlocks(playerLevel) {
        this.areas.forEach(area => {
            if (playerLevel >= area.levelRequired) {
                area.status = 'unlocked';
            }
        });
    }
};
