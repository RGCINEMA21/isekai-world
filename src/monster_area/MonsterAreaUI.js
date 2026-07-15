/**
 * MonsterAreaUI - HUD for Monster Area.
 * Shows area name, player stats, and action buttons.
 * Responsive: Mobile Portrait & Desktop Landscape.
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

        this.container = this.scene.add.container(0, 0).setDepth(100).setScrollFactor(0);

        const stats = this.saveData?.stats || {};
        const currency = this.saveData?.currency || {};

        // === TOP PANEL ===
        const panelH = isPortrait ? 85 : 100;
        const bg = this.scene.add.graphics();
        if (isPortrait) {
            bg.fillStyle(0x2c1810, 0.88);
            bg.fillRoundedRect(4, 4, w - 8, panelH, 8);
            bg.lineStyle(2, 0xc9a84c, 0.5);
            bg.strokeRoundedRect(4, 4, w - 8, panelH, 8);
        } else {
            bg.fillStyle(0x2c1810, 0.85);
            bg.fillRoundedRect(6, 6, 220, panelH, 8);
            bg.lineStyle(2, 0xc9a84c, 0.5);
            bg.strokeRoundedRect(6, 6, 220, panelH, 8);
        }
        this.container.add(bg);

        // Area name badge
        const badgeW = Math.min(180, w * 0.3);
        const badgeBg = this.scene.add.graphics();
        badgeBg.fillStyle(0x335522, 0.9);
        badgeBg.fillRoundedRect(w / 2 - badgeW / 2, 8, badgeW, 22, 6);
        badgeBg.lineStyle(1, 0x66aa44, 0.7);
        badgeBg.strokeRoundedRect(w / 2 - badgeW / 2, 8, badgeW, 22, 6);
        this.container.add(badgeBg);

        this.container.add(this.scene.add.text(w / 2, 19, '🌱 ' + this.areaName, {
            fontSize: '11px', fontFamily: 'Arial', color: '#ccff88', fontStyle: 'bold'
        }).setOrigin(0.5));

        // Stats
        const fs = Math.max(9, Math.min(11, w * 0.011)) + 'px';
        const sx = isPortrait ? 14 : 14;
        let sy = 36;
        const lh = 13;

        const addStat = (label, val, color) => {
            this.container.add(this.scene.add.text(sx, sy, label, {
                fontSize: fs, fontFamily: 'Arial', color: '#aa8844'
            }));
            this.container.add(this.scene.add.text(sx + 70, sy, String(val), {
                fontSize: fs, fontFamily: 'Arial', color: color || '#f0e0c0', fontStyle: 'bold'
            }));
            sy += lh;
        };

        addStat('HP:', `${stats.hp||100}/${stats.maxHp||100}`, '#44cc44');
        addStat('Energy:', `${stats.energy||100}/${stats.maxEnergy||100}`, '#ffcc44');
        addStat('Level:', stats.level || 1, '#44ccff');
        addStat('Gold:', String(currency.gold || 0).replace(/\B(?=(\d{3})+(?!\d))/g, ','), '#ffaa44');

        // === BOTTOM BUTTONS (right side, away from D-pad) ===
        const btnSize = 40;
        const btnMargin = 14;

        // Inventory button (right side, above back)
        this._createCircleBtn(w - btnMargin - btnSize/2, h - btnMargin - btnSize/2 - btnSize - 10, btnSize,
            0x6b3a0a, 0xc9a84c, '🎒', onInventory);

        // Back button (bottom-right)
        this._createCircleBtn(w - btnMargin - btnSize/2, h - btnMargin - btnSize/2, btnSize,
            0x8b2222, 0xcc6644, '🏠', onBack);

        // Hint
        const hint = this.scene.add.text(w / 2, h - 16, '👆 Geser kiri untuk gerak · Klik tombol', {
            fontSize: Math.max(8, Math.min(10, w * 0.01)) + 'px',
            fontFamily: 'Arial', color: '#887755', fontStyle: 'italic'
        }).setOrigin(0.5).setDepth(100).setScrollFactor(0);
        this.container.add(hint);
        this.scene.tweens.add({ targets: hint, alpha: 0, duration: 1000, delay: 3000 });
    }

    _createCircleBtn(x, y, size, bgColor, borderColor, icon, onClick) {
        const bg = this.scene.add.graphics();
        bg.fillStyle(bgColor, 0.8);
        bg.fillCircle(x, y, size / 2);
        bg.lineStyle(2, borderColor, 0.8);
        bg.strokeCircle(x, y, size / 2);
        this.container.add(bg);

        this.container.add(this.scene.add.text(x, y, icon, { fontSize: '18px' }).setOrigin(0.5));

        const hit = this.scene.add.rectangle(x, y, size + 8, size + 8, 0x000000, 0)
            .setInteractive({ useHandCursor: true }).setDepth(101).setScrollFactor(0);
        hit.on('pointerdown', onClick);
        this.container.add(hit);
    }

    destroy() {
        if (this.container) { this.container.destroy(); this.container = null; }
    }
}
