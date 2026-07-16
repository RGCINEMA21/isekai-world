/**
 * PortalUI — Portal Monster panel.
 * All sizing via ResponsiveLayout.
 */
class PortalUI {
    constructor(scene, portalManager) {
        this.scene = scene;
        this.rl = new ResponsiveLayout(scene);
        this.portalManager = portalManager;
        this.container = null;
        this.areaSelector = null;
        this.selectedArea = null;
        this.onEnterArea = null;
        this.onBack = null;
    }

    open(saveData, callbacks) {
        this.onEnterArea = callbacks.onEnterArea || (() => {});
        this.onBack = callbacks.onBack || (() => {});
        const playerLevel = saveData?.stats?.level || 1;
        this.portalManager.refreshUnlocks(playerLevel);
        this.build(playerLevel);
    }

    build(playerLevel) {
        this.destroy();
        this.rl.recalculate();
        const { w, h, isPortrait } = this.rl;
        const rl = this.rl;

        this.container = this.scene.add.container(0, 0).setDepth(500).setScrollFactor(0);

        // Dim overlay
        const dim = this.scene.add.graphics();
        dim.fillStyle(0x000000, 0.6);
        dim.fillRect(0, 0, w, h);
        this.container.add(dim);

        // Panel
        const pw = rl.panelWidth(isPortrait ? 0.94 : 0.6);
        const ph = rl.panelHeight(isPortrait ? 0.8 : 0.85);
        const px = w / 2;
        const py = h / 2;

        const bg = this.scene.add.graphics();
        bg.fillStyle(0x1a0a00, 0.4); bg.fillRoundedRect(px - pw/2 + 5, py - ph/2 + 5, pw, ph, 16);
        bg.fillStyle(0x2c1810, 0.97); bg.fillRoundedRect(px - pw/2, py - ph/2, pw, ph, 14);
        bg.fillStyle(0x3a2415, 0.3); bg.fillRoundedRect(px - pw/2 + 8, py - ph/2 + 8, pw - 16, ph - 16, 12);
        bg.lineStyle(3, 0xc9a84c, 0.9); bg.strokeRoundedRect(px - pw/2, py - ph/2, pw, ph, 14);
        this.container.add(bg);

        // Title
        const titleFs = rl.fontSize(18);
        const titleY = py - ph/2 + 22;
        this.container.add(this.scene.add.text(px, titleY, '⚔ PORTAL MONSTER', {
            fontSize: titleFs + 'px', fontFamily: 'Georgia, serif', color: '#ff6644',
            fontStyle: 'bold', stroke: '#2c1810', strokeThickness: 3
        }).setOrigin(0.5));

        // Level info
        const infoY = titleY + 32;
        this.container.add(this.scene.add.text(px, infoY, 'Level Kamu: ' + playerLevel + '  ·  Pilih area!', {
            fontSize: rl.fontSize(12) + 'px', fontFamily: 'Arial', color: '#c9a84c'
        }).setOrigin(0.5));

        // Separator
        const sep = this.scene.add.graphics();
        sep.lineStyle(1, 0xc9a84c, 0.3);
        sep.lineBetween(px - pw/2 + 20, infoY + 16, px + pw/2 - 20, infoY + 16);
        this.container.add(sep);

        // Area grid
        const gridTop = infoY + 24;
        const gridBottom = py + ph/2 - 130;
        const gridH = Math.max(120, gridBottom - gridTop);
        const gridW = pw - 24;

        this.areaSelector = new AreaSelector(this.scene, this.portalManager, {
            onAreaSelected: (area) => {
                this.selectedArea = area;
                this.showAreaDetail(area, px, py, pw, ph);
            },
            onEnterArea: (area) => this.enterArea(area),
            playerLevel: playerLevel,
            isPortrait: isPortrait,
            rl: rl
        });
        this.areaSelector.create(this.container, px - gridW/2, gridTop, gridW, gridH);

        // Buttons
        const btnY = py + ph/2 - 55;
        const btnFs = rl.fontSize(14);
        const btnW = Math.round(pw * 0.38);
        const btnH = Math.max(40, Math.min(50, rl.smaller * 0.065));

        // Enter
        const enterX = px - btnW/2 - 8;
        this.enterBtnBg = this.scene.add.graphics();
        this.enterBtnBg.fillStyle(0x555555, 0.9);
        this.enterBtnBg.fillRoundedRect(enterX, btnY, btnW, btnH, 10);
        this.enterBtnBg.lineStyle(2, 0x777777, 0.7);
        this.enterBtnBg.strokeRoundedRect(enterX, btnY, btnW, btnH, 10);
        this.container.add(this.enterBtnBg);
        this.enterBtnText = this.scene.add.text(enterX + btnW/2, btnY + btnH/2, '🔒 Tergunci', {
            fontSize: btnFs + 'px', fontFamily: 'Arial', color: '#999999', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.container.add(this.enterBtnText);
        const enterHit = this.scene.add.rectangle(enterX + btnW/2, btnY + btnH/2, btnW + 20, btnH + 20, 0, 0)
            .setInteractive({ useHandCursor: true }).setDepth(501).setScrollFactor(0);
        enterHit.on('pointerdown', () => {
            if (this.selectedArea?.status === 'unlocked') this.enterArea(this.selectedArea);
        });
        this.container.add(enterHit);

        // Back
        const backX = px + 8;
        const backBg = this.scene.add.graphics();
        backBg.fillStyle(0x8b3a0a, 0.9);
        backBg.fillRoundedRect(backX, btnY, btnW, btnH, 10);
        backBg.lineStyle(2, 0xc9a84c, 0.7);
        backBg.strokeRoundedRect(backX, btnY, btnW, btnH, 10);
        this.container.add(backBg);
        this.container.add(this.scene.add.text(backX + btnW/2, btnY + btnH/2, '⬅ Kembali', {
            fontSize: btnFs + 'px', fontFamily: 'Arial', color: '#ffd700', fontStyle: 'bold'
        }).setOrigin(0.5));
        const backHit = this.scene.add.rectangle(backX + btnW/2, btnY + btnH/2, btnW + 20, btnH + 20, 0, 0)
            .setInteractive({ useHandCursor: true }).setDepth(501).setScrollFactor(0);
        backHit.on('pointerdown', () => this.close());
        this.container.add(backHit);
    }

    showAreaDetail(area, px, py, pw, ph) {
        if (this._detailContainer) { this._detailContainer.destroy(); this._detailContainer = null; }
        const isUnlocked = area.status === 'unlocked';
        const dw = pw - 32;
        const dh = 85;
        this._detailContainer = this.scene.add.container(0, 0);
        this.container.add(this._detailContainer);
        const dBg = this.scene.add.graphics();
        dBg.fillStyle(0x1a0a00, 0.8); dBg.fillRoundedRect(px - dw/2, py + ph/2 - 160, dw, dh, 8);
        dBg.lineStyle(2, isUnlocked ? 0x44cc44 : 0x882222, 0.6);
        dBg.strokeRoundedRect(px - dw/2, py + ph/2 - 160, dw, dh, 8);
        this._detailContainer.add(dBg);
        this._detailContainer.add(this.scene.add.text(px - dw/2 + 12, py + ph/2 - 150,
            area.icon + ' ' + area.name + '\nLevel: ' + area.levelRequired + ' · ' + (isUnlocked ? 'Terbuka' : 'Tergunci') + '\n' + (area.description || ''), {
            fontSize: this.rl.fontSize(11) + 'px', fontFamily: 'Arial', color: isUnlocked ? '#d4c4a0' : '#777', lineSpacing: 4
        }));
    }

    enterArea(area) {
        if (!area || area.status !== 'unlocked') return;
        this.onEnterArea(area);
    }

    close() {
        if (this.container) {
            this.scene.tweens.add({ targets: this.container, alpha: 0, duration: 200,
                onComplete: () => { this.destroy(); this.onBack(); }
            });
        }
    }

    destroy() {
        if (this.areaSelector) { this.areaSelector.destroy(); this.areaSelector = null; }
        if (this._detailContainer) { this._detailContainer.destroy(); this._detailContainer = null; }
        if (this.container) { this.container.destroy(); this.container = null; }
        this.selectedArea = null;
    }
}
