/**
 * SpawnDatabase - Database titik spawn monster per area.
 * Semua data spawn point didefinisikan di sini.
 * Tidak perlu ubah kode utama untuk menambah spawn point baru.
 */
const SpawnDatabase = {
    areas: {
        beginner_grassland: [
            {
                id: 'sp_bg_1',
                x: 10, y: 12,
                monsterPool: ['carrot_slime', 'green_slime'],
                radius: 50,
                maxMonsters: 3,
                respawnTime: 8000,
                active: true
            },
            {
                id: 'sp_bg_2',
                x: 22, y: 8,
                monsterPool: ['carrot_slime', 'wild_rabbit'],
                radius: 50,
                maxMonsters: 3,
                respawnTime: 8000,
                active: true
            },
            {
                id: 'sp_bg_3',
                x: 8, y: 20,
                monsterPool: ['green_slime', 'wild_rabbit'],
                radius: 50,
                maxMonsters: 3,
                respawnTime: 10000,
                active: true
            },
            {
                id: 'sp_bg_4',
                x: 20, y: 18,
                monsterPool: ['carrot_slime', 'green_slime', 'wild_rabbit'],
                radius: 50,
                maxMonsters: 3,
                respawnTime: 8000,
                active: true
            }
        ]
    },

    /**
     * Dapatkan semua spawn point untuk area
     * @param {string} areaId
     * @returns {Array}
     */
    getSpawnPoints(areaId) {
        return this.areas[areaId] || [];
    },

    /**
     * Tambah spawn point ke area
     * @param {string} areaId
     * @param {Object} spawnData
     */
    addSpawnPoint(areaId, spawnData) {
        if (!this.areas[areaId]) this.areas[areaId] = [];
        this.areas[areaId].push(spawnData);
    }
};
