/**
 * VillageUI - HUD for village mode.
 * All elements use percentage-based sizing.
 * Buttons are LARGE and always visible on mobile.
 */
class VillageUI {
    constructor(scene) {
        this.scene = scene;
        this.container = null;
        this.btnHits = [];
    }

    create() {
        if (this.container) this.container.destroy();
        this.btnHits = [];

        const w = this.scene.cameras.main.width;
        const h = this.scene.cameras.main.height;
        const isPortrait = h > w;

        this.container = this.scene.add.container(0, 0).setDepth(100).setScrollFactor(0);

        const saveData = this._loadSave();
        const playerData = saveData?.player || {};
        const stats = saveData?.stats || {};
        const currency = saveData?.currency || {};

        // === TOP HUD PANEL ===
        const panelH = Math.max(70, h * 0.09);
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x2c1810, 0.9);
        bg.fillRoundedRect(4, 4, w - 8, panelH, 8);
        bg.lineStyle(2, 0xc9a84c, 0.6);
        bg.strokeRoundedRect(4, 4, w - 8, panelH, 8);
        this.container.add(bg);

        // Player name
        const nameFs = Math.max(12, Math.round(w * 0.032)) + 'px';
        this.container.add(this.scene.add.text(14, 12, playerData.name || '???', {
            fontSize: nameFs, fontFamily: 'Arial', color: '#ffdd88', fontStyle: 'bold'
        }));

        // Stats row
        const statFs = Math.max(10, Math.round(w * 0.025)) + 'px';
        const statY = 12 + Math.round(w * 0.04);
        const statsLine = `Lv${stats.level||1}  |  HP ${stats.hp||100}/${stats.maxHp||100}  |  Gold ${String(currency.gold||0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
        this.container.add(this.scene.add.text(14, statY, statsLine, {
            fontSize: statFs, fontFamily: 'Arial', color: '#ccccaa'
        }));

        // === RIGHT SIDE BUTTONS (big, impossible to miss) ===
        const btnSize = Math.max(50, Math.round(Math.min(w, h) * 0.075));
        const btnX = w - btnSize / 2 - 10;
        const btnGap = btnSize + 12;

        // Inventory button
        this._makeBtn(btnX, panelH + 20 + btnSize / 2, btnSize,
            0x6b3a0a, 0xc9a84c, '\u{1F392}', 'Inventory', () => {
                this._notif('Inventory tersedia saat Adventure Mode.');
            });

        // Warehouse button
        this._makeBtn(btnX, panelH + 20 + btnGap + btnSize / 2, btnSize,
            0x3a5a8a, 0x66aacc, '\u{1F4E6}', 'Gudang', () => {
                try { localStorage.setItem('isekai_world_save', JSON.stringify(saveData)); } catch(e) {}
                this.scene.cameras.main.fadeOut(300, 0, 0, 0);
                this.scene.cameras.main.once('camerafadeoutcomplete', () => {
                    this.scene.scene.start('WarehouseScene');
                });
            });

        // Hint
        const hintFs = Math.max(9, Math.round(w * 0.023)) + 'px';
        const hint = this.scene.add.text(w / 2, h - 20, isPortrait
            ? 'Geser layar untuk pan \u00B7 Scroll untuk zoom \u00B7 Klik NPC'
            : 'Drag untuk pan \u00B7 Scroll untuk zoom \u00B7 Klik NPC', {
            fontSize: hintFs, fontFamily: 'Arial', color: '#887755', fontStyle: 'italic'
        }).setOrigin(0.5).setDepth(100).setScrollFactor(0);
        this.container.add(hint);
        this.scene.tweens.add({ targets: hint, alpha: 0, duration: 1500, delay: 4000 });
    }

    _makeBtn(x, y, size, bgColor, borderColor, icon, label, onClick) {
        // Background circle
        const bg = this.scene.add.graphics();
        bg.fillStyle(bgColor, 0.9);
        bg.fillCircle(x, y, size / 2);
        bg.lineStyle(3, borderColor, 0.9);
        bg.strokeCircle(x, y, size / 2);
        this.container.add(bg);

        // Icon
        const iconFs = Math.round(size * 0.45) + 'px';
        this.container.add(this.scene.add.text(x, y - 2, icon, {
            fontSize: iconFs
        }).setOrigin(0.5));

        // Label below
        const labelFs = Math.max(8, Math.round(size * 0.18)) + 'px';
        this.container.add(this.scene.add.text(x, y + size / 2 + 10, label, {
            fontSize: labelFs, fontFamily: 'Arial', color: '#ffffff', fontStyle: 'bold',
            stroke: '#000000', strokeThickness: 2
        }).setOrigin(0.5));

        // Hit area (transparent, for touch)
        const hit = this.scene.add.rectangle(x, y, size + 12, size + 12, 0x000000, 0)
            .setInteractive({ useHandCursor: true }).setDepth(101).setScrollFactor(0);
        hit.on('pointerdown', (ptr, lx, ly, ev) => {
            if (ev && ev.stopPropagation) ev.stopPropagation();
            onClick();
        });
        this.container.add(hit);
        this.btnHits.push(hit);
    }

    _notif(msg) {
        const w = this.scene.cameras.main.width;
        const h = this.scene.cameras.main.height;
        const fs = Math.max(12, Math.round(w * 0.03)) + 'px';
        const notif = this.scene.add.container(w / 2, h * 0.4).setDepth(500).setScrollFactor(0).setAlpha(0);
        notif.add(this.scene.add.text(0, 0, msg, {
            fontSize: fs, fontFamily: 'Arial', color: '#ffffff', fontStyle: 'bold',
            stroke: '#000000', strokeThickness: 3,
            backgroundColor: '#2c1810ee', padding: { x: 16, y: 12 }
        }).setOrigin(0.5));
        this.scene.tweens.add({
            targets: notif, alpha: 1, y: h * 0.35, duration: 300,
            onComplete: () => {
                this.scene.tweens.add({
                    targets: notif, alpha: 0, y: h * 0.3, duration: 400, delay: 2000,
                    onComplete: () => notif.destroy()
                });
            }
        });
    }

    _loadSave() {
        try { const r = localStorage.getItem('isekai_world_save'); return r ? JSON.parse(r) : null; } catch(e) { return null; }
    }

    destroy() {
        if (this.container) { this.container.destroy(); this.container = null; }
        this.btnHits = [];
    }
}
