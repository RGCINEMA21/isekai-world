/**
 * PortalScene - Scene utama Portal Monster.
 * Dibuka dari MainVillageScene saat klik Portal/NPC.
 * Menampilkan daftar area, info, dan masuk ke Adventure Mode.
 */
class PortalScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PortalScene' });
    }

    create() {
        this.saveData = this.loadSave();
        this.portalManager = new PortalManager(this);
        this.portalUI = null;

        this.drawBackground();
        this.openPortal();

        // Keyboard shortcuts
        this.input.keyboard.on('keydown-ESC', () => this.exitPortal());
        this.input.keyboard.on('keydown-B', () => this.exitPortal());

        // Fade in
        this.cameras.main.fadeIn(300, 0, 0, 0);
    }

    /** Gambar background portal */
    drawBackground() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        const g = this.add.graphics();

        // Dark red/purple background
        for (let i = 0; i < h; i++) {
            const t = i / h;
            const r = Math.floor(Phaser.Math.Linear(20, 40, t));
            const gr = Math.floor(Phaser.Math.Linear(5, 15, t));
            const b = Math.floor(Phaser.Math.Linear(25, 50, t));
            g.lineStyle(1, Phaser.Display.Color.GetColor(r, gr, b));
            g.lineBetween(0, i, w, i);
        }

        // Floating particles
        for (let i = 0; i < 30; i++) {
            const px = Phaser.Math.Between(0, w);
            const py = Phaser.Math.Between(0, h);
            g.fillStyle(0xff4444, Phaser.Math.FloatBetween(0.1, 0.3));
            g.fillCircle(px, py, Phaser.Math.Between(1, 3));
        }

        // Portal swirl effect
        const cx = w / 2;
        const cy = h / 2;
        for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2;
            const radius = 60 + i * 3;
            g.fillStyle(0xff4444, 0.05);
            g.fillCircle(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius, 20);
        }

        // Overlay gelap
        g.fillStyle(0x000000, 0.4);
        g.fillRect(0, 0, w, h);
    }

    /** Buka portal UI */
    openPortal() {
        this.portalUI = new PortalUI(this, this.portalManager);
        this.portalUI.open(this.saveData, {
            onEnterArea: (area) => this.enterArea(area),
            onBack: () => this.exitPortal()
        });
    }

    /** Masuk ke area monster */
    enterArea(area) {
        if (!area) return;

        const adventureData = this.portalManager.getAdventureData(area.id);
        if (!adventureData) return;

        // Tutup UI dulu
        if (this.portalUI) {
            this.portalUI.destroy();
            this.portalUI = null;
        }

        // Fade out lalu masuk adventure
        this.cameras.main.fadeOut(400, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('AdventureScene', adventureData);
        });
    }

    /** Keluar dari portal */
    exitPortal() {
        if (this.portalUI) {
            this.portalUI.destroy();
            this.portalUI = null;
        }

        this.cameras.main.fadeOut(300, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('VillageScene');
        });
    }

    /** Load save data */
    loadSave() {
        try {
            const raw = localStorage.getItem('isekai_world_save');
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    /** Save game */
    saveGame() {
        if (!this.saveData) return;
        try {
            localStorage.setItem('isekai_world_save', JSON.stringify(this.saveData));
        } catch (e) {}
    }

    shutdown() {
        this.saveGame();
    }
}
