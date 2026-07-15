/**
 * VillageUI - HUD and interactive buttons for the village.
 * Shows player stats, inventory button, warehouse button.
 * Responsive: Mobile Portrait & Desktop Landscape.
 */
class VillageUI {
    constructor(scene) {
        this.scene = scene;
        this.container = null;
    }

    create() {
        if (this.container) this.container.destroy();

        const w = this.scene.cameras.main.width;
        const h = this.scene.cameras.main.height;
        const isPortrait = h > w;

        this.container = this.scene.add.container(0, 0).setDepth(100).setScrollFactor(0);

        const saveData = this._loadSave();
        const playerData = saveData?.player || {};
        const stats = saveData?.stats || {};
        const currency = saveData?.currency || {};

        // Background panel
        const bg = this.scene.add.graphics();
        if (isPortrait) {
            bg.fillStyle(0x2c1810, 0.88);
            bg.fillRoundedRect(4, 4, w - 8, 90, 8);
            bg.lineStyle(2, 0xc9a84c, 0.5);
            bg.strokeRoundedRect(4, 4, w - 8, 90, 8);
        } else {
            bg.fillStyle(0x2c1810, 0.85);
            bg.fillRoundedRect(6, 6, 200, 105, 8);
            bg.lineStyle(2, 0xc9a84c, 0.5);
            bg.strokeRoundedRect(6, 6, 200, 105, 8);
        }
        this.container.add(bg);

        // Stats
        const fs = Math.max(9, Math.min(12, w * 0.011)) + 'px';
        const x = isPortrait ? 14 : 14;
        let y = 14;
        const lh = 14;

        const addStat = (label, value, color) => {
            this.container.add(this.scene.add.text(x, y, label, {
                fontSize: fs, fontFamily: 'Arial', color: '#aa8844'
            }));
            this.container.add(this.scene.add.text(x + 80, y, String(value), {
                fontSize: fs, fontFamily: 'Arial', color: color || '#f0e0c0', fontStyle: 'bold'
            }));
            y += lh;
        };

        addStat('Nama:', playerData.name || '???', '#ffdd88');
        addStat('Level:', stats.level || 1, '#44ccff');
        addStat('HP:', `${stats.hp||100}/${stats.maxHp||100}`, '#44cc44');
        addStat('Gold:', String(currency.gold || 0).replace(/\B(?=(\d{3})+(?!\d))/g, ','), '#ffaa44');
        addStat('Diamond:', String(currency.diamond || 0), '#44ddff');

        // Hint text
        const hint = this.scene.add.text(w / 2, h - 20, '👆 Geser untuk pan · Scroll untuk zoom · Klik NPC', {
            fontSize: Math.max(9, Math.min(11, w * 0.011)) + 'px',
            fontFamily: 'Arial', color: '#887755', fontStyle: 'italic'
        }).setOrigin(0.5).setDepth(100).setScrollFactor(0);
        this.container.add(hint);
        this.scene.tweens.add({ targets: hint, alpha: 0, duration: 1000, delay: 3000 });

        // Inventory button
        this._createButton(w, h, isPortrait, w - 36, isPortrait ? h - 50 : 36,
            0x6b3a0a, 0xc9a84c, '🎒', () => {
                // Inventory not available in village mode
                this._showNotification('Inventory tersedia saat Adventure Mode.');
            });

        // Warehouse button
        this._createButton(w, h, isPortrait, w - 36, isPortrait ? h - 100 : 80,
            0x3a5a8a, 0x66aacc, '📦', () => {
                const sd = this._loadSave();
                try { localStorage.setItem('isekai_world_save', JSON.stringify(sd)); } catch(e) {}
                this.scene.cameras.main.fadeOut(300, 0, 0, 0);
                this.scene.cameras.main.once('camerafadeoutcomplete', () => {
                    this.scene.scene.start('WarehouseScene');
                });
            });
    }

    _createButton(w, h, isPortrait, x, y, bgColor, borderColor, icon, onClick) {
        const bg = this.scene.add.graphics();
        bg.fillStyle(bgColor, 0.8);
        bg.fillCircle(x, y, 22);
        bg.lineStyle(2, borderColor, 0.8);
        bg.strokeCircle(x, y, 22);
        this.container.add(bg);

        const txt = this.scene.add.text(x, y, icon, { fontSize: '18px' }).setOrigin(0.5);
        this.container.add(txt);

        const hit = this.scene.add.rectangle(x, y, 48, 48, 0x000000, 0)
            .setInteractive({ useHandCursor: true }).setDepth(101).setScrollFactor(0);
        hit.on('pointerdown', onClick);
        this.container.add(hit);
    }

    _showNotification(msg) {
        const w = this.scene.cameras.main.width;
        const h = this.scene.cameras.main.height;
        const notif = this.scene.add.container(w / 2, h * 0.85).setDepth(500).setScrollFactor(0).setAlpha(0);
        const fs = Math.max(11, Math.min(14, w * 0.014)) + 'px';
        notif.add(this.scene.add.text(0, 0, msg, {
            fontSize: fs, fontFamily: 'Arial', color: '#ffffff', fontStyle: 'bold',
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
        try {
            const r = localStorage.getItem('isekai_world_save');
            return r ? JSON.parse(r) : null;
        } catch (e) { return null; }
    }

    destroy() {
        if (this.container) { this.container.destroy(); this.container = null; }
    }
}
