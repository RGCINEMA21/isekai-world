/**
 * MonsterSpawner - Bridge antara AdventureScene dan SpawnManager.
 * Dipasang ke AdventureScene untuk mengaktifkan monster spawn di area.
 * Menyediakan tombol debug toggle di UI.
 */
class MonsterSpawner {
    /**
     * @param {Phaser.Scene} scene - AdventureScene instance
     * @param {AdventureManager} manager
     */
    constructor(scene, manager) {
        this.scene = scene;
        this.manager = manager;
        this.spawnManager = null;
        this.initialized = false;
    }

    /** Inisialisasi spawn system untuk area ini */
    init() {
        const areaId = this.manager.areaId;
        const tileSize = this.manager.tileSize;

        // Cek apakah area memiliki spawn point di database
        const spawnPoints = SpawnDatabase.getSpawnPoints(areaId);
        if (!spawnPoints || spawnPoints.length === 0) {
            console.log('[MonsterSpawner] Tidak ada spawn point untuk area: ' + areaId);
            return;
        }

        this.spawnManager = new SpawnManager(this.scene, areaId, tileSize);
        this.spawnManager.initialSpawn();
        this.initialized = true;
        console.log('[MonsterSpawner] Area ' + areaId + ' loaded. Monsters: ' + this.spawnManager.getActiveCount());
    }

    /** Update dipanggil tiap frame */
    update(delta) {
        if (!this.initialized || !this.spawnManager) return;
        this.spawnManager.update(delta);
    }

    /** Toggle debug mode */
    toggleDebug() {
        if (!this.spawnManager) return false;
        return this.spawnManager.toggleDebug();
    }

    /** Dapatkan info untuk ditampilkan di UI */
    getInfo() {
        if (!this.spawnManager) return null;
        return this.spawnManager.getStats();
    }

    /** Bersihkan semua monster */
    clearAll() {
        if (this.spawnManager) {
            this.spawnManager.clearAll();
        }
    }

    destroy() {
        if (this.spawnManager) {
            this.spawnManager.destroy();
            this.spawnManager = null;
        }
        this.initialized = false;
    }
}
