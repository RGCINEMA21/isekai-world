/**
 * MainMenuScene - Menu utama ISEKAI WORLD.
 * Background: Isekai fantasy dengan portal dimensional, floating islands,
 * aurora, dan suasana dramatis mirip contoh.
 */
class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
        this.titleText = null;
        this.subtitleText = null;
        this.copyrightText = null;
        this.menuButtons = [];
        this.settingsPopup = null;
        this.exitPopup = null;
        this.dimOverlay = null;
        this.particles = [];
    }

    create() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;

        this.createIsekaiBackground(w, h);

        // Dim overlay for popups — depth 200, starts invisible
        this.dimOverlay = this.add.rectangle(w/2, h/2, w, h, 0x000000, 0)
            .setDepth(200).setVisible(false);

        // Responsive detection using ResponsiveLayout
        const rl = new ResponsiveLayout(this);
        const smaller = rl.smaller;
        const isMobile = rl.w < 600;
        const titleSize = rl.titleSize(52) + 'px';
        const subSize = rl.labelSize(14) + 'px';
        const btnFontSize = rl.fontSize(18) + 'px';
        const btnW = isMobile ? Math.max(200, Math.min(280, w * 0.65)) : Math.max(260, Math.min(360, w * 0.3));
        const btnH = isMobile ? Math.max(44, Math.min(52, smaller * 0.065)) : Math.max(52, Math.min(64, smaller * 0.06));
        const btnSpacing = isMobile ? Math.max(50, Math.min(60, smaller * 0.075)) : Math.max(60, Math.min(80, smaller * 0.075));

        // --- TITLE ---
        this.titleText = this.add.text(w/2, h * 0.08, 'ISEKAI WORLD', {
            fontSize: titleSize,
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#1a0033',
            strokeThickness: Math.max(4, Math.min(6, smaller * 0.008))
        }).setOrigin(0.5).setAlpha(0).setDepth(10);

        // --- SUBTITLE ---
        this.subtitleText = this.add.text(w/2, h * 0.08 + parseFloat(titleSize) * 0.9, 'v0.0.1', {
            fontSize: subSize,
            fontFamily: 'Arial, sans-serif',
            color: '#ccbbee',
            stroke: '#000',
            strokeThickness: 2
        }).setOrigin(0.5).setAlpha(0).setDepth(10);

        // --- COPYRIGHT ---
        this.copyrightText = this.add.text(w/2, h - 16, '© ISEKAI WORLD PROJECT', {
            fontSize: '11px',
            fontFamily: 'Arial, sans-serif',
            color: '#666666'
        }).setOrigin(0.5).setAlpha(0).setDepth(10);

        // --- BUTTONS ---
        const buttonData = [
            { label: '▶  New Game',   action: 'newGame',   enabled: true },
            { label: '▶  Continue',   action: 'continue',  enabled: localStorage.getItem('isekai_world_save') ? true : false },
            { label: '⚙  Settings',   action: 'settings',  enabled: true },
            { label: '✕  Exit',       action: 'exit',      enabled: true }
        ];

        // Position buttons — center-lower area, always comfortably visible
        const totalBtnsHeight = buttonData.length * btnSpacing;
        const btnStartY = Math.round(h * 0.48);
        buttonData.forEach((data, i) => {
            const by = btnStartY + i * btnSpacing;
            this.menuButtons.push(
                this.createButton(w/2, by, data, btnW, btnH, btnFontSize, i)
            );
        });

        this.initAudio();
        this.playEntrance(h);

        // Auto-play BGM
        audioManager.playBGM(this);
    }

    /* =============================================
     *  BACKGROUND - Isekai Fantasy Scene
     * ============================================= */
    createIsekaiBackground(w, h) {
        const g = this.add.graphics().setDepth(0);

        // --- Dark sky gradient (deep blue to purple) ---
        for (let i = 0; i < h; i++) {
            const t = i / h;
            let r, gr, b;
            if (t < 0.5) {
                // Upper sky: dark blue -> purple
                r = Math.floor(Phaser.Math.Linear(10, 60, t * 2));
                gr = Math.floor(Phaser.Math.Linear(10, 30, t * 2));
                b = Math.floor(Phaser.Math.Linear(40, 80, t * 2));
            } else {
                // Lower: purple -> dark
                r = Math.floor(Phaser.Math.Linear(60, 20, (t-0.5) * 2));
                gr = Math.floor(Phaser.Math.Linear(30, 10, (t-0.5) * 2));
                b = Math.floor(Phaser.Math.Linear(80, 30, (t-0.5) * 2));
            }
            g.lineStyle(1, Phaser.Display.Color.GetColor(r, gr, b));
            g.lineBetween(0, i, w, i);
        }

        // --- Aurora / Magic lights across the sky ---
        this.drawAurora(g, w, h);

        // --- Stars ---
        for (let i = 0; i < 120; i++) {
            const sx = Phaser.Math.Between(0, w);
            const sy = Phaser.Math.Between(0, h * 0.6);
            const size = Phaser.Math.Between(1, 3);
            const colors = [0xffffff, 0xaaccff, 0xffaadd, 0xddbbff, 0xaaffcc];
            g.fillStyle(colors[Phaser.Math.Between(0, 4)], Phaser.Math.FloatBetween(0.2, 1));
            g.fillRect(sx, sy, size, size);
        }

        // --- Mountain silhouettes (background) ---
        this.drawMountains(g, w, h);

        // --- Floating Island + Castle (left side) ---
        this.drawFloatingIsland(g, w * 0.18, h * 0.28, 1.0);

        // --- Small floating island (right) ---
        this.drawSmallIsland(g, w * 0.82, h * 0.22, 0.6);

        // --- Massive Portal / Dimensional Gate (center) ---
        this.drawPortal(g, w * 0.5, h * 0.45, w, h);

        // --- Ground ---
        this.drawGround(g, w, h);

        // --- Dark overlay for text readability ---
        g.fillStyle(0x000000, 0.2);
        g.fillRect(0, 0, w, h);
    }

    drawAurora(g, w, h) {
        // Soft aurora streaks in the sky
        const auroraColors = [0x4466aa, 0x6644aa, 0x8844bb, 0x4488cc, 0x664499];
        for (let i = 0; i < 12; i++) {
            const y = Phaser.Math.Between(Math.floor(h * 0.05), Math.floor(h * 0.35));
            const startX = Phaser.Math.Between(0, Math.floor(w * 0.3));
            const endX = Phaser.Math.Between(Math.floor(w * 0.5), w);
            const color = auroraColors[Phaser.Math.Between(0, auroraColors.length - 1)];

            g.lineStyle(Phaser.Math.Between(1, 3), color, Phaser.Math.FloatBetween(0.05, 0.15));
            g.beginPath();
            g.moveTo(startX, y);
            for (let x = startX; x < endX; x += 20) {
                const wave = Math.sin((x / 100) + i) * 15;
                g.lineTo(x, y + wave);
            }
            g.strokePath();
        }
    }

    drawMountains(g, w, h) {
        // Background mountains - dark silhouettes
        g.fillStyle(0x0a0a1a, 1);
        g.beginPath();
        g.moveTo(0, h * 0.55);

        // Mountain 1
        g.lineTo(w * 0.08, h * 0.38);
        g.lineTo(w * 0.15, h * 0.42);
        g.lineTo(w * 0.22, h * 0.35);
        g.lineTo(w * 0.30, h * 0.44);

        // Mountain 2 (tall)
        g.lineTo(w * 0.38, h * 0.30);
        g.lineTo(w * 0.45, h * 0.40);
        g.lineTo(w * 0.50, h * 0.42);

        // Mountain 3
        g.lineTo(w * 0.55, h * 0.35);
        g.lineTo(w * 0.62, h * 0.40);
        g.lineTo(w * 0.70, h * 0.33);
        g.lineTo(w * 0.78, h * 0.38);

        // Mountain 4
        g.lineTo(w * 0.85, h * 0.32);
        g.lineTo(w * 0.95, h * 0.40);
        g.lineTo(w, h * 0.38);
        g.lineTo(w, h * 0.55);
        g.closePath();
        g.fillPath();

        // Mountain 2nd layer (slightly lighter)
        g.fillStyle(0x111122, 0.8);
        g.beginPath();
        g.moveTo(0, h * 0.55);
        g.lineTo(w * 0.10, h * 0.45);
        g.lineTo(w * 0.25, h * 0.48);
        g.lineTo(w * 0.35, h * 0.42);
        g.lineTo(w * 0.50, h * 0.50);
        g.lineTo(w * 0.65, h * 0.43);
        g.lineTo(w * 0.80, h * 0.48);
        g.lineTo(w * 0.90, h * 0.42);
        g.lineTo(w, h * 0.46);
        g.lineTo(w, h * 0.55);
        g.closePath();
        g.fillPath();
    }

    drawFloatingIsland(g, x, y, scale) {
        const s = scale;

        // Magic glow under island
        g.fillStyle(0x6633aa, 0.08);
        g.fillEllipse(x, y + 30 * s, 120 * s, 30 * s);

        // Floating rocks underneath
        g.fillStyle(0x1a1020, 1);
        g.fillTriangle(x, y + 50 * s, x - 30 * s, y + 15 * s, x + 30 * s, y + 15 * s);
        g.fillStyle(0x2a1a30, 1);
        g.fillTriangle(x + 10 * s, y + 40 * s, x - 15 * s, y + 20 * s, x + 35 * s, y + 20 * s);

        // Island top (grass/earth)
        g.fillStyle(0x1a3a1a, 1);
        g.fillRect(x - 55 * s, y - 5 * s, 110 * s, 12 * s);
        g.fillStyle(0x2d5a2d, 1);
        g.fillRect(x - 50 * s, y - 8 * s, 100 * s, 8 * s);

        // Castle/Building on island
        this.drawCastle(g, x, y - 8 * s, s);

        // Trees on island
        this.drawIslandTree(g, x - 42 * s, y - 12 * s, s * 0.7);
        this.drawIslandTree(g, x + 38 * s, y - 10 * s, s * 0.5);
        this.drawIslandTree(g, x + 25 * s, y - 10 * s, s * 0.6);
    }

    drawCastle(g, x, y, s) {
        // Main tower
        g.fillStyle(0x334466, 1);
        g.fillRect(x - 8 * s, y - 35 * s, 16 * s, 30 * s);

        // Tower top (pointed)
        g.fillStyle(0x445577, 1);
        g.fillTriangle(x - 10 * s, y - 35 * s, x + 10 * s, y - 35 * s, x, y - 50 * s);

        // Side walls
        g.fillStyle(0x2a3a55, 1);
        g.fillRect(x - 20 * s, y - 20 * s, 12 * s, 15 * s);
        g.fillRect(x + 8 * s, y - 20 * s, 12 * s, 15 * s);

        // Windows (glowing)
        g.fillStyle(0xffee88, 0.8);
        g.fillRect(x - 4 * s, y - 28 * s, 3 * s, 4 * s);
        g.fillRect(x + 1 * s, y - 28 * s, 3 * s, 4 * s);

        g.fillStyle(0xffee88, 0.6);
        g.fillRect(x - 17 * s, y - 16 * s, 3 * s, 3 * s);
        g.fillRect(x + 14 * s, y - 16 * s, 3 * s, 3 * s);
    }

    drawIslandTree(g, x, y, s) {
        g.fillStyle(0x2a1a10, 1);
        g.fillRect(x - 2 * s, y - 5 * s, 4 * s, 8 * s);
        g.fillStyle(0x1a4a1a, 1);
        g.fillCircle(x, y - 12 * s, 10 * s);
        g.fillStyle(0x226622, 0.8);
        g.fillCircle(x - 4 * s, y - 10 * s, 7 * s);
    }

    drawSmallIsland(g, x, y, scale) {
        const s = scale;
        g.fillStyle(0x6633aa, 0.06);
        g.fillEllipse(x, y + 15 * s, 60 * s, 15 * s);

        g.fillStyle(0x1a1020, 1);
        g.fillTriangle(x, y + 25 * s, x - 20 * s, y + 8 * s, x + 20 * s, y + 8 * s);

        g.fillStyle(0x1a3a1a, 1);
        g.fillRect(x - 18 * s, y, 36 * s, 6 * s);
        g.fillStyle(0x2d5a2d, 1);
        g.fillRect(x - 15 * s, y - 3 * s, 30 * s, 5 * s);

        this.drawIslandTree(g, x, y - 5 * s, s * 0.5);
    }

    drawPortal(g, cx, cy, w, h) {
        const portalH = Math.min(h * 0.55, 350);
        const portalW = portalH * 0.65;

        // --- Outer glow aura ---
        g.fillStyle(0x3322aa, 0.04);
        g.fillCircle(cx, cy, portalW * 0.8);
        g.fillStyle(0x5533cc, 0.06);
        g.fillCircle(cx, cy, portalW * 0.65);

        // --- Outer energy ring ---
        g.lineStyle(3, 0x6644dd, 0.4);
        g.strokeCircle(cx, cy, portalW * 0.55);
        g.lineStyle(2, 0x8866ee, 0.3);
        g.strokeCircle(cx, cy, portalW * 0.6);

        // --- Main portal body (tall oval / egg shape) ---
        // Draw as filled vertical ellipse
        g.fillStyle(0x110022, 0.95);
        g.fillEllipse(cx, cy, portalW * 0.5, portalH * 0.7);

        // Inner gradient rings
        g.fillStyle(0x220044, 0.6);
        g.fillEllipse(cx, cy, portalW * 0.42, portalH * 0.6);
        g.fillStyle(0x330066, 0.5);
        g.fillEllipse(cx, cy, portalW * 0.34, portalH * 0.5);
        g.fillStyle(0x440088, 0.4);
        g.fillEllipse(cx, cy, portalW * 0.25, portalH * 0.4);
        g.fillStyle(0x5500aa, 0.3);
        g.fillEllipse(cx, cy, portalW * 0.15, portalH * 0.3);

        // --- Swirling energy particles inside ---
        for (let i = 0; i < 60; i++) {
            const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
            const dist = Phaser.Math.FloatBetween(0, 1);
            const rx = portalW * 0.2 * dist;
            const ry = portalH * 0.3 * dist;
            const px = cx + Math.cos(angle) * rx;
            const py = cy + Math.sin(angle) * ry;
            const colors = [0x7744dd, 0x9966ff, 0xaa88ff, 0xccaaff, 0xff88cc, 0xff66aa];
            const alpha = Phaser.Math.FloatBetween(0.2, 0.8);
            const size = Phaser.Math.Between(1, 4);
            g.fillStyle(colors[Phaser.Math.Between(0, 5)], alpha);
            g.fillCircle(px, py, size);
        }

        // --- Bright energy edge ---
        g.lineStyle(2, 0x9977ff, 0.6);
        g.strokeEllipse(cx, cy, portalW * 0.52, portalH * 0.72);
        g.lineStyle(1, 0xbb99ff, 0.4);
        g.strokeEllipse(cx, cy, portalW * 0.48, portalH * 0.68);

        // --- Light beam from top ---
        g.fillStyle(0x8866cc, 0.08);
        g.fillTriangle(cx, cy - portalH * 0.35, cx - 30, 0, cx + 30, 0);

        // --- Energy sparks around portal ---
        for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2;
            const dist = portalW * 0.35 + Phaser.Math.FloatBetween(-5, 15);
            const px = cx + Math.cos(angle) * dist;
            const py = cy + Math.sin(angle) * dist * 1.3;
            g.fillStyle(0xaa88ff, Phaser.Math.FloatBetween(0.2, 0.6));
            g.fillRect(px - 1, py - 1, 3, 3);
        }

        // --- Floating magic symbols around portal ---
        const symbols = ['✦', '◆', '⬡'];
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + 0.4;
            const dist = portalW * 0.55;
            const px = cx + Math.cos(angle) * dist;
            const py = cy + Math.sin(angle) * dist * 1.3;
            g.fillStyle(0xccaaee, Phaser.Math.FloatBetween(0.15, 0.35));
            g.fillCircle(px, py, 2);
        }
    }

    drawGround(g, w, h) {
        const groundY = h * 0.72;

        // Main ground
        g.fillStyle(0x0d1a0d, 1);
        g.fillRect(0, groundY, w, h - groundY);

        // Ground top edge (grass)
        g.fillStyle(0x1a3a1a, 1);
        g.fillRect(0, groundY, w, 6);

        // Grass details
        for (let i = 0; i < 60; i++) {
            const gx = Phaser.Math.Between(0, w);
            const gy = Phaser.Math.Between(Math.floor(groundY), Math.floor(h));
            const colors = [0x1a3a1a, 0x1d4020, 0x153015, 0x203820];
            g.fillStyle(colors[Phaser.Math.Between(0, 3)], Phaser.Math.FloatBetween(0.3, 0.7));
            g.fillRect(gx, gy, Phaser.Math.Between(2, 8), 2);
        }

        // Magic sparkles on ground
        for (let i = 0; i < 15; i++) {
            const gx = Phaser.Math.Between(0, w);
            const gy = Phaser.Math.Between(Math.floor(groundY), Math.floor(h));
            g.fillStyle(0x8866cc, Phaser.Math.FloatBetween(0.1, 0.3));
            g.fillRect(gx, gy, 2, 2);
        }
    }

    /* =============================================
     *  BUTTONS
     * ============================================= */
    createButton(x, y, data, btnW, btnH, fontSize, index) {
        const container = this.add.container(x, y + 300).setDepth(20).setAlpha(0);

        const bg = this.add.graphics();
        this.drawBtnBg(bg, btnW, btnH, data.enabled, false);
        container.add(bg);

        const label = this.add.text(0, 0, data.label, {
            fontSize: fontSize,
            fontFamily: 'Arial, sans-serif',
            color: data.enabled ? '#ffffff' : '#666666',
            fontStyle: 'bold',
            stroke: data.enabled ? '#2a1555' : '#000000',
            strokeThickness: data.enabled ? 2 : 1
        }).setOrigin(0.5);
        container.add(label);

        if (!data.enabled) {
            const note = this.add.text(0, btnH/2 + 10, 'Belum ada Save Game.', {
                fontSize: '12px', fontFamily: 'Arial, sans-serif',
                color: '#999999', fontStyle: 'italic'
            }).setOrigin(0.5);
            container.add(note);
        }

        if (data.enabled) {
            const hit = this.add.rectangle(0, 0, btnW, btnH, 0, 0)
                .setInteractive({ useHandCursor: true });
            container.add(hit);

            hit.on('pointerover', () => {
                this.tweens.add({ targets: container, scaleX: 1.06, scaleY: 1.06, duration: 100 });
                bg.clear();
                this.drawBtnBg(bg, btnW, btnH, true, true);
                label.setColor('#ffeecc');
            });

            hit.on('pointerout', () => {
                this.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 100 });
                bg.clear();
                this.drawBtnBg(bg, btnW, btnH, true, false);
                label.setColor('#ffffff');
            });

            hit.on('pointerdown', () => {
                this.playClick();
                this.tweens.add({
                    targets: container, scaleX: 0.95, scaleY: 0.95,
                    duration: 50, yoyo: true,
                    onComplete: () => this.handleClick(data.action)
                });
            });
        }

        return container;
    }

    drawBtnBg(g, w, h, enabled, hovered) {
        const r = 12;
        if (!enabled) {
            g.fillStyle(0x2a2a2a, 0.7);
            g.fillRoundedRect(-w/2, -h/2, w, h, r);
            g.lineStyle(2, 0x555555, 0.5);
            g.strokeRoundedRect(-w/2, -h/2, w, h, r);
            return;
        }
        // Enabled: bright, high-contrast buttons
        const bgColor = hovered ? 0x6b45cc : 0x4a2d8a;
        const borderColor = hovered ? 0xddbbff : 0x9977ee;
        const bgAlpha = 0.95;
        // Outer glow
        g.fillStyle(borderColor, 0.3);
        g.fillRoundedRect(-w/2-3, -h/2-3, w+6, h+6, r+3);
        // Border
        g.fillStyle(borderColor, 0.9);
        g.fillRoundedRect(-w/2-2, -h/2-2, w+4, h+4, r+2);
        // Background
        g.fillStyle(bgColor, bgAlpha);
        g.fillRoundedRect(-w/2, -h/2, w, h, r);
        // Highlight shine at top
        g.fillStyle(0xffffff, 0.12);
        g.fillRoundedRect(-w/2+3, -h/2+2, w-6, h/2-1, r-1);
    }

    /* =============================================
     *  ACTIONS
     * ============================================= */
    handleClick(action) {
        if (action === 'newGame') this.showNewGamePopup();
        else if (action === 'continue') this.handleContinue();
        else if (action === 'settings') this.showSettingsPopup();
        else if (action === 'exit') this.showExitPopup();
    }

    handleContinue() {
        this.playClick();
        this.cameras.main.fadeOut(300, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('VillageScene');
        });
    }

    showNewGamePopup() {
        this.playClick();
        this.cameras.main.fadeOut(300, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('CharacterCreatorScene');
        });
    }

    showSettingsPopup() {
        if (this.settingsPopup) return;

        const cx = this.cameras.main.centerX;
        const cy = this.cameras.main.centerY;
        const pw = Math.min(480, this.cameras.main.width - 20);

        this.dimOverlay.setVisible(true).setAlpha(0.6).setInteractive();
        this.settingsPopup = this.add.container(cx, cy).setDepth(210).setAlpha(0);

        const bg = this.add.graphics();
        bg.fillStyle(0x2c1810, 0.95);
        bg.fillRoundedRect(-pw/2, -200, pw, 400, 14);
        bg.lineStyle(2, 0xc9a84c);
        bg.strokeRoundedRect(-pw/2, -200, pw, 400, 14);
        this.settingsPopup.add(bg);

        this.settingsPopup.add(this.add.text(0, -170, '⚙  Settings', {
            fontSize: '24px', fontFamily: 'Arial', color: '#fff', fontStyle: 'bold'
        }).setOrigin(0.5));

        // Music toggle
        const musicMuted = audioManager.isMuted();
        const musicLabel = this.add.text(-pw/2 + 20, -120, '🎵  Music', {
            fontSize: '18px', fontFamily: 'Arial', color: '#ccc'
        }).setOrigin(0, 0.5);
        this.settingsPopup.add(musicLabel);

        const musicValue = this.add.text(pw/2 - 20, -120, musicMuted ? 'OFF' : 'ON', {
            fontSize: '16px', fontFamily: 'Arial', color: musicMuted ? '#cc4444' : '#88cc66', fontStyle: 'bold'
        }).setOrigin(1, 0.5);
        this.settingsPopup.add(musicValue);

        const musicHit = this.add.rectangle(0, -120, pw - 40, 40, 0x000000, 0)
            .setInteractive({ useHandCursor: true });
        this.settingsPopup.add(musicHit);
        musicHit.on('pointerdown', () => {
            const muted = audioManager.toggleMute();
            musicValue.setText(muted ? 'OFF' : 'ON');
            musicValue.setColor(muted ? '#cc4444' : '#88cc66');
            this.playClick();
        });

        bg.lineStyle(1, 0x8b6914, 0.3);
        bg.lineBetween(-pw/2+20, -98, pw/2-20, -98);

        // Volume slider label
        this.settingsPopup.add(this.add.text(-pw/2 + 20, -75, '🔊  Volume', {
            fontSize: '18px', fontFamily: 'Arial', color: '#ccc'
        }).setOrigin(0, 0.5));

        const volPct = Math.round(audioManager.getVolume() * 100);
        const volText = this.add.text(pw/2 - 20, -75, volPct + '%', {
            fontSize: '16px', fontFamily: 'Arial', color: '#88cc66', fontStyle: 'bold'
        }).setOrigin(1, 0.5);
        this.settingsPopup.add(volText);

        // Volume bar
        const barW = pw - 80;
        const barX = -barW / 2;
        const barY = -55;
        const barBg = this.add.graphics();
        barBg.fillStyle(0x333333, 1);
        barBg.fillRoundedRect(barX, barY, barW, 10, 5);
        this.settingsPopup.add(barBg);

        const barFill = this.add.graphics();
        const drawBar = (pct) => {
            barFill.clear();
            barFill.fillStyle(0xc9a84c, 1);
            barFill.fillRoundedRect(barX, barY, barW * pct, 10, 5);
        };
        drawBar(audioManager.getVolume());
        this.settingsPopup.add(barFill);

        const barHit = this.add.rectangle(0, barY + 5, barW + 20, 30, 0x000000, 0)
            .setInteractive({ useHandCursor: true });
        this.settingsPopup.add(barHit);
        barHit.on('pointerdown', (pointer) => {
            const localX = pointer.x - this.settingsPopup.x - barX;
            const pct = Phaser.Math.Clamp(localX / barW, 0, 1);
            audioManager.setVolume(pct);
            drawBar(pct);
            volText.setText(Math.round(pct * 100) + '%');
        });

        bg.lineStyle(1, 0x8b6914, 0.3);
        bg.lineBetween(-pw/2+20, -40, pw/2-20, -40);

        // Placeholder items
        const placeholders = [
            { l: '🖥  Fullscreen', v: 'OFF' },
            { l: '🌐  Bahasa', v: 'Indonesia' }
        ];
        placeholders.forEach((item, i) => {
            const yy = -20 + i * 45;
            this.settingsPopup.add(this.add.text(-pw/2 + 20, yy, item.l, {
                fontSize: '18px', fontFamily: 'Arial', color: '#ccc'
            }).setOrigin(0, 0.5));
            this.settingsPopup.add(this.add.text(pw/2 - 20, yy, item.v, {
                fontSize: '16px', fontFamily: 'Arial', color: '#88cc66', fontStyle: 'bold'
            }).setOrigin(1, 0.5));
            if (i < placeholders.length - 1) {
                bg.lineStyle(1, 0x8b6914, 0.3);
                bg.lineBetween(-pw/2+20, yy+22, pw/2-20, yy+22);
            }
        });

        const clBg = this.add.graphics();
        clBg.fillStyle(0x8b3a0a, 0.9);
        clBg.fillRoundedRect(-50, 152, 100, 34, 6);
        this.settingsPopup.add(clBg);
        this.settingsPopup.add(this.add.text(0, 169, '✕  Close', {
            fontSize: '15px', fontFamily: 'Arial', color: '#fff', fontStyle: 'bold'
        }).setOrigin(0.5));

        const clHit = this.add.rectangle(0, 169, 100, 34, 0, 0)
            .setInteractive({ useHandCursor: true });
        this.settingsPopup.add(clHit);
        clHit.on('pointerdown', () => { this.playClick(); this.closeSettings(); });

        this.tweens.add({ targets: this.settingsPopup, alpha: 1, duration: 300 });
    }

    closeSettings() {
        if (!this.settingsPopup) return;
        this.tweens.add({ targets: this.settingsPopup, alpha: 0, duration: 200,
            onComplete: () => { this.settingsPopup.destroy(); this.settingsPopup = null; this.dimOverlay.setVisible(false).setAlpha(0).disableInteractive(); }
        });
    }

    showExitPopup() {
        if (this.exitPopup) return;

        const cx = this.cameras.main.centerX;
        const cy = this.cameras.main.centerY;
        const pw = Math.min(440, this.cameras.main.width - 30);

        this.dimOverlay.setVisible(true).setAlpha(0.6).setInteractive();
        this.exitPopup = this.add.container(cx, cy).setDepth(210).setAlpha(0);

        const bg = this.add.graphics();
        bg.fillStyle(0x2c1810, 0.95);
        bg.fillRoundedRect(-pw/2, -85, pw, 170, 14);
        bg.lineStyle(2, 0xc9a84c);
        bg.strokeRoundedRect(-pw/2, -85, pw, 170, 14);
        this.exitPopup.add(bg);

        this.exitPopup.add(this.add.text(0, -50, '🙏', { fontSize: '32px' }).setOrigin(0.5));
        this.exitPopup.add(this.add.text(0, -5, 'Terima kasih telah mencoba\nISEKAI WORLD.', {
            fontSize: '17px', fontFamily: 'Arial', color: '#fff', align: 'center'
        }).setOrigin(0.5));

        const clBg = this.add.graphics();
        clBg.fillStyle(0x8b3a0a, 0.9);
        clBg.fillRoundedRect(-40, 40, 80, 30, 6);
        this.exitPopup.add(clBg);
        this.exitPopup.add(this.add.text(0, 55, 'OK', {
            fontSize: '15px', fontFamily: 'Arial', color: '#fff', fontStyle: 'bold'
        }).setOrigin(0.5));

        const clHit = this.add.rectangle(0, 55, 80, 30, 0, 0)
            .setInteractive({ useHandCursor: true });
        this.exitPopup.add(clHit);
        clHit.on('pointerdown', () => { this.playClick(); this.closeExit(); });

        this.tweens.add({ targets: this.exitPopup, alpha: 1, duration: 300 });
    }

    closeExit() {
        if (!this.exitPopup) return;
        this.tweens.add({ targets: this.exitPopup, alpha: 0, duration: 200,
            onComplete: () => { this.exitPopup.destroy(); this.exitPopup = null; this.dimOverlay.setVisible(false).setAlpha(0).disableInteractive(); }
        });
    }

    /* =============================================
     *  ANIMATION
     * ============================================= */
    playEntrance(h) {
        const slide = h < 500 ? 220 : 280;
        this.tweens.add({
            targets: this.titleText, alpha: 1, duration: 600, ease: 'Power2',
            onComplete: () => {
                this.tweens.add({ targets: this.subtitleText, alpha: 1, duration: 300, ease: 'Power2' });
                this.menuButtons.forEach((btn, i) => {
                    this.tweens.add({
                        targets: btn, alpha: 1, y: btn.y - 300,
                        duration: 500, delay: i * 100, ease: 'Back.easeOut'
                    });
                });
                this.tweens.add({ targets: this.copyrightText, alpha: 1, duration: 500, delay: 600, ease: 'Power2' });
            }
        });
    }

    /* =============================================
     *  AUDIO
     * ============================================= */
    initAudio() { this.audioCtx = null; }

    getAudioCtx() {
        if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        return this.audioCtx;
    }

    playClick() {
        try {
            const ctx = this.getAudioCtx();
            const o = ctx.createOscillator();
            const gn = ctx.createGain();
            o.connect(gn); gn.connect(ctx.destination);
            o.type = 'sine';
            o.frequency.setValueAtTime(500, ctx.currentTime);
            o.frequency.exponentialRampToValueAtTime(250, ctx.currentTime + 0.05);
            gn.gain.setValueAtTime(0.08, ctx.currentTime);
            gn.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
            o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.06);
        } catch(e) {}
    }

    update() {
        // Future: animated portal particles, floating elements, etc.
    }
}
