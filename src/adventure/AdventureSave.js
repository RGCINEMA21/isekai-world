/**
 * AdventureSave - Handles saving/loading adventure mode data.
 * Stores player position, stats, and progress.
 */
const AdventureSave = {
    SAVE_KEY: 'isekai_world_adventure',
    
    /**
     * Save adventure data to LocalStorage.
     * @param {Object} data - Adventure data to save
     * @returns {boolean} Success status
     */
    save(data) {
        try {
            const saveData = {
                ...data,
                timestamp: Date.now()
            };
            localStorage.setItem(this.SAVE_KEY, JSON.stringify(saveData));
            return true;
        } catch (e) {
            console.error('[AdventureSave] Save failed:', e);
            return false;
        }
    },
    
    /**
     * Load adventure data from LocalStorage.
     * @returns {Object|null} Saved data or null
     */
    load() {
        try {
            const raw = localStorage.getItem(this.SAVE_KEY);
            if (!raw) return null;
            return JSON.parse(raw);
        } catch (e) {
            console.error('[AdventureSave] Load failed:', e);
            return null;
        }
    },
    
    /**
     * Clear adventure save data.
     */
    clear() {
        try {
            localStorage.removeItem(this.SAVE_KEY);
        } catch (e) {
            console.error('[AdventureSave] Clear failed:', e);
        }
    },
    
    /**
     * Save player stats to main save.
     * @param {Object} mainSave - Main save data
     * @param {Object} stats - Stats to update
     */
    saveToMainSave(mainSave, stats) {
        if (!mainSave) return;
        
        if (stats.hp !== undefined) mainSave.stats.hp = stats.hp;
        if (stats.energy !== undefined) mainSave.stats.energy = stats.energy;
        if (stats.exp !== undefined) mainSave.stats.exp = stats.exp;
        if (stats.gold !== undefined) mainSave.currency.gold = stats.gold;
        if (stats.diamond !== undefined) mainSave.currency.diamond = stats.diamond;
        if (stats.playerX !== undefined) mainSave.progress.playerX = stats.playerX;
        if (stats.playerY !== undefined) mainSave.progress.playerY = stats.playerY;
        
        try {
            localStorage.setItem('isekai_world_save', JSON.stringify(mainSave));
        } catch (e) {
            console.error('[AdventureSave] Main save failed:', e);
        }
    },
    
    /**
     * Load player stats from main save.
     * @param {Object} mainSave - Main save data
     * @returns {Object} Player stats
     */
    loadFromMainSave(mainSave) {
        if (!mainSave) return {};
        
        return {
            hp: mainSave.stats?.hp || 100,
            maxHp: mainSave.stats?.maxHp || 100,
            energy: mainSave.stats?.energy || 100,
            maxEnergy: mainSave.stats?.maxEnergy || 100,
            exp: mainSave.stats?.exp || 0,
            level: mainSave.stats?.level || 1,
            gold: mainSave.currency?.gold || 0,
            diamond: mainSave.currency?.diamond || 0,
            playerX: mainSave.progress?.playerX || 0,
            playerY: mainSave.progress?.playerY || 0
        };
    }
};
