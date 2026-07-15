/**
 * MonsterAreaUI - HUD for Monster Area.
 * Shows area name, player stats, and action buttons.
 * Responsive: Mobile Portrait & Desktop Landscape.
 * All sizing is percentage-based for any screen size.
 */
class MonsterAreaUI {
    constructor(scene, saveData, areaName) {
        this.scene = scene;
        this.saveData = saveData;
        this.areaName = areaName;
        this.container = null;
    }

    /** Helper: responsive font size */
    _fs(base) {
        const w = this.scene.cameras.main.width;
        return Math.max(8, Math.round(base * Math.min(w, 800) / 800)) + 'px';
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
        const panelH = isPortrait ? h * 0.1 : h * 0.12;
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x2c1810, 0.88);
        bg.fillRoundedRect(4, 4, w - 8, panelH, 8);
        bg.lineStyle(2, 0xc9a84c, 0.5);
        bg.strokeRoundedRect(4, 4, w - 8, panelH, 8);
        this.container.add(bg);

        // Area name badge
        const badgeW = Math.min(w * 0.4, 200);
        const badgeBg = this.scene.add.graphics();
        badgeBg.fillStyle(0x335522, 0.9);
        badgeBg.fillRoundedRect(w / 2 - badgeW / 2, 6, badgeW, panelH * 0.28, 6);
        badgeBg.lineStyle(1, 0x66aa44, 0.7);
        badgeBg.strokeRoundedRect(w / 2 - badgeW / 2, 6, badgeW, panelH * 0.28, 6);
        this.container.add(badgeBg);

        this.container.add(this.scene.add.text(w / 2, 6 + panelH * 0.14, '\u{1F331} ' + this.areaName, {
            fontSize: this._fs(11), fontFamily: 'Arial', color: '#ccff88', fontStyle: 'bold'
        }).setOrigin(0.5));

        // Stats row (compact)
        const statsY = 6 + panelH * 0.35;
        const colW = w / 4;
        const addStat = (col, label, val, color) => {
            this.container.add(this.scene.add.text(col * colW + 8, statsY, label, {
                fontSize: this._fs(9), fontFamily: 'Arial', color: '#aa8844'
            }));
            this.container.add(this.scene.add.text(col * colW + 55, statsY, String(val), {
                fontSize: this._fs(10), fontFamily: 'Arial', color: color || '#f0e0c0', fontStyle: 'bold'
            }));
        };
        addStat(0, 'HP', `${stats.hp||100}/${stats.maxHp||100}`, '#44cc44');
        addStat(1, 'Nrg', `${stats.energy||100}/${stats.maxEnergy||100}`, '#ffcc44');
        addStat(2, 'Lv', stats.level || 1, '#44ccff');
        addStat(3, 'G', String(currency.gold || 0).replace(/\B(?=(\d{3})+(?!\d))/g, ','), '#ffaa44');

        // === RIGHT SIDE BUTTONS ===
        const btnSize = Math.max(36, Math.min(48, w * 0.06));
        const btnMargin = Math.max(12, w * 0.02);
        const btnX = w - btnMargin - btnSize / 2;
        const btnGap = btnSize + Math.max(10, h * 0.015);

        // Back button
        this._createBtn(btnX, panelH + 20 + btnSize / 2, btnSize,
            0x8b2222, 0xcc6644, '\u{1F3E0}', onBack);

        // Inventory button
        this._createBtn(btnX, panelH + 20 + btnGap + btnSize / 2, btnSize,
            0x6b3a0a, 0xc9a84c, '\u{1F392}', onInventory);

        // Hint text
        const hint = this.scene.add.text(w / 2, h - h * 0.02, isPortrait
            ? '\u{1F449} Sentuh joystick kiri untuk bergerak'
            : 'WASD / Arrow Keys untuk bergerak', {
            fontSize: this._fs(9), fontFamily: 'Arial', color: '#887755', fontStyle: 'italic'
        }).setOrigin(0.5).setDepth(100).setScrollFactor(0);
        this.container.add(hint);
        this.scene.tweens.add({ targets: hint, alpha: 0, duration: 1000, delay: 3000 });
    }

    _createBtn(x, y, size, bgColor, borderColor, icon, onClick) {
        const bg = this.scene.add.graphics();
        bg.fillStyle(bgColor, 0.85);
        bg.fillRoundedRect(x - size / 2, y - size / 2, size, size, 8);
        bg.lineStyle(2, borderColor, 0.8);
        bg.strokeRoundedRect(x - size / 2, y - size / 2, size, size, 8);
        this.container.add(bg);

        const fontSize = Math.round(size * 0.45) + 'px';
        this.container.add(this.scene.add.text(x, y, icon, { fontSize }).setOrigin(0.5));

        const hit = this.scene.add.rectangle(x, y, size + 10, size + 10, 0x000000, 0)
            .setInteractive({ useHandCursor: true }).setDepth(101).setScrollFactor(0);
        hit.on('pointerdown', (pointer, lx, ly, event) => {
            if (event && event.stopPropagation) event.stopPropagation();
            onClick();
        });
        this.container.add(hit);
    }

    destroy() {
        if (this.container) { this.container.destroy(); this.container = null; }
    }
}
