/**
 * VillageUI — HUD + buttons for the village.
 * All sizing via ResponsiveLayout.
 */
class VillageUI {
    constructor(scene) {
        this.scene = scene;
        this.rl = new ResponsiveLayout(scene);
        this.container = null;
    }

    create() {
        if (this.container) this.container.destroy();
        this.rl.recalculate();
        const { w, h, isPortrait } = this.rl;
        const rl = this.rl;

        this.container = this.scene.add.container(0, 0).setDepth(100).setScrollFactor(0);

        const saveData = this._loadSave();
        const playerData = saveData?.player || {};
        const stats = saveData?.stats || {};
        const currency = saveData?.currency || {};

        // Background panel
        const panelH = Math.round(h * (isPortrait ? 0.11 : 0.15));
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x2c1810, 0.88);
        bg.fillRoundedRect(rl.pad(), rl.pad(), isPortrait ? w - rl.pad() * 2 : 230, panelH, 8);
        bg.lineStyle(2, 0xc9a84c, 0.5);
        bg.strokeRoundedRect(rl.pad(), rl.pad(), isPortrait ? w - rl.pad() * 2 : 230, panelH, 8);
        this.container.add(bg);

        // Stats
        const fs = rl.fontSize(12);
        const x = rl.pad() + 8;
        let y = rl.pad() + 8;
        const lh = rl.lineHeight();

        const addStat = (label, value, color) => {
            this.container.add(this.scene.add.text(x, y, label, { fontSize: fs + 'px', fontFamily: 'Arial', color: '#aa8844' }));
            this.container.add(this.scene.add.text(x + 80, y, String(value), { fontSize: fs + 'px', fontFamily: 'Arial', color: color || '#f0e0c0', fontStyle: 'bold' }));
            y += lh;
        };

        addStat('Nama:', playerData.name || '???', '#ffdd88');
        addStat('Level:', stats.level || 1, '#44ccff');
        addStat('HP:', `${stats.hp||100}/${stats.maxHp||100}`, '#44cc44');
        addStat('Gold:', String(currency.gold || 0).replace(/\B(?=(\d{3})+(?!\d))/g, ','), '#ffaa44');
        addStat('Diamond:', String(currency.diamond || 0), '#44ddff');

        // Hint
        const hint = this.scene.add.text(w / 2, h - 16, '👆 Geser untuk pan · Scroll untuk zoom · Klik NPC', {
            fontSize: rl.labelSize(10) + 'px', fontFamily: 'Arial', color: '#887755', fontStyle: 'italic'
        }).setOrigin(0.5).setDepth(100).setScrollFactor(0);
        this.container.add(hint);
        this.scene.tweens.add({ targets: hint, alpha: 0, duration: 1000, delay: 3000 });

        // Buttons
        const bd = rl.buttonDiameter();
        const btnX = rl.rightButtonX();

        // Inventory (bottom-right)
        this._createButton(btnX, rl.bottomButtonY(0), bd, 0x6b3a0a, 0xc9a84c, '🎒', () => {
            this._showNotification('Inventory tersedia saat Adventure Mode.');
        });

        // Warehouse (above inventory)
        this._createButton(btnX, rl.bottomButtonY(bd + rl.pad()), bd, 0x3a5a8a, 0x66aacc, '📦', () => {
            const sd = this._loadSave();
            try { localStorage.setItem('isekai_world_save', JSON.stringify(sd)); } catch(e) {}
            this.scene.cameras.main.fadeOut(300, 0, 0, 0);
            this.scene.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.scene.start('WarehouseScene');
            });
        });
    }

    _createButton(x, y, size, bgColor, borderColor, icon, onClick) {
        const bg = this.scene.add.graphics();
        bg.fillStyle(bgColor, 0.8);
        bg.fillCircle(x, y, size / 2);
        bg.lineStyle(2, borderColor, 0.8);
        bg.strokeCircle(x, y, size / 2);
        this.container.add(bg);
        this.container.add(this.scene.add.text(x, y, icon, { fontSize: (size * 0.4) + 'px' }).setOrigin(0.5));
        const hit = this.scene.add.rectangle(x, y, size + 16, size + 16, 0x000000, 0)
            .setInteractive({ useHandCursor: true }).setDepth(101).setScrollFactor(0);
        hit.on('pointerdown', onClick);
        this.container.add(hit);
    }

    _showNotification(msg) {
        const { w, h } = this.rl;
        const fs = this.rl.fontSize(13);
        const notif = this.scene.add.container(w / 2, h * 0.85).setDepth(500).setScrollFactor(0).setAlpha(0);
        notif.add(this.scene.add.text(0, 0, msg, {
            fontSize: fs + 'px', fontFamily: 'Arial', color: '#ffffff', fontStyle: 'bold',
            stroke: '#000000', strokeThickness: 3,
            backgroundColor: '#2c1810ee', padding: { x: 16, y: 10 }
        }).setOrigin(0.5));
        this.scene.tweens.add({
            targets: notif, alpha: 1, y: h * 0.8, duration: 300,
            onComplete: () => {
                this.scene.tweens.add({
                    targets: notif, alpha: 0, y: h * 0.75, duration: 400, delay: 2000,
                    onComplete: () => notif.destroy()
                });
            }
        });
    }

    _loadSave() {
        try { const r = localStorage.getItem('isekai_world_save'); return r ? JSON.parse(r) : null; } catch (e) { return null; }
    }

    destroy() { if (this.container) { this.container.destroy(); this.container = null; } }
}
