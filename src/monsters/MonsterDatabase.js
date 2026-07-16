/**
 * MonsterDatabase - Database utama monster ISEKAI WORLD.
 * Pusat seluruh data monster yang digunakan oleh semua sistem.
 * Menggabungkan MonsterData, AreaMonsterDatabase, dan DropTable.
 */
const MonsterDatabase = {
    /**
     * Dapatkan info lengkap monster (stats final berdasarkan level)
     * @param {string} monsterId - ID monster
     * @param {number} level - Level monster yang spawn
     * @returns {Object|null} Data monster lengkap
     */
    getMonsterInfo(monsterId, level = 1) {
        const base = MonsterData.getMonster(monsterId);
        if (!base) return null;

        // Hitung stats final
        const stats = MonsterConfig.calculateStats(base.baseStats, level, base.rarity);

        return {
            id: base.id,
            name: base.name,
            description: base.description,
            type: base.type,
            level: level,
            rarity: base.rarity,
            rarityData: MonsterConfig.getRarity(base.rarity),
            sprite: base.sprite,
            stats: stats,
            expReward: stats.expReward,
            goldReward: stats.goldReward,
            diamondReward: base.diamondReward,
            dropTable: new DropTable(base.dropTable),
            spawnAreas: base.spawnAreas,
            isBoss: base.isBoss,
            isActive: base.isActive,
            animations: base.animations,
            sounds: base.sounds,
            visual: base.visual
        };
    },

    /**
     * Dapatkan info boss
     * @param {string} bossId - ID boss
     * @param {number} level - Level boss
     * @returns {Object|null} Data boss lengkap
     */
    getBossInfo(bossId, level = 1) {
        const base = MonsterData.getBoss(bossId);
        if (!base) return null;

        const cfg = MonsterConfig.bossConfig;
        const stats = MonsterConfig.calculateStats(base.baseStats, level, base.rarity);

        // Boss multiplier
        stats.hp = Math.floor(stats.hp * cfg.hpMultiplier);
        stats.damage = Math.floor(stats.damage * cfg.damageMultiplier);

        return {
            id: base.id,
            name: base.name,
            description: base.description,
            type: base.type,
            level: level,
            rarity: base.rarity,
            rarityData: MonsterConfig.getRarity(base.rarity),
            sprite: base.sprite,
            stats: stats,
            expReward: Math.floor(stats.expReward * cfg.expMultiplier),
            goldReward: Math.floor(stats.goldReward * cfg.goldMultiplier),
            diamondReward: base.diamondReward,
            dropTable: new DropTable(base.dropTable),
            spawnAreas: base.spawnAreas,
            isBoss: true,
            bossConfig: base.bossConfig,
            animations: base.animations,
            sounds: base.sounds,
            visual: base.visual
        };
    },

    /**
     * Roll drops dari monster
     * @param {string} monsterId - ID monster
     * @param {number} monsterLevel - Level monster
     * @param {number} playerLevel - Level pemain
     * @returns {Array} Daftar item yang drop
     */
    rollMonsterDrops(monsterId, monsterLevel, playerLevel) {
        const base = MonsterData.getMonster(monsterId);
        if (!base) return [];

        const dropTable = new DropTable(base.dropTable);
        return dropTable.rollDrops(playerLevel);
    },

    /**
     * Dapatkan semua monster yang bisa spawn di area
     * @param {string} areaId - ID area
     * @param {number} playerLevel - Level pemain
     * @returns {Array} Daftar monster eligible
     */
    getSpawnableMonsters(areaId, playerLevel) {
        const entries = AreaMonsterDatabase.getMonstersForArea(areaId);
        return entries.filter(e => {
            return playerLevel >= e.minLevel && playerLevel <= e.maxLevel;
        });
    },

    /**
     * Roll random monster spawn untuk area
     * @param {string} areaId - ID area
     * @param {number} playerLevel - Level pemain
     * @returns {Object|null} Monster yang dipilih
     */
    rollSpawn(areaId, playerLevel) {
        const entries = AreaMonsterDatabase.getMonstersForArea(areaId);
        const eligible = entries.filter(e => 
            playerLevel >= e.minLevel && playerLevel <= e.maxLevel
        );

        if (eligible.length === 0) return null;

        const totalWeight = eligible.reduce((sum, e) => sum + e.weight, 0);
        let roll = Math.random() * totalWeight;

        for (const e of eligible) {
            roll -= e.weight;
            if (roll <= 0) {
                // Random level dalam range
                const monsterLevel = Phaser.Math.Between(e.minLevel, e.maxLevel);
                return this.getMonsterInfo(e.monsterId, monsterLevel);
            }
        }

        const fallback = eligible[0];
        return this.getMonsterInfo(fallback.monsterId, fallback.minLevel);
    },

    /**
     * Dapatkan summary area untuk UI
     * @param {string} areaId - ID area
     * @returns {Object|null} Info ringkas area
     */
    getAreaSummary(areaId) {
        const area = AreaMonsterDatabase.getArea(areaId);
        if (!area) return null;

        const monsters = area.monsters.map(m => {
            const data = MonsterData.getMonster(m.monsterId);
            return data ? { id: m.monsterId, name: data.name, sprite: data.sprite, rarity: data.rarity } : null;
        }).filter(Boolean);

        const bosses = area.bosses.map(bossId => {
            const data = MonsterData.getBoss(bossId);
            return data ? { id: bossId, name: data.name, sprite: data.sprite, rarity: data.rarity } : null;
        }).filter(Boolean);

        return {
            id: area.id,
            name: area.name,
            description: area.description,
            levelRange: area.levelRange,
            difficulty: area.difficulty,
            monsters: monsters,
            bosses: bosses,
            maxMonsters: area.maxMonsters
        };
    },

    /**
     * Dapatkan semua monster aktif
     * @returns {Array} Daftar semua monster aktif
     */
    getAllActiveMonsters() {
        return MonsterData.getActiveMonsters().map(m => ({
            id: m.id,
            name: m.name,
            sprite: m.sprite,
            type: m.type,
            rarity: m.rarity,
            level: m.level,
            spawnAreas: m.spawnAreas
        }));
    },

    /**
     * Statistik database
     * @returns {Object} Statistik
     */
    getStats() {
        const monsters = Object.values(MonsterData.monsters).filter(m => m.isActive);
        const bosses = Object.values(MonsterData.bosses);
        const areas = Object.values(AreaMonsterDatabase.areas);

        return {
            totalMonsters: monsters.length,
            totalBosses: bosses.length,
            totalAreas: areas.length,
            activeAreas: areas.filter(a => a.monsters.length > 0).length,
            rarityDistribution: {
                common: monsters.filter(m => m.rarity === 'common').length,
                uncommon: monsters.filter(m => m.rarity === 'uncommon').length,
                rare: monsters.filter(m => m.rarity === 'rare').length,
                epic: monsters.filter(m => m.rarity === 'epic').length,
                legendary: monsters.filter(m => m.rarity === 'legendary').length,
                mythic: monsters.filter(m => m.rarity === 'mythic').length
            }
        };
    }
};
