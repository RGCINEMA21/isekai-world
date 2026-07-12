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
    backgroundColor: '#1a1a2e',

    // Target FPS
    fps: {
        target: 60,
        forceSetTimeOut: false
    },

    // Daftar scene (BootScene -> MainMenuScene -> ...)
    scene: [BootScene, MainMenuScene, CharacterCreatorScene]
};

// Inisialisasi game
const game = new Phaser.Game(config);

console.log('[Isekai World] Game initialized. Resolution: 1280x720, FPS target: 60');
