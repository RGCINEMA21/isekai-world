/**
 * RewardPopup - UI popup untuk menampilkan hadiah pertarungan.
 * Menampilkan EXP, Gold, Item Drop, dan Level Up.
 * Responsive: Mobile Portrait & Desktop Landscape.
 */
class RewardPopup {
    /**
     * @param {Phaser.Scene} scene
     */
    constructor(scene) {
        this.scene = scene;
        this.container = null;
        this.popups = [];
    }

    /**
     * Tampilkan hadiah pertarungan.
     * @param {Object} rewards - { exp, gold, drops, levelUp }
     */
    show(rewards) {
        const w = this.scene.cameras.main.width;
        const h = this.scene.cameras.main.height;
        const isPortrait = h > w;

        // Posisi popup di pojok kanan atas
        const baseX = isPortrait ? w / 2 : w - 16;
        const baseY = isPortrait ? h * 0.15 : 160;
        const anchor = isPortrait ? 0.5 : 1;

        let delay = 0;
        const lines = [];

        // Level Up (paling atas, jika ada)
        if (rewards.levelUp) {
            lines.push({
                text: `✨ LEVEL UP! Lv.${rewards.newLevel}`,
                color: '#ffdd00',
                fontSize: isPortrait ? '18px' : '16px',
                bgColor: 0x443300,
                delay: delay
            });
            delay += 400;
        }

        // EXP
        if (rewards.exp && rewards.exp > 0) {
            lines.push({
                text: `+${rewards.exp} EXP`,
                color: '#44ccff',
                fontSize: isPortrait ? '15px' : '13px',
                bgColor: 0x1a3344,
                delay: delay
            });
            delay += 250;
        }

        // Gold
        if (rewards.gold && rewards.gold > 0) {
            lines.push({
                text: `+${rewards.gold} Gold`,
                color: '#ffaa44',
                fontSize: isPortrait ? '15px' : '13px',
                bgColor: 0x3a2a10,
                delay: delay
            });
            delay += 250;
        }

        // Item Drops
        if (rewards.drops && rewards.drops.length > 0) {
            for (const drop of rewards.drops) {
                lines.push({
                    text: `${drop.icon} ${drop.name} ×${drop.quantity}`,
                    color: '#ccff88',
                    fontSize: isPortrait ? '14px' : '12px',
                    bgColor: 0x1a2a10,
                    delay: delay
                });
                delay += 200;
            }
        }

        // Buat popup untuk setiap baris
        lines.forEach((line, i) => {
            this.scene.time.delayedCall(line.delay, () => {
                this._createPopupLine(baseX, baseY + i * (isPortrait ? 32 : 26), line, anchor, i);
            });
        });
    }

    /**
     * Buat satu baris popup.
     */
    _createPopupLine(x, y, line, anchor, index) {
        const w = this.scene.cameras.main.width;
        const isPortrait = this.scene.cameras.main.height > w;

        const popup = this.scene.add.container(x, y)
            .setDepth(600)
            .setScrollFactor(0)
            .setAlpha(0);

        // Hitung lebar text
        const tempText = this.scene.add.text(0, 0, line.text, {
            fontSize: line.fontSize,
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff'
        });
        const textW = tempText.width;
        tempText.destroy();

        const padding = 12;
        const bgW = textW + padding * 2;
        const bgH = parseInt(line.fontSize) + 10;

        // Background
        const bg = this.scene.add.graphics();
        bg.fillStyle(line.bgColor, 0.9);
        bg.fillRoundedRect(-bgW / 2, -bgH / 2, bgW, bgH, 6);
        bg.lineStyle(1, 0xc9a84c, 0.4);
        bg.strokeRoundedRect(-bgW / 2, -bgH / 2, bgW, bgH, 6);
        popup.add(bg);

        // Text
        const text = this.scene.add.text(0, 0, line.text, {
            fontSize: line.fontSize,
            fontFamily: 'Arial, sans-serif',
            color: line.color,
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        popup.add(text);

        // Animasi: muncul, naik sedikit, menghilang
        this.scene.tweens.add({
            targets: popup,
            alpha: 1,
            y: y - 10,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                this.scene.tweens.add({
                    targets: popup,
                    alpha: 0,
                    y: y - 40,
                    duration: 800,
                    delay: 1500,
                    ease: 'Power2',
                    onComplete: () => popup.destroy()
                });
            }
        });

        this.popups.push(popup);
    }

    /**
     * Tampilkan animasi Level Up besar di tengah layar.
     * @param {number} newLevel
     */
    showLevelUp(newLevel) {
        const w = this.scene.cameras.main.width;
        const h = this.scene.cameras.main.height;

        const levelUp = this.scene.add.container(w / 2, h / 2)
            .setDepth(700)
            .setScrollFactor(0)
            .setAlpha(0);

        // Background glow
        const glow = this.scene.add.graphics();
        glow.fillStyle(0xffdd00, 0.15);
        glow.fillCircle(0, 0, 120);
        levelUp.add(glow);

        // Text
        const text = this.scene.add.text(0, -10, '✨ LEVEL UP! ✨', {
            fontSize: '24px',
            fontFamily: 'Georgia, serif',
            color: '#ffdd00',
            fontStyle: 'bold',
            stroke: '#332200',
            strokeThickness: 4
        }).setOrigin(0.5);
        levelUp.add(text);

        const levelText = this.scene.add.text(0, 20, `Level ${newLevel}`, {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        levelUp.add(levelText);

        // Animasi
        this.scene.tweens.add({
            targets: levelUp,
            alpha: 1,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 400,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.scene.tweens.add({
                    targets: levelUp,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 200,
                    onComplete: () => {
                        this.scene.tweens.add({
                            targets: levelUp,
                            alpha: 0,
                            y: h / 2 - 40,
                            duration: 800,
                            delay: 1500,
                            ease: 'Power2',
                            onComplete: () => levelUp.destroy()
                        });
                    }
                });
            }
        });
    }

    /** Bersihkan semua popup */
    destroy() {
        this.popups.forEach(p => {
            if (p && p.active) p.destroy();
        });
        this.popups = [];
    }
}
