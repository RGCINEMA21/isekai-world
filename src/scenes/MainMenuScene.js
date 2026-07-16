/**
 * MainMenuScene — simple, clear main menu.
 * Title centered, buttons below. All sizes from ResponsiveLayout.
 */
class MainMenuScene extends Phaser.Scene {
    constructor() { super({ key: 'MainMenuScene' }); }

    create() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;

        // Background gradient
        const bg = this.add.graphics();
        for (let i = 0; i < h; i++) {
            const t = i / h;
            const r = Math.floor(10 + Math.sin(t * 3) * 30);
            const g = Math.floor(10 + Math.sin(t * 2) * 15);
            const b = Math.floor(35 + Math.sin(t * 4) * 25);
            bg.fillStyle(Phaser.Display.Color.GetColor(r, g, b), 1);
            bg.fillRect(0, i, w, 1);
        }

        // Stars
        for (let i = 0; i < 60; i++) {
            bg.fillStyle(0xffffff, Phaser.Math.FloatBetween(0.3, 1));
            bg.fillRect(Phaser.Math.Between(0, w), Phaser.Math.Between(0, h * 0.7), 2, 2);
        }

        // Portal glow center
        bg.fillStyle(0x6633aa, 0.08);
        bg.fillCircle(w / 2, h * 0.35, Math.min(w, h) * 0.25);
        bg.fillStyle(0xaa44ff, 0.05);
        bg.fillCircle(w / 2, h * 0.35, Math.min(w, h) * 0.15);

        // === TITLE ===
        const titleFs = Math.max(28, Math.round(Math.min(w, h) * 0.075));
        this.add.text(w / 2, h * 0.15, 'ISEKAI WORLD', {
            fontSize: titleFs + 'px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#220044',
            strokeThickness: 6
        }).setOrigin(0.5);

        // Subtitle
        this.add.text(w / 2, h * 0.15 + titleFs * 0.8, 'v0.0.1', {
            fontSize: Math.max(12, Math.round(titleFs * 0.3)) + 'px',
            fontFamily: 'Arial, sans-serif',
            color: '#bbaadd'
        }).setOrigin(0.5);

        // === BUTTONS ===
        const buttons = [
            { label: '▶  New Game',   action: 'newGame',  enabled: true },
            { label: '▶  Continue',   action: 'continue', enabled: !!localStorage.getItem('isekai_world_save') },
            { label: '⚙  Settings',   action: 'settings', enabled: true },
            { label: '✕  Exit',       action: 'exit',     enabled: true }
        ];

        const btnW = Math.max(220, Math.min(340, Math.round(w * 0.32)));
        const btnH = Math.max(48, Math.min(60, Math.round(Math.min(w, h) * 0.065)));
        const btnGap = Math.max(14, Math.round(btnH * 0.32));
        const btnFontSize = Math.max(16, Math.round(btnH * 0.38));
        const totalH = buttons.length * btnH + (buttons.length - 1) * btnGap;
        const startY = h * 0.5;

