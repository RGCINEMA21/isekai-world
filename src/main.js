/**
 * ISEKAI WORLD - Main Configuration
 * Konfigurasi Phaser 3 untuk game RPG Pixel Farming.
 * Responsive: menyesuaikan ukuran layar perangkat.
 */

// Deteksi ukuran layar untuk base resolution
function getGameSize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    // Base resolution tetap landscape, tapi scale mode RESIZE yang handle
    return { width: Math.max(w, 960), height: Math.max(h, 540) };
}

const gameSize = getGameSize();

const config = {
    type: Phaser.AUTO,
    width: gameSize.width,
    height: gameSize.height,

    parent: 'game-container',

    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: '100%',
        height: '100%',
        min: { width: 480, height: 320 },
        max: { width: 3840, height: 2160 }
    },

    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },

    backgroundColor: '#1a1a2e',

    fps: {
        target: 60,
        forceSetTimeOut: false
    },

    scene: [BootScene, MainMenuScene, CharacterCreatorScene],

    // Render anti-alias
    antialias: true,
    pixelArt: false,
    roundPixels: true
};

const game = new Phaser.Game(config);

// Handle resize window
window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
});

// Prevent zoom on mobile
document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('gesturechange', (e) => e.preventDefault());

console.log('[Isekai World] Game initialized. Responsive mode enabled.');
