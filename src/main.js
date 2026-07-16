/**
 * ISEKAI WORLD - Main Configuration
 * Uses Phaser.Scale.RESIZE for automatic screen adaptation.
 * All scenes must listen to this.scale.on('resize') to rebuild their UI.
 */

const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    scale: {
        mode: Phaser.Scale.RESIZE,
        width: '100%',
        height: '100%',
        autoCenter: Phaser.Scale.CENTER_BOTH,
        min: { width: 300, height: 400 },
        max: { width: 2560, height: 1440 }
    },
    input: {
        activePointers: 3
    },
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 }, debug: false }
    },
    backgroundColor: '#1a1a2e',
    fps: { target: 60, forceSetTimeOut: false },
    scene: [BootScene, MainMenuScene, CharacterCreatorScene, MainVillageScene, VillageScene, MonsterAreaScene, HomeScene, WarehouseScene, PortalScene, AdventureScene],
    antialias: false,
    pixelArt: true,
    roundPixels: true
};

const game = new Phaser.Game(config);

// No manual resize handler needed — Phaser.Scale.RESIZE handles it automatically.
// Scenes should listen: this.scale.on('resize', (sz) => this.onResize(sz));

console.log('[Isekai World] Game initialized. Scale mode: RESIZE.');
