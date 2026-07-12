/**
 * ISEKAI WORLD - Main Configuration
 * Konfigurasi Phaser 3 untuk game RPG Pixel Farming.
 */

// Konfigurasi utama Phaser
const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,

    // Parent element untuk canvas
    parent: 'game-container',

    // Mode scaling: FIT dengan CENTER_BOTH
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },

    // Physics: Arcade Physics
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },

    // Background warna hijau rumput
    backgroundColor: '#6ab04c',

    // Target FPS
    fps: {
        target: 60,
        forceSetTimeOut: false
    },

    // Daftar scene (urutan dimulai dari Scene pertama)
    scene: [BootScene]
};

// Inisialisasi game
const game = new Phaser.Game(config);

// Log info ke console untuk debugging
console.log('[Isekai World] Game initialized. Resolution: 1280x720, FPS target: 60');
