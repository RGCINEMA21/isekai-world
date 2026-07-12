/**
 * ISEKAI WORLD - Main Configuration
 * Responsive: menyesuaikan ukuran layar perangkat.
 */

const config = {
    type: Phaser.AUTO,
    width: 960,
    height: 540,
    parent: 'game-container',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 }, debug: false }
    },
    backgroundColor: '#1a1a2e',
    fps: { target: 60, forceSetTimeOut: false },
    scene: [BootScene, MainMenuScene, CharacterCreatorScene, MainVillageScene],
    antialias: false,
    pixelArt: true,
    roundPixels: true
};

const game = new Phaser.Game(config);
console.log('[Isekai World] Game initialized.');
