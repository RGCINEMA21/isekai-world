/**
 * BootScene - Scene pertama saat game dimulai.
 * Menampilkan splash screen lalu transisi ke MainMenuScene.
 * Responsive: menyesuaikan ukuran layar.
 */
class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    create() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        const centerX = w / 2;
        const centerY = h / 2;

        // Responsive font size
        const titleSize = Math.max(24, Math.min(68, w * 0.05));
        const loadSize = Math.max(12, Math.min(20, w * 0.015));

        // Background gradient
        const bg = this.add.graphics();
        for (let i = 0; i < h; i++) {
            const t = i / h;
            const r = Math.floor(10 + t * 15);
            const g = Math.floor(10 + t * 10);
            const b = Math.floor(30 + t * 20);
            bg.lineStyle(1, Phaser.Display.Color.GetColor(r, g, b));
            bg.lineBetween(0, i, w, i);
        }

        // Judul splash screen
        this.add.text(centerX, centerY - 20, 'ISEKAI WORLD', {
            fontSize: titleSize + 'px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: Math.max(3, titleSize * 0.08)
        }).setOrigin(0.5);

        // Loading text
        this.add.text(centerX, centerY + titleSize * 0.6, 'Loading...', {
            fontSize: loadSize + 'px',
            fontFamily: 'Arial, sans-serif',
            color: '#aaaaaa'
        }).setOrigin(0.5);

        // Transisi ke MainMenuScene setelah 1.5 detik
        this.time.delayedCall(1500, () => {
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('MainMenuScene');
            });
        });
    }
}
