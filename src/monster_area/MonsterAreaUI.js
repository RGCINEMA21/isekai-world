/**
 * MonsterAreaUI — HUD for monster area.
 * All sizing via ResponsiveLayout — works on every screen.
 */
class MonsterAreaUI {
    constructor(scene, saveData, areaName) {
        this.scene = scene;
        this.rl = new ResponsiveLayout(scene);
        this.saveData = saveData;
        this.areaName = areaName;
        this.container = null;
    }

    create(onBack, onInventory) {
        if (this.container) this.container.destroy();
        this.rl.recalculate();
        const { w, h, isPortrait, rl: _ } = this;
        const rl = this.rl;

        this.container = this.scene.add.container(0, 0).setDepth(100).setScrollFactor(0);

        const stats = this.saveData?.stats || {};
        const currency = this.saveData?.currency || {};

        // ── TOP HUD BAR ──
        const panelH = Math.round(h * (isPortrait ? 0.1 : 0.12));
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x2c1810, 0.88);
        bg.fillRoundedRect(4, 4, w - 8, panelH, 8);
        bg.lineStyle(2, 0xc9a84c, 0.5);
        bg.strokeRoundedRect(4, 4, w - 8, panelH, 8);
        this.container.add(bg);

        // Area badge
        const badgeW = Math.min(220, w * 0.45);
        const badgeFs = rl.fontSize(12);
        const badgeBg = this.scene.add.graphics();
        badgeBg.fillStyle(0x335522, 0.9);
        badgeBg.fillRoundedRect(w / 2 - badgeW / 2, 8, badgeW, 24, 6);
        badgeBg.lineStyle(1, 0x66aa44, 0.7);
        badgeBg.strokeRoundedRect(w / 2 - badgeW / 2, 8, badgeW, 24, 6);
        this.container.add(badgeBg);
        this.container.add(this.scene.add.text(w / 2, 20, '\u{1F331} ' + this.areaName, {
            fontSize: badgeFs + 'px', fontFamily: 'Arial', color: '#ccff88', fontStyle: 'bold'
        }).setOrigin(0.5));

        // Stats
        const fs = rl.fontSize(12);
        const lh = rl.lineHeight();
        const col1X = 14;
        const col2X = Math.round(w * 0.35);
        let sy = 38;

        const addStat = (x, label, val, color) => {
            this.container.add(this.scene.add.text(x, sy, label, { fontSize: fs + 'px', fontFamily: 'Arial', color: '#aa8844' }));
            this.container.add(this.scene.add.text(x + 44, sy, String(val), { fontSize: fs + 'px', fontFamily: 'Arial', color: color || '#f0e0c0', fontStyle: 'bold' }));
        };

        addStat(col1X, 'HP:', `${stats.hp || 100}/${stats.maxHp || 100}`, '#44cc44');
        addStat(col2X, 'Nrg:', `${stats.energy || 100}/${stats.maxEnergy || 100}`, '#ffcc44');
        sy += lh;
        addStat(col1X, 'Lv:', stats.level || 1, '#44ccff');
        addStat(col2X, 'Gold:', String(currency.gold || 0).replace(/\B(?=(\d{3})+(?!\d))/g, ','), '#ffaa44');
        sy += lh;
        addStat(col1X, 'Dmd:', String(currency.diamond || 0), '#cc66ff');

        // ── BOTTOM BUTTONS ──
        const bd = rl.buttonDiameter();
        const pad = rl.pad();
        const btnX = rl.rightButtonX();
        const btnBottomY = rl.bottomButtonY(0);
        const btnAboveY = rl.bottomButtonY(bd + pad);

        this._makeBtn(btnX, btnBottomY, bd, 0x8b2222, 0xcc6644, '\u{1F3E0}', onBack, 'Desa');
        this._makeBtn(btnX, btnAboveY, bd, 0x6b3a0a, 0xc9a84c, '\u{1F392}', onInventory, 'Tas');

        // Hint
        const isMobile = this.scene.playerController?.isTouchDevice || false;
        const hint = this.scene.add.text(w / 2, h - 14,
            isMobile ? 'Joystick kiri untuk gerak' : 'WASD / Arrow untuk gerak', {
            fontSize: rl.labelSize(10) + 'px', fontFamily: 'Arial', color: '#887755', fontStyle: 'italic'
        }).setOrigin(0.5).setDepth(100).setScrollFactor(0);
        this.container.add(hint);
        this.scene.tweens.add({ targets: hint, alpha: 0, duration: 1000, delay: 3000 });
    }

    _makeBtn(x, y, size, bgColor, borderColor, icon, onClick, label) {
        const bg = this.scene.add.graphics();
        bg.fillStyle(bgColor, 0.85);
        bg.fillCircle(x, y, size / 2);
        bg.lineStyle(3, borderColor, 0.8);
        bg.strokeCircle(x, y, size / 2);
        this.container.add(bg);

        this.container.add(this.scene.add.text(x, y - 4, icon, { fontSize: (size * 0.38) + 'px' }).setOrigin(0.5));

        if (label) {
            this.container.add(this.scene.add.text(x, y + size * 0.3, label, {
                fontSize: this.rl.labelSize(8) + 'px', fontFamily: 'Arial', color: '#ffffff', fontStyle: 'bold'
            }).setOrigin(0.5));
        }

        const hit = this.scene.add.rectangle(x, y, size + 24, size + 24, 0x000000, 0)
            .setInteractive({ useHandCursor: true }).setDepth(101).setScrollFactor(0);
        hit.on('pointerdown', (ptr, lx, ly, ev) => {
            if (ev && ev.stopPropagation) ev.stopPropagation();
            onClick();
        });
        this.container.add(hit);
    }

    destroy() {
        if (this.container) { this.container.destroy(); this.container = null; }
    }
}
