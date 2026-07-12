/**
 * MainMenuScene - Halaman menu utama game ISEKAI WORLD.
 * Menampilkan judul, tombol menu, dan popup settings/exit.
 */
class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });

        // Referensi elemen UI
        this.titleText = null;
        this.subtitleText = null;
        this.versionText = null;
        this.copyrightText = null;
        this.menuButtons = [];
        this.settingsPopup = null;
        this.exitPopup = null;
        this.dimOverlay = null;
    }

    /* =============================================
     *  CREATE - Inisialisasi scene
     * ============================================= */
    create() {
        const cx = this.cameras.main.centerX;
        const cy = this.cameras.main.centerY;
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;

        // --- Background: pixel village placeholder ---
        this.createBackground(w, h);

        // --- Dim overlay (untuk popup) ---
        this.dimOverlay = this.add.rectangle(cx, cy, w, h, 0x000000, 0)
            .setDepth(100)
            .setInteractive();

        // --- Judul utama ---
        this.titleText = this.add.text(cx, h * 0.18, 'ISEKAI WORLD', {
            fontSize: '72px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#2d2d2d',
            strokeThickness: 8,
            shadow: { offsetX: 3, offsetY: 3, color: '#000', blur: 8, fill: true }
        }).setOrigin(0.5).setAlpha(0).setDepth(10);

        // --- Subtitle ---
        this.subtitleText = this.add.text(cx, h * 0.18 + 55, 'Offline Version v0.0.1', {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            color: '#cccccc',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setAlpha(0).setDepth(10);

        // --- Copyright ---
        this.copyrightText = this.add.text(cx, h - 25, '© ISEKAI WORLD PROJECT', {
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif',
            color: '#888888'
        }).setOrigin(0.5).setAlpha(0).setDepth(10);

        // --- Buat tombol menu ---
        this.createMenuButtons(cx, cy, w);

        // --- Animasi entrance ---
        this.playEntranceAnimation();

        // --- Audio placeholder (Web Audio API) ---
        this.initAudio();
    }

    /* =============================================
     *  BACKGROUND - Placeholder village pixel art
     * ============================================= */
    createBackground(w, h) {
        const g = this.add.graphics().setDepth(0);

        // Sky gradient (langit senja)
        for (let i = 0; i < h * 0.55; i++) {
            const t = i / (h * 0.55);
            const r = Math.floor(Phaser.Math.Linear(25, 135, t));
            const gr = Math.floor(Phaser.Math.Linear(30, 180, t));
            const b = Math.floor(Phaser.Math.Linear(80, 220, t));
            g.lineStyle(1, Phaser.Display.Color.GetColor(r, gr, b));
            g.lineBetween(0, i, w, i);
        }

        // Stars
        for (let i = 0; i < 40; i++) {
            const sx = Phaser.Math.Between(0, w);
            const sy = Phaser.Math.Between(0, h * 0.4);
            const size = Phaser.Math.Between(1, 3);
            g.fillStyle(0xffffff, Phaser.Math.FloatBetween(0.3, 0.9));
            g.fillRect(sx, sy, size, size);
        }

        // Moon
        g.fillStyle(0xfff5cc, 1);
        g.fillCircle(w * 0.82, h * 0.12, 35);
        g.fillStyle(0xffeeaa, 0.4);
        g.fillCircle(w * 0.82, h * 0.12, 50);

        // Ground
        g.fillStyle(0x2d5a27, 1);
        g.fillRect(0, h * 0.55, w, h * 0.45);

        // Ground details
        for (let i = 0; i < 30; i++) {
            const gx = Phaser.Math.Between(0, w);
            const gy = Phaser.Math.Between(Math.floor(h * 0.55), h);
            g.fillStyle(0x3a7a30, 0.5);
            g.fillRect(gx, gy, Phaser.Math.Between(3, 12), 2);
        }

        // --- Buildings placeholder ---
        // House kiri
        this.drawHouse(g, w * 0.12, h * 0.42, 70, 55, 0x8B4513, 0x654321);
        // House tengah-kiri
        this.drawHouse(g, w * 0.30, h * 0.38, 55, 45, 0x7B3F00, 0x5C3317);
        // House tengah-kanan
        this.drawHouse(g, w * 0.62, h * 0.40, 60, 50, 0x8B4513, 0x6B4226);
        // House kanan
        this.drawHouse(g, w * 0.85, h * 0.44, 65, 48, 0x704214, 0x553318);

        // Trees
        this.drawTree(g, w * 0.04, h * 0.50);
        this.drawTree(g, w * 0.22, h * 0.48);
        this.drawTree(g, w * 0.48, h * 0.50);
        this.drawTree(g, w * 0.75, h * 0.49);
        this.drawTree(g, w * 0.96, h * 0.51);

        // Path
        g.fillStyle(0xc4a265, 0.4);
        g.fillRect(w * 0.42, h * 0.55, w * 0.16, h * 0.45);

        // Overlay gelap transparan (supaya tombol terbaca)
        g.fillStyle(0x000000, 0.35);
        g.fillRect(0, 0, w, h);
    }

    /** Gambar rumah sederhana */
    drawHouse(g, x, y, width, height, wallColor, roofColor) {
        // Dinding
        g.fillStyle(wallColor, 1);
        g.fillRect(x - width / 2, y, width, height);
        // Atap segitiga
        g.fillStyle(roofColor, 1);
        g.fillTriangle(
            x - width / 2 - 10, y,
            x + width / 2 + 10, y,
            x, y - height * 0.5
        );
        // Jendela
        g.fillStyle(0xffee88, 0.8);
        g.fillRect(x - width * 0.15, y + height * 0.25, width * 0.12, height * 0.2);
        g.fillRect(x + width * 0.05, y + height * 0.25, width * 0.12, height * 0.2);
        // Pintu
        g.fillStyle(0x5C3317, 1);
        g.fillRect(x - width * 0.08, y + height * 0.55, width * 0.16, height * 0.45);
    }

    /** Gambar pohon sederhana */
    drawTree(g, x, y) {
        // Batang
        g.fillStyle(0x5C3317, 1);
        g.fillRect(x - 4, y - 20, 8, 25);
        // Daun
        g.fillStyle(0x1a6b1a, 1);
        g.fillCircle(x, y - 30, 18);
        g.fillStyle(0x228B22, 0.8);
        g.fillCircle(x - 8, y - 25, 12);
        g.fillCircle(x + 8, y - 25, 12);
    }

    /* =============================================
     *  MENU BUTTONS
     * ============================================= */
    createMenuButtons(cx, cy, w) {
        const buttonData = [
            { label: '▶  New Game',   action: 'newGame',   enabled: true },
            { label: '▶  Continue',   action: 'continue',  enabled: false },
            { label: '⚙  Settings',   action: 'settings',  enabled: true },
            { label: '✕  Exit',       action: 'exit',      enabled: true }
        ];

        const startY = cy - 40;
        const spacing = 70;

        buttonData.forEach((data, index) => {
            const btnY = startY + index * spacing;
            const btn = this.createButton(cx, btnY, data, index);
            this.menuButtons.push(btn);
        });
    }

    /** Buat satu tombol menu */
    createButton(x, y, data, index) {
        const btnWidth = 280;
        const btnHeight = 55;

        const container = this.add.container(x, y + 300).setDepth(20).setAlpha(0);

        // Background tombol
        const bg = this.add.graphics();
        this.drawButtonShape(bg, btnWidth, btnHeight, data.enabled);
        container.add(bg);

        // Label
        const label = this.add.text(0, 0, data.label, {
            fontSize: '24px',
            fontFamily: 'Arial, sans-serif',
            color: data.enabled ? '#ffffff' : '#666666',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        container.add(label);

        // Label "Belum ada Save Game" untuk Continue
        let disabledLabel = null;
        if (data.action === 'continue') {
            disabledLabel = this.add.text(0, 25, 'Belum ada Save Game.', {
                fontSize: '13px',
                fontFamily: 'Arial, sans-serif',
                color: '#888888',
                fontStyle: 'italic'
            }).setOrigin(0.5);
            container.add(disabledLabel);
        }

        // Interaktif (hanya untuk tombol yang aktif)
        if (data.enabled) {
            const hitArea = this.add.rectangle(0, 0, btnWidth, btnHeight, 0x000000, 0)
                .setInteractive({ useHandCursor: true });
            container.add(hitArea);

            // Hover effect (desktop)
            hitArea.on('pointerover', () => {
                this.tweens.add({
                    targets: container,
                    scaleX: 1.08,
                    scaleY: 1.08,
                    duration: 120,
                    ease: 'Power2'
                });
                bg.clear();
                this.drawButtonShape(bg, btnWidth, btnHeight, true, true);
                label.setColor('#ffff88');
            });

            hitArea.on('pointerout', () => {
                this.tweens.add({
                    targets: container,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 120,
                    ease: 'Power2'
                });
                bg.clear();
                this.drawButtonShape(bg, btnWidth, btnHeight, true, false);
                label.setColor('#ffffff');
            });

            // Click effect
            hitArea.on('pointerdown', () => {
                this.playClickSound();
                this.tweens.add({
                    targets: container,
                    scaleX: 0.95,
                    scaleY: 0.95,
                    duration: 60,
                    yoyo: true,
                    ease: 'Power2',
                    onComplete: () => {
                        this.handleButtonClick(data.action);
                    }
                });
            });
        }

        return container;
    }

    /** Gambar bentuk tombol */
    drawButtonShape(g, width, height, enabled, hovered = false) {
        const radius = 12;
        const bgColor = enabled
            ? (hovered ? 0x4a7a3a : 0x3a6a2a)
            : 0x333333;
        const borderColor = enabled
            ? (hovered ? 0x88cc66 : 0x5a9a4a)
            : 0x444444;

        // Border
        g.fillStyle(borderColor, 1);
        g.fillRoundedRect(-width / 2 - 3, -height / 2 - 3, width + 6, height + 6, radius + 2);
        // Background
        g.fillStyle(bgColor, 0.92);
        g.fillRoundedRect(-width / 2, -height / 2, width, height, radius);
        // Inner highlight
        g.fillStyle(0xffffff, enabled ? 0.08 : 0.03);
        g.fillRoundedRect(-width / 2 + 2, -height / 2 + 2, width - 4, height / 2, radius - 2);
    }

    /* =============================================
     *  BUTTON ACTIONS
     * ============================================= */
    handleButtonClick(action) {
        switch (action) {
            case 'newGame':
                this.showNewGameMessage();
                break;
            case 'continue':
                // Tidak bisa diklik
                break;
            case 'settings':
                this.showSettingsPopup();
                break;
            case 'exit':
                this.showExitPopup();
                break;
        }
    }

    /** Tampilkan pesan New Game placeholder */
    showNewGameMessage() {
        const cx = this.cameras.main.centerX;
        const cy = this.cameras.main.centerY;

        // Dim overlay
        this.dimOverlay.setAlpha(0.5);

        const container = this.add.container(cx, cy).setDepth(200).setAlpha(0);

        const bg = this.add.graphics();
        bg.fillStyle(0x222222, 0.95);
        bg.fillRoundedRect(-220, -70, 440, 140, 16);
        bg.lineStyle(2, 0x5a9a4a);
        bg.strokeRoundedRect(-220, -70, 440, 140, 16);
        container.add(bg);

        const msg = this.add.text(0, -15, '🎭 Character Creator akan\ndibuat pada Prompt #3', {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        container.add(msg);

        // Tombol OK
        const okBtn = this.add.rectangle(0, 45, 100, 35, 0x5a9a4a, 1)
            .setInteractive({ useHandCursor: true });
        container.add(okBtn);

        const okText = this.add.text(0, 45, 'OK', {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        container.add(okText);

        okBtn.on('pointerdown', () => {
            this.playClickSound();
            this.tweens.add({
                targets: container,
                alpha: 0,
                duration: 200,
                onComplete: () => {
                    container.destroy();
                    this.dimOverlay.setAlpha(0);
                }
            });
        });

        this.tweens.add({ targets: container, alpha: 1, duration: 300, ease: 'Power2' });
    }

    /* =============================================
     *  SETTINGS POPUP
     * ============================================= */
    showSettingsPopup() {
        if (this.settingsPopup) return;

        const cx = this.cameras.main.centerX;
        const cy = this.cameras.main.centerY;

        this.dimOverlay.setAlpha(0.5);

        this.settingsPopup = this.add.container(cx, cy).setDepth(200).setAlpha(0);

        // Background
        const bg = this.add.graphics();
        bg.fillStyle(0x1a1a2e, 0.97);
        bg.fillRoundedRect(-250, -200, 500, 400, 16);
        bg.lineStyle(2, 0x5a9a4a);
        bg.strokeRoundedRect(-250, -200, 500, 400, 16);
        this.settingsPopup.add(bg);

        // Title
        const title = this.add.text(0, -170, '⚙  Settings', {
            fontSize: '28px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.settingsPopup.add(title);

        // Divider line
        bg.lineStyle(1, 0x444444);
        bg.lineBetween(-200, -145, 200, -145);

        // Settings items
        const settingsItems = [
            { label: '🔊  Audio',      value: 'ON' },
            { label: '🎵  Music',      value: 'ON' },
            { label: '🔈  SFX',        value: 'ON' },
            { label: '🖥  Fullscreen',  value: 'OFF' },
            { label: '🌐  Bahasa',     value: 'Indonesia' }
        ];

        settingsItems.forEach((item, i) => {
            const yPos = -100 + i * 55;

            // Label
            const lbl = this.add.text(-180, yPos, item.label, {
                fontSize: '20px',
                fontFamily: 'Arial, sans-serif',
                color: '#cccccc'
            }).setOrigin(0, 0.5);
            this.settingsPopup.add(lbl);

            // Value (placeholder)
            const val = this.add.text(180, yPos, item.value, {
                fontSize: '18px',
                fontFamily: 'Arial, sans-serif',
                color: '#88cc66',
                fontStyle: 'bold'
            }).setOrigin(1, 0.5);
            this.settingsPopup.add(val);

            // Separator line
            if (i < settingsItems.length - 1) {
                bg.lineStyle(1, 0x333333);
                bg.lineBetween(-180, yPos + 22, 180, yPos + 22);
            }
        });

        // Close button
        const closeBg = this.add.graphics();
        closeBg.fillStyle(0x5a9a4a, 1);
        closeBg.fillRoundedRect(-60, 155, 120, 40, 8);
        this.settingsPopup.add(closeBg);

        const closeLabel = this.add.text(0, 175, '✕  Close', {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.settingsPopup.add(closeLabel);

        const closeHit = this.add.rectangle(0, 175, 120, 40, 0x000000, 0)
            .setInteractive({ useHandCursor: true });
        this.settingsPopup.add(closeHit);

        closeHit.on('pointerover', () => { closeBg.clear(); closeBg.fillStyle(0x6aaa5a, 1); closeBg.fillRoundedRect(-60, 155, 120, 40, 8); });
        closeHit.on('pointerout', () => { closeBg.clear(); closeBg.fillStyle(0x5a9a4a, 1); closeBg.fillRoundedRect(-60, 155, 120, 40, 8); });
        closeHit.on('pointerdown', () => {
            this.playClickSound();
            this.closeSettingsPopup();
        });

        // Animate in
        this.tweens.add({ targets: this.settingsPopup, alpha: 1, duration: 300, ease: 'Power2' });
    }

    closeSettingsPopup() {
        if (!this.settingsPopup) return;
        this.tweens.add({
            targets: this.settingsPopup,
            alpha: 0,
            duration: 200,
            onComplete: () => {
                this.settingsPopup.destroy();
                this.settingsPopup = null;
                this.dimOverlay.setAlpha(0);
            }
        });
    }

    /* =============================================
     *  EXIT POPUP
     * ============================================= */
    showExitPopup() {
        if (this.exitPopup) return;

        const cx = this.cameras.main.centerX;
        const cy = this.cameras.main.centerY;

        this.dimOverlay.setAlpha(0.5);

        this.exitPopup = this.add.container(cx, cy).setDepth(200).setAlpha(0);

        // Background
        const bg = this.add.graphics();
        bg.fillStyle(0x1a1a2e, 0.97);
        bg.fillRoundedRect(-240, -100, 480, 200, 16);
        bg.lineStyle(2, 0x996633);
        bg.strokeRoundedRect(-240, -100, 480, 200, 16);
        this.exitPopup.add(bg);

        // Emoji
        const emoji = this.add.text(0, -65, '🙏', { fontSize: '40px' }).setOrigin(0.5);
        this.exitPopup.add(emoji);

        // Message
        const msg = this.add.text(0, -10, 'Terima kasih telah mencoba\nISEKAI WORLD.', {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        this.exitPopup.add(msg);

        // Close button
        const closeBg = this.add.graphics();
        closeBg.fillStyle(0x996633, 1);
        closeBg.fillRoundedRect(-60, 55, 120, 38, 8);
        this.exitPopup.add(closeBg);

        const closeLabel = this.add.text(0, 74, 'OK', {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.exitPopup.add(closeLabel);

        const closeHit = this.add.rectangle(0, 74, 120, 38, 0x000000, 0)
            .setInteractive({ useHandCursor: true });
        this.exitPopup.add(closeHit);

        closeHit.on('pointerover', () => { closeBg.clear(); closeBg.fillStyle(0xaa7744, 1); closeBg.fillRoundedRect(-60, 55, 120, 38, 8); });
        closeHit.on('pointerout', () => { closeBg.clear(); closeBg.fillStyle(0x996633, 1); closeBg.fillRoundedRect(-60, 55, 120, 38, 8); });
        closeHit.on('pointerdown', () => {
            this.playClickSound();
            this.closeExitPopup();
        });

        this.tweens.add({ targets: this.exitPopup, alpha: 1, duration: 300, ease: 'Power2' });
    }

    closeExitPopup() {
        if (!this.exitPopup) return;
        this.tweens.add({
            targets: this.exitPopup,
            alpha: 0,
            duration: 200,
            onComplete: () => {
                this.exitPopup.destroy();
                this.exitPopup = null;
                this.dimOverlay.setAlpha(0);
            }
        });
    }

    /* =============================================
     *  ANIMATIONS
     * ============================================= */
    playEntranceAnimation() {
        // Judul fade in
        this.tweens.add({
            targets: this.titleText,
            alpha: 1,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                // Subtitle muncul
                this.tweens.add({
                    targets: this.subtitleText,
                    alpha: 1,
                    duration: 500,
                    ease: 'Power2'
                });

                // Tombol muncul satu per satu dari bawah
                this.menuButtons.forEach((btn, i) => {
                    this.tweens.add({
                        targets: btn,
                        alpha: 1,
                        y: btn.y - 300,
                        duration: 600,
                        delay: i * 200,
                        ease: 'Back.easeOut'
                    });
                });

                // Copyright fade in
                this.tweens.add({
                    targets: this.copyrightText,
                    alpha: 1,
                    duration: 800,
                    delay: 1200,
                    ease: 'Power2'
                });
            }
        });
    }

    /* =============================================
     *  AUDIO - Placeholder clicks
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

    playClickSound() {
        try {
            const ctx = this.getAudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = 'square';
            osc.frequency.setValueAtTime(800, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.08);

            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.1);
        } catch (e) {
            // Audio tidak tersedia, skip
        }
    }

    /* =============================================
     *  UPDATE
     * ============================================= */
    update() {
        // Dapat ditambahkan efek animasi berkelanjutan di sini
    }
}
