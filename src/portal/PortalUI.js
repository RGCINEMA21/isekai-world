/**
 * PortalUI - UI utama Portal Monster.
 * Responsive: Mobile Portrait & Desktop Landscape.
 * Area cards besar dan mudah disentuh.
 */
class PortalUI {
    constructor(scene, portalManager) {
        this.scene = scene;
        this.portalManager = portalManager;
        this.container = null;
        this.areaSelector = null;
        this.selectedArea = null;
        this.isPortrait = false;
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
        const w = this.scene.cameras.main.width;
        const h = this.scene.cameras.main.height;
        this.isPortrait = h > w;

        this.container = this.scene.add.container(0, 0).setDepth(500).setScrollFactor(0);

        // Dim overlay - only visual, NO pointer events
        const dim = this.scene.add.graphics();
        dim.fillStyle(0x000000, 0.6);
        dim.fillRect(0, 0, w, h);
        this.container.add(dim);

        // Panel size - fills most of the screen on mobile
        const pw = this.isPortrait ? w * 0.95 : Math.min(700, w * 0.65);
        const ph = this.isPortrait ? h * 0.85 : Math.min(520, h * 0.88);
        const px = w / 2;
        const py = h / 2;

        // Background panel
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x1a0a00, 0.4);
        bg.fillRoundedRect(px - pw / 2 + 5, py - ph / 2 + 5, pw, ph, 16);
        bg.fillStyle(0x2c1810, 0.97);
        bg.fillRoundedRect(px - pw / 2, py - ph / 2, pw, ph, 14);
        bg.fillStyle(0x3a2415, 0.3);
        bg.fillRoundedRect(px - pw / 2 + 8, py - ph / 2 + 8, pw - 16, ph - 16, 12);
        bg.lineStyle(3, 0xc9a84c, 0.9);
        bg.strokeRoundedRect(px - pw / 2, py - ph / 2, pw, ph, 14);
        this.container.add(bg);

        // Title
        const titleFs = this.isPortrait ? '20px' : '22px';
        const titleY = py - ph / 2 + 16;
        this.container.add(this.scene.add.text(px, titleY, '⚔ PORTAL MONSTER', {
            fontSize: titleFs,
            fontFamily: 'Georgia, serif',
            color: '#ff6644',
            fontStyle: 'bold',
            stroke: '#2c1810',
            strokeThickness: 3
        }).setOrigin(0.5));

        // Level info
        const infoY = titleY + 30;
        const infoFs = this.isPortrait ? '13px' : '14px';
        this.container.add(this.scene.add.text(px, infoY,
            'Level Kamu: ' + playerLevel + '  ·  Pilih area untuk bertarung!', {
            fontSize: infoFs,
            fontFamily: 'Arial',
            color: '#c9a84c'
        }).setOrigin(0.5));

        // Separator
        const sep = this.scene.add.graphics();
        sep.lineStyle(1, 0xc9a84c, 0.3);
        sep.lineBetween(px - pw / 2 + 20, infoY + 16, px + pw / 2 - 20, infoY + 16);
        this.container.add(sep);

        // Area list - scrollable on mobile
        const gridTop = infoY + 24;
        const gridH = ph * 0.52;
        const gridW = pw - 24;

        // Use AreaSelector
        this.areaSelector = new AreaSelector(this.scene, this.portalManager, {
            onAreaSelected: (area) => {
                this.selectedArea = area;
                this.showAreaDetail(area, px, py, pw, ph, playerLevel);
            },
            onEnterArea: (area) => this.enterArea(area),
            playerLevel: playerLevel,
            isPortrait: this.isPortrait
        });
        this.areaSelector.create(this.container, px - gridW / 2, gridTop, gridW, gridH);

