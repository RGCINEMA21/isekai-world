/**
 * RewardManager - Koordinator utama Reward System.
 * Menghubungkan: BattleManager → DropManager, ExperienceManager, GoldManager.
 * Semua data hadiah diambil dari Monster Database.
 */
class RewardManager {
    /**
     * @param {Phaser.Scene} scene - MonsterAreaScene
     * @param {Object} saveData - Data save player
     */
    constructor(scene, saveData) {
        this.scene = scene;
        this.saveData = saveData;

        // Inisialisasi sub-managers
        this.levelManager = new LevelManager(saveData);
        this.expManager = new ExperienceManager(saveData, this.levelManager);
        this.goldManager = new GoldManager(saveData);

        // Storage Manager (perlu warehouse yang sudah di-load)
        this.storageManager = null;
        this.dropManager = null;

        // Reward popup
        this.rewardPopup = new RewardPopup(scene);

        // Auto-save timer
        this.lastSaveTime = 0;
        this.autoSaveInterval = 10000; // 10 detik
    }

    /**
     * Inisialisasi storage manager setelah warehouse di-load.
     * @param {StorageManager} storageManager
     */
    initStorage(storageManager) {
        this.storageManager = storageManager;
        this.dropManager = new DropManager(storageManager);
    }

    /**
     * Proses semua hadiah dari monster yang dikalahkan.
     * @param {Object} monsterData - Data monster dari MonsterDatabase
     * @returns {Object} Ringkasan hadiah
     */
    processBattleReward(monsterData) {
        const playerLevel = this.levelManager.getLevel();
        const rewards = {
            exp: 0,
            gold: 0,
            drops: [],
            levelUp: false,
            newLevel: playerLevel
        };

        if (!monsterData) return rewards;

        // 1. EXP Reward
        const expAmount = monsterData.expReward || monsterData.stats?.expReward || 0;
        if (expAmount > 0) {
            const expResult = this.expManager.grantExp(expAmount);
            rewards.exp = expResult.expGained;
            rewards.levelUp = expResult.leveled;
            rewards.newLevel = expResult.newLevel;
        }

        // 2. Gold Reward
        const goldAmount = monsterData.goldReward || monsterData.stats?.goldReward || 0;
        if (goldAmount > 0) {
            rewards.gold = this.goldManager.addGold(goldAmount);
        }

        // 3. Drop Items (via DropManager → StorageManager → Gudang)
        if (this.dropManager && monsterData.dropTable) {
            rewards.drops = this.dropManager.rollAndDistribute(monsterData, playerLevel);
        }

        // 4. Simpan otomatis
        this.save();

        // 5. Tampilkan popup hadiah
        this.rewardPopup.show(rewards);

        // 6. Tampilkan Level Up animation (jika level naik)
        if (rewards.levelUp) {
            this.scene.time.delayedCall(300, () => {
                this.rewardPopup.showLevelUp(rewards.newLevel);
            });
        }

        return rewards;
    }

    /**
     * Dapatkan data EXP untuk UI.
     * @returns {{ level, exp, expToNext, percent }}
     */
    getExpInfo() {
        const level = this.levelManager.getLevel();
        const exp = this.levelManager.getExp();
        const expToNext = this.levelManager.getExpToNext();
        return {
            level,
            exp,
            expToNext,
            percent: expToNext > 0 ? exp / expToNext : 0
        };
    }

    /**
     * Dapatkan data currency untuk UI.
     * @returns {{ gold, diamond }}
     */
    getCurrencyInfo() {
        return {
            gold: this.goldManager.getGold(),
            diamond: this.goldManager.getDiamond()
        };
    }

    /** Simpan data ke LocalStorage */
    save() {
        if (!this.saveData) return;
        try {
            localStorage.setItem('isekai_world_save', JSON.stringify(this.saveData));
        } catch (e) {
            console.error('[RewardManager] Save failed:', e);
        }
    }

    /** Cleanup */
    destroy() {
        if (this.rewardPopup) this.rewardPopup.destroy();
    }
}