        buttons.forEach((data, i) => {
            const bx = w / 2;
            const by = startY + i * (btnH + btnGap);

            // Button background — bright purple, always visible
            const g = this.add.graphics();
            // Glow
            g.fillStyle(0x7744cc, 0.15);
            g.fillRoundedRect(bx - btnW / 2 - 4, by - btnH / 2 - 4, btnW + 8, btnH + 8, 14);
            // Border
            g.fillStyle(data.enabled ? 0xaa88ee : 0x555555, 0.9);
            g.fillRoundedRect(bx - btnW / 2 - 2, by - btnH / 2 - 2, btnW + 4, btnH + 4, 12);
            // Background
            g.fillStyle(data.enabled ? 0x4a2d8a : 0x2a2a3a, 0.95);
            g.fillRoundedRect(bx - btnW / 2, by - btnH / 2, btnW, btnH, 10);
            // Shine
            g.fillStyle(0xffffff, 0.08);
            g.fillRoundedRect(bx - btnW / 2 + 4, by - btnH / 2 + 2, btnW - 8, btnH / 2, { tl: 8, tr: 8, bl: 0, br: 0 });

            // Button text
            const txt = this.add.text(bx, by, data.label, {
                fontSize: btnFontSize + 'px',
                fontFamily: 'Arial, sans-serif',
                color: data.enabled ? '#ffffff' : '#777777',
                fontStyle: 'bold',
                stroke: data.enabled ? '#220044' : '#000000',
                strokeThickness: 2
            }).setOrigin(0.5);

            // "Belum ada Save" note for disabled Continue
            if (!data.enabled) {
                this.add.text(bx, by + btnH / 2 + 10, 'Belum ada Save Game', {
                    fontSize: Math.max(10, Math.round(btnFontSize * 0.6)) + 'px',
                    fontFamily: 'Arial, sans-serif',
                    color: '#888888',
                    fontStyle: 'italic'
                }).setOrigin(0.5);
            }

            // Hit area
            if (data.enabled) {
                const hit = this.add.rectangle(bx, by, btnW, btnH, 0, 0)
                    .setInteractive({ useHandCursor: true });

                hit.on('pointerover', () => {
                    g.clear();
                    g.fillStyle(0x7744cc, 0.2);
                    g.fillRoundedRect(bx - btnW / 2 - 6, by - btnH / 2 - 6, btnW + 12, btnH + 12, 16);
                    g.fillStyle(0xbb99ff, 1);
                    g.fillRoundedRect(bx - btnW / 2 - 2, by - btnH / 2 - 2, btnW + 4, btnH + 4, 12);
                    g.fillStyle(0x6b4dcc, 0.95);
                    g.fillRoundedRect(bx - btnW / 2, by - btnH / 2, btnW, btnH, 10);
                    g.fillStyle(0xffffff, 0.12);
                    g.fillRoundedRect(bx - btnW / 2 + 4, by - btnH / 2 + 2, btnW - 8, btnH / 2, { tl: 8, tr: 8, bl: 0, br: 0 });
                    txt.setColor('#ffeecc');
                });

                hit.on('pointerout', () => {
                    g.clear();
                    g.fillStyle(0x7744cc, 0.15);
                    g.fillRoundedRect(bx - btnW / 2 - 4, by - btnH / 2 - 4, btnW + 8, btnH + 8, 14);
                    g.fillStyle(0xaa88ee, 0.9);
                    g.fillRoundedRect(bx - btnW / 2 - 2, by - btnH / 2 - 2, btnW + 4, btnH + 4, 12);
                    g.fillStyle(0x4a2d8a, 0.95);
                    g.fillRoundedRect(bx - btnW / 2, by - btnH / 2, btnW, btnH, 10);
                    g.fillStyle(0xffffff, 0.08);
                    g.fillRoundedRect(bx - btnW / 2 + 4, by - btnH / 2 + 2, btnW - 8, btnH / 2, { tl: 8, tr: 8, bl: 0, br: 0 });
                    txt.setColor('#ffffff');
                });

                hit.on('pointerdown', () => {
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
                    this.handleClick(data.action);
                });
            }
        });

        // Copyright
        this.add.text(w / 2, h - 14, '© ISEKAI WORLD PROJECT', {
            fontSize: Math.max(10, Math.round(Math.min(w, h) * 0.015)) + 'px',
            fontFamily: 'Arial, sans-serif',
            color: '#555555'
        }).setOrigin(0.5);

        // Fade in
        this.cameras.main.fadeIn(300, 0, 0, 0);

