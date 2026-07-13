/**
 * HomeScene - Interior Rumah (Static, No Movement).
 * Klik kasur → tidur → pulihkan HP/Energy → balik ke desa.
 * Klik pintu → langsung balik ke desa.
 * Responsive portrait & landscape.
 */
class HomeScene extends Phaser.Scene {
    constructor() {
        super({ key: 'HomeScene' });
    }

    create() {
        this.saveData = this.loadSave();
        this.isSleeping = false;

        const w = this.cameras.main.width;
        const h = this.cameras.main.height;

        this.drawInterior(w, h);
        this.createInteractiveZones(w, h);
        this.createUI(w, h);

        this.cameras.main.fadeIn(500, 0, 0, 0);
    }

    /* =============================================
     *  DRAW INTERIOR (Responsive to screen size)
     * ============================================= */
    drawInterior(w, h) {
        const g = this.add.graphics();

        // Floor - wooden planks
        g.fillStyle(0x8b7355, 1);
        g.fillRect(0, 0, w, h);

        // Wood grain pattern
        for (let y = 0; y < h; y += 12) {
            g.lineStyle(1, 0x7a6345, 0.3);
            g.lineBetween(0, y, w, y);
        }
        for (let x = 0; x < w; x += 20) {
            g.lineStyle(1, 0x6b5535, 0.15);
            g.lineBetween(x, 0, x, h);
        }

        // Back wall
        const wallH = h * 0.18;
        g.fillStyle(0x6b4b2a, 1);
        g.fillRect(0, 0, w, wallH);

        // Wall wood texture
        for (let x = 0; x < w; x += 30) {
            g.lineStyle(1, 0x5a3a1a, 0.4);
            g.lineBetween(x, 0, x, wallH);
        }

        // Wall-floor border
        g.lineStyle(3, 0x5a3a1a, 0.8);
        g.lineBetween(0, wallH, w, wallH);

        // Window (center-ish)
        const winW = w * 0.12;
        const winH = wallH * 0.7;
        const winX = w * 0.5 - winW / 2;
        const winY = wallH * 0.15;
        g.fillStyle(0x88bbee, 0.7);
        g.fillRect(winX, winY, winW, winH);
        // Window frame
        g.lineStyle(3, 0x5a3a1a, 1);
        g.strokeRect(winX, winY, winW, winH);
        g.lineBetween(winX + winW / 2, winY, winX + winW / 2, winY + winH);
        g.lineBetween(winX, winY + winH / 2, winX + winW, winY + winH / 2);
        // Sky through window
        g.fillStyle(0xaaddff, 0.4);
        g.fillRect(winX + 2, winY + 2, winW / 2 - 3, winH / 2 - 3);

        // === BED (left side) ===
        const bedX = w * 0.08;
        const bedY = wallH + h * 0.05;
        const bedW = w * 0.3;
        const bedH = h * 0.35;

        // Bed frame
        g.fillStyle(0x5a3a1a, 1);
        g.fillRoundedRect(bedX, bedY, bedW, bedH, 6);

        // Mattress
        g.fillStyle(0xeeeedd, 0.95);
        g.fillRoundedRect(bedX + 6, bedY + 6, bedW - 12, bedH - 12, 4);

        // Blanket (blue)
        g.fillStyle(0x4477aa, 0.8);
        g.fillRoundedRect(bedX + 6, bedY + bedH * 0.4, bedW - 12, bedH * 0.55, 4);

        // Pillow
        g.fillStyle(0xffffff, 0.9);
        g.fillRoundedRect(bedX + 10, bedY + 10, bedW * 0.35, bedH * 0.25, 6);

        // Bed label
        this.add.text(bedX + bedW / 2, bedY + bedH + 14, '🛏 Kasur', {
            fontSize: Math.max(12, Math.min(16, w * 0.018)) + 'px',
            fontFamily: 'Arial', color: '#ffd700', fontStyle: 'bold',
            stroke: '#2c1810', strokeThickness: 2
        }).setOrigin(0.5);

        // === TABLE (center-right) ===
        const tblX = w * 0.48;
        const tblY = wallH + h * 0.08;
        const tblW = w * 0.2;
        const tblH = h * 0.08;

        g.fillStyle(0x6b4b2a, 1);
        g.fillRect(tblX, tblY, tblW, tblH);
        g.lineStyle(2, 0x5a3a1a, 0.6);
        g.strokeRect(tblX, tblY, tblW, tblH);
        // Table legs
        g.fillStyle(0x5a3a1a, 1);
        g.fillRect(tblX + 4, tblY + tblH, 6, h * 0.12);
        g.fillRect(tblX + tblW - 10, tblY + tblH, 6, h * 0.12);

        // Candle on table
        g.fillStyle(0xffeecc, 1);
        g.fillRect(tblX + tblW / 2 - 3, tblY - 12, 6, 12);
        g.fillStyle(0xffaa33, 0.8);
        g.fillCircle(tblX + tblW / 2, tblY - 16, 5);

        // === CHAIR ===
        const chairX = tblX + tblW * 0.35;
        const chairY = tblY + tblH + h * 0.12;
        g.fillStyle(0x6b4b2a, 1);
        g.fillRect(chairX, chairY, w * 0.06, h * 0.05);
        g.fillRect(chairX, chairY - h * 0.08, w * 0.06, h * 0.08);

        // === WARDROBE (right side) ===
        const warX = w * 0.78;
        const warY = wallH + h * 0.02;
        const warW = w * 0.14;
        const warH = h * 0.3;

        g.fillStyle(0x5a3a1a, 1);
        g.fillRoundedRect(warX, warY, warW, warH, 4);
        g.lineStyle(2, 0x4a2a0a, 0.6);
        g.strokeRoundedRect(warX, warY, warW, warH, 4);
        // Door split
        g.lineStyle(2, 0x4a2a0a, 0.5);
        g.lineBetween(warX + warW / 2, warY, warX + warW / 2, warY + warH);
        // Handles
        g.fillStyle(0xc9a84c, 1);
        g.fillCircle(warX + warW / 2 - 6, warY + warH / 2, 3);
        g.fillCircle(warX + warW / 2 + 6, warY + warH / 2, 3);

        // === CARPET ===
        const carpX = w * 0.35;
        const carpY = h * 0.58;
        const carpW = w * 0.3;
        const carpH = h * 0.2;
        g.fillStyle(0x8b2252, 0.6);
        g.fillRoundedRect(carpX, carpY, carpW, carpH, 8);
        g.lineStyle(2, 0xc9a84c, 0.4);
        g.strokeRoundedRect(carpX + 6, carpY + 6, carpW - 12, carpH - 12, 6);

        // === EXIT DOOR (bottom center) ===
        const doorX = w * 0.42;
        const doorY = h - h * 0.25;
        const doorW = w * 0.16;
        const doorH = h * 0.25;

        g.fillStyle(0x5a3a1a, 1);
        g.fillRoundedRect(doorX, doorY, doorW, doorH, 4);
        // Door panel
        g.fillStyle(0x6b4b2a, 0.8);
        g.fillRoundedRect(doorX + 6, doorY + 6, doorW - 12, doorH - 18, 3);
        // Handle
        g.fillStyle(0xc9a84c, 1);
        g.fillCircle(doorX + doorW - 14, doorY + doorH / 2, 4);

        // Door label
        this.add.text(doorX + doorW / 2, doorY + doorH + 12, '🚪 Pintu Keluar', {
            fontSize: Math.max(12, Math.min(16, w * 0.018)) + 'px',
            fontFamily: 'Arial', color: '#ffd700', fontStyle: 'bold',
            stroke: '#2c1810', strokeThickness: 2
        }).setOrigin(0.5);

        // Warm lighting effect (subtle gradient overlay)
        const light = this.add.graphics();
        light.fillStyle(0xffaa44, 0.06);
        light.fillCircle(w * 0.5, h * 0.3, w * 0.4);
    }

