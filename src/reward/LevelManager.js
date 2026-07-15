/**
 * LevelManager - Mengelola level player dan kebutuhan EXP untuk naik level.
 * Semua data EXP/Level diambil dari save data.
 */
class LevelManager {
    /**
     * @param {Object} saveData - Data save player
     */
    constructor(saveData) {
        this.saveData = saveData;
        this.stats = saveData?.stats || {};
    }

    /** Dapatkan level saat ini */
    getLevel() {
        return this.stats.level || 1;
    }

    /** Dapatkan EXP saat ini */
    getExp() {
        return this.stats.exp || 0;
    }

    /** Dapatkan EXP yang dibutuhkan untuk level berikutnya */
    getExpToNext() {
        return this.stats.expToNext || this._calcExpNeeded(this.getLevel());
    }

    /**
     * Hitung EXP yang dibutuhkan untuk level tertentu
     * Formula: 100 + (level * 20)
     * @param {number} level
     * @returns {number}
     */
    _calcExpNeeded(level) {
        return 100 + (level * 20);
    }

    /**
     * Tambah EXP ke player. Cek level up otomatis.
     * @param {number} amount - Jumlah EXP
     * @returns {{ leveled: boolean, newLevel: number, expGained: number }}
     */
    addExp(amount) {
        if (amount <= 0) return { leveled: false, newLevel: this.getLevel(), expGained: 0 };

        this.stats.exp = (this.stats.exp || 0) + amount;
        let leveled = false;
        let newLevel = this.getLevel();

        // Cek level up berulang (jika EXP sangat banyak)
        while (this.stats.exp >= this.stats.expToNext) {
            this.stats.exp -= this.stats.expToNext;
            this.stats.level = (this.stats.level || 1) + 1;
            newLevel = this.stats.level;
            this.stats.expToNext = this._calcExpNeeded(newLevel);
            leveled = true;

            // Terapkan bonus level up
            this._applyLevelUpBonus(newLevel);
        }

        return { leveled, newLevel, expGained: amount };
    }

    /**
     * Terapkan bonus saat level naik.
     * Siapkan struktur untuk stat bonus di masa depan.
     * @param {number} newLevel
     */
    _applyLevelUpBonus(newLevel) {
        if (this.stats.maxHp) {
            this.stats.maxHp += 5;
            this.stats.hp = this.stats.maxHp; // Full heal saat level up
        }
        if (this.stats.attack) {
            this.stats.attack += 1;
        }
        if (this.stats.defense) {
            this.stats.defense += 1;
        }
    }

    /**
     * Set EXP dan level langsung (untuk load save)
     */
    setLevel(level, exp) {
        this.stats.level = level;
        this.stats.exp = exp;
        this.stats.expToNext = this._calcExpNeeded(level);
    }
}
