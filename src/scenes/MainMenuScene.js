/**
 * MainMenuScene - Halaman menu utama game ISEKAI WORLD.
 * Background bertema isekai fantasy (portal, langit magis, floating islands).
 * Layout responsif untuk desktop, tablet, dan HP.
 */
class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });

        this.titleText = null;
        this.subtitleText = null;
        this.versionText = null;
        this.copyrightText = null;
        this.menuButtons = [];
        this.settingsPopup = null;
        this.exitPopup = null;
        this.dimOverlay = null;
    }

    create() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;

        // Background isekai fantasy
        this.createIsekaiBackground(w, h);

        // Dim overlay for popups
        this.dimOverlay = this.add.rectangle(w/2, h/2, w, h, 0x000000, 0)
            .setDepth(100)
            .setInteractive();

        // Responsive layout - calculate positions based on screen size
        const isMobile = w < 600 || h < 500;
        const titleSize = isMobile ? '48px' : '72px';
        const subtitleSize = isMobile ? '14px' : '20px';
        const btnSize = isMobile ? '20px' : '26px';
        const btnWidth = isMobile ? 220 : 300;
        const btnHeight = isMobile ? 45 : 58;

        // Title position - adapt to available space
        const titleY = h < 500 ? h * 0.12 : h * 0.16;
        const subtitleY = titleY + (isMobile ? 40 : 60);
        const btnStartY = h < 500 ? h * 0.35 : h * 0.38;
        const btnSpacing = isMobile ? 55 : 72;
        const maxButtons = h < 500 ? 3 : 4;

        // --- JUDUL ---
        this.titleText = this.add.text(w/2, titleY, 'ISEKAI WORLD', {
            fontSize: titleSize,
            fontFamily: 'Arial, sans-serif',
            color: '#fff8e7',
            fontStyle: 'bold',
            stroke: '#1a1a2e',
            strokeThickness: 6,
            shadow: { offsetX: 3, offsetY: 3, color: '#000', blur: 12, fill: true }
        }).setOrigin(0.5).setAlpha(0).setDepth(10);

        // --- SUBTITLE ---
        this.subtitleText = this.add.text(w/2, subtitleY, 'Offline Version v0.0.1', {
            fontSize: subtitleSize,
            fontFamily: 'Arial, sans-serif',
            color: '#ddd8cc',
            stroke: '#000',
            strokeThickness: 2
        }).setOrigin(0.5).setAlpha(0).setDepth(10);

        // --- COPYRIGHT ---
        this.copyrightText = this.add.text(w/2, h - 18, '© ISEKAI WORLD PROJECT', {
            fontSize: '12px',
            fontFamily: 'Arial, sans-serif',
            color: '#888888',
            stroke: '#000',
            strokeThickness: 1
        }).setOrigin(0.5).setAlpha(0).setDepth(10);

        // --- BUTTONS ---
        const buttonData = [
            { label: '▶  New Game',   action: 'newGame',   enabled: true },
            { label: '▶  Continue',   action: 'continue',  enabled: false },
            { label: '⚙  Settings',   action: 'settings',  enabled: true },
            { label: '✕  Exit',       action: 'exit',      enabled: true }
        ];

        const visibleButtons = buttonData.slice(0, maxButtons);
        const totalBtnHeight = visibleButtons.length * btnSpacing;
        const actualStartY = btnStartY;

        visibleButtons.forEach((data, i) => {
            const btnY = actualStartY + i * btnSpacing;
            const btn = this.createButton(w/2, btnY, data, btnWidth, btnHeight, btnSize, i);
            this.menuButtons.push(btn);
        });

        // Audio placeholder
        this.initAudio();

        // Animate entrance
        this.playEntranceAnimation(h);
    }

    /* =============================================
     *  ISEKAI FANTASY BACKGROUND
     * ============================================= */
    createIsekaiBackground(w, h) {
        const g = this.add.graphics().setDepth(0);

        // 1. Sky gradient (magic twilight)
        for (let i = 0; i < h * 0.6; i++) {
            const t = i / (h * 0.6);
            const r = Math.floor(Phaser.Math.Linear(80, 180, t));
            const gr = Math.floor(Phaser.Math.Linear(40, 100, t));
            const b = Math.floor(Phaser.Math.Linear(140, 220, t));
            g.lineStyle(1, Phaser.Display.Color.GetColor(r, gr, b));
            g.lineBetween(0, i, w, i);
        }

        // 2. Stars + magic particles
        for (let i = 0; i < 80; i++) {
            const sx = Phaser.Math.Between(0, w);
            const sy = Phaser.Math.Between(0, h * 0.45);
            const size = Phaser.Math.Between(1, 3);
            const alpha = Phaser.Math.FloatBetween(0.3, 1);
            // Random star color
            const colors = [0xffffff, 0xfff5cc, 0xccddff, 0xffccaa];
            g.fillStyle(colors[Phaser.Math.Between(0, 3)], alpha);
            g.fillRect(sx, sy, size, size);
        }

        // 3. Floating islands with magic glow
        const islandPositions = [
            { x: w * 0.08, y: h * 0.25, s: 0.6 },
            { x: w * 0.85, y: h * 0.20, s: 0.8 },
            { x: w * 0.15, y: h * 0.48, s: 0.5 },
            { x: w * 0.92, y: h * 0.50, s: 0.7 }
        ];

        islandPositions.forEach(pos => {
            this.drawFloatingIsland(g, pos.x, pos.y, pos.s);
        });

        // 4. Portal (isekai dimensional gate)
        const portalX = w * 0.5;
        const portalY = h * 0.55;
        this.drawPortal(g, portalX, portalY);

        // 5. Ground with magic grass
        g.fillStyle(0x1a3a1a, 1);
        g.fillRect(0, h * 0.65, w, h * 0.35);

        // Magic grass patches
        for (let i = 0; i < 40; i++) {
            const gx = Phaser.Math.Between(0, w);
            const gy = Phaser.Math.Between(Math.floor(h * 0.65), h);
            const alpha = Phaser.Math.FloatBetween(0.2, 0.5);
            const colors = [0x2d5a27, 0x3a7a30, 0x4a8a40, 0x225522];
            g.fillStyle(colors[Phaser.Math.Between(0, 3)], alpha);
            g.fillRect(gx, gy, Phaser.Math.Between(4, 20), 3);
        }

        // 6. Sparkle particles overlay
        for (let i = 0; i < 30; i++) {
            const px = Phaser.Math.Between(0, w);
            const py = Phaser.Math.Between(0, h);
            g.fillStyle(0xffffff, Phaser.Math.FloatBetween(0.1, 0.4));
            g.fillRect(px, py, 2, 2);
        }

        // 7. Semi-transparent dark overlay for readability
        g.fillStyle(0x000000, 0.25);
        g.fillRect(0, 0, w, h);
    }

    drawFloatingIsland(g, x, y, scale) {
        // Magic glow
        g.fillStyle(0x6644aa, 0.15);
        g.fillCircle(x, y + 15 * scale, 40 * scale);

        // Island body
        g.fillStyle(0x3a2a1a, 1);
        g.fillTriangle(
            x, y - 20 * scale,
            x - 40 * scale, y + 10 * scale,
            x + 40 * scale, y + 10 * scale
        );

        // Grass top
        g.fillStyle(0x2d6a2d, 1);
        g.fillRect(x - 35 * scale, y - 20 * scale, 70 * scale, 6 * scale);

        // Trees
        this.drawMiniTree(g, x - 20 * scale, y - 25 * scale, scale * 0.5);
        this.drawMiniTree(g, x + 15 * scale, y - 22 * scale, scale * 0.4);
    }

    drawMiniTree(g, x, y, s) {
        g.fillStyle(0x5C3317, 1);
        g.fillRect(x - 2, y - 8 * s, 4, 12 * s);
        g.fillStyle(0x1a6b1a, 1);
        g.fillCircle(x, y - 15 * s, 10 * s);
        g.fillStyle(0x228B22, 0.8);
        g.fillCircle(x - 5 * s, y - 12 * s, 7 * s);
        g.fillCircle(x + 5 * s, y - 12 * s, 7 * s);
    }

    drawPortal(g, x, y) {
        // Outer glow
        g.fillStyle(0x8844ff, 0.1);
        g.fillCircle(x, y, 70);

        // Outer ring
        g.lineStyle(4, 0x9966ff, 0.6);
        g.strokeCircle(x, y, 45);
        g.lineStyle(2, 0xcc88ff, 0.8);
        g.strokeCircle(x, y, 40);

        // Inner portal
        for (let i = 0; i < 15; i++) {
            const angle = (i / 15) * Math.PI * 2;
            const radius = Phaser.Math.Between(5, 35);
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;
            const colors = [0x8844ff, 0xaa66ff, 0xcc88ff, 0xffaaee, 0x9966ff];
            g.fillStyle(colors[Phaser.Math.Between(0, 4)], Phaser.Math.FloatBetween(0.3, 0.8));
            g.fillRect(px - 2, py - 2, 4, 4);
        }

        // Center light
        g.fillStyle(0xccaaff, 0.3);
        g.fillCircle(x, y, 20);
        g.fillStyle(0xffffff, 0.15);
        g.fillCircle(x, y, 10);

        // Magic particles around portal
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + 0.3;
            const dist = 50;
            const px = x + Math.cos(angle) * dist;
            const py = y + Math.sin(angle) * dist;
            g.fillStyle(0xcc88ff, Phaser.Math.FloatBetween(0.2, 0.6));
            g.fillRect(px - 2, py - 2, 4, 4);
        }
    }

    /* =============================================
     *  MENU BUTTONS
     * ============================================= */
    createButton(x, y, data, btnWidth, btnHeight, btnSize, index) {
        const container = this.add.container(x, y + 300).setDepth(20).setAlpha(0);

        // Button background
        const bg = this.add.graphics();
        this.drawButton(bg, btnWidth, btnHeight, data.enabled, false);
        container.add(bg);

        // Label
        const label = this.add.text(0, 0, data.label, {
            fontSize: btnSize,
            fontFamily: 'Arial, sans-serif',
            color: data.enabled ? '#fff8e7' : '#666666',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        container.add(label);

        // Disabled note for Continue
        let disabledLabel = null;
        if (data.action === 'continue' && data.enabled === false) {
            disabledLabel = this.add.text(0, btnHeight/2 + 8, 'Belum ada Save Game.', {
                fontSize: '11px',
                fontFamily: 'Arial, sans-serif',
                color: '#888',
                fontStyle: 'italic'
            }).setOrigin(0.5);
            container.add(disabledLabel);
        }

        if (data.enabled) {
            const hitArea = this.add.rectangle(0, 0, btnWidth, btnHeight, 0x000000, 0)
                .setInteractive({ useHandCursor: true });
            container.add(hitArea);

            hitArea.on('pointerover', () => {
                this.tweens.add({ targets: container, scaleX: 1.06, scaleY: 1.06, duration: 120, ease: 'Power2' });
                bg.clear();
                this.drawButton(bg, btnWidth, btnHeight, true, true);
                label.setColor('#ffdd77');
            });

            hitArea.on('pointerout', () => {
                this.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 120, ease: 'Power2' });
                bg.clear();
                this.drawButton(bg, btnWidth, btnHeight, true, false);
                label.setColor('#fff8e7');
            });

            hitArea.on('pointerdown', () => {
                this.playClick();
                this.tweens.add({
                    targets: container, scaleX: 0.95, scaleY: 0.95,
                    duration: 60, yoyo: true, ease: 'Power2',
                    onComplete: () => { this.handleClick(data.action); }
                });
            });
        }

        return container;
    }

    drawButton(g, w, h, enabled, hovered) {
        const r = Math.min(12, w * 0.04);
        const bgColor = enabled ? (hovered ? 0x4a2a5a : 0x2a1a3a) : 0x222222;
        const borderColor = enabled ? (hovered ? 0xcc88ff : 0x8844cc) : 0x444444;
        const alpha = enabled ? 0.92 : 0.6;

        g.fillStyle(borderColor, alpha);
        g.fillRoundedRect(-w/2 - 2, -h/2 - 2, w + 4, h + 4, r + 1);
        g.fillStyle(bgColor, alpha);
        g.fillRoundedRect(-w/2, -h/2, w, h, r);
        g.fillStyle(0xffffff, enabled ? 0.06 : 0.02);
        g.fillRoundedRect(-w/2 + 2, -h/2 + 2, w - 4, h/2 - 2, Math.max(r-1, 3));
    }

    /* =============================================
     *  BUTTON ACTIONS
     * ============================================= */
    handleClick(action) {
        switch (action) {
            case 'newGame': this.showNewGamePopup(); break;
            case 'settings': this.showSettingsPopup(); break;
            case 'exit': this.showExitPopup(); break;
        }
    }

    showNewGamePopup() {
        const cx = this.cameras.main.centerX;
        const cy = this.cameras.main.centerY;
        const w = this.cameras.main.width;

        this.dimOverlay.setAlpha(0.6);
        const popupW = Math.min(440, w - 40);

        const popup = this.add.container(cx, cy).setDepth(200).setAlpha(0);

        const bg = this.add.graphics();
        bg.fillStyle(0x1a0a2e, 0.97);
        bg.fillRoundedRect(-popupW/2, -70, popupW, 140, 16);
        bg.lineStyle(2, 0x8844cc);
        bg.strokeRoundedRect(-popupW/2, -70, popupW, 140, 16);
        popup.add(bg);

        const msg = this.add.text(0, -15, '🎭 Character Creator akan\ndibuat pada Prompt #3', {
            fontSize: '20px', fontFamily: 'Arial, sans-serif',
            color: '#fff', align: 'center'
        }).setOrigin(0.5);
        popup.add(msg);

        const btnOk = this.add.rectangle(0, 45, 100, 35, 0x8844cc, 1)
            .setInteractive({ useHandCursor: true });
        popup.add(btnOk);
        const txtOk = this.add.text(0, 45, 'OK', {
            fontSize: '18px', fontFamily: 'Arial, sans-serif',
            color: '#fff', fontStyle: 'bold'
        }).setOrigin(0.5);
        popup.add(txtOk);

        btnOk.on('pointerover', () => { btnOk.setFillStyle(0xaa66ee); });
        btnOk.on('pointerout', () => { btnOk.setFillStyle(0x8844cc); });
        btnOk.on('pointerdown', () => {
            this.playClick();
            this.tweens.add({
                targets: popup, alpha: 0, duration: 200,
                onComplete: () => { popup.destroy(); this.dimOverlay.setAlpha(0); }
            });
        });

        this.tweens.add({ targets: popup, alpha: 1, duration: 300, ease: 'Power2' });
    }

    showSettingsPopup() {
        if (this.settingsPopup) return;

        const cx = this.cameras.main.centerX;
        const cy = this.cameras.main.centerY;
        const w = this.cameras.main.width;
        const isMobile = w < 600;

        this.dimOverlay.setAlpha(0.6);
        const popupW = Math.min(500, w - 30);
        const popupH = isMobile ? 370 : 400;

        this.settingsPopup = this.add.container(cx, cy).setDepth(200).setAlpha(0);

        const bg = this.add.graphics();
        bg.fillStyle(0x1a0a2e, 0.97);
        bg.fillRoundedRect(-popupW/2, -popupH/2, popupW, popupH, 16);
        bg.lineStyle(2, 0x8844cc);
        bg.strokeRoundedRect(-popupW/2, -popupH/2, popupW, popupH, 16);
        this.settingsPopup.add(bg);

        const title = this.add.text(0, -popupH/2 + 30, '⚙  Settings', {
            fontSize: '26px', fontFamily: 'Arial, sans-serif',
            color: '#fff', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.settingsPopup.add(title);

        const items = [
            { label: '🔊  Audio',      value: 'ON' },
            { label: '🎵  Music',      value: 'ON' },
            { label: '🔈  SFX',        value: 'ON' },
            { label: '🖥  Fullscreen',  value: 'OFF' },
            { label: '🌐  Bahasa',     value: 'Indonesia' }
        ];

        const itemStartY = -popupH/2 + 70;
        items.forEach((item, i) => {
            const yPos = itemStartY + i * 55;
            const label = this.add.text(-popupW/2 + 20, yPos, item.label, {
                fontSize: '18px', fontFamily: 'Arial, sans-serif',
                color: '#ccc'
            }).setOrigin(0, 0.5);
            this.settingsPopup.add(label);

            const val = this.add.text(popupW/2 - 20, yPos, item.value, {
                fontSize: '16px', fontFamily: 'Arial, sans-serif',
                color: '#88cc66', fontStyle: 'bold'
            }).setOrigin(1, 0.5);
            this.settingsPopup.add(val);

            if (i < items.length - 1) {
                bg.lineStyle(1, 0x333333);
                bg.lineBetween(-popupW/2 + 20, yPos + 22, popupW/2 - 20, yPos + 22);
            }
        });

        // Close
        const closeBtn = this.add.graphics();
        closeBtn.fillStyle(0x8844cc, 1);
        closeBtn.fillRoundedRect(-60, popupH/2 - 50, 120, 38, 8);
        this.settingsPopup.add(closeBtn);

        const closeLabel = this.add.text(0, popupH/2 - 31, '✕  Close', {
            fontSize: '16px', fontFamily: 'Arial, sans-serif',
            color: '#fff', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.settingsPopup.add(closeLabel);

        const closeHit = this.add.rectangle(0, popupH/2 - 31, 120, 38, 0, 0)
            .setInteractive({ useHandCursor: true });
        this.settingsPopup.add(closeHit);

        closeHit.on('pointerover', () => { closeBtn.clear(); closeBtn.fillStyle(0xaa66ee, 1); closeBtn.fillRoundedRect(-60, popupH/2 - 50, 120, 38, 8); });
        closeHit.on('pointerout', () => { closeBtn.clear(); closeBtn.fillStyle(0x8844cc, 1); closeBtn.fillRoundedRect(-60, popupH/2 - 50, 120, 38, 8); });
        closeHit.on('pointerdown', () => {
            this.playClick();
            this.closeSettingsPopup();
        });

        this.tweens.add({ targets: this.settingsPopup, alpha: 1, duration: 300, ease: 'Power2' });
    }

    closeSettingsPopup() {
        if (!this.settingsPopup) return;
        this.tweens.add({
            targets: this.settingsPopup, alpha: 0, duration: 200,
            onComplete: () => {
                this.settingsPopup.destroy();
                this.settingsPopup = null;
                this.dimOverlay.setAlpha(0);
            }
        });
    }

    showExitPopup() {
        if (this.exitPopup) return;

        const cx = this.cameras.main.centerX;
        const cy = this.cameras.main.centerY;
        const w = this.cameras.main.width;

        this.dimOverlay.setAlpha(0.6);
        const popupW = Math.min(440, w - 30);

        this.exitPopup = this.add.container(cx, cy).setDepth(200).setAlpha(0);

        const bg = this.add.graphics();
        bg.fillStyle(0x1a0a2e, 0.97);
        bg.fillRoundedRect(-popupW/2, -90, popupW, 180, 16);
        bg.lineStyle(2, 0x8844cc);
        bg.strokeRoundedRect(-popupW/2, -90, popupW, 180, 16);
        this.exitPopup.add(bg);

        const emoji = this.add.text(0, -55, '🙏', { fontSize: '36px' }).setOrigin(0.5);
        this.exitPopup.add(emoji);

        const msg = this.add.text(0, -5, 'Terima kasih telah mencoba\nISEKAI WORLD.', {
            fontSize: '18px', fontFamily: 'Arial, sans-serif',
            color: '#fff', align: 'center'
        }).setOrigin(0.5);
        this.exitPopup.add(msg);

        const closeBtn = this.add.graphics();
        closeBtn.fillStyle(0x8844cc, 1);
        closeBtn.fillRoundedRect(-55, 45, 110, 35, 8);
        this.exitPopup.add(closeBtn);

        const closeLabel = this.add.text(0, 63, 'OK', {
            fontSize: '16px', fontFamily: 'Arial, sans-serif',
            color: '#fff', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.exitPopup.add(closeLabel);

        const closeHit = this.add.rectangle(0, 63, 110, 35, 0, 0)
            .setInteractive({ useHandCursor: true });
        this.exitPopup.add(closeHit);

        closeHit.on('pointerover', () => { closeBtn.clear(); closeBtn.fillStyle(0xaa66ee, 1); closeBtn.fillRoundedRect(-55, 45, 110, 35, 8); });
        closeHit.on('pointerout', () => { closeBtn.clear(); closeBtn.fillStyle(0x8844cc, 1); closeBtn.fillRoundedRect(-55, 45, 110, 35, 8); });
        closeHit.on('pointerdown', () => {
            this.playClick();
            this.closeExitPopup();
        });

        this.tweens.add({ targets: this.exitPopup, alpha: 1, duration: 300, ease: 'Power2' });
    }

    closeExitPopup() {
        if (!this.exitPopup) return;
        this.tweens.add({
            targets: this.exitPopup, alpha: 0, duration: 200,
            onComplete: () => {
                this.exitPopup.destroy();
                this.exitPopup = null;
                this.dimOverlay.setAlpha(0);
            }
        });
    }

    /* =============================================
     *  ENTRANCE ANIMATION
     * ============================================= */
    playEntranceAnimation(h) {
        const slideDistance = h < 500 ? 250 : 300;

        this.tweens.add({
            targets: this.titleText, alpha: 1, duration: 1000, ease: 'Power2',
            onComplete: () => {
                this.tweens.add({
                    targets: this.subtitleText, alpha: 1, duration: 500, ease: 'Power2'
                });

                this.menuButtons.forEach((btn, i) => {
                    this.tweens.add({
                        targets: btn, alpha: 1, y: btn.y - slideDistance,
                        duration: 500, delay: i * 150, ease: 'Back.easeOut'
                    });
                });

                this.tweens.add({
                    targets: this.copyrightText, alpha: 1, duration: 800,
                    delay: 1000, ease: 'Power2'
                });
            }
        });
    }

    /* =============================================
     *  AUDIO
     * ============================================= */
    initAudio() {
        this.audioCtx = null;
    }

    getAudioContext() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        return this.audioCtx;
    }

    playClick() {
        try {
            const ctx = this.getAudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.06);
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.08);
        } catch(e) {}
    }
}
