/**
 * SpawnManager - Mengelola seluruh spawn point di satu area.
 * Menginisialisasi spawn point dari SpawnDatabase,
 * mengelola update loop, dan menyediakan API untuk sistem lain.
 */
class SpawnManager {
    /**
     * @param {Phaser.Scene} scene
     * @param {string} areaId
     * @param {number} tileSize
     */
    constructor(scene, areaId, tileSize) {
        this.scene = scene;
        this.areaId = areaId;
        this.tileSize = tileSize;

        // Buat object pool
        this.pool = new MonsterPool(scene, 30);

        // Buat spawn points dari database
        const configs = SpawnDatabase.getSpawnPoints(areaId);
        this.spawnPoints = configs.map(c => new SpawnPoint(c, tileSize));

        // Debug
        this.debugMode = false;
        this.debugGfx = null;

        // Label monster (text objects yang di-reuse)
        this.labels = [];
        this.maxLabels = 30;
        this._initLabels();
    }

    /** Pre-create label text objects */
    _initLabels() {
        for (let i = 0; i < this.maxLabels; i++) {
            const nameText = this.scene.add.text(0, 0, '', {
                fontSize: '10px',
                fontFamily: 'Arial',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5).setDepth(51).setVisible(false);

            const levelText = this.scene.add.text(0, 0, '', {
                fontSize: '8px',
                fontFamily: 'monospace',
                color: '#aaaaaa',
                stroke: '#000000',
                strokeThickness: 1
            }).setOrigin(0.5).setDepth(51).setVisible(false);

            this.labels.push({ nameText, levelText, used: false });
        }
    }

    /** Spawn awal semua spawn point */
    initialSpawn() {
        for (const sp of this.spawnPoints) {
            sp.initialSpawn(this.pool);
        }
    }

    /** Update semua spawn point */
    update(delta) {
        for (const sp of this.spawnPoints) {
            sp.update(delta, this.pool);
        }

        // Update entity animasi
        this.pool.update(delta);

        // Update label posisi
        this._updateLabels();
    }

    /** Update label posisi berdasarkan kamera */
    _updateLabels() {
        // Reset semua label
        for (const label of this.labels) {
            label.used = false;
            label.nameText.setVisible(false);
            label.levelText.setVisible(false);
        }

        const camera = this.scene.cameras.main;
        const zoom = camera.zoom || 1;
        let labelIdx = 0;

        for (const entity of this.pool.active) {
            if (!entity.active) continue;
            if (!entity.isInCamera(camera, 50)) continue;
            if (labelIdx >= this.labels.length) break;

            const sx = (entity.x - camera.scrollX) * zoom;
            const sy = (entity.y - camera.scrollY) * zoom;

            // Hanya tampilkan jika di layar
            if (sx < -50 || sx > camera.width + 50) continue;
            if (sy < -50 || sy > camera.height + 50) continue;

            const label = this.labels[labelIdx];
            label.used = true;

            // Nama monster (emoji)
            label.nameText.setText(entity.monsterData.sprite);
            label.nameText.setPosition(sx, sy - 22 * zoom);
            label.nameText.setFontSize(Math.max(10, 14 * zoom) + 'px');
            label.nameText.setVisible(true);

            // Level text
            const rarityColor = entity.monsterData.rarityData?.color || '#aaaaaa';
            label.levelText.setText('Lv.' + entity.monsterData.level);
            label.levelText.setPosition(sx, sy - 10 * zoom);
            label.levelText.setFontSize(Math.max(7, 9 * zoom) + 'px');
            label.levelText.setColor(rarityColor);
            label.levelText.setVisible(true);

            labelIdx++;
        }
    }

    /** Toggle debug mode */
    toggleDebug() {
        this.debugMode = !this.debugMode;
        if (this.debugMode) {
            if (!this.debugGfx) {
                this.debugGfx = this.scene.add.graphics().setDepth(150);
            }
            for (const sp of this.spawnPoints) {
                sp.showDebug(this.debugGfx);
            }
        } else {
            for (const sp of this.spawnPoints) {
                sp.hideDebug();
                sp.destroyDebug();
            }
            if (this.debugGfx) this.debugGfx.clear();
        }
        return this.debugMode;
    }

    /** Dapatkan semua monster aktif */
    getAllActiveMonsters() {
        return this.pool.active.filter(m => m.active);
    }

    /** Dapatkan jumlah total monster aktif */
    getActiveCount() {
        return this.pool.getActiveCount();
    }

    /** Dapatkan info ringkas */
    getStats() {
        return {
            areaId: this.areaId,
            spawnPoints: this.spawnPoints.length,
            activeMonsters: this.pool.getActiveCount(),
            poolAvailable: this.pool.getPoolCount()
        };
    }

    /** Bersihkan semua monster dari area */
    clearAll() {
        for (const sp of this.spawnPoints) {
            sp.deactivateAll(this.pool);
        }
    }

    destroy() {
        // Hapus labels
        for (const label of this.labels) {
            label.nameText.destroy();
            label.levelText.destroy();
        }
        this.labels = [];

        if (this.debugGfx) this.debugGfx.destroy();
        this.pool.destroy();
        for (const sp of this.spawnPoints) {
            sp.destroyDebug();
        }
    }
}
