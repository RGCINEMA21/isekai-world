/**
 * MainMenuScene — main menu with clearly visible buttons.
 */
class MainMenuScene extends Phaser.Scene {
    constructor() { super({ key: 'MainMenuScene' }); }

    create() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        console.log('[MainMenu] create() w=' + w + ' h=' + h);

        // Dark gradient background
        const bg = this.add.graphics();
        bg.fillStyle(0x0d0d2a, 1);
        bg.fillRect(0, 0, w, h);
        // Stars
        for (let i = 0; i < 50; i++) {
            bg.fillStyle(0xffffff, Phaser.Math.FloatBetween(0.3, 0.9));
            bg.fillRect(Phaser.Math.Between(0, w), Phaser.Math.Between(0, h * 0.6), 2, 2);
        }
        // Portal glow
        bg.fillStyle(0x5533aa, 0.06);
        bg.fillCircle(w / 2, h * 0.3, Math.min(w, h) * 0.2);

        // === TITLE ===
        const titleFs = Math.max(32, Math.min(72, Math.round(Math.min(w, h) * 0.08)));
        this.add.text(w / 2, h * 0.12, 'ISEKAI WORLD', {
            fontSize: titleFs + 'px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#220044',
            strokeThickness: 6
        }).setOrigin(0.5);

        this.add.text(w / 2, h * 0.12 + titleFs * 0.85, 'v0.0.1', {
            fontSize: Math.max(14, Math.round(titleFs * 0.28)) + 'px',
            fontFamily: 'Arial',
            color: '#bbaadd'
        }).setOrigin(0.5);

        // === BUTTONS ===
        const buttons = [
            { label: 'NEW GAME',   icon: '▶', action: 'newGame',  enabled: true },
            { label: 'CONTINUE',   icon: '▶', action: 'continue', enabled: !!localStorage.getItem('isekai_world_save') },
            { label: 'SETTINGS',   icon: '⚙', action: 'settings', enabled: true },
            { label: 'EXIT',       icon: '✕', action: 'exit',     enabled: true }
        ];

        const smaller = Math.min(w, h);
        const btnW = Math.min(w * 0.65, 360);
        const btnH = Math.max(50, Math.min(64, Math.round(smaller * 0.075)));
        const btnGap = Math.max(12, Math.round(btnH * 0.28));
        const btnFontSize = Math.max(18, Math.round(btnH * 0.38));
        const totalBtnH = buttons.length * btnH + (buttons.length - 1) * btnGap;
        const firstBtnY = h * 0.42;

        buttons.forEach((data, i) => {
            const bx = w / 2;
            const by = firstBtnY + i * (btnH + btnGap);
            const enabled = data.enabled;

            // Graphics for button
            const g = this.add.graphics();
            this._drawBtn(g, bx, by, btnW, btnH, enabled, false);

            // Label
            const label = this.add.text(bx, by, data.icon + '  ' + data.label, {
                fontSize: btnFontSize + 'px',
                fontFamily: 'Arial, sans-serif',
                color: enabled ? '#ffffff' : '#666666',
                fontStyle: 'bold',
                stroke: enabled ? '#1a0044' : '#000000',
                strokeThickness: 2
            }).setOrigin(0.5);

            // Disabled note
            if (!enabled) {
                this.add.text(bx, by + btnH / 2 + 12, '(no save data)', {
                    fontSize: Math.max(11, Math.round(btnFontSize * 0.6)) + 'px',
                    fontFamily: 'Arial', color: '#666666', fontStyle: 'italic'
                }).setOrigin(0.5);
            }

            // Interactive
            if (enabled) {
                const hit = this.add.rectangle(bx, by, btnW + 10, btnH + 10, 0, 0)
                    .setInteractive({ useHandCursor: true });
                hit.on('pointerover', () => {
                    this._drawBtn(g, bx, by, btnW, btnH, true, true);
                    label.setColor('#ffeecc');
                });
                hit.on('pointerout', () => {
                    this._drawBtn(g, bx, by, btnW, btnH, true, false);
                    label.setColor('#ffffff');
                });
                hit.on('pointerdown', () => {
                    this._playClick();
                    this.handleClick(data.action);
                });
            }
        });

        // Copyright
        this.add.text(w / 2, h - 16, '© ISEKAI WORLD', {
            fontSize: Math.max(11, Math.round(smaller * 0.016)) + 'px',
            fontFamily: 'Arial', color: '#555555'
        }).setOrigin(0.5);

