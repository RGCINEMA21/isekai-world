/**
 * PortalUI - UI utama Portal Monster.
 * Menampilkan popup dengan daftar area, detail, dan tombol masuk.
 * Responsive: Mobile Portrait & Desktop Landscape.
 */
class PortalUI {
    constructor(scene, portalManager) {
        this.scene = scene;
        this.portalManager = portalManager;
        this.container = null;
        this.detailPanel = null;
        this.areaSelector = null;
        this.selectedArea = null;
        this.isPortrait = false;
        this.onEnterArea = null;
        this.onBack = null;
    }

    /** Buka portal UI */
    open(saveData, callbacks) {
        this.onEnterArea = callbacks.onEnterArea || (() => {});
        this.onBack = callbacks.onBack || (() => {});

        const playerLevel = saveData?.stats?.level || 1;
        this.portalManager.refreshUnlocks(playerLevel);

        this.build(playerLevel);
    }

    /** Bangun seluruh UI */
    build(playerLevel) {
        this.destroy();

        const w = this.scene.cameras.main.width;
        const h = this.scene.cameras.main.height;
        this.isPortrait = h > w;

        this.container = this.scene.add.container(0, 0).setDepth(500).setScrollFactor(0);

        // Overlay gelap
        const dim = this.scene.add.graphics();
        dim.fillStyle(0x000000, 0.5);
        dim.fillRect(0, 0, w, h);
        this.container.add(dim);

        // Klik overlay untuk tutup
        const dimHit = this.scene.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0)
            .setInteractive();
        dimHit.on('pointerdown', () => this.close());
        this.container.add(dimHit);

        // Panel utama
        const pw = this.isPortrait ? w * 0.92 : Math.min(600, w * 0.6);
        const ph = this.isPortrait ? h * 0.78 : Math.min(480, h * 0.85);
        const px = w / 2;
        const py = h / 2;

        this.drawMainPanel(px, py, pw, ph, playerLevel);

