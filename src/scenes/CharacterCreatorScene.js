/**
 * CharacterCreatorScene - Halaman pembuatan karakter sebelum mulai permainan.
 * Muncul saat pemain menekan tombol New Game di Main Menu.
 */
class CharacterCreatorScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CharacterCreatorScene' });

        this.playerName = '';
        this.gender = 'male'; // default: laki-laki
        this.genderButtons = {};
        this.genderHighlights = {};
        this.previewGraphics = null;
        this.nameInputElement = null;
        this.nameErrorText = null;
        this.summaryTexts = {};
        this.summaryPanel = null;
    }

    /* =============================================
     *  CREATE - Main entry
     * ============================================= */
    create() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;

        this.createBackground(w, h);
        this.createTitle(w, h);
        this.createCharacterPreview(w, h);
        this.createNameInput(w, h);
        this.createGenderSelection(w, h);
        this.createSummaryPanel(w, h);
        this.createButtons(w, h);

        // Entrance animation
        this.cameras.main.fadeIn(400, 0, 0, 0);
    }

    /* =============================================
     *  BACKGROUND - Grassland fantasy
     * ============================================= */
    createBackground(w, h) {
        const g = this.add.graphics();

        // Sky gradient (light blue to green)
        for (let i = 0; i < h; i++) {
            const t = i / h;
            let r, gr, b;
            if (t < 0.55) {
                // Sky
                r = Math.floor(Phaser.Math.Linear(60, 100, t / 0.55));
                gr = Math.floor(Phaser.Math.Linear(80, 160, t / 0.55));
                b = Math.floor(Phaser.Math.Linear(140, 180, t / 0.55));
            } else {
                // Grass
                const gt = (t - 0.55) / 0.45;
                r = Math.floor(Phaser.Math.Linear(100, 50, gt));
                gr = Math.floor(Phaser.Math.Linear(160, 110, gt));
                b = Math.floor(Phaser.Math.Linear(180, 55, gt));
            }
            g.lineStyle(1, Phaser.Display.Color.GetColor(r, gr, b));
            g.lineBetween(0, i, w, i);
        }

        // Distant mountains
        g.fillStyle(0x3a5a3a, 0.4);
        for (let x = 0; x < w; x += 2) {
            const mh = 100 + Math.sin(x * 0.008) * 40 + Math.sin(x * 0.02) * 20;
            g.fillRect(x, h * 0.55 - mh, 2, mh);
        }

        // Clouds
        this.drawCloud(g, w * 0.15, h * 0.12, 1.0);
        this.drawCloud(g, w * 0.55, h * 0.08, 0.7);
        this.drawCloud(g, w * 0.82, h * 0.15, 0.9);

        // Grass detail
        for (let i = 0; i < 40; i++) {
            const gx = Phaser.Math.Between(0, w);
            const gy = Phaser.Math.Between(Math.floor(h * 0.6), h);
            g.fillStyle(0x44883a, 0.5);
            g.fillRect(gx, gy, 2, 6);
            g.fillRect(gx + 4, gy + 2, 2, 4);
        }

        // Flowers
        for (let i = 0; i < 15; i++) {
            const fx = Phaser.Math.Between(0, w);
            const fy = Phaser.Math.Between(Math.floor(h * 0.65), h);
            const colors = [0xff6688, 0xffaa44, 0xff55cc, 0xffff66];
            g.fillStyle(colors[i % colors.length], 0.7);
            g.fillCircle(fx, fy, 3);
            g.fillStyle(0xffff00, 0.8);
            g.fillCircle(fx, fy, 1);
        }

        // Small village silhouettes in distance
        g.fillStyle(0x2a4a2a, 0.3);
        // House 1
        g.fillRect(w * 0.7, h * 0.52, 20, 14);
        g.fillTriangle(w * 0.7 - 3, h * 0.52, w * 0.7 + 23, h * 0.52, w * 0.7 + 10, h * 0.52 - 10);
        // House 2
        g.fillRect(w * 0.75, h * 0.53, 16, 11);
        g.fillTriangle(w * 0.75 - 2, h * 0.53, w * 0.75 + 18, h * 0.53, w * 0.75 + 8, h * 0.53 - 8);
        // Tree
        g.fillStyle(0x2a4a2a, 0.25);
        g.fillCircle(w * 0.65, h * 0.5, 12);
        g.fillRect(w * 0.65 - 2, h * 0.5, 4, 8);

        // Dark overlay at edges for depth
        g.fillStyle(0x000000, 0.15);
        g.fillRect(0, 0, 80, h);
        g.fillRect(w - 80, 0, 80, h);
        g.fillStyle(0x000000, 0.25);
        g.fillRect(0, 0, w, 40);
    }

    drawCloud(g, x, y, scale) {
        g.fillStyle(0xffffff, 0.25);
        g.fillCircle(x, y, 20 * scale);
        g.fillCircle(x + 20 * scale, y - 5 * scale, 16 * scale);
        g.fillCircle(x - 18 * scale, y + 3 * scale, 14 * scale);
        g.fillCircle(x + 10 * scale, y + 5 * scale, 12 * scale);
    }

    /* =============================================
     *  TITLE
     * ============================================= */
    createTitle(w, h) {
        this.add.text(w / 2, 50, 'CREATE YOUR CHARACTER', {
            fontSize: '36px',
            fontFamily: 'Georgia, serif',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#1a0a33',
            strokeThickness: 5
        }).setOrigin(0.5).setDepth(10);

        this.add.text(w / 2, 85, 'Tentukan jati dirimu di dunia Isekai', {
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif',
            color: '#ccddee',
            fontStyle: 'italic'
        }).setOrigin(0.5).setDepth(10);
    }

    /* =============================================
     *  CHARACTER PREVIEW
     * ============================================= */
    createCharacterPreview(w, h) {
        const previewX = w * 0.25;
        const previewY = h * 0.42;

        // Platform / pedestal
        const pedestal = this.add.graphics().setDepth(5);
        pedestal.fillStyle(0x553322, 0.7);
        pedestal.fillRoundedRect(previewX - 60, previewY + 70, 120, 16, 8);
        pedestal.fillStyle(0x664433, 0.5);
        pedestal.fillRoundedRect(previewX - 50, previewY + 78, 100, 8, 4);

        // Glow behind character
        const glow = this.add.graphics().setDepth(4);
        glow.fillStyle(0x4488ff, 0.08);
        glow.fillCircle(previewX, previewY, 70);
        glow.fillStyle(0x6644cc, 0.06);
        glow.fillCircle(previewX, previewY, 50);

        // Character graphics
        this.previewGraphics = this.add.graphics().setDepth(10);
        this.drawCharacterPreview(previewX, previewY);

        // Name label below pedestal
        this.previewNameLabel = this.add.text(previewX, previewY + 105, '???' , {
            fontSize: '16px',
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
        const skinColor = 0xffcc99;
        const hairColor = isMale ? 0x553311 : 0x883322;
        const shirtColor = isMale ? 0x2266bb : 0xcc4477;
        const pantsColor = isMale ? 0x334466 : 0x554466;
        const bootColor = 0x3a2a1a;
        const eyeColor = isMale ? 0x2244aa : 0x228844;

        // Scale factor for bigger preview
        const s = 2.5;

        // Cape
        if (isMale) {
            g.fillStyle(0x4455aa, 0.8);
            g.fillRect(cx - 8 * s, cy + 2 * s, 16 * s, 20 * s);
        } else {
            g.fillStyle(0xaa4466, 0.8);
            g.fillRect(cx - 7 * s, cy + 2 * s, 14 * s, 22 * s);
        }

        // Boots
        g.fillStyle(bootColor, 1);
        g.fillRect(cx - 6 * s, cy + 16 * s, 5 * s, 7 * s);
        g.fillRect(cx + 1 * s, cy + 16 * s, 5 * s, 7 * s);

        // Pants
        g.fillStyle(pantsColor, 1);
        g.fillRect(cx - 6 * s, cy + 6 * s, 5 * s, 11 * s);
        g.fillRect(cx + 1 * s, cy + 6 * s, 5 * s, 11 * s);

        // Shirt
        g.fillStyle(shirtColor, 1);
        g.fillRect(cx - 7 * s, cy - 6 * s, 14 * s, 13 * s);

        // Belt
        g.fillStyle(0x553311, 1);
        g.fillRect(cx - 7 * s, cy + 4 * s, 14 * s, 2 * s);
        g.fillStyle(0xccaa44, 1);
        g.fillRect(cx - 1 * s, cy + 3.5 * s, 2 * s, 3 * s);

        // Arms
        g.fillStyle(skinColor, 1);
        g.fillRect(cx - 10 * s, cy - 4 * s, 4 * s, 10 * s);
        g.fillRect(cx + 6 * s, cy - 4 * s, 4 * s, 10 * s);

        // Gloves
        g.fillStyle(isMale ? 0x554433 : 0x664455, 1);
        g.fillRect(cx - 10 * s, cy + 4 * s, 4 * s, 3 * s);
        g.fillRect(cx + 6 * s, cy + 4 * s, 4 * s, 3 * s);

        // Head
        g.fillStyle(skinColor, 1);
        g.fillRect(cx - 6 * s, cy - 17 * s, 12 * s, 12 * s);

        // Hair
        g.fillStyle(hairColor, 1);
        g.fillRect(cx - 6 * s, cy - 18 * s, 12 * s, 4 * s);
        g.fillRect(cx - 7 * s, cy - 17 * s, 2 * s, (isMale ? 6 : 10) * s);
        g.fillRect(cx + 5 * s, cy - 17 * s, 2 * s, (isMale ? 6 : 10) * s);
        if (!isMale) {
            // Long hair sides
            g.fillRect(cx - 8 * s, cy - 14 * s, 2 * s, 14 * s);
            g.fillRect(cx + 6 * s, cy - 14 * s, 2 * s, 14 * s);
            // Hair shine
            g.fillStyle(0xaa5533, 0.4);
            g.fillRect(cx - 3 * s, cy - 18 * s, 4 * s, 2 * s);
        }

        // Eyes
        g.fillStyle(0xffffff, 1);
        g.fillRect(cx - 4 * s, cy - 13 * s, 3 * s, 3 * s);
        g.fillRect(cx + 1 * s, cy - 13 * s, 3 * s, 3 * s);
        g.fillStyle(eyeColor, 1);
        g.fillRect(cx - 3 * s, cy - 12 * s, 2 * s, 2 * s);
        g.fillRect(cx + 2 * s, cy - 12 * s, 2 * s, 2 * s);
        // Pupils
        g.fillStyle(0x111111, 1);
        g.fillRect(cx - 2.5 * s, cy - 11.5 * s, 1 * s, 1 * s);
        g.fillRect(cx + 2.5 * s, cy - 11.5 * s, 1 * s, 1 * s);

        // Mouth
        g.fillStyle(0xcc8866, 1);
        g.fillRect(cx - 1.5 * s, cy - 8 * s, 3 * s, 1 * s);

        // Sword on back (for male)
        if (isMale) {
            g.fillStyle(0xcccccc, 1);
            g.fillRect(cx + 8 * s, cy - 14 * s, 2 * s, 24 * s);
            g.fillStyle(0xccaa44, 1);
            g.fillRect(cx + 6 * s, cy + 8 * s, 6 * s, 2 * s);
        } else {
            // Staff (for female)
            g.fillStyle(0x886644, 1);
            g.fillRect(cx - 11 * s, cy - 18 * s, 2 * s, 30 * s);
            g.fillStyle(0x66aaff, 0.8);
            g.fillCircle(cx - 10 * s, cy - 19 * s, 3 * s);
        }
    }

    /* =============================================
     *  NAME INPUT
     * ============================================= */
    createNameInput(w, h) {
        const inputX = w * 0.25;
        const inputY = h * 0.75;

        // Label
        this.add.text(inputX, inputY - 28, 'Nama Karakter:', {
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(10);

        // Input background (Phaser graphics)
        this.inputBg = this.add.graphics().setDepth(10);
        this.inputBg.fillStyle(0x1a0a33, 0.9);
        this.inputBg.fillRoundedRect(inputX - 110, inputY - 12, 220, 32, 8);
        this.inputBg.lineStyle(2, 0x6644aa, 1);
        this.inputBg.strokeRoundedRect(inputX - 110, inputY - 12, 220, 32, 8);

        // Blinking cursor text
        this.nameDisplay = this.add.text(inputX - 100, inputY + 4, '', {
            fontSize: '18px',
            fontFamily: 'monospace',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(0, 0.5).setDepth(11);

        // Cursor blink
        this.cursorText = this.add.text(inputX - 100, inputY + 4, '|', {
            fontSize: '18px',
            fontFamily: 'monospace',
            color: '#ffffff'
        }).setOrigin(0, 0.5).setDepth(11);

        this.tweens.add({
            targets: this.cursorText,
            alpha: { from: 1, to: 0 },
            duration: 500,
            yoyo: true,
            repeat: -1
        });

        // Error text
        this.nameErrorText = this.add.text(inputX, inputY + 28, '', {
            fontSize: '12px',
            fontFamily: 'Arial, sans-serif',
            color: '#ff4444',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(10);

        // Create hidden HTML input
        this.createHTMLInput(inputX, inputY);
    }

    createHTMLInput(x, y) {
        // Create input element outside canvas
        const input = document.createElement('input');
        input.type = 'text';
        input.maxLength = 15;
        input.placeholder = 'Masukkan nama...';
        input.style.cssText = [
            'position: absolute',
            'opacity: 0',
            'pointer-events: none',
            'z-index: -1',
            'font-size: 18px',
            'font-family: monospace'
        ].join(';');

        document.body.appendChild(input);
        this.nameInputElement = input;

        // Keyboard capture: click on canvas area to focus
        const hitArea = this.add.rectangle(x, y + 4, 220, 32, 0x000000, 0)
            .setInteractive({ useHandCursor: true })
            .setDepth(12);

        hitArea.on('pointerdown', () => {
            input.focus();
            this.inputBg.clear();
            this.inputBg.fillStyle(0x1a0a33, 0.95);
            this.inputBg.fillRoundedRect(x - 110, y - 12, 220, 32, 8);
            this.inputBg.lineStyle(2, 0x8866dd, 1);
            this.inputBg.strokeRoundedRect(x - 110, y - 12, 220, 32, 8);
        });

        // Listen for input changes
        input.addEventListener('input', (e) => {
            let val = e.target.value;
            // Only allow letters and numbers
            val = val.replace(/[^a-zA-Z0-9]/g, '');
            e.target.value = val;
            this.playerName = val;
            this.nameDisplay.setText(val);
            this.cursorText.x = x - 100 + this.nameDisplay.width + 2;
            this.validateName(val);
            this.updateSummary();
            this.updatePreviewName();
        });

        // Handle Enter key
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.handleStartAdventure();
            }
        });
    }

    validateName(name) {
        if (name.length === 0) {
            this.nameErrorText.setText('');
            return false;
        }
        if (name.length < 3) {
            this.nameErrorText.setText('⚠ Minimal 3 karakter');
            return false;
        }
        if (name.length > 15) {
            this.nameErrorText.setText('⚠ Maksimal 15 karakter');
            return false;
        }
        if (!/^[a-zA-Z0-9]+$/.test(name)) {
            this.nameErrorText.setText('⚠ Hanya huruf dan angka');
            return false;
        }
        this.nameErrorText.setText('✓ Nama valid');
        this.nameErrorText.setColor('#44cc44');
        return true;
    }

    /* =============================================
     *  GENDER SELECTION
     * ============================================= */
    createGenderSelection(w, h) {
        const centerX = w * 0.25;
        const y = h * 0.85;

        this.add.text(centerX, y - 30, 'Pilih Gender:', {
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(10);

        const btnW = 90;
        const btnH = 36;
        const gap = 16;

        // Male button
        this.createGenderButton(
            centerX - btnW / 2 - gap / 2, y + 8,
            btnW, btnH, 'male', '👦 Laki-laki'
        );

        // Female button
        this.createGenderButton(
            centerX + btnW / 2 + gap / 2, y + 8,
            btnW, btnH, 'female', '👧 Perempuan'
        );
    }

    createGenderButton(x, y, bw, bh, genderKey, label) {
        const g = this.add.graphics().setDepth(10);
        const isActive = this.gender === genderKey;

        this.drawGenderBtn(g, x, y, bw, bh, isActive);

        const text = this.add.text(x, y, label, {
            fontSize: '13px',
            fontFamily: 'Arial, sans-serif',
            color: isActive ? '#ffffff' : '#aaaacc',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(11);

        const hit = this.add.rectangle(x, y, bw, bh, 0x000000, 0)
            .setInteractive({ useHandCursor: true })
            .setDepth(12);

        hit.on('pointerdown', () => {
            if (this.gender !== genderKey) {
                this.gender = genderKey;
                this.playClick();
                // Redraw both buttons
                this.drawGenderBtn(this.genderButtons.male.g, this.genderButtons.male.x,
                    this.genderButtons.male.y, this.genderButtons.male.w, this.genderButtons.male.h,
                    genderKey === 'male');
                this.genderButtons.male.text.setColor(genderKey === 'male' ? '#ffffff' : '#aaaacc');

                this.drawGenderBtn(this.genderButtons.female.g, this.genderButtons.female.x,
                    this.genderButtons.female.y, this.genderButtons.female.w, this.genderButtons.female.h,
                    genderKey === 'female');
                this.genderButtons.female.text.setColor(genderKey === 'female' ? '#ffffff' : '#aaaacc');

                // Redraw character preview
                const w = this.cameras.main.width;
                const h = this.cameras.main.height;
                this.drawCharacterPreview(w * 0.25, h * 0.42);
                this.updateSummary();
            }
        });

        hit.on('pointerover', () => {
            if (this.gender !== genderKey) {
                this.drawGenderBtn(g, x, y, bw, bh, false, true);
            }
        });

        hit.on('pointerout', () => {
            this.drawGenderBtn(g, x, y, bw, bh, isActive || this.gender === genderKey);
        });

        this.genderButtons[genderKey] = { g, text, hit, x, y, w: bw, h: bh };
    }

    drawGenderBtn(g, x, y, w, h, active, hover = false) {
        g.clear();
        if (active) {
            g.fillStyle(0x6644aa, 1);
            g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 8);
            g.lineStyle(2, 0x8866dd, 1);
            g.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 8);
        } else if (hover) {
            g.fillStyle(0x333355, 0.8);
            g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 8);
            g.lineStyle(1, 0x6644aa, 0.6);
            g.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 8);
        } else {
            g.fillStyle(0x222244, 0.8);
            g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 8);
            g.lineStyle(1, 0x444466, 0.5);
            g.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 8);
        }
    }

    /* =============================================
     *  SUMMARY PANEL (right side)
     * ============================================= */
    createSummaryPanel(w, h) {
        const panelX = w * 0.72;
        const panelY = h * 0.15;
        const panelW = 300;
        const panelH = 480;

        // Panel background
        this.summaryPanel = this.add.graphics().setDepth(5);
        this.summaryPanel.fillStyle(0x0a0a1a, 0.85);
        this.summaryPanel.fillRoundedRect(panelX - panelW / 2, panelY, panelW, panelH, 12);
        this.summaryPanel.lineStyle(2, 0x6644aa, 0.7);
        this.summaryPanel.strokeRoundedRect(panelX - panelW / 2, panelY, panelW, panelH, 12);

        // Panel title
        this.add.text(panelX, panelY + 25, '📋 Ringkasan Karakter', {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffdd88',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(10);

        // Divider
        this.summaryPanel.lineStyle(1, 0x6644aa, 0.4);
        this.summaryPanel.lineBetween(panelX - panelW / 2 + 20, panelY + 48, panelX + panelW / 2 - 20, panelY + 48);

        // Summary items
        const items = [
            { key: 'name',      label: 'Nama',          value: '???' },
            { key: 'gender',    label: 'Gender',         value: 'Laki-laki' },
            { key: 'hp',        label: 'HP',             value: '100 / 100' },
            { key: 'energy',    label: 'Energy',         value: '100 / 100' },
            { key: 'gold',      label: 'Gold',           value: '1,000' },
            { key: 'diamond',   label: 'Diamond',        value: '0' },
            { key: 'weapon',    label: 'Senjata Awal',   value: 'Pedang Kayu' },
            { key: 'armor',     label: 'Armor',          value: 'Tidak Ada' },
            { key: 'location',  label: 'Lokasi',         value: 'Main Village' },
            { key: 'level',     label: 'Level',          value: '1' }
        ];

        const startY = panelY + 65;
        const lineH = 38;

        items.forEach((item, i) => {
            const iy = startY + i * lineH;

            // Label
            this.add.text(panelX - panelW / 2 + 24, iy, item.label, {
                fontSize: '13px',
                fontFamily: 'Arial, sans-serif',
                color: '#8888aa'
            }).setDepth(10);

            // Value
            const valText = this.add.text(panelX + panelW / 2 - 24, iy, item.value, {
                fontSize: '13px',
                fontFamily: 'Arial, sans-serif',
                color: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(1, 0).setDepth(10);

            this.summaryTexts[item.key] = valText;

            // Separator
            if (i < items.length - 1) {
                this.summaryPanel.lineStyle(1, 0x333355, 0.3);
                this.summaryPanel.lineBetween(
                    panelX - panelW / 2 + 20, iy + 28,
                    panelX + panelW / 2 - 20, iy + 28
                );
            }
        });
    }

    updateSummary() {
        if (!this.summaryTexts.name) return;
        this.summaryTexts.name.setText(this.playerName || '???');
        this.summaryTexts.gender.setText(this.gender === 'male' ? 'Laki-laki' : 'Perempuan');
    }

    updatePreviewName() {
        if (this.previewNameLabel) {
            this.previewNameLabel.setText(this.playerName || '???');
        }
    }

    /* =============================================
     *  BUTTONS
     * ============================================= */
    createButtons(w, h) {
        const btnY = h - 45;
        const btnH = 40;

        // Back button (left)
        this.createActionBtn(w * 0.15, btnY, 150, btnH, '⬅  Kembali', 0x444466, () => {
            this.playClick();
            this.cleanup();
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('MainMenuScene');
            });
        });

        // Random Name button (center-left)
        this.createActionBtn(w * 0.38, btnY, 160, btnH, '🎲  Acak Nama', 0x556644, () => {
            this.playClick();
            this.randomizeName();
        });

        // Start Adventure button (right)
        this.createActionBtn(w * 0.75, btnY, 220, btnH, '▶  Mulai Petualangan', 0x447744, () => {
            this.handleStartAdventure();
        });
    }

    createActionBtn(x, y, w, h, label, color, callback) {
        const g = this.add.graphics().setDepth(10);
        g.fillStyle(color, 1);
        g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 8);
        g.lineStyle(1, 0xffffff, 0.15);
        g.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 8);

        const text = this.add.text(x, y, label, {
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(11);

        const hit = this.add.rectangle(x, y, w, h, 0x000000, 0)
            .setInteractive({ useHandCursor: true })
            .setDepth(12);

        hit.on('pointerover', () => {
            g.clear();
            g.fillStyle(color + 0x222222, 1);
            g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 8);
            g.lineStyle(1, 0xffffff, 0.25);
            g.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 8);
        });

        hit.on('pointerout', () => {
            g.clear();
            g.fillStyle(color, 1);
            g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 8);
            g.lineStyle(1, 0xffffff, 0.15);
            g.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 8);
        });

        hit.on('pointerdown', callback);
    }

    /* =============================================
     *  RANDOM NAME
     * ============================================= */
    randomizeName() {
        const names = [
            'Arlen', 'Kael', 'Rin', 'Lyra', 'Eren', 'Aira', 'Leon',
            'Cedra', 'Milo', 'Yuki', 'Sora', 'Nora', 'Finn', 'Luna',
            'Asher', 'Iris', 'Rowan', 'Sage', 'Theo', 'Nova', 'Zara',
            'Dante', 'Elara', 'Orion', 'Vera', 'Kai', 'Mira', 'Thane'
        ];
        const randomName = names[Math.floor(Math.random() * names.length)];

        this.playerName = randomName;
        this.nameDisplay.setText(randomName);

        if (this.nameInputElement) {
            this.nameInputElement.value = randomName;
        }

        // Update cursor position
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        const inputX = w * 0.25;
        const inputY = h * 0.75;
        this.cursorText.x = inputX - 100 + this.nameDisplay.width + 2;

        this.validateName(randomName);
        this.updateSummary();
        this.updatePreviewName();
    }

    /* =============================================
     *  START ADVENTURE
     * ============================================= */
    handleStartAdventure() {
        // Validate name
        if (!this.playerName || this.playerName.length < 3) {
            this.nameErrorText.setText('⚠ Masukkan nama minimal 3 karakter!');
            this.nameErrorText.setColor('#ff4444');
            this.shakeElement(this.inputBg);
            return;
        }

        if (!this.validateName(this.playerName)) {
            this.shakeElement(this.inputBg);
            return;
        }

        // Build player data
        const playerData = {
            player: {
                name: this.playerName,
                gender: this.gender
            },
            stats: {
                level: 1,
                exp: 0,
                expToNext: 100,
                hp: 100,
                maxHp: 100,
                energy: 100,
                maxEnergy: 100,
                attack: 10,
                defense: 5
            },
            currency: {
                gold: 1000,
                diamond: 0
            },
            equipment: {
                weapon: 'Pedang Kayu',
                armor: 'Tidak Ada',
                accessory: 'Tidak Ada'
            },
            inventory: {
                items: [],
                maxSlots: 20
            },
            warehouse: {
                unlocked: false,
                items: []
            },
            quests: {
                active: [],
                completed: []
            },
            progress: {
                mapLevel: 0,
                location: 'Main Village',
                playTime: 0,
                createdAt: new Date().toISOString()
            }
        };

        // Save to LocalStorage
        try {
            localStorage.setItem('isekai_world_save', JSON.stringify(playerData));
            this.showSuccessMessage();
        } catch (e) {
            this.nameErrorText.setText('⚠ Gagal menyimpan data! Coba lagi.');
            this.nameErrorText.setColor('#ff4444');
            console.error('[CharacterCreator] Save error:', e);
        }
    }

    showSuccessMessage() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;

        // Dim overlay
        const dim = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0)
            .setDepth(300);

        this.tweens.add({ targets: dim, alpha: 0.7, duration: 300 });

        // Success container
        const popup = this.add.container(w / 2, h / 2).setDepth(301).setAlpha(0);

        const bg = this.add.graphics();
        bg.fillStyle(0x0a1a0a, 0.97);
        bg.fillRoundedRect(-220, -100, 440, 200, 14);
        bg.lineStyle(2, 0x44aa44, 1);
        bg.strokeRoundedRect(-220, -100, 440, 200, 14);
        popup.add(bg);

        // Check icon
        popup.add(this.add.text(0, -70, '✅', {
            fontSize: '36px'
        }).setOrigin(0.5));

        // Success text
        popup.add(this.add.text(0, -25, 'Karakter berhasil dibuat!', {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            color: '#44cc44',
            fontStyle: 'bold'
        }).setOrigin(0.5));

        // Loading bar
        const loadBarBg = this.add.graphics();
        loadBarBg.fillStyle(0x222244, 1);
        loadBarBg.fillRoundedRect(-100, 10, 200, 12, 6);
        popup.add(loadBarBg);

        const loadBarFill = this.add.graphics();
        popup.add(loadBarFill);

        // Animate loading bar
        let progress = 0;
        const loadTimer = this.time.addEvent({
            delay: 30,
            repeat: 66,
            callback: () => {
                progress += 1.5;
                if (progress > 100) progress = 100;
                loadBarFill.clear();
                loadBarFill.fillStyle(0x44aa44, 1);
                loadBarFill.fillRoundedRect(-100, 10, 200 * (progress / 100), 12, 6);
            }
        });

        // After loading complete, show next message
        this.time.delayedCall(2200, () => {
            // Remove loading bar, show next message
            loadBarBg.clear();
            loadBarFill.clear();

            popup.add(this.add.text(0, 16, 'Desa Utama akan dibuat pada Prompt #4.', {
                fontSize: '14px',
                fontFamily: 'Arial, sans-serif',
                color: '#aaaacc',
                fontStyle: 'italic'
            }).setOrigin(0.5));

            // OK button
            const okBg = this.add.graphics();
            okBg.fillStyle(0x44aa44, 1);
            okBg.fillRoundedRect(-45, 55, 90, 34, 8);
            popup.add(okBg);

            popup.add(this.add.text(0, 72, 'OK', {
                fontSize: '16px',
                fontFamily: 'Arial, sans-serif',
                color: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5));

            const okHit = this.add.rectangle(0, 72, 90, 34, 0x000000, 0)
                .setInteractive({ useHandCursor: true });
            popup.add(okHit);

            okHit.on('pointerdown', () => {
                this.playClick();
                this.cleanup();
                this.cameras.main.fadeOut(300, 0, 0, 0);
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    this.scene.start('MainMenuScene');
                });
            });
        });

        this.tweens.add({ targets: popup, alpha: 1, duration: 300 });
    }

    /* =============================================
     *  EFFECTS
     * ============================================= */
    shakeElement(element) {
        if (!element || !element.scene) return;
        const origX = element.x;
        this.tweens.add({
            targets: element,
            x: origX - 4,
            duration: 50,
            yoyo: true,
            repeat: 3,
            onComplete: () => { if (element.scene) element.x = origX; }
        });
    }

    playClick() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const o = ctx.createOscillator();
            const gn = ctx.createGain();
            o.connect(gn);
            gn.connect(ctx.destination);
            o.type = 'sine';
            o.frequency.setValueAtTime(500, ctx.currentTime);
            o.frequency.exponentialRampToValueAtTime(250, ctx.currentTime + 0.05);
            gn.gain.setValueAtTime(0.08, ctx.currentTime);
            gn.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
            o.start(ctx.currentTime);
            o.stop(ctx.currentTime + 0.06);
        } catch (e) { /* silent */ }
    }

    /* =============================================
     *  CLEANUP
     * ============================================= */
    cleanup() {
        if (this.nameInputElement) {
            this.nameInputElement.remove();
            this.nameInputElement = null;
        }
    }

    shutdown() {
        this.cleanup();
    }
}
