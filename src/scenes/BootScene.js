/**
 * BootScene — splash screen, loads assets, then transitions to MainMenu.
 */
class BootScene extends Phaser.Scene {
    constructor() { super({ key: 'BootScene' }); }

    preload() {
        try { this.load.audio('bgm', 'assets/audio/bgm.mp3'); } catch (e) {}
    }

    create() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;

        // Background
        this.cameras.main.setBackgroundColor('#0d0d1a');

        // Title
        this.add.text(w / 2, h * 0.38, 'ISEKAI WORLD', {
            fontSize: Math.max(30, Math.round(Math.min(w, h) * 0.065)) + 'px',
            fontFamily: 'Arial, sans-serif', color: '#ffffff', fontStyle: 'bold',
            stroke: '#000000', strokeThickness: 4
        }).setOrigin(0.5);

        // Loading bar
        const barW = Math.min(280, w * 0.35);
        const barH = 8;
        const barX = w / 2 - barW / 2;
        const barY = h * 0.55;

        const barBg = this.add.graphics();
        barBg.fillStyle(0x333333, 0.8);
        barBg.fillRoundedRect(barX, barY, barW, barH, 4);

        const barFill = this.add.graphics();
        let p = 0;
        this.time.addEvent({
            delay: 30, repeat: 50,
            callback: () => {
                p = Math.min(100, p + 2);
                barFill.clear();
                barFill.fillStyle(0xc9a84c, 1);
                barFill.fillRoundedRect(barX, barY, barW * (p / 100), barH, 4);
            }
        });

        this.add.text(w / 2, barY + 20, 'Loading...', {
            fontSize: Math.max(11, Math.round(Math.min(w, h) * 0.02)) + 'px',
            fontFamily: 'Arial, sans-serif', color: '#aaaaaa'
        }).setOrigin(0.5);

        this.time.delayedCall(1700, () => {
            this.cameras.main.fadeOut(400, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('MainMenuScene');
            });
        });
    }
}
