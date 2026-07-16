/**
 * BootScene — splash screen, loads assets, then transitions to MainMenu.
 */
class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Try loading BGM, but don't block if it fails
        try { this.load.audio('bgm', 'assets/audio/bgm.mp3'); } catch (e) {}
    }

    create() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        const cx = w / 2;
        const cy = h / 2;
        const rl = new ResponsiveLayout(this);

        // Background
        const bg = this.add.graphics();
        for (let i = 0; i < h; i++) {
            const t = i / h;
            bg.lineStyle(1, Phaser.Display.Color.GetColor(
                Math.floor(10 + t * 15), Math.floor(10 + t * 10), Math.floor(30 + t * 20)
            ));
            bg.lineBetween(0, i, w, i);
        }

        // Title
        this.add.text(cx, cy - 30, 'ISEKAI WORLD', {
            fontSize: rl.titleSize(48) + 'px',
            fontFamily: 'Arial, sans-serif', color: '#ffffff', fontStyle: 'bold',
            stroke: '#000000', strokeThickness: 4
        }).setOrigin(0.5);

        // Loading text
        const loadText = this.add.text(cx, cy + 20, 'Loading...', {
            fontSize: rl.fontSize(14) + 'px',
            fontFamily: 'Arial, sans-serif', color: '#aaaaaa'
        }).setOrigin(0.5);

        // Loading bar
        const barW = Math.min(300, w * 0.4);
        const barH = 8;
        const barX = cx - barW / 2;
        const barY = cy + 45;

        const barBg = this.add.graphics();
        barBg.fillStyle(0x333333, 0.8);
        barBg.fillRoundedRect(barX, barY, barW, barH, 4);

        const barFill = this.add.graphics();
        let progress = 0;

        this.time.addEvent({
            delay: 25, repeat: 58,
            callback: () => {
                progress = Math.min(100, progress + 1.8);
                barFill.clear();
                barFill.fillStyle(0xc9a84c, 1);
                barFill.fillRoundedRect(barX, barY, barW * (progress / 100), barH, 4);
            }
        });

        // Transition after loading
        this.time.delayedCall(1600, () => {
            this.cameras.main.fadeOut(400, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('MainMenuScene');
            });
        });
    }
}
