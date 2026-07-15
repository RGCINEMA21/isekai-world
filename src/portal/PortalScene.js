/**
 * PortalScene - Portal Monster UI.
 * Shows all 10 areas with lock/unlock status based on player level.
 */
class PortalScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PortalScene' });
    }

    create() {
        this.saveData = this._loadSave();
        this.playerLevel = this.saveData?.stats?.level || 1;

        this.drawBackground();
        this.buildUI();

        this.input.keyboard.on('keydown-ESC', () => this.exitPortal());
        this.cameras.main.fadeIn(300, 0, 0, 0);
    }

    drawBackground() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        const g = this.add.graphics();
        for (let i = 0; i < h; i++) {
            const t = i / h;
            g.lineStyle(1, Phaser.Display.Color.GetColor(
                Math.floor(20 + t * 30), Math.floor(5 + t * 10), Math.floor(30 + t * 30)
            ));
            g.lineBetween(0, i, w, i);
        }
    }

    buildUI() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        const isPortrait = h > w;

        // Main panel
        const pw = isPortrait ? w * 0.94 : Math.min(700, w * 0.65);
        const ph = isPortrait ? h * 0.85 : Math.min(520, h * 0.88);
        const px = w / 2;
        const py = h / 2;

        const bg = this.add.graphics();
        bg.fillStyle(0x1a0a00, 0.3); bg.fillRoundedRect(px-pw/2+4, py-ph/2+4, pw, ph, 14);
        bg.fillStyle(0x2c1810, 0.95); bg.fillRoundedRect(px-pw/2, py-ph/2, pw, ph, 12);
        bg.fillStyle(0x3a2415, 0.5); bg.fillRoundedRect(px-pw/2+6, py-ph/2+6, pw-12, ph-12, 10);
        bg.lineStyle(3, 0xc9a84c, 0.9); bg.strokeRoundedRect(px-pw/2, py-ph/2, pw, ph, 12);

        // Title
        const titleFs = Math.max(14, Math.min(20, w*0.022)) + 'px';
        this.add.text(px, py - ph/2 + 28, '⚔ Portal Monster', {
            fontSize: titleFs, fontFamily: 'Georgia, serif',
            color: '#ffd700', fontStyle: 'bold', stroke: '#2c1810', strokeThickness: 2
        }).setOrigin(0.5);

        // Player level
        this.add.text(px, py - ph/2 + 52, 'Level Kamu: ' + this.playerLevel, {
            fontSize: Math.max(11, Math.min(13, w*0.014)) + 'px',
            fontFamily: 'Arial', color: '#44ccff', fontStyle: 'bold'
        }).setOrigin(0.5);

        // Area grid
        const areas = MonsterAreaDatabase.getAllAreas();
        const cols = isPortrait ? 2 : 3;
        const gap = 10;
        const slotW = (pw - 40 - gap * (cols-1)) / cols;
        const slotH = (ph - 120) / Math.ceil(areas.length / cols) - gap;
        const gridTop = py - ph/2 + 70;
        const gridLeft = px - (cols * (slotW + gap) - gap) / 2;

        areas.forEach((area, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const sx = gridLeft + col * (slotW + gap);
            const sy = gridTop + row * (slotH + gap);
            this._createAreaSlot(area, sx, sy, slotW, slotH);
        });

        // Back button
        const backFs = Math.max(12, Math.min(15, w*0.016)) + 'px';
        const backBg = this.add.graphics();
        backBg.fillStyle(0x8b3a0a, 0.9);
        backBg.fillRoundedRect(px-50, py+ph/2-42, 100, 30, 8);
        backBg.lineStyle(2, 0xc9a84c, 0.7);
        backBg.strokeRoundedRect(px-50, py+ph/2-42, 100, 30, 8);

        this.add.text(px, py+ph/2-27, '← Kembali', {
            fontSize: backFs, fontFamily: 'Arial', color: '#ffd700', fontStyle: 'bold'
        }).setOrigin(0.5);

        const backHit = this.add.rectangle(px, py+ph/2-27, 100, 30, 0, 0)
            .setInteractive({ useHandCursor: true });
        backHit.on('pointerdown', () => this.exitPortal());
    }

    _createAreaSlot(area, x, y, w, h) {
        const unlocked = this.playerLevel >= area.levelRequired;
        const color = unlocked ? 0x2a4a2a : 0x2a2a2a;
        const borderColor = unlocked ? 0x44aa44 : 0x555555;

        const slotBg = this.add.graphics();
        slotBg.fillStyle(color, 0.9);
        slotBg.fillRoundedRect(x, y, w, h, 8);
        slotBg.lineStyle(2, borderColor, 0.7);
        slotBg.strokeRoundedRect(x, y, w, h, 8);

        // Icon
        const iconFs = Math.max(16, Math.min(22, w*0.12)) + 'px';
        this.add.text(x + w/2, y + h*0.25, area.icon, {
            fontSize: iconFs
        }).setOrigin(0.5).setAlpha(unlocked ? 1 : 0.4);

        // Name
        const nameFs = Math.max(9, Math.min(11, w*0.06)) + 'px';
        this.add.text(x + w/2, y + h*0.5, area.name, {
            fontSize: nameFs, fontFamily: 'Arial',
            color: unlocked ? '#ccffaa' : '#888888',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Level requirement
        const lvlFs = Math.max(8, Math.min(10, w*0.05)) + 'px';
        const lvlText = unlocked ? '✅ Level ' + area.levelRequired + '+' : '🔒 Level ' + area.levelRequired + '+';
        this.add.text(x + w/2, y + h*0.72, lvlText, {
            fontSize: lvlFs, fontFamily: 'Arial',
            color: unlocked ? '#44cc44' : '#cc4444'
        }).setOrigin(0.5);

        // Monster count
        this.add.text(x + w/2, y + h*0.88, area.monsters.length + ' monster', {
            fontSize: Math.max(7, Math.min(9, w*0.04)) + 'px',
            fontFamily: 'Arial', color: unlocked ? '#aabbcc' : '#666666'
        }).setOrigin(0.5);

        // Click handler
        if (unlocked) {
            const hit = this.add.rectangle(x + w/2, y + h/2, w, h, 0, 0)
                .setInteractive({ useHandCursor: true });
            hit.on('pointerdown', () => this._enterArea(area));
            hit.on('pointerover', () => {
                slotBg.clear();
                slotBg.fillStyle(0x3a6a3a, 0.95);
                slotBg.fillRoundedRect(x, y, w, h, 8);
                slotBg.lineStyle(2, 0x66cc66, 0.9);
                slotBg.strokeRoundedRect(x, y, w, h, 8);
            });
            hit.on('pointerout', () => {
                slotBg.clear();
                slotBg.fillStyle(color, 0.9);
                slotBg.fillRoundedRect(x, y, w, h, 8);
                slotBg.lineStyle(2, borderColor, 0.7);
                slotBg.strokeRoundedRect(x, y, w, h, 8);
            });
        }
    }

    _enterArea(area) {
        const config = MonsterAreaDatabase.getAreaConfig(area.id);
        if (!config) return;

        try { localStorage.setItem('isekai_world_save', JSON.stringify(this.saveData)); } catch(e) {}

        this.cameras.main.fadeOut(400, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('MonsterAreaScene', config);
        });
    }

    exitPortal() {
        this.cameras.main.fadeOut(300, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('VillageScene');
        });
    }

    _loadSave() {
        try { const r = localStorage.getItem('isekai_world_save'); return r ? JSON.parse(r) : null; } catch(e) { return null; }
    }

    shutdown() {
        try { localStorage.setItem('isekai_world_save', JSON.stringify(this.saveData)); } catch(e) {}
    }
}
