/**
 * ISEKAI WORLD - Main Configuration
 * Phaser handles canvas sizing via Scale.RESIZE.
 */

const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    scale: {
        mode: Phaser.Scale.RESIZE,
        width: '100%',
        height: '100%',
        autoCenter: Phaser.Scale.CENTER_BOTH
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
console.log('[Isekai World] Game started');
