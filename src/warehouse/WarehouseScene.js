/**
 * WarehouseScene - Scene gudang pemain.
 * Dibuka dari MainVillageScene saat klik gudang/NPC.
 * Responsive portrait & landscape.
 */
class WarehouseScene extends Phaser.Scene {
    constructor() {
        super({ key: 'WarehouseScene' });
    }

    create() {
        // Load save data
        this.saveData = this.loadSave();

        // Load warehouse
        this.warehouse = WarehouseSave.loadOrCreate();

        // Background
        this.drawBackground();

        // UI
        this.warehouseUI = new WarehouseUI(this, this.warehouse, this.saveData);
        this.warehouseUI.open(this.saveData);

        // Keyboard shortcut
        this.input.keyboard.on('keydown-ESC', () => this.exitWarehouse());
        this.input.keyboard.on('keydown-B', () => this.exitWarehouse());

        // Fade in
        this.cameras.main.fadeIn(300, 0, 0, 0);
    }

    /** Gambar background desa yang sedikit gelap */
    drawBackground() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        const g = this.add.graphics();

        // Green ground
        g.fillStyle(0x4a8a3a, 1);
        g.fillRect(0, 0, w, h);

        // Grass texture
        for (let i = 0; i < 60; i++) {
            const gx = Phaser.Math.Between(0, w);
            const gy = Phaser.Math.Between(0, h);
            g.fillStyle(0x3a7a2a, 0.6);
            g.fillRect(gx, gy, 2, 5);
        }

        // Overlay gelap
        g.fillStyle(0x000000, 0.5);
        g.fillRect(0, 0, w, h);
    }

    /** Keluar dari gudang */
    exitWarehouse() {
        // Simpan sebelum keluar
        WarehouseSave.save(this.warehouse);

        this.cameras.main.fadeOut(300, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('MainVillageScene');
        });
    }

    /** Save/Load */
    saveGame() {
        WarehouseSave.save(this.warehouse);
    }

    loadSave() {
        try {
            const r = localStorage.getItem('isekai_world_save');
            return r ? JSON.parse(r) : null;
        } catch (e) { return null; }
    }

    shutdown() {
        this.saveGame();
    }
}
