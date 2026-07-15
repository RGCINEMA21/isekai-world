/**
 * MonsterAreaUI - HUD for Monster Area.
 * All elements use percentage-based sizing.
 * Buttons are LARGE and always visible on mobile.
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

        // === TOP HUD PANEL ===
        const panelH = Math.max(70, h * 0.09);
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x2c1810, 0.9);
        bg.fillRoundedRect(4, 4, w - 8, panelH, 8);
        bg.lineStyle(2, 0xc9a84c, 0.6);
        bg.strokeRoundedRect(4, 4, w - 8, panelH, 8);
        this.container.add(bg);

        // Area name
        const nameFs = Math.max(12, Math.round(w * 0.03)) + 'px';
        this.container.add(this.scene.add.text(14, 12, '\u{1F331} ' + this.areaName, {
            fontSize: nameFs, fontFamily: 'Arial', color: '#ccff88', fontStyle: 'bold'
        }));

        // Stats
        const statFs = Math.max(10, Math.round(w * 0.025)) + 'px';
        const statY = 12 + Math.round(w * 0.04);
        const statsLine = `Lv${stats.level||1}  |  HP ${stats.hp||100}/${stats.maxHp||100}  |  Nrg ${stats.energy||100}/${stats.maxEnergy||100}  |  Gold ${String(currency.gold||0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
        this.container.add(this.scene.add.text(14, statY, statsLine, {
            fontSize: statFs, fontFamily: 'Arial', color: '#ccccaa'
        }));

        // === RIGHT SIDE BUTTONS ===
        const btnSize = Math.max(50, Math.round(Math.min(w, h) * 0.075));
        const btnX = w - btnSize / 2 - 10;
        const btnGap = btnSize + 12;

        // Back button
        this._makeBtn(btnX, panelH + 20 + btnSize / 2, btnSize,
            0x8b2222, 0xcc6644, '\u{1F3E0}', 'Desa', onBack);

        // Inventory button
        this._makeBtn(btnX, panelH + 20 + btnGap + btnSize / 2, btnSize,
            0x6b3a0a, 0xc9a84c, '\u{1F392}', 'Tas', onInventory);

        // Hint
        const hintFs = Math.max(9, Math.round(w * 0.023)) + 'px';
        const hint = this.scene.add.text(w / 2, h - 20, isPortrait
            ? 'Sentuh joystick kiri untuk bergerak'
            : 'WASD / Arrow Keys untuk bergerak', {
            fontSize: hintFs, fontFamily: 'Arial', color: '#887755', fontStyle: 'italic'
        }).setOrigin(0.5).setDepth(100).setScrollFactor(0);
        this.container.add(hint);
        this.scene.tweens.add({ targets: hint, alpha: 0, duration: 1500, delay: 4000 });
    }

    _makeBtn(x, y, size, bgColor, borderColor, icon, label, onClick) {
        const bg = this.scene.add.graphics();
        bg.fillStyle(bgColor, 0.9);
        bg.fillCircle(x, y, size / 2);
        bg.lineStyle(3, borderColor, 0.9);
        bg.strokeCircle(x, y, size / 2);
        this.container.add(bg);

        const iconFs = Math.round(size * 0.45) + 'px';
        this.container.add(this.scene.add.text(x, y - 2, icon, {
            fontSize: iconFs
        }).setOrigin(0.5));

        const labelFs = Math.max(8, Math.round(size * 0.18)) + 'px';
        this.container.add(this.scene.add.text(x, y + size / 2 + 10, label, {
            fontSize: labelFs, fontFamily: 'Arial', color: '#ffffff', fontStyle: 'bold',
            stroke: '#000000', strokeThickness: 2
        }).setOrigin(0.5));

        const hit = this.scene.add.rectangle(x, y, size + 12, size + 12, 0x000000, 0)
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