    /* =============================================
     *  INTERACTIVE ZONES (Clickable)
     * ============================================= */
    createInteractiveZones(w, h) {
        const wallH = h * 0.18;

        // Bed zone (clickable)
        const bedX = w * 0.08;
        const bedY = wallH + h * 0.05;
        const bedW = w * 0.3;
        const bedH = h * 0.35;

        this.bedZone = this.add.rectangle(
            bedX + bedW / 2, bedY + bedH / 2, bedW, bedH, 0x000000, 0
        ).setInteractive({ useHandCursor: true });

        this.bedZone.on('pointerover', () => this.showBedHint(w, h));
        this.bedZone.on('pointerout', () => this.hideBedHint());
        this.bedZone.on('pointerdown', () => this.doSleep());

        // Door zone (clickable)
        const doorX = w * 0.42;
        const doorY = h - h * 0.25;
        const doorW = w * 0.16;
        const doorH = h * 0.25;

        this.doorZone = this.add.rectangle(
            doorX + doorW / 2, doorY + doorH / 2, doorW, doorH, 0x000000, 0
        ).setInteractive({ useHandCursor: true });

        this.doorZone.on('pointerover', () => this.showDoorHint(w, h));
        this.doorZone.on('pointerout', () => this.hideDoorHint());
        this.doorZone.on('pointerdown', () => this.exitHouse());

        // Hint text containers
        this.bedHint = null;
        this.doorHint = null;
    }

    showBedHint(w, h) {
        this.hideBedHint();
        const wallH = h * 0.18;
        const bedY = wallH + h * 0.05;
        this.bedHint = this.add.text(w * 0.23, bedY - 16, '🛏 Tidur', {
            fontSize: Math.max(13, Math.min(18, w * 0.02)) + 'px',
            fontFamily: 'Arial', color: '#ffdd88', fontStyle: 'bold',
            stroke: '#2c1810', strokeThickness: 3
        }).setOrigin(0.5).setDepth(50);

        this.tweens.add({ targets: this.bedHint, y: this.bedHint.y - 5, duration: 600, yoyo: true, repeat: -1 });
    }

    hideBedHint() { if (this.bedHint) { this.bedHint.destroy(); this.bedHint = null; } }