        // Fade in
        this.container.setAlpha(0);
        this.scene.tweens.add({ targets: this.container, alpha: 1, duration: 250 });
    }

    /** Gambar panel utama */
    drawMainPanel(px, py, pw, ph, playerLevel) {
        // Background panel
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x1a0a00, 0.3);
        bg.fillRoundedRect(px - pw / 2 + 4, py - ph / 2 + 4, pw, ph, 14);
        bg.fillStyle(0x2c1810, 0.95);
        bg.fillRoundedRect(px - pw / 2, py - ph / 2, pw, ph, 12);
        bg.fillStyle(0x3a2415, 0.5);
        bg.fillRoundedRect(px - pw / 2 + 6, py - ph / 2 + 6, pw - 12, ph - 12, 10);
        bg.lineStyle(3, 0xc9a84c, 0.9);
        bg.strokeRoundedRect(px - pw / 2, py - ph / 2, pw, ph, 12);
        bg.lineStyle(1, 0x8b6914, 0.3);
        bg.strokeRoundedRect(px - pw / 2 + 8, py - ph / 2 + 8, pw - 16, ph - 16, 10);
        this.container.add(bg);

        // Corner gems
        const corners = [
            [px - pw / 2 + 12, py - ph / 2 + 12],
            [px + pw / 2 - 12, py - ph / 2 + 12],
            [px - pw / 2 + 12, py + ph / 2 - 12],
            [px + pw / 2 - 12, py + ph / 2 - 12]
        ];
        corners.forEach(([cx, cy]) => {
            const gem = this.scene.add.graphics();
            gem.fillStyle(0xff4444, 0.7);
            gem.fillCircle(cx, cy, 5);
            gem.fillStyle(0xff8888, 0.4);
            gem.fillCircle(cx - 1, cy - 1, 3);
            this.container.add(gem);
        });

        // Title
        const titleY = py - ph / 2 + 14;
        const titleBg = this.scene.add.graphics();
        titleBg.fillStyle(0x6b1a0a, 0.7);
        titleBg.fillRoundedRect(px - 120, titleY, 240, 32, 8);
        this.container.add(titleBg);

        const titleFs = Math.max(14, Math.min(20, pw * 0.035)) + 'px';
        this.container.add(this.scene.add.text(px, titleY + 16, '⚔ PORTAL MONSTER', {
            fontSize: titleFs,
            fontFamily: 'Georgia, serif',
            color: '#ff6644',
            fontStyle: 'bold',
            stroke: '#2c1810',
            strokeThickness: 2
        }).setOrigin(0.5));

        // Info bar
        const infoY = titleY + 38;
        const infoFs = Math.max(9, Math.min(12, pw * 0.02)) + 'px';
        this.container.add(this.scene.add.text(px, infoY,
            `Level Kamu: ${playerLevel}  ·  Pilih area untuk bertarung!`, {
            fontSize: infoFs,
            fontFamily: 'Arial',
            color: '#c9a84c'
        }).setOrigin(0.5));

        // Separator
        const sep = this.scene.add.graphics();
        sep.lineStyle(1, 0xc9a84c, 0.3);
        sep.lineBetween(px - pw / 2 + 16, infoY + 14, px + pw / 2 - 16, infoY + 14);
        this.container.add(sep);

        // Area grid area
        const gridTop = infoY + 22;
        const gridH = ph * 0.38;
        const gridW = pw - 24;

        this.areaSelector = new AreaSelector(this.scene, this.portalManager, {
            onAreaSelected: (area) => this.showAreaDetail(area, px, py, pw, ph, playerLevel),
            onEnterArea: (area) => this.enterArea(area),
            playerLevel: playerLevel,
            isPortrait: this.isPortrait
        });
        this.areaSelector.create(this.container, px - gridW / 2, gridTop, gridW, gridH);

        // Detail panel (di bawah grid)
        this.detailContainer = this.scene.add.container(px, gridTop + gridH + 12).setDepth(501);
        this.container.add(this.detailContainer);

        // Tombol
        this.createButtons(px, py, pw, ph);
    }

    /** Tampilkan detail area yang dipilih */
    showAreaDetail(area, px, py, pw, ph, playerLevel) {
        this.selectedArea = area;
        this.detailContainer.removeAll(true);

        const dw = pw - 24;
        const dh = Math.min(100, ph * 0.22);

        // Background detail
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x1a3a1a, 0.5);
        bg.fillRoundedRect(-dw / 2, 0, dw, dh, 8);
        bg.lineStyle(1, 0x8b6914, 0.5);
        bg.strokeRoundedRect(-dw / 2, 0, dw, dh, 8);
        this.detailContainer.add(bg);

        const isUnlocked = area.status === 'unlocked';
        const tFs = Math.max(11, Math.min(14, pw * 0.025)) + 'px';
        const dFs = Math.max(9, Math.min(11, pw * 0.018)) + 'px';

        // Nama area
        this.detailContainer.add(this.scene.add.text(0, 10, area.icon + ' ' + area.name, {
            fontSize: tFs,
            fontFamily: 'Arial',
            color: '#ffd700',
            fontStyle: 'bold'
        }).setOrigin(0.5));

        // Info detail
        const infoLines = [
            `Level Direkomendasikan: ${area.recommendedLevel}`,
            `Kesulitan: ${area.difficulty}`,
            `Monster: ${isUnlocked ? '(Belum dibuat)' : 'Terkunci'}`,
            `Drop: ${isUnlocked ? '(Belum dibuat)' : 'Terkunci'}`
        ];

        const col1X = -dw / 2 + 14;
        const col2X = dw / 4;
        const startY = 30;

        infoLines.forEach((line, i) => {
            const x = i < 2 ? col1X : col2X;
            const y = startY + (i % 2) * 16;
            this.detailContainer.add(this.scene.add.text(x, y, '• ' + line, {
                fontSize: dFs,
                fontFamily: 'Arial',
                color: isUnlocked ? '#d4c4a0' : '#777777'
            }));
        });

        // Status badge
        const badgeColor = isUnlocked ? 0x228833 : 0x882222;
        const badgeText = isUnlocked ? '✅ Terbuka' : `🔒 Lv.${area.levelRequired}`;
        const badge = this.scene.add.graphics();
        badge.fillStyle(badgeColor, 0.8);
        badge.fillRoundedRect(dw / 2 - 80, 8, 72, 20, 6);
        this.detailContainer.add(badge);

        this.detailContainer.add(this.scene.add.text(dw / 2 - 44, 18, badgeText, {
            fontSize: '9px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5));

        // Update tombol Masuk
        this.updateEnterButton(isUnlocked);
    }

    /** Update status tombol Masuk */
    updateEnterButton(isUnlocked) {
        if (this.enterBtnBg) {
            this.enterBtnBg.clear();
            this.enterBtnBg.fillStyle(isUnlocked ? 0x228833 : 0x555555, 0.9);
            this.enterBtnBg.fillRoundedRect(-80, 0, 160, 36, 8);
            this.enterBtnBg.lineStyle(2, isUnlocked ? 0x44cc44 : 0x777777, 0.7);
            this.enterBtnBg.strokeRoundedRect(-80, 0, 160, 36, 8);
        }
        if (this.enterBtnText) {
            this.enterBtnText.setText(isUnlocked ? '⚔ Masuk Area' : '🔒 Tergunci');
            this.enterBtnText.setColor(isUnlocked ? '#ffffff' : '#999999');
        }
        if (this.enterBtnHit) {
            if (isUnlocked) {
                this.enterBtnHit.setInteractive({ useHandCursor: true });
            } else {
                this.enterBtnHit.disableInteractive();
            }
        }
    }

    /** Buat tombol aksi */
    createButtons(px, py, pw, ph) {
        const btnY = py + ph / 2 - 50;
        const btnFs = Math.max(12, Math.min(15, pw * 0.025)) + 'px';

        // Tombol Masuk
        this.enterBtnBg = this.scene.add.graphics();
        this.enterBtnBg.fillStyle(0x555555, 0.9);
        this.enterBtnBg.fillRoundedRect(-80, 0, 160, 36, 8);
        this.enterBtnBg.lineStyle(2, 0x777777, 0.7);
        this.enterBtnBg.strokeRoundedRect(-80, 0, 160, 36, 8);

        const enterContainer = this.scene.add.container(px - 90, btnY);
        enterContainer.add(this.enterBtnBg);

        this.enterBtnText = this.scene.add.text(0, 18, '🔒 Tergunci', {
            fontSize: btnFs,
            fontFamily: 'Arial',
            color: '#999999',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        enterContainer.add(this.enterBtnText);

        this.enterBtnHit = this.scene.add.rectangle(0, 18, 160, 36, 0x000000, 0);
        enterContainer.add(this.enterBtnHit);

        this.enterBtnHit.on('pointerdown', () => {
            if (this.selectedArea && this.selectedArea.status === 'unlocked') {
                this.enterArea(this.selectedArea);
            }
        });

        this.container.add(enterContainer);

        // Tombol Kembali
        const backContainer = this.scene.add.container(px + 90, btnY);

        const backBg = this.scene.add.graphics();
        backBg.fillStyle(0x8b3a0a, 0.9);
        backBg.fillRoundedRect(-80, 0, 160, 36, 8);
        backBg.lineStyle(2, 0xc9a84c, 0.7);
        backBg.strokeRoundedRect(-80, 0, 160, 36, 8);
        backContainer.add(backBg);

        backContainer.add(this.scene.add.text(0, 18, '⬅ Kembali', {
            fontSize: btnFs,
            fontFamily: 'Arial',
            color: '#ffd700',
            fontStyle: 'bold'
        }).setOrigin(0.5));

        const backHit = this.scene.add.rectangle(0, 18, 160, 36, 0x000000, 0)
            .setInteractive({ useHandCursor: true });
        backContainer.add(backHit);

        backHit.on('pointerdown', () => this.close());
        this.container.add(backContainer);
    }

    /** Masuk ke area */
    enterArea(area) {
        if (!area || area.status !== 'unlocked') return;
        this.onEnterArea(area);
    }

    /** Tutup portal UI */
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

    /** Bersihkan semua */
    destroy() {
        if (this.areaSelector) {
            this.areaSelector.destroy();
            this.areaSelector = null;
        }
        if (this.container) {
            this.container.destroy();
            this.container = null;
        }
        this.selectedArea = null;
    }
}
