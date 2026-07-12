/**
 * CharacterCreatorScene - Halaman pembuatan karakter.
 * Responsive: menyesuaikan portrait & landscape.
 */
class CharacterCreatorScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CharacterCreatorScene' });
        this.playerName = '';
        this.gender = 'male';
        this.genderButtons = {};
        this.previewGraphics = null;
        this.nameInputElement = null;
        this.nameErrorText = null;
        this.summaryTexts = {};
        this.previewNameLabel = null;
    }

    /* =============================================
     *  HELPER - Responsive sizing
     * ============================================= */
    sz(base) {
        const w = this.cameras.main.width;
        return Math.max(10, Math.round(base * (w / 1280)));
    }

    /* =============================================
     *  CREATE
     * ============================================= */
    create() {
        this.w = this.cameras.main.width;
        this.h = this.cameras.main.height;
        this.isPortrait = this.h > this.w;

        this.createBackground();
        this.createTitle();
        this.createCharacterPreview();
        this.createNameInput();
        this.createGenderSelection();
        this.createSummaryPanel();
        this.createButtons();
        this.cameras.main.fadeIn(400, 0, 0, 0);
    }

    /* =============================================
     *  BACKGROUND
     * ============================================= */
    createBackground() {
        const { w, h } = this;
        const g = this.add.graphics();

        // Sky gradient
        for (let i = 0; i < h; i++) {
            const t = i / h;
            let r, gr, b;
            if (t < 0.55) {
                r = Math.floor(Phaser.Math.Linear(60, 100, t / 0.55));
                gr = Math.floor(Phaser.Math.Linear(80, 160, t / 0.55));
                b = Math.floor(Phaser.Math.Linear(140, 180, t / 0.55));
            } else {
                const gt = (t - 0.55) / 0.45;
                r = Math.floor(Phaser.Math.Linear(100, 50, gt));
                gr = Math.floor(Phaser.Math.Linear(160, 110, gt));
                b = Math.floor(Phaser.Math.Linear(180, 55, gt));
            }
            g.lineStyle(1, Phaser.Display.Color.GetColor(r, gr, b));
            g.lineBetween(0, i, w, i);
        }

        // Mountains
        g.fillStyle(0x3a5a3a, 0.4);
        for (let x = 0; x < w; x += 2) {
            const mh = h * 0.08 + Math.sin(x * 0.008) * h * 0.05 + Math.sin(x * 0.02) * h * 0.03;
            g.fillRect(x, h * 0.55 - mh, 2, mh);
        }

        // Clouds
        this.drawCloud(g, w * 0.15, h * 0.1, 1.0);
        this.drawCloud(g, w * 0.55, h * 0.06, 0.7);
        this.drawCloud(g, w * 0.82, h * 0.12, 0.9);

        // Grass details
        for (let i = 0; i < 30; i++) {
            const gx = Phaser.Math.Between(0, w);
            const gy = Phaser.Math.Between(Math.floor(h * 0.6), h);
            g.fillStyle(0x44883a, 0.5);
            g.fillRect(gx, gy, 2, 6);
        }
    }

    drawCloud(g, x, y, scale) {
        g.fillStyle(0xffffff, 0.2);
        g.fillCircle(x, y, 20 * scale);
        g.fillCircle(x + 20 * scale, y - 5 * scale, 16 * scale);
        g.fillCircle(x - 18 * scale, y + 3 * scale, 14 * scale);
    }

    /* =============================================
     *  TITLE
     * ============================================= */
    createTitle() {
        this.add.text(this.w / 2, this.h * 0.04, 'CREATE YOUR CHARACTER', {
            fontSize: this.sz(36) + 'px',
            fontFamily: 'Georgia, serif',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#1a0a33',
            strokeThickness: this.sz(5)
        }).setOrigin(0.5).setDepth(10);

        this.add.text(this.w / 2, this.h * 0.04 + this.sz(35), 'Tentukan jati dirimu di dunia Isekai', {
            fontSize: this.sz(13) + 'px',
            fontFamily: 'Arial, sans-serif',
            color: '#ccddee',
            fontStyle: 'italic'
        }).setOrigin(0.5).setDepth(10);
    }

    /* =============================================
     *  LAYOUT CALCULATION
     * ============================================= */
    getLayout() {
        const { w, h, isPortrait } = this;
        if (isPortrait) {
            // Portrait: vertical stack
            return {
                previewX: w / 2,
                previewY: h * 0.18,
                inputX: w / 2,
                inputY: h * 0.42,
                genderX: w / 2,
                genderY: h * 0.52,
                summaryX: w / 2,
                summaryY: h * 0.62,
                summaryW: Math.min(w - 40, 400),
                summaryH: h * 0.30,
                btnY: h - h * 0.05
            };
        } else {
            // Landscape: side by side
            return {
                previewX: w * 0.22,
                previewY: h * 0.38,
                inputX: w * 0.22,
                inputY: h * 0.72,
                genderX: w * 0.22,
                genderY: h * 0.85,
                summaryX: w * 0.72,
                summaryY: h * 0.12,
                summaryW: Math.min(w * 0.32, 340),
                summaryH: h * 0.72,
                btnY: h - h * 0.05
            };
        }
    }

    /* =============================================
     *  CHARACTER PREVIEW
     * ============================================= */
    createCharacterPreview() {
        const L = this.getLayout();
        const cx = L.previewX;
        const cy = L.previewY;

        // Platform
        const ped = this.add.graphics().setDepth(5);
        ped.fillStyle(0x553322, 0.7);
        ped.fillRoundedRect(cx - 50, cy + 58, 100, 12, 6);

        // Glow
        const glow = this.add.graphics().setDepth(4);
        glow.fillStyle(0x4488ff, 0.08);
        glow.fillCircle(cx, cy, 60);

        // Character
        this.previewGraphics = this.add.graphics().setDepth(10);
        this.drawCharacterPreview(cx, cy);

        // Name label
        this.previewNameLabel = this.add.text(cx, cy + 78, '???', {
            fontSize: this.sz(16) + 'px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(10);
    }

    drawCharacterPreview(cx, cy) {
        const g = this.previewGraphics;
        g.clear();
        const isMale = this.gender === 'male';
        const s = Math.max(1.5, Math.min(2.5, this.w / 550)); // Scale based on screen
        const skinColor = 0xffcc99;
        const hairColor = isMale ? 0x553311 : 0x883322;
        const shirtColor = isMale ? 0x2266bb : 0xcc4477;
        const pantsColor = isMale ? 0x334466 : 0x554466;
        const bootColor = 0x3a2a1a;
        const eyeColor = isMale ? 0x2244aa : 0x228844;

        // Cape
        g.fillStyle(isMale ? 0x4455aa : 0xaa4466, 0.8);
        g.fillRect(cx - 7 * s, cy + 2 * s, 14 * s, (isMale ? 18 : 20) * s);

        // Boots
        g.fillStyle(bootColor, 1);
        g.fillRect(cx - 5 * s, cy + 14 * s, 4 * s, 6 * s);
        g.fillRect(cx + 1 * s, cy + 14 * s, 4 * s, 6 * s);

        // Pants
        g.fillStyle(pantsColor, 1);
        g.fillRect(cx - 5 * s, cy + 5 * s, 4 * s, 10 * s);
        g.fillRect(cx + 1 * s, cy + 5 * s, 4 * s, 10 * s);

        // Shirt
        g.fillStyle(shirtColor, 1);
        g.fillRect(cx - 6 * s, cy - 5 * s, 12 * s, 11 * s);

        // Belt
        g.fillStyle(0x553311, 1);
        g.fillRect(cx - 6 * s, cy + 3 * s, 12 * s, 2 * s);
        g.fillStyle(0xccaa44, 1);
        g.fillRect(cx - 1 * s, cy + 2.5 * s, 2 * s, 3 * s);

        // Arms
        g.fillStyle(skinColor, 1);
        g.fillRect(cx - 9 * s, cy - 3 * s, 3 * s, 8 * s);
        g.fillRect(cx + 6 * s, cy - 3 * s, 3 * s, 8 * s);

        // Head
        g.fillStyle(skinColor, 1);
        g.fillRect(cx - 5 * s, cy - 15 * s, 10 * s, 11 * s);

        // Hair
        g.fillStyle(hairColor, 1);
        g.fillRect(cx - 5 * s, cy - 16 * s, 10 * s, 3 * s);
        g.fillRect(cx - 6 * s, cy - 15 * s, 2 * s, (isMale ? 5 : 9) * s);
        g.fillRect(cx + 4 * s, cy - 15 * s, 2 * s, (isMale ? 5 : 9) * s);
        if (!isMale) {
            g.fillRect(cx - 7 * s, cy - 12 * s, 2 * s, 12 * s);
            g.fillRect(cx + 5 * s, cy - 12 * s, 2 * s, 12 * s);
        }

        // Eyes
        g.fillStyle(0xffffff, 1);
        g.fillRect(cx - 3 * s, cy - 12 * s, 2.5 * s, 2.5 * s);
        g.fillRect(cx + 0.5 * s, cy - 12 * s, 2.5 * s, 2.5 * s);
        g.fillStyle(eyeColor, 1);
        g.fillRect(cx - 2 * s, cy - 11 * s, 1.5 * s, 1.5 * s);
        g.fillRect(cx + 1 * s, cy - 11 * s, 1.5 * s, 1.5 * s);

        // Mouth
        g.fillStyle(0xcc8866, 1);
        g.fillRect(cx - 1 * s, cy - 7.5 * s, 2 * s, 1 * s);

        // Weapon
        if (isMale) {
            g.fillStyle(0xcccccc, 1);
            g.fillRect(cx + 7 * s, cy - 12 * s, 1.5 * s, 20 * s);
            g.fillStyle(0xccaa44, 1);
            g.fillRect(cx + 5.5 * s, cy + 6 * s, 4.5 * s, 1.5 * s);
        } else {
            g.fillStyle(0x886644, 1);
            g.fillRect(cx - 10 * s, cy - 16 * s, 1.5 * s, 26 * s);
            g.fillStyle(0x66aaff, 0.8);
            g.fillCircle(cx - 9.25 * s, cy - 17 * s, 2.5 * s);
        }
    }

    /* =============================================
     *  NAME INPUT
     * ============================================= */
    createNameInput() {
        const L = this.getLayout();
        const x = L.inputX;
        const y = L.inputY;
        const inputW = Math.min(240, this.w * 0.45);

        this.add.text(x, y - 24, 'Nama Karakter:', {
            fontSize: this.sz(14) + 'px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(10);

        // Input bg
        this.inputBg = this.add.graphics().setDepth(10);
        this.inputBg.fillStyle(0x1a0a33, 0.9);
        this.inputBg.fillRoundedRect(x - inputW / 2, y - 12, inputW, 32, 8);
        this.inputBg.lineStyle(2, 0x6644aa, 1);
        this.inputBg.strokeRoundedRect(x - inputW / 2, y - 12, inputW, 32, 8);

        // Name display
        this.nameDisplay = this.add.text(x - inputW / 2 + 10, y + 4, '', {
            fontSize: this.sz(16) + 'px',
            fontFamily: 'monospace',
            color: '#ffffff'
        }).setOrigin(0, 0.5).setDepth(11);

        // Cursor
        this.cursorText = this.add.text(x - inputW / 2 + 10, y + 4, '|', {
            fontSize: this.sz(16) + 'px',
            fontFamily: 'monospace',
            color: '#ffffff'
        }).setOrigin(0, 0.5).setDepth(11);
        this.tweens.add({ targets: this.cursorText, alpha: { from: 1, to: 0 }, duration: 500, yoyo: true, repeat: -1 });

        // Error text
        this.nameErrorText = this.add.text(x, y + 28, '', {
            fontSize: this.sz(11) + 'px',
            fontFamily: 'Arial, sans-serif',
            color: '#ff4444',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(10);

        this.createHTMLInput(x, y, inputW);
    }

    createHTMLInput(x, y, inputW) {
        const input = document.createElement('input');
        input.type = 'text';
        input.maxLength = 15;
        input.placeholder = 'Masukkan nama...';
        input.style.cssText = 'position:absolute;opacity:0;pointer-events:none;z-index:-1;font-size:18px;font-family:monospace';
        document.body.appendChild(input);
        this.nameInputElement = input;

        const hit = this.add.rectangle(x, y + 4, inputW, 32, 0x000000, 0)
            .setInteractive({ useHandCursor: true }).setDepth(12);

        hit.on('pointerdown', () => {
            input.focus();
            this.inputBg.clear();
            this.inputBg.fillStyle(0x1a0a33, 0.95);
            this.inputBg.fillRoundedRect(x - inputW / 2, y - 12, inputW, 32, 8);
            this.inputBg.lineStyle(2, 0x8866dd, 1);
            this.inputBg.strokeRoundedRect(x - inputW / 2, y - 12, inputW, 32, 8);
        });

        input.addEventListener('input', (e) => {
            let val = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
            e.target.value = val;
            this.playerName = val;
            this.nameDisplay.setText(val);
            this.cursorText.x = x - inputW / 2 + 10 + this.nameDisplay.width + 2;
            this.validateName(val);
            this.updateSummary();
            this.updatePreviewName();
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.handleStartAdventure();
        });
    }

    validateName(name) {
        if (!name || name.length === 0) { this.nameErrorText.setText(''); return false; }
        if (name.length < 3) { this.nameErrorText.setText('⚠ Minimal 3 karakter'); this.nameErrorText.setColor('#ff4444'); return false; }
        if (name.length > 15) { this.nameErrorText.setText('⚠ Maksimal 15 karakter'); this.nameErrorText.setColor('#ff4444'); return false; }
        if (!/^[a-zA-Z0-9]+$/.test(name)) { this.nameErrorText.setText('⚠ Hanya huruf dan angka'); this.nameErrorText.setColor('#ff4444'); return false; }
        this.nameErrorText.setText('✓ Nama valid');
        this.nameErrorText.setColor('#44cc44');
        return true;
    }

    /* =============================================
     *  GENDER SELECTION
     * ============================================= */
    createGenderSelection() {
        const L = this.getLayout();
        const x = L.genderX;
        const y = L.genderY;
        const btnW = Math.min(90, this.w * 0.16);
        const btnH = 36;
        const gap = 12;

        this.add.text(x, y - 28, 'Pilih Gender:', {
            fontSize: this.sz(14) + 'px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(10);

        this.createGenderButton(x - btnW / 2 - gap / 2, y + 8, btnW, btnH, 'male', '👦 Laki-laki');
        this.createGenderButton(x + btnW / 2 + gap / 2, y + 8, btnW, btnH, 'female', '👧 Perempuan');
    }

    createGenderButton(x, y, bw, bh, genderKey, label) {
        const g = this.add.graphics().setDepth(10);
        this.drawGenderBtn(g, x, y, bw, bh, this.gender === genderKey);

        const text = this.add.text(x, y, label, {
            fontSize: this.sz(12) + 'px',
            fontFamily: 'Arial, sans-serif',
            color: this.gender === genderKey ? '#ffffff' : '#aaaacc',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(11);

        const hit = this.add.rectangle(x, y, bw, bh, 0x000000, 0)
            .setInteractive({ useHandCursor: true }).setDepth(12);

        hit.on('pointerdown', () => {
            if (this.gender !== genderKey) {
                this.gender = genderKey;
                this.playClick();
                const other = genderKey === 'male' ? 'female' : 'male';
                this.drawGenderBtn(this.genderButtons[other].g, this.genderButtons[other].x,
                    this.genderButtons[other].y, this.genderButtons[other].w, this.genderButtons[other].h, false);
                this.genderButtons[other].text.setColor('#aaaacc');
                this.drawGenderBtn(g, x, y, bw, bh, true);
                text.setColor('#ffffff');
                this.drawCharacterPreview(this.getLayout().previewX, this.getLayout().previewY);
                this.updateSummary();
            }
        });

        this.genderButtons[genderKey] = { g, text, hit, x, y, w: bw, h: bh };
    }

    drawGenderBtn(g, x, y, w, h, active) {
        g.clear();
        g.fillStyle(active ? 0x6644aa : 0x222244, active ? 1 : 0.8);
        g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 8);
        g.lineStyle(active ? 2 : 1, active ? 0x8866dd : 0x444466, active ? 1 : 0.5);
        g.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 8);
    }

    /* =============================================
     *  SUMMARY PANEL
     * ============================================= */
    createSummaryPanel() {
        const L = this.getLayout();
        const px = L.summaryX;
        const py = L.summaryY;
        const pw = L.summaryW;
        const ph = L.summaryH;

        // Panel bg
        this.summaryPanel = this.add.graphics().setDepth(5);
        this.summaryPanel.fillStyle(0x0a0a1a, 0.85);
        this.summaryPanel.fillRoundedRect(px - pw / 2, py, pw, ph, 10);
        this.summaryPanel.lineStyle(2, 0x6644aa, 0.7);
        this.summaryPanel.strokeRoundedRect(px - pw / 2, py, pw, ph, 10);

        // Title
        this.add.text(px, py + 20, '📋 Ringkasan Karakter', {
            fontSize: this.sz(15) + 'px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffdd88',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(10);

        this.summaryPanel.lineStyle(1, 0x6644aa, 0.4);
        this.summaryPanel.lineBetween(px - pw / 2 + 16, py + 38, px + pw / 2 - 16, py + 38);

        const items = [
            { key: 'name', label: 'Nama', value: '???' },
            { key: 'gender', label: 'Gender', value: 'Laki-laki' },
            { key: 'hp', label: 'HP', value: '100 / 100' },
            { key: 'energy', label: 'Energy', value: '100 / 100' },
            { key: 'gold', label: 'Gold', value: '1,000' },
            { key: 'diamond', label: 'Diamond', value: '0' },
            { key: 'weapon', label: 'Senjata', value: 'Pedang Kayu' },
            { key: 'armor', label: 'Armor', value: 'Tidak Ada' },
            { key: 'location', label: 'Lokasi', value: 'Main Village' },
            { key: 'level', label: 'Level', value: '1' }
        ];

        const startY = py + 48;
        const lineH = Math.max(28, (ph - 60) / items.length);

        items.forEach((item, i) => {
            const iy = startY + i * lineH;
            this.add.text(px - pw / 2 + 16, iy, item.label, {
                fontSize: this.sz(12) + 'px',
                fontFamily: 'Arial, sans-serif',
                color: '#8888aa'
            }).setDepth(10);

            const valText = this.add.text(px + pw / 2 - 16, iy, item.value, {
                fontSize: this.sz(12) + 'px',
                fontFamily: 'Arial, sans-serif',
                color: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(1, 0).setDepth(10);
            this.summaryTexts[item.key] = valText;

            if (i < items.length - 1) {
                this.summaryPanel.lineStyle(1, 0x333355, 0.3);
                this.summaryPanel.lineBetween(px - pw / 2 + 16, iy + lineH - 4, px + pw / 2 - 16, iy + lineH - 4);
            }
        });
    }

    updateSummary() {
        if (!this.summaryTexts.name) return;
        this.summaryTexts.name.setText(this.playerName || '???');
        this.summaryTexts.gender.setText(this.gender === 'male' ? 'Laki-laki' : 'Perempuan');
    }

    updatePreviewName() {
        if (this.previewNameLabel) this.previewNameLabel.setText(this.playerName || '???');
    }

    /* =============================================
     *  BUTTONS
     * ============================================= */
    createButtons() {
        const L = this.getLayout();
        const btnY = L.btnY;
        const btnH = Math.min(40, this.h * 0.055);
        const isSmall = this.isPortrait;

        if (isSmall) {
            // Portrait: stack vertically
            const gap = btnH + 8;
            this.createActionBtn(this.w / 2, btnY - gap * 2, this.w * 0.6, btnH, '⬅  Kembali', 0x444466, () => {
                this.playClick(); this.cleanup();
                this.cameras.main.fadeOut(300, 0, 0, 0);
                this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('MainMenuScene'));
            });
            this.createActionBtn(this.w / 2, btnY - gap, this.w * 0.6, btnH, '🎲  Acak Nama', 0x556644, () => {
                this.playClick(); this.randomizeName();
            });
            this.createActionBtn(this.w / 2, btnY, this.w * 0.7, btnH, '▶  Mulai Petualangan', 0x447744, () => {
                this.handleStartAdventure();
            });
        } else {
            // Landscape: side by side
            this.createActionBtn(this.w * 0.08, btnY, this.w * 0.14, btnH, '⬅ Kembali', 0x444466, () => {
                this.playClick(); this.cleanup();
                this.cameras.main.fadeOut(300, 0, 0, 0);
                this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('MainMenuScene'));
            });
            this.createActionBtn(this.w * 0.22, btnY, this.w * 0.16, btnH, '🎲 Acak Nama', 0x556644, () => {
                this.playClick(); this.randomizeName();
            });
            this.createActionBtn(this.w * 0.42, btnY, this.w * 0.24, btnH, '▶ Mulai Petualangan', 0x447744, () => {
                this.handleStartAdventure();
            });
        }
    }

    createActionBtn(x, y, w, h, label, color, callback) {
        const g = this.add.graphics().setDepth(10);
        g.fillStyle(color, 1);
        g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 8);

        this.add.text(x, y, label, {
            fontSize: this.sz(13) + 'px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(11);

        const hit = this.add.rectangle(x, y, w, h, 0x000000, 0)
            .setInteractive({ useHandCursor: true }).setDepth(12);

        hit.on('pointerover', () => {
            g.clear();
            g.fillStyle(color + 0x222222, 1);
            g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 8);
        });
        hit.on('pointerout', () => {
            g.clear();
            g.fillStyle(color, 1);
            g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 8);
        });
        hit.on('pointerdown', callback);
    }

    /* =============================================
     *  RANDOM NAME
     * ============================================= */
    randomizeName() {
        const names = ['Arlen','Kael','Rin','Lyra','Eren','Aira','Leon','Cedra','Milo','Yuki','Sora','Nora','Finn','Luna','Asher','Iris','Rowan','Sage','Theo','Nova','Zara','Dante','Elara','Orion','Vera','Kai','Mira','Thane'];
        const name = names[Math.floor(Math.random() * names.length)];
        this.playerName = name;
        this.nameDisplay.setText(name);
        if (this.nameInputElement) this.nameInputElement.value = name;
        const L = this.getLayout();
        const inputW = Math.min(240, this.w * 0.45);
        this.cursorText.x = L.inputX - inputW / 2 + 10 + this.nameDisplay.width + 2;
        this.validateName(name);
        this.updateSummary();
        this.updatePreviewName();
    }

    /* =============================================
     *  START ADVENTURE
     * ============================================= */
    handleStartAdventure() {
        if (!this.playerName || this.playerName.length < 3) {
            this.nameErrorText.setText('⚠ Masukkan nama minimal 3 karakter!');
            this.nameErrorText.setColor('#ff4444');
            return;
        }
        if (!this.validateName(this.playerName)) return;

        const playerData = {
            player: { name: this.playerName, gender: this.gender },
            stats: { level: 1, exp: 0, expToNext: 100, hp: 100, maxHp: 100, energy: 100, maxEnergy: 100, attack: 10, defense: 5 },
            currency: { gold: 1000, diamond: 0 },
            equipment: { weapon: 'Pedang Kayu', armor: 'Tidak Ada', accessory: 'Tidak Ada' },
            inventory: { items: [], maxSlots: 20 },
            warehouse: { unlocked: false, items: [] },
            quests: { active: [], completed: [] },
            progress: { mapLevel: 0, location: 'Main Village', playTime: 0, createdAt: new Date().toISOString() }
        };

        try {
            localStorage.setItem('isekai_world_save', JSON.stringify(playerData));
            this.showSuccessMessage();
        } catch (e) {
            this.nameErrorText.setText('⚠ Gagal menyimpan data!');
            this.nameErrorText.setColor('#ff4444');
            console.error('[CharacterCreator] Save error:', e);
        }
    }

    showSuccessMessage() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        const dim = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0).setDepth(300);
        this.tweens.add({ targets: dim, alpha: 0.7, duration: 300 });

        const popup = this.add.container(w / 2, h / 2).setDepth(301).setAlpha(0);
        const bg = this.add.graphics();
        bg.fillStyle(0x0a1a0a, 0.97);
        bg.fillRoundedRect(-200, -90, 400, 180, 14);
        bg.lineStyle(2, 0x44aa44, 1);
        bg.strokeRoundedRect(-200, -90, 400, 180, 14);
        popup.add(bg);

        popup.add(this.add.text(0, -60, '✅', { fontSize: '32px' }).setOrigin(0.5));
        popup.add(this.add.text(0, -20, 'Karakter berhasil dibuat!', {
            fontSize: this.sz(18) + 'px', fontFamily: 'Arial', color: '#44cc44', fontStyle: 'bold'
        }).setOrigin(0.5));

        // Loading bar
        const loadBg = this.add.graphics();
        loadBg.fillStyle(0x222244, 1);
        loadBg.fillRoundedRect(-90, 10, 180, 10, 5);
        popup.add(loadBg);
        const loadFill = this.add.graphics();
        popup.add(loadFill);

        let progress = 0;
        this.time.addEvent({
            delay: 30, repeat: 66,
            callback: () => {
                progress = Math.min(100, progress + 1.5);
                loadFill.clear();
                loadFill.fillStyle(0x44aa44, 1);
                loadFill.fillRoundedRect(-90, 10, 180 * (progress / 100), 10, 5);
            }
        });

        this.time.delayedCall(2200, () => {
            loadBg.clear(); loadFill.clear();
            popup.add(this.add.text(0, 14, 'Desa Utama akan dibuat pada Prompt #4.', {
                fontSize: this.sz(13) + 'px', fontFamily: 'Arial', color: '#aaaacc', fontStyle: 'italic'
            }).setOrigin(0.5));

            const okBg = this.add.graphics();
            okBg.fillStyle(0x44aa44, 1);
            okBg.fillRoundedRect(-40, 48, 80, 30, 8);
            popup.add(okBg);
            popup.add(this.add.text(0, 63, 'OK', {
                fontSize: '15px', fontFamily: 'Arial', color: '#ffffff', fontStyle: 'bold'
            }).setOrigin(0.5));

            const okHit = this.add.rectangle(0, 63, 80, 30, 0x000000, 0)
                .setInteractive({ useHandCursor: true });
            popup.add(okHit);
            okHit.on('pointerdown', () => {
                this.playClick(); this.cleanup();
                this.cameras.main.fadeOut(300, 0, 0, 0);
                this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('MainMenuScene'));
            });
        });

        this.tweens.add({ targets: popup, alpha: 1, duration: 300 });
    }

    /* =============================================
     *  AUDIO
     * ============================================= */
    playClick() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const o = ctx.createOscillator();
            const gn = ctx.createGain();
            o.connect(gn); gn.connect(ctx.destination);
            o.type = 'sine';
            o.frequency.setValueAtTime(500, ctx.currentTime);
            o.frequency.exponentialRampToValueAtTime(250, ctx.currentTime + 0.05);
            gn.gain.setValueAtTime(0.08, ctx.currentTime);
            gn.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
            o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.06);
        } catch (e) {}
    }

    cleanup() {
        if (this.nameInputElement) { this.nameInputElement.remove(); this.nameInputElement = null; }
    }

    shutdown() { this.cleanup(); }
}