    showDoorHint(w, h) {
        this.hideDoorHint();
        const doorY = h - h * 0.25;
        this.doorHint = this.add.text(w * 0.5, doorY - 14, '🚪 Keluar', {
            fontSize: Math.max(13, Math.min(18, w * 0.02)) + 'px',
            fontFamily: 'Arial', color: '#ffdd88', fontStyle: 'bold',
            stroke: '#2c1810', strokeThickness: 3
        }).setOrigin(0.5).setDepth(50);

        this.tweens.add({ targets: this.doorHint, y: this.doorHint.y - 5, duration: 600, yoyo: true, repeat: -1 });
    }

    hideDoorHint() { if (this.doorHint) { this.doorHint.destroy(); this.doorHint = null; } }

    /* =============================================
     *  SLEEP
     * ============================================= */
    doSleep() {
        if (this.isSleeping) return;
        this.isSleeping = true;

        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        this.hideBedHint();
        this.hideDoorHint();

        // Disable interactions
        this.bedZone.disableInteractive();
        this.doorZone.disableInteractive();

        // Dim overlay
        const dim = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0).setDepth(100);
        this.tweens.add({ targets: dim, alpha: 0.85, duration: 800 });

        // "Tidur..." text
        const sleepText = this.add.text(w / 2, h * 0.4, '💤 Tidur...', {
            fontSize: Math.max(18, Math.min(28, w * 0.03)) + 'px',
            fontFamily: 'Georgia, serif', color: '#ffd700', fontStyle: 'bold',
            stroke: '#2c1810', strokeThickness: 3
        }).setOrigin(0.5).setDepth(110).setAlpha(0);

        this.tweens.add({ targets: sleepText, alpha: 1, duration: 600, delay: 400 });

        // After sleep animation
        this.time.delayedCall(2500, () => {
            // Restore HP & Energy
            if (this.saveData && this.saveData.stats) {
                this.saveData.stats.hp = this.saveData.stats.maxHp;
                this.saveData.stats.energy = this.saveData.stats.maxEnergy;
            }
            this.saveGame();

            // Show recovery message
            sleepText.setText('✨ HP dan Energy telah dipulihkan!');

            // Fade back in
            this.tweens.add({ targets: dim, alpha: 0, duration: 800, delay: 500 });

            this.time.delayedCall(2000, () => {
                dim.destroy();
                sleepText.destroy();
                this.exitHouse();
            });
        });
    }

    /* =============================================
     *  EXIT HOUSE
     * ============================================= */
    exitHouse() {
        this.saveGame();
        this.cameras.main.fadeOut(400, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('MainVillageScene');
        });
    }

    /* =============================================
     *  UI - Title Bar
     * ============================================= */
    createUI(w, h) {
        // Title bar
        const barH = Math.max(36, h * 0.06);
        const g = this.add.graphics().setDepth(60);
        g.fillStyle(0x2c1810, 0.85);
        g.fillRoundedRect(w / 2 - 100, 8, 200, barH, 8);
        g.lineStyle(2, 0xc9a84c, 0.6);
        g.strokeRoundedRect(w / 2 - 100, 8, 200, barH, 8);

        this.add.text(w / 2, 8 + barH / 2, '🏠 Rumah', {
            fontSize: Math.max(14, Math.min(20, w * 0.022)) + 'px',
            fontFamily: 'Georgia, serif', color: '#ffd700', fontStyle: 'bold',
            stroke: '#2c1810', strokeThickness: 2
        }).setOrigin(0.5).setDepth(61);

        // Player stats bar at bottom
        if (this.saveData) {
            const s = this.saveData.stats || {};
            const barY = h - Math.max(32, h * 0.05) - 8;
            const statsBg = this.add.graphics().setDepth(60);
            statsBg.fillStyle(0x2c1810, 0.8);
            statsBg.fillRoundedRect(8, barY, w - 16, Math.max(28, h * 0.04), 6);
            statsBg.lineStyle(1, 0xc9a84c, 0.4);
            statsBg.strokeRoundedRect(8, barY, w - 16, Math.max(28, h * 0.04), 6);

            const fs = Math.max(11, Math.min(14, w * 0.015)) + 'px';
            const statsText = `❤️ HP: ${s.hp||100}/${s.maxHp||100}   ⚡ Energy: ${s.energy||100}/${s.maxEnergy||100}`;
            this.add.text(w / 2, barY + Math.max(14, h * 0.02), statsText, {
                fontSize: fs, fontFamily: 'Arial', color: '#d4c4a0', fontStyle: 'bold'
            }).setOrigin(0.5).setDepth(61);
        }
    }

    /* =============================================
     *  SAVE/LOAD
     * ============================================= */
    saveGame() {
        if (!this.saveData) return;
        try {
            localStorage.setItem('isekai_world_save', JSON.stringify(this.saveData));
        } catch (e) {}
    }

    loadSave() {
        try {
            const r = localStorage.getItem('isekai_world_save');
            return r ? JSON.parse(r) : null;
        } catch (e) { return null; }
    }

    shutdown() { this.saveGame(); }
}
