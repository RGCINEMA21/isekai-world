/**
 * MonsterConfig - Konfigurasi dan konstanta untuk sistem monster.
 * Berisi rarity system, base stats, dan pengaturan global.
 */
const MonsterConfig = {
    // === RARITY SYSTEM ===
    rarity: {
        common:    { id: 'common',    name: 'Common',    color: '#aaaaaa', multiplier: 1.0 },
        uncommon:  { id: 'uncommon',  name: 'Uncommon',  color: '#44cc44', multiplier: 1.2 },
        rare:      { id: 'rare',      name: 'Rare',      color: '#4488ff', multiplier: 1.5 },
        epic:      { id: 'epic',      name: 'Epic',      color: '#aa44ff', multiplier: 2.0 },
        legendary: { id: 'legendary', name: 'Legendary', color: '#ffaa00', multiplier: 3.0 },
        mythic:    { id: 'mythic',    name: 'Mythic',    color: '#ff4444', multiplier: 5.0 }
    },

    // === BASE STATS ===
    baseStats: {
        hp: 10,
        damage: 5,
        attackSpeed: 1.0,
        moveSpeed: 60,
        expReward: 10,
        goldReward: 5
    },

    // === LEVEL SCALING ===
    scaling: {
        hpPerLevel: 8,
        damagePerLevel: 3,
        expPerLevel: 5,
        goldPerLevel: 3
    },

    // === DROP TABLE DEFAULTS ===
    dropDefaults: {
        baseDropRate: 0.5,
        rareDropRate: 0.1,
        epicDropRate: 0.02,
        legendaryDropRate: 0.005
    },

    // === BOSS CONFIG ===
    bossConfig: {
        hpMultiplier: 10,
        damageMultiplier: 3,
        expMultiplier: 5,
        goldMultiplier: 5,
        respawnTime: 3600000, // 1 jam dalam ms
        maxPlayers: 1
    },

    // === MONSTER TYPES ===
    types: {
        slime:  { name: 'Slime',  icon: '🟢' },
        beast:  { name: 'Beast',  icon: '🐾' },
        plant:  { name: 'Plant',  icon: '🌿' },
        undead: { name: 'Undead', icon: '💀' },
        dragon: { name: 'Dragon', icon: '🐉' },
        demon:  { name: 'Demon',  icon: '👹' },
        spirit: { name: 'Spirit', icon: '👻' },
        golem:  { name: 'Golem',  icon: '🗿' },
        insect: { name: 'Insect', icon: '🐛' },
        aquatic:{ name: 'Aquatic',icon: '🐟' }
    },

    // === ANIMATION STATES ===
    animations: {
        idle:    'idle',
        walk:    'walk',
        attack:  'attack',
        hurt:    'hurt',
        death:   'death'
    },

    /** Dapatkan data rarity */
    getRarity(rarityId) {
        return this.rarity[rarityId] || this.rarity.common;
    },

    /** Dapatkan multiplier rarity */
    getRarityMultiplier(rarityId) {
        return this.getRarity(rarityId).multiplier;
    },

    /** Hitung stats monster berdasarkan level dan rarity */
    calculateStats(baseStats, level, rarityId) {
        const mult = this.getRarityMultiplier(rarityId);
        return {
            hp: Math.floor((baseStats.hp + this.scaling.hpPerLevel * (level - 1)) * mult),
            damage: Math.floor((baseStats.damage + this.scaling.damagePerLevel * (level - 1)) * mult),
            attackSpeed: baseStats.attackSpeed,
            moveSpeed: baseStats.moveSpeed,
            expReward: Math.floor(((baseStats.expReward || this.baseStats.expReward) + this.scaling.expPerLevel * (level - 1)) * mult),
            goldReward: Math.floor(((baseStats.goldReward || this.baseStats.goldReward) + this.scaling.goldPerLevel * (level - 1)) * mult)
        };
    }
};