        // Action buttons
        this.createButtons(px, py, pw, ph);
    }

    showAreaDetail(area, px, py, pw, ph, playerLevel) {
        // Remove old detail
        if (this._detailContainer) {
            this._detailContainer.destroy();
            this._detailContainer = null;
        }

        const isUnlocked = area.status === 'unlocked';
        const dw = pw - 32;
        const dh = 100;
        const dx = px - dw / 2;
        const dy = py + ph / 2 - 170;

        this._detailContainer = this.scene.add.container(0, 0);
        this.container.add(this._detailContainer);

        // Detail background
        const dBg = this.scene.add.graphics();
        dBg.fillStyle(0x1a0a00, 0.8);
        dBg.fillRoundedRect(dx, dy, dw, dh, 8);
        dBg.lineStyle(2, isUnlocked ? 0x44cc44 : 0x882222, 0.6);
        dBg.strokeRoundedRect(dx, dy, dw, dh, 8);
        this._detailContainer.add(dBg);

        // Area info
        const dFs = this.isPortrait ? '12px' : '13px';
        const infoText = area.icon + ' ' + area.name +
            '\nLevel: ' + area.levelRequired + '  ·  ' + (isUnlocked ? 'Terbuka' : 'Tergunci') +
            '\n' + (area.description || '');
        this._detailContainer.add(this.scene.add.text(dx + 12, dy + 10, infoText, {
            fontSize: dFs,
            fontFamily: 'Arial',
            color: isUnlocked ? '#d4c4a0' : '#777777',
            lineSpacing: 4
        }));
    }

    createButtons(px, py, pw, ph) {
        const btnY = py + ph / 2 - 55;
        const btnFs = this.isPortrait ? '16px' : '15px';
        const btnW = this.isPortrait ? 180 : 160;
        const btnH = 44;

        // Enter button
        const enterX = px - btnW / 2 - 8;
        this.enterBtnBg = this.scene.add.graphics();
        this.enterBtnBg.fillStyle(0x555555, 0.9);
        this.enterBtnBg.fillRoundedRect(enterX, btnY, btnW, btnH, 10);
        this.enterBtnBg.lineStyle(2, 0x777777, 0.7);
        this.enterBtnBg.strokeRoundedRect(enterX, btnY, btnW, btnH, 10);
        this.container.add(this.enterBtnBg);

        this.enterBtnText = this.scene.add.text(enterX + btnW / 2, btnY + btnH / 2, '🔒 Tergunci', {
            fontSize: btnFs,
            fontFamily: 'Arial',
            color: '#999999',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.container.add(this.enterBtnText);

        const enterHit = this.scene.add.rectangle(enterX + btnW / 2, btnY + btnH / 2, btnW, btnH, 0x000000, 0)
            .setInteractive({ useHandCursor: true }).setDepth(501).setScrollFactor(0);
        enterHit.on('pointerdown', (ptr) => {
            if (this.selectedArea && this.selectedArea.status === 'unlocked') {
                this.enterArea(this.selectedArea);
            }
        });
        this.container.add(enterHit);

        // Back button
        const backX = px + 8;
        const backBg = this.scene.add.graphics();
        backBg.fillStyle(0x8b3a0a, 0.9);
        backBg.fillRoundedRect(backX, btnY, btnW, btnH, 10);
        backBg.lineStyle(2, 0xc9a84c, 0.7);
        backBg.strokeRoundedRect(backX, btnY, btnW, btnH, 10);
        this.container.add(backBg);

        this.container.add(this.scene.add.text(backX + btnW / 2, btnY + btnH / 2, '⬅ Kembali', {
            fontSize: btnFs,
            fontFamily: 'Arial',
            color: '#ffd700',
            fontStyle: 'bold'
        }).setOrigin(0.5));

        const backHit = this.scene.add.rectangle(backX + btnW / 2, btnY + btnH / 2, btnW, btnH, 0x000000, 0)
            .setInteractive({ useHandCursor: true }).setDepth(501).setScrollFactor(0);
        backHit.on('pointerdown', () => this.close());
        this.container.add(backHit);
    }

    updateEnterButton(isUnlocked) {
        if (this.enterBtnBg) {
            this.enterBtnBg.clear();
            this.enterBtnBg.fillStyle(isUnlocked ? 0x228833 : 0x555555, 0.9);
            this.enterBtnBg.fillRoundedRect(0, 0, 180, 44, 10);
            this.enterBtnBg.lineStyle(2, isUnlocked ? 0x44cc44 : 0x777777, 0.7);
            this.enterBtnBg.strokeRoundedRect(0, 0, 180, 44, 10);
        }
        if (this.enterBtnText) {
            this.enterBtnText.setText(isUnlocked ? '⚔ Masuk Area' : '🔒 Tergunci');
            this.enterBtnText.setColor(isUnlocked ? '#ffffff' : '#999999');
        }
    }

    enterArea(area) {
        if (!area || area.status !== 'unlocked') return;
        this.onEnterArea(area);
    }

    close() {
        if (this.container) {
            this.scene.tweens.add({
                targets: this.container,
                alpha: 0,
                duration: 200,
                onComplete: () => {
                    this.destroy();
                    this.onBack();
                }
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