        this.cameras.main.fadeIn(200, 0, 0, 0);
        try { audioManager.playBGM(this); } catch (e) {}
    }

    _drawBtn(g, x, y, w, h, enabled, hovered) {
        g.clear();
        const hw = w / 2, hh = h / 2;
        if (!enabled) {
            g.fillStyle(0x333344, 0.6);
            g.fillRoundedRect(x - hw, y - hh, w, h, 10);
            g.lineStyle(2, 0x555566, 0.5);
            g.strokeRoundedRect(x - hw, y - hh, w, h, 10);
            return;
        }
        // Glow
        g.fillStyle(hovered ? 0x8855dd : 0x6633aa, hovered ? 0.25 : 0.12);
        g.fillRoundedRect(x - hw - 5, y - hh - 5, w + 10, h + 10, 15);
        // Border
        g.fillStyle(hovered ? 0xccaaee : 0x9977dd, 0.95);
        g.fillRoundedRect(x - hw - 2, y - hh - 2, w + 4, h + 4, 12);
        // Body
        g.fillStyle(hovered ? 0x6b4dcc : 0x4a2d8a, 0.98);
        g.fillRoundedRect(x - hw, y - hh, w, h, 10);
        // Shine
        g.fillStyle(0xffffff, hovered ? 0.14 : 0.08);
        g.fillRoundedRect(x - hw + 4, y - hh + 2, w - 8, h * 0.45, { tl: 8, tr: 8, bl: 0, br: 0 });
    }

    _playClick() {
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
            case 'settings': this.showSettings(); break;
            case 'exit': this.showExit(); break;
        }
    }

    showSettings() {
        const w = this.cameras.main.width, h = this.cameras.main.height;
        const pw = Math.min(400, w * 0.85);
        const dim = this.add.rectangle(w/2, h/2, w, h, 0, 0).setDepth(200).setAlpha(0).setInteractive();
        this.tweens.add({ targets: dim, alpha: 0.6, duration: 200 });
        const p = this.add.container(w/2, h/2).setDepth(210).setAlpha(0);
        const g = this.add.graphics();
        g.fillStyle(0x2c1810, 0.97); g.fillRoundedRect(-pw/2, -110, pw, 220, 14);
        g.lineStyle(3, 0xc9a84c); g.strokeRoundedRect(-pw/2, -110, pw, 220, 14);
        p.add(g);
        p.add(this.add.text(0, -85, '⚙ Settings', { fontSize: '22px', fontFamily: 'Georgia', color: '#ffd700', fontStyle: 'bold' }).setOrigin(0.5));
        p.add(this.add.text(0, -40, 'Volume: ' + Math.round(audioManager.getVolume() * 100) + '%', { fontSize: '16px', fontFamily: 'Arial', color: '#fff' }).setOrigin(0.5));
        const mb = this.add.graphics(); mb.fillStyle(0x4a2d8a, 0.9); mb.fillRoundedRect(-55, -15, 110, 32, 8); p.add(mb);
        const mt = this.add.text(0, 1, audioManager.isMuted() ? '🔇 Unmute' : '🔊 Mute', { fontSize: '14px', fontFamily: 'Arial', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5); p.add(mt);
        const mh = this.add.rectangle(0, 1, 110, 32, 0, 0).setInteractive({ useHandCursor: true }); p.add(mh);
        mh.on('pointerdown', () => { const m = audioManager.toggleMute(); mt.setText(m ? '🔇 Unmute' : '🔊 Mute'); });
        const cb = this.add.graphics(); cb.fillStyle(0x8b3a0a, 0.9); cb.fillRoundedRect(-45, 50, 90, 32, 8); p.add(cb);
        p.add(this.add.text(0, 66, '✕ Close', { fontSize: '14px', fontFamily: 'Arial', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5));
        const ch = this.add.rectangle(0, 66, 90, 32, 0, 0).setInteractive({ useHandCursor: true }); p.add(ch);
        ch.on('pointerdown', () => { this.tweens.add({ targets: [p, dim], alpha: 0, duration: 200, onComplete: () => { p.destroy(); dim.destroy(); } }); });
        this.tweens.add({ targets: p, alpha: 1, duration: 200 });
    }

    showExit() {
        const w = this.cameras.main.width, h = this.cameras.main.height;
        const pw = Math.min(400, w * 0.85);
        const dim = this.add.rectangle(w/2, h/2, w, h, 0, 0).setDepth(200).setAlpha(0).setInteractive();
        this.tweens.add({ targets: dim, alpha: 0.6, duration: 200 });
        const p = this.add.container(w/2, h/2).setDepth(210).setAlpha(0);
        const g = this.add.graphics();
        g.fillStyle(0x2c1810, 0.97); g.fillRoundedRect(-pw/2, -70, pw, 140, 14);
        g.lineStyle(3, 0xc9a84c); g.strokeRoundedRect(-pw/2, -70, pw, 140, 14);
        p.add(g);
        p.add(this.add.text(0, -30, '🙏 Terima kasih\nISEKAI WORLD.', { fontSize: '16px', fontFamily: 'Arial', color: '#fff', align: 'center' }).setOrigin(0.5));
        const ob = this.add.graphics(); ob.fillStyle(0x8b3a0a, 0.9); ob.fillRoundedRect(-40, 30, 80, 30, 8); p.add(ob);
        p.add(this.add.text(0, 45, 'OK', { fontSize: '15px', fontFamily: 'Arial', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5));
        const oh = this.add.rectangle(0, 45, 80, 30, 0, 0).setInteractive({ useHandCursor: true }); p.add(oh);
        oh.on('pointerdown', () => { this.tweens.add({ targets: [p, dim], alpha: 0, duration: 200, onComplete: () => { p.destroy(); dim.destroy(); } }); });
        this.tweens.add({ targets: p, alpha: 1, duration: 200 });
    }
}
