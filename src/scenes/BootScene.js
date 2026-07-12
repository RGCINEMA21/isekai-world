/**
 * BootScene - Scene pertama yang ditampilkan saat game dimulai.
 * Menampilkan judul "ISEKAI WORLD" dan status project.
 */
class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Belum ada asset yang dimuat di phase ini
    }

    create() {
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        // Judul utama: ISEKAI WORLD
        this.titleText = this.add.text(centerX, centerY - 40, 'ISEKAI WORLD', {
            fontSize: '64px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);

        // Subtitle: Project berhasil dibuat
        this.subtitleText = this.add.text(centerX, centerY + 30, 'Project berhasil dibuat.', {
            fontSize: '24px',
            fontFamily: 'Arial, sans-serif',
            color: '#cccccc',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Efek kedap-kedip sederhana pada judul
        this.tweens.add({
            targets: this.titleText,
            alpha: { from: 1, to: 0.6 },
            duration: 1200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // FPS counter (debug info)
        this.fpsText = this.add.text(10, 10, '', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#00ff00'
        });
    }

    update() {
        // Update FPS display setiap frame
        if (this.fpsText) {
            this.fpsText.setText('FPS: ' + this.game.loop.actualFps.toFixed(1));
        }
    }
}
