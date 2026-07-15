/**
 * MonsterAreaUI - HUD for Monster Area.
 * Shows area name, player stats, and action buttons.
 * Responsive: Mobile Portrait & Desktop Landscape.
 * Buttons on RIGHT side only. Joystick is on LEFT side (bottom-left).
 */
class MonsterAreaUI {
    constructor(scene, saveData, areaName) {
        this.scene = scene;
        this.saveData = saveData;
        this.areaName = areaName;
        this.container = null;
        this.buttons = [];
    }

    create(onBack, onInventory) {
        if (this.container) this.container.destroy();
        this.buttons = [];

        const w = this.scene.cameras.main.width;
        const h = this.scene.cameras.main.height;
        const isPortrait = h > w;

        this.container = this.scene.add.container(0, 0).setDepth(100).setScrollFactor(0);

        const stats = this.saveData?.stats || {};
        const currency = this.saveData?.currency || {};

        // === TOP PANEL ===
        const panelH = isPortrait ? 80 : 90;
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
        const badgeW = Math.min(180, w * 0.35);
        const badgeBg = this.scene.add.graphics();
        badgeBg.fillStyle(0x335522, 0.9);
        badgeBg.fillRoundedRect(w / 2 - badgeW / 2, 8, badgeW, 22, 6);
        badgeBg.lineStyle(1, 0x66aa44, 0.7);
        badgeBg.strokeRoundedRect(w / 2 - badgeW / 2, 8, badgeW, 22, 6);
        this.container.add(badgeBg);

        this.container.add(this.scene.add.text(w / 2, 19, '\u{1F331} ' + this.areaName, {
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

        // === RIGHT SIDE BUTTONS ===
        const btnSize = 44;
        const btnMargin = 16;
        const btnX = w - btnMargin - btnSize / 2;

        // Back button (top-right, below HUD)
        this._createBtn(btnX, panelH + 30, btnSize,
            0x8b2222, 0xcc6644, '\u{1F3E0}', onBack);

        // Inventory button (below back)
        this._createBtn(btnX, panelH + 30 + btnSize + 16, btnSize,
            0x6b3a0a, 0xc9a84c, '\u{1F392}', onInventory);

        // Hint text
        const hint = this.scene.add.text(w / 2, h - 16, isPortrait
            ? '\u{1F449} Sentuh joystick kiri untuk bergerak'
            : 'WASD / Arrow Keys untuk bergerak', {
            fontSize: Math.max(8, Math.min(10, w * 0.01)) + 'px',
            fontFamily: 'Arial', color: '#887755', fontStyle: 'italic'
        }).setOrigin(0.5).setDepth(100).setScrollFactor(0);
        this.container.add(hint);
        this.scene.tweens.add({ targets: hint, alpha: 0, duration: 1000, delay: 3000 });
    }

    _createBtn(x, y, size, bgColor, borderColor, icon, onClick) {
        const bg = this.scene.add.graphics();
        bg.fillStyle(bgColor, 0.85);
        bg.fillRoundedRect(x - size/2, y - size/2, size, size, 8);
        bg.lineStyle(2, borderColor, 0.8);
        bg.strokeRoundedRect(x - size/2, y - size/2, size, size, 8);
        this.container.add(bg);

        this.container.add(this.scene.add.text(x, y, icon, { fontSize: '20px' }).setOrigin(0.5));

        const hit = this.scene.add.rectangle(x, y, size + 8, size + 8, 0x000000, 0)
            .setInteractive({ useHandCursor: true }).setDepth(101).setScrollFactor(0);
        hit.on('pointerdown', (pointer, localX, localY, event) => {
            if (event && event.stopPropagation) event.stopPropagation();
            onClick();
        });
        this.container.add(hit);
        this.buttons.push(hit);
    }

    destroy() {
        if (this.container) { this.container.destroy(); this.container = null; }
        this.buttons = [];
    }
}
