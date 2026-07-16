/**
 * BattleResult - Panel hasil pertarungan: Kemenangan dan Kekalahan.
 * Menampilkan panel dengan opsi setelah battle selesai.
 */
class BattleResult {
    /**
     * @param {Phaser.Scene} scene
     */
    constructor(scene) {
        this.scene = scene;
        this.container = null;
        this.onVictory = null;   // callback()
        this.onDefeat = null;    // callback()
    }

    /** Tampilkan panel kemenangan */
    showVictory(monsterName, callbacks = {}) {
        this.onVictory = callbacks.onContinue || (() => {});
        this._showPanel('🏆 KEMENANGAN!', monsterName + ' telah dikalahkan!', 0x228833, [
            { label: 'Lanjut Jelajahi', action: () => { this.hide(); this.onVictory(); } }
        ]);
    }

    /** Tampilkan panel kekalahan */
    showDefeat(callbacks = {}) {
        this.onDefeat = callbacks.onReturnVillage || (() => {});
        this.onRetry = callbacks.onRetry || (() => {});
        this._showPanel('💀 KEKALAHAN', 'HP kamu habis!', 0x882222, [
            { label: '🏠 Kembali ke Desa', action: () => { this.hide(); this.onDefeat(); } },
            { label: '🔄 Coba Lagi', action: () => { this.hide(); this.onRetry(); } }
        ]);
    }

    /** Buat panel */
    _showPanel(title, message, bgColor, buttons) {
        this.hide();
        const w = this.scene.cameras.main.width;
        const h = this.scene.cameras.main.height;

        this.container = this.scene.add.container(w / 2, h / 2)
            .setDepth(500).setScrollFactor(0).setAlpha(0);

        // Dim overlay
        const dim = this.scene.add.graphics().setScrollFactor(0);
        dim.fillStyle(0x000000, 0.6);
        dim.fillRect(-w / 2, -h / 2, w, h);
        this.container.add(dim);

        // Panel box
        const rl = new ResponsiveLayout(this.scene);
        const panelW = Math.min(Math.round(rl.smaller * 0.85), Math.round(w * 0.85));
        const panelH = Math.max(160, Math.round(rl.smaller * 0.24));
        const panelBg = this.scene.add.graphics().setScrollFactor(0);
        panelBg.fillStyle(0x2c1810, 0.95);
        panelBg.fillRoundedRect(-panelW / 2, -panelH / 2, panelW, panelH, 12);
        panelBg.lineStyle(3, bgColor, 0.8);
        panelBg.strokeRoundedRect(-panelW / 2, -panelH / 2, panelW, panelH, 12);
        this.container.add(panelBg);

        // Title
        this.container.add(this.scene.add.text(0, -panelH / 2 + 30, title, {
            fontSize: rl.fontSize(18) + 'px', fontFamily: 'Georgia, serif', color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0));

        // Message
        this.container.add(this.scene.add.text(0, -panelH / 2 + 60, message, {
            fontSize: rl.fontSize(12) + 'px', fontFamily: 'Arial', color: '#cccccc',
            wordWrap: { width: panelW - 40 }, align: 'center'
        }).setOrigin(0.5).setScrollFactor(0));

        // Buttons
        const btnSpacing = 110;
        const btnStartX = -(buttons.length - 1) * btnSpacing / 2;
        buttons.forEach((btn, i) => {
            const bx = btnStartX + i * btnSpacing;
            const by = panelH / 2 - 40;

            const btnBg = this.scene.add.graphics().setScrollFactor(0);
            btnBg.fillStyle(bgColor, 1);
            btnBg.fillRoundedRect(bx - 48, by - 16, 96, 32, 8);
            this.container.add(btnBg);

            const text = this.scene.add.text(bx, by, btn.label, {
                fontSize: rl.labelSize(11) + 'px', fontFamily: 'Arial', color: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5).setScrollFactor(0);
            this.container.add(text);

            const hit = this.scene.add.rectangle(bx, by, 96, 32, 0x000000, 0)
                .setInteractive({ useHandCursor: true }).setScrollFactor(0);
            hit.on('pointerdown', btn.action);
            this.container.add(hit);
        });

        // Fade in
        this.scene.tweens.add({
            targets: this.container,
            alpha: 1,
            duration: 300,
            ease: 'Power2'
        });
    }

    /** Sembunyikan panel */
    hide() {
        if (this.container) {
            this.container.destroy();
            this.container = null;
        }
    }

    destroy() {
        this.hide();
    }
}
