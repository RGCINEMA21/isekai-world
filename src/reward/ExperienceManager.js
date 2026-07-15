/**
 * ExperienceManager - Mengelola pendistribusian EXP ke player.
 * Menggunakan LevelManager untuk cek level up.
 */
class ExperienceManager {
    /**
     * @param {Object} saveData - Data save player
     * @param {LevelManager} levelManager
     */
    constructor(saveData, levelManager) {
        this.saveData = saveData;
        this.levelManager = levelManager;
    }

    /**
     * Berikan EXP dari hasil pertarungan.
     * @param {number} expAmount - Jumlah EXP
     * @returns {{ leveled: boolean, newLevel: number, expGained: number }}
     */
    grantExp(expAmount) {
        if (!expAmount || expAmount <= 0) return { leveled: false, newLevel: this.levelManager.getLevel(), expGained: 0 };

        const result = this.levelManager.addExp(expAmount);

        // Simpan ke save data
        if (this.saveData && this.saveData.stats) {
            this.saveData.stats.level = this.levelManager.getLevel();
            this.saveData.stats.exp = this.levelManager.getExp();
            this.saveData.stats.expToNext = this.levelManager.getExpToNext();
            this.saveData.stats.maxHp = this.levelManager.stats.maxHp;
            this.saveData.stats.hp = this.levelManager.stats.hp;
            this.saveData.stats.attack = this.levelManager.stats.attack;
            this.saveData.stats.defense = this.levelManager.stats.defense;
        }

        return result;
    }
}
