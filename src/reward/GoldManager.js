/**
 * GoldManager - Mengelola pendistribusian Gold ke player.
 * Diamond TIDAK diberikan dari monster biasa.
 */
class GoldManager {
    /**
     * @param {Object} saveData - Data save player
     */
    constructor(saveData) {
        this.saveData = saveData;
        this.currency = saveData?.currency || {};
    }

    /** Dapatkan jumlah gold saat ini */
    getGold() {
        return this.currency.gold || 0;
    }

    /** Dapatkan jumlah diamond saat ini */
    getDiamond() {
        return this.currency.diamond || 0;
    }

    /**
     * Tambah gold.
     * @param {number} amount
     * @returns {number} Gold yang berhasil ditambahkan
     */
    addGold(amount) {
        if (!amount || amount <= 0) return 0;
        this.currency.gold = (this.currency.gold || 0) + amount;

        // Simpan ke save data
        if (this.saveData) {
            this.saveData.currency = this.saveData.currency || {};
            this.saveData.currency.gold = this.currency.gold;
        }

        return amount;
    }

    /**
     * Tambah diamond (hanya dari Boss, Event, Quest, Achievement, Login).
     * @param {number} amount
     * @returns {number}
     */
    addDiamond(amount) {
        if (!amount || amount <= 0) return 0;
        this.currency.diamond = (this.currency.diamond || 0) + amount;

        if (this.saveData) {
            this.saveData.currency = this.saveData.currency || {};
            this.saveData.currency.diamond = this.currency.diamond;
        }

        return amount;
    }

    /**
     * Kurangi gold (untuk belanja, upgrade, dll).
     * @param {number} amount
     * @returns {number} Jumlah yang benar-benar dikurangi
     */
    spendGold(amount) {
        if (!amount || amount <= 0) return 0;
        const available = this.currency.gold || 0;
        const spent = Math.min(amount, available);
        this.currency.gold = available - spent;

        if (this.saveData) {
            this.saveData.currency = this.saveData.currency || {};
            this.saveData.currency.gold = this.currency.gold;
        }

        return spent;
    }
}
