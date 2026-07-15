/**
 * BootScene - Splash screen responsive.
 * Preloads audio assets, then transitions to MainMenu.
 */
class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        this.load.audio('bgm', 'assets/audio/bgm.mp3');
    }

    create() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        const cx = w / 2, cy = h / 2;

        const bg = this.add.graphics();
        for (let i = 0; i < h; i++) {
            const t = i / h;
            bg.lineStyle(1, Phaser.Display.Color.GetColor(
                Math.floor(10 + t * 15), Math.floor(10 + t * 10), Math.floor(30 + t * 20)
            ));
            bg.lineBetween(0, i, w, i);
        }

        this.add.text(cx, cy - 15, 'ISEKAI WORLD', {
            fontSize: Math.max(28, Math.min(60, w * 0.05)) + 'px',
            fontFamily: 'Arial, sans-serif', color: '#ffffff', fontStyle: 'bold',
            stroke: '#000000', strokeThickness: 4
        }).setOrigin(0.5);

        this.add.text(cx, cy + 25, 'Loading...', {
            fontSize: Math.max(12, Math.min(18, w * 0.015)) + 'px',
            fontFamily: 'Arial, sans-serif', color: '#aaaaaa'
        }).setOrigin(0.5);

        this.time.delayedCall(1500, () => {
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('MainMenuScene');
            });
        });
    }
}