        // BGM
        try { audioManager.playBGM(this); } catch (e) {}
    }

    handleClick(action) {
        switch (action) {
            case 'newGame':
                this.cameras.main.fadeOut(300, 0, 0, 0);
                this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('CharacterCreatorScene'));
                break;
            case 'continue':
                this.cameras.main.fadeOut(300, 0, 0, 0);
                this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('VillageScene'));
                break;
            case 'settings':
                this.showSettings();
                break;
            case 'exit':
                this.showExit();
                break;
        }
    }

    showSettings() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        const pw = Math.min(400, w * 0.85);

        const dim = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0).setDepth(200).setAlpha(0);
        this.tweens.add({ targets: dim, alpha: 0.6, duration: 200 });
        dim.setInteractive();

        const popup = this.add.container(w / 2, h / 2).setDepth(210).setAlpha(0);
        const bg = this.add.graphics();
        bg.fillStyle(0x2c1810, 0.97);
        bg.fillRoundedRect(-pw / 2, -120, pw, 240, 14);
        bg.lineStyle(3, 0xc9a84c, 0.9);
        bg.strokeRoundedRect(-pw / 2, -120, pw, 240, 14);
        popup.add(bg);

        popup.add(this.add.text(0, -95, '⚙ Settings', {
            fontSize: '22px', fontFamily: 'Georgia, serif', color: '#ffd700', fontStyle: 'bold'
        }).setOrigin(0.5));

        // Volume
        popup.add(this.add.text(0, -50, '🔊 Volume: ' + Math.round(audioManager.getVolume() * 100) + '%', {
            fontSize: '16px', fontFamily: 'Arial', color: '#ffffff'
        }).setOrigin(0.5));

        // Mute toggle
        const muteLabel = audioManager.isMuted() ? '🔇 Unmute' : '🔊 Mute';
        const muteBg = this.add.graphics();
        muteBg.fillStyle(0x4a2d8a, 0.9);
        muteBg.fillRoundedRect(-60, -20, 120, 36, 8);
        popup.add(muteBg);
        const muteTxt = this.add.text(0, -2, muteLabel, {
            fontSize: '14px', fontFamily: 'Arial', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);
        popup.add(muteTxt);
        const muteHit = this.add.rectangle(0, -2, 120, 36, 0, 0).setInteractive({ useHandCursor: true });
        popup.add(muteHit);
        muteHit.on('pointerdown', () => {
            const muted = audioManager.toggleMute();
            muteTxt.setText(muted ? '🔇 Unmute' : '🔊 Mute');
        });

        // Close
        const clBg = this.add.graphics();
        clBg.fillStyle(0x8b3a0a, 0.9);
        clBg.fillRoundedRect(-50, 55, 100, 34, 8);
        popup.add(clBg);
        popup.add(this.add.text(0, 72, '✕ Close', {
            fontSize: '15px', fontFamily: 'Arial', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5));
        const clHit = this.add.rectangle(0, 72, 100, 34, 0, 0).setInteractive({ useHandCursor: true });
        popup.add(clHit);
        clHit.on('pointerdown', () => {
            this.tweens.add({ targets: [popup, dim], alpha: 0, duration: 200, onComplete: () => {
                popup.destroy(); dim.destroy();
            }});
        });

        this.tweens.add({ targets: popup, alpha: 1, duration: 200 });
    }

    showExit() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        const pw = Math.min(400, w * 0.85);

        const dim = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0).setDepth(200).setAlpha(0);
        this.tweens.add({ targets: dim, alpha: 0.6, duration: 200 });
        dim.setInteractive();

        const popup = this.add.container(w / 2, h / 2).setDepth(210).setAlpha(0);
        const bg = this.add.graphics();
        bg.fillStyle(0x2c1810, 0.97);
        bg.fillRoundedRect(-pw / 2, -80, pw, 160, 14);
        bg.lineStyle(3, 0xc9a84c, 0.9);
        bg.strokeRoundedRect(-pw / 2, -80, pw, 160, 14);
        popup.add(bg);

        popup.add(this.add.text(0, -50, '🙏 Terima kasih telah mencoba\nISEKAI WORLD.', {
            fontSize: '16px', fontFamily: 'Arial', color: '#ffffff', align: 'center'
        }).setOrigin(0.5));

        const okBg = this.add.graphics();
        okBg.fillStyle(0x8b3a0a, 0.9);
        okBg.fillRoundedRect(-40, 30, 80, 30, 8);
        popup.add(okBg);
        popup.add(this.add.text(0, 45, 'OK', {
            fontSize: '15px', fontFamily: 'Arial', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5));
        const okHit = this.add.rectangle(0, 45, 80, 30, 0, 0).setInteractive({ useHandCursor: true });
        popup.add(okHit);
        okHit.on('pointerdown', () => {
            this.tweens.add({ targets: [popup, dim], alpha: 0, duration: 200, onComplete: () => {
                popup.destroy(); dim.destroy();
            }});
        });

        this.tweens.add({ targets: popup, alpha: 1, duration: 200 });
    }

    shutdown() {}
}
