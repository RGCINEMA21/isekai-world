/**
 * MonsterLoader - Utility untuk memuat dan mengelola data monster.
 * Menyediakan API tingkat tinggi untuk sistem lain (combat, spawn, dll).
 * Semua sistem harus menggunakan MonsterLoader sebagai satu-satunya akses ke data monster.
 */
const MonsterLoader = {
    /** Cache monster yang sudah di-load */
    _cache: new Map(),

    /**
     * Load dan cache data monster
     * @param {string} monsterId - ID monster
     * @param {number} level - Level monster
     * @returns {Object} Data monster
     */
    load(monsterId, level = 1) {
        const key = `${monsterId}_${level}`;
        if (this._cache.has(key)) {
            return this._cache.get(key);
        }

        const data = MonsterDatabase.getMonsterInfo(monsterId, level);
        if (data) {
            this._cache.set(key, data);
        }
        return data;
    },

    /**
     * Load boss
     * @param {string} bossId - ID boss
     * @param {number} level - Level boss
     * @returns {Object} Data boss
     */
    loadBoss(bossId, level = 1) {
        const key = `boss_${bossId}_${level}`;
        if (this._cache.has(key)) {
            return this._cache.get(key);
        }

        const data = MonsterDatabase.getBossInfo(bossId, level);
        if (data) {
            this._cache.set(key, data);
        }
        return data;
    },

    /**
     * Spawn random monster di area
     * @param {string} areaId - ID area
     * @param {number} playerLevel - Level pemain
     * @returns {Object} Data monster yang di-spawn
     */
    spawnRandom(areaId, playerLevel) {
        const data = MonsterDatabase.rollSpawn(areaId, playerLevel);
        if (data) {
            const key = `spawn_${areaId}_${Date.now()}`;
            this._cache.set(key, data);
        }
        return data;
    },

    /**
     * Hitung drops dari monster
     * @param {string} monsterId - ID monster
     * @param {number} monsterLevel - Level monster
     * @param {number} playerLevel - Level pemain
     * @returns {Array} Drops
     */
    getDrops(monsterId, monsterLevel, playerLevel) {
        return MonsterDatabase.rollMonsterDrops(monsterId, monsterLevel, playerLevel);
    },

    /**
     * Cek apakah monster adalah boss
     * @param {string} monsterId - ID monster
     * @returns {boolean}
     */
    isBoss(monsterId) {
        const data = MonsterData.getMonster(monsterId);
        return data ? data.isBoss : false;
    },

    /**
     * Dapatkan info singkat untuk UI
     * @param {string} monsterId - ID monster
     * @param {number} level - Level monster
     * @returns {Object} Info singkat
     */
    getQuickInfo(monsterId, level = 1) {
        const data = this.load(monsterId, level);
        if (!data) return null;

        return {
            id: data.id,
            name: data.name,
            level: data.level,
            rarity: data.rarity,
            rarityColor: data.rarityData.color,
            hp: data.stats.hp,
            damage: data.stats.damage,
            exp: data.stats.expReward,
            gold: data.stats.goldReward,
            sprite: data.sprite
        };
    },

    /**
     * Dapatkan preview area untuk portal UI
     * @param {string} areaId - ID area
     * @returns {Object} Preview data
     */
    getAreaPreview(areaId) {
        const summary = MonsterDatabase.getAreaSummary(areaId);
        if (!summary) return null;

        return {
            ...summary,
            monsterPreview: summary.monsters.slice(0, 5).map(m => ({
                name: m.name,
                sprite: m.sprite,
                rarity: m.rarity,
                color: MonsterConfig.getRarity(m.rarity).color
            }))
        };
    },

    /**
     * Clear cache
     */
    clearCache() {
        this._cache.clear();
    },

    /**
     * Dapatkan jumlah monster di cache
     * @returns {number}
     */
    getCacheSize() {
        return this._cache.size;
    }
};
