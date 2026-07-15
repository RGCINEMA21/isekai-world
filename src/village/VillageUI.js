/**
 * VillageUI - HUD and interactive buttons for the village.
 * Shows player stats, inventory button, warehouse button.
 * Responsive: Mobile Portrait & Desktop Landscape.
 * All sizing adapts to screen dimensions.
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
        const smaller = Math.min(w, h);

        this.container = this.scene.add.container(0, 0).setDepth(100).setScrollFactor(0);

        const saveData = this._loadSave();
        const playerData = saveData?.player || {};
        const stats = saveData?.stats || {};
        const currency = saveData?.currency || {};

        // Background panel
        const bg = this.scene.add.graphics();
        if (isPortrait) {
            bg.fillStyle(0x2c1810, 0.88);
            bg.fillRoundedRect(4, 4, w - 8, Math.max(80, h * 0.1), 8);
            bg.lineStyle(2, 0xc9a84c, 0.5);
            bg.strokeRoundedRect(4, 4, w - 8, Math.max(80, h * 0.1), 8);
        } else {
            bg.fillStyle(0x2c1810, 0.85);
            bg.fillRoundedRect(6, 6, 220, 110, 8);
            bg.lineStyle(2, 0xc9a84c, 0.5);
            bg.strokeRoundedRect(6, 6, 220, 110, 8);
        }
        this.container.add(bg);

        // Stats
        const fs = Math.max(10, Math.min(13, smaller * 0.016)) + 'px';
        const x = 14;
        let y = 14;
        const lh = Math.max(13, Math.min(16, smaller * 0.02));

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
            fontSize: Math.max(9, Math.min(12, smaller * 0.015)) + 'px',
            fontFamily: 'Arial', color: '#887755', fontStyle: 'italic'
        }).setOrigin(0.5).setDepth(100).setScrollFactor(0);
        this.container.add(hint);
        this.scene.tweens.add({ targets: hint, alpha: 0, duration: 1000, delay: 3000 });

        // Button sizing
        const btnSize = Math.max(42, Math.min(55, smaller * 0.07));
        const btnPad = Math.max(12, smaller * 0.02);

        // Inventory button (bottom-right area)
        const ibX = w - btnSize / 2 - btnPad;
        const ibY = isPortrait ? h - btnSize / 2 - btnPad : btnSize / 2 + btnPad;
        this._createButton(ibX, ibY, btnSize, 0x6b3a0a, 0xc9a84c, '🎒', () => {
            this._showNotification('Inventory tersedia saat Adventure Mode.');
        });

        // Warehouse button (above inventory on mobile, below inventory on desktop)
        const wbX = w - btnSize / 2 - btnPad;
        const wbY = isPortrait ? ibY - btnSize - btnPad : ibY + btnSize + btnPad;
        this._createButton(wbX, wbY, btnSize, 0x3a5a8a, 0x66aacc, '📦', () => {
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

        const txt = this.scene.add.text(x, y, icon, { fontSize: (size * 0.4) + 'px' }).setOrigin(0.5);
        this.container.add(txt);

        const hit = this.scene.add.rectangle(x, y, size + 16, size + 16, 0x000000, 0)
            .setInteractive({ useHandCursor: true }).setDepth(101).setScrollFactor(0);
        hit.on('pointerdown', onClick);
        this.container.add(hit);
    }

    _showNotification(msg) {
        const w = this.scene.cameras.main.width;
        const h = this.scene.cameras.main.height;
        const fs = Math.max(11, Math.min(14, Math.min(w, h) * 0.018)) + 'px';
        const notif = this.scene.add.container(w / 2, h * 0.85).setDepth(500).setScrollFactor(0).setAlpha(0);
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
