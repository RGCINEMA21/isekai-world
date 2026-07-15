/**
 * MonsterAreaUI - HUD for Monster Area.
 * Responsive: works on all screen sizes.
 * Buttons positioned bottom-right for easy thumb access on mobile.
 * All sizing adapts to screen dimensions.
 */
class MonsterAreaUI {
    constructor(scene, saveData, areaName) {
        this.scene = scene;
        this.saveData = saveData;
        this.areaName = areaName;
        this.container = null;
    }

    create(onBack, onInventory) {
        if (this.container) this.container.destroy();

        const w = this.scene.cameras.main.width;
        const h = this.scene.cameras.main.height;
        const isPortrait = h > w;
        const smaller = Math.min(w, h);

        this.container = this.scene.add.container(0, 0).setDepth(100).setScrollFactor(0);

        const stats = this.saveData?.stats || {};
        const currency = this.saveData?.currency || {};

        // === TOP HUD BAR ===
        const panelH = isPortrait ? Math.max(70, h * 0.09) : Math.max(68, h * 0.12);
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x2c1810, 0.88);
        bg.fillRoundedRect(4, 4, w - 8, panelH, 8);
        bg.lineStyle(2, 0xc9a84c, 0.5);
        bg.strokeRoundedRect(4, 4, w - 8, panelH, 8);
        this.container.add(bg);

        // Area badge
        const badgeW = Math.min(200, w * 0.45);
        const badgeFs = Math.max(11, Math.min(14, smaller * 0.018)) + 'px';
        const badgeBg = this.scene.add.graphics();
        badgeBg.fillStyle(0x335522, 0.9);
        badgeBg.fillRoundedRect(w / 2 - badgeW / 2, 8, badgeW, 24, 6);
        badgeBg.lineStyle(1, 0x66aa44, 0.7);
        badgeBg.strokeRoundedRect(w / 2 - badgeW / 2, 8, badgeW, 24, 6);
        this.container.add(badgeBg);
        this.container.add(this.scene.add.text(w / 2, 20, '\u{1F331} ' + this.areaName, {
            fontSize: badgeFs, fontFamily: 'Arial', color: '#ccff88', fontStyle: 'bold'
        }).setOrigin(0.5));

        // Stats - two columns
        const fs = Math.max(10, Math.min(13, smaller * 0.016)) + 'px';
        const col1X = 14;
        const col2X = w * 0.35;
        let sy = 36;
        const lh = Math.max(11, Math.min(14, smaller * 0.017));

        const addStat = (x, label, val, color) => {
            this.container.add(this.scene.add.text(x, sy, label, { fontSize: fs, fontFamily: 'Arial', color: '#aa8844' }));
            this.container.add(this.scene.add.text(x + 42, sy, String(val), { fontSize: fs, fontFamily: 'Arial', color: color || '#f0e0c0', fontStyle: 'bold' }));
        };

        addStat(col1X, 'HP:', `${stats.hp || 100}/${stats.maxHp || 100}`, '#44cc44');
        addStat(col2X, 'Nrg:', `${stats.energy || 100}/${stats.maxEnergy || 100}`, '#ffcc44');
        sy += lh;
        addStat(col1X, 'Lv:', stats.level || 1, '#44ccff');
        addStat(col2X, 'Gold:', String(currency.gold || 0).replace(/\B(?=(\d{3})+(?!\d))/g, ','), '#ffaa44');
        sy += lh;
        addStat(col1X, 'Dmd:', String(currency.diamond || 0), '#cc66ff');

        // === BOTTOM BUTTONS ===
        const btnSize = Math.max(48, Math.min(65, smaller * 0.085));
        const btnPad = Math.max(12, Math.min(20, smaller * 0.025));
        const btnX = w - btnSize / 2 - btnPad;
        const btnBottomY = h - btnSize / 2 - btnPad;

        // Back button (bottom-right)
        this._makeBtn(btnX, btnBottomY, btnSize, 0x8b2222, 0xcc6644, '\u{1F3E0}', onBack, 'Desa');

        // Inventory button (above back)
        this._makeBtn(btnX, btnBottomY - btnSize - btnPad, btnSize, 0x6b3a0a, 0xc9a84c, '\u{1F392}', onInventory, 'Tas');

        // Hint text
        const isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || !!window.matchMedia('(pointer: coarse)').matches;
        const hintText = isMobile
            ? 'Joystick kiri untuk gerak'
            : 'WASD / Arrow untuk gerak';
        const hint = this.scene.add.text(w / 2, h - 14, hintText, {
            fontSize: Math.max(9, Math.min(11, w * 0.013)) + 'px',
            fontFamily: 'Arial', color: '#887755', fontStyle: 'italic'
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
                fontSize: Math.max(8, Math.min(10, size * 0.16)) + 'px',
                fontFamily: 'Arial', color: '#ffffff', fontStyle: 'bold'
            }).setOrigin(0.5));
        }

        // Big hit area for easy touch
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
