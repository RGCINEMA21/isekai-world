/**
 * BootScene — splash screen.
 */
class BootScene extends Phaser.Scene {
    constructor() { super({ key: 'BootScene' }); }

    preload() {
        try { this.load.audio('bgm', 'assets/audio/bgm.mp3'); } catch (e) {}
    }

    create() {
        console.log('[BootScene] create()');
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        this.cameras.main.setBackgroundColor('#0d0d1a');

        const titleFs = Math.max(30, Math.min(60, Math.round(Math.min(w, h) * 0.065)));
        this.add.text(w / 2, h * 0.38, 'ISEKAI WORLD', {
            fontSize: titleFs + 'px', fontFamily: 'Arial, sans-serif',
            color: '#ffffff', fontStyle: 'bold', stroke: '#000', strokeThickness: 4
        }).setOrigin(0.5);

        const barW = Math.min(280, w * 0.35);
        const barY = h * 0.55;
        const barX = w / 2 - barW / 2;
        const barH = 8;

        this.add.graphics().fillStyle(0x333333, 0.8).fillRoundedRect(barX, barY, barW, barH, 4);
        const fill = this.add.graphics();
        let p = 0;
        this.time.addEvent({ delay: 30, repeat: 50, callback: () => {
            p = Math.min(100, p + 2);
            fill.clear(); fill.fillStyle(0xc9a84c, 1);
            fill.fillRoundedRect(barX, barY, barW * (p / 100), barH, 4);
        }});

        this.time.delayedCall(1700, () => {
            this.cameras.main.fadeOut(400, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('MainMenuScene');
            });
        });
    }
}
