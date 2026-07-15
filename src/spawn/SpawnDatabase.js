/**
 * SpawnDatabase - Database titik spawn monster per area.
 * Semua data spawn point didefinisikan di sini.
 * Tidak perlu ubah kode utama untuk menambah spawn point baru.
 */
const SpawnDatabase = {
    areas: {
        padang_rumput: [
            {
                id: 'sp_pr_1',
                x: 15, y: 15,
                monsterPool: ['carrot_slime', 'green_slime'],
                radius: 80,
                maxMonsters: 3,
                respawnTime: 8000,
                active: true
            },
            {
                id: 'sp_pr_2',
                x: 40, y: 12,
                monsterPool: ['carrot_slime', 'wild_rabbit'],
                radius: 70,
                maxMonsters: 3,
                respawnTime: 8000,
                active: true
            },
            {
                id: 'sp_pr_3',
                x: 25, y: 35,
                monsterPool: ['green_slime', 'wild_rabbit'],
                radius: 90,
                maxMonsters: 4,
                respawnTime: 10000,
                active: true
            },
            {
                id: 'sp_pr_4',
                x: 45, y: 40,
                monsterPool: ['carrot_slime', 'green_slime', 'wild_rabbit'],
                radius: 75,
                maxMonsters: 3,
                respawnTime: 8000,
                active: true
            },
            {
                id: 'sp_pr_5',
                x: 10, y: 45,
                monsterPool: ['carrot_slime'],
                radius: 60,
                maxMonsters: 2,
                respawnTime: 6000,
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
