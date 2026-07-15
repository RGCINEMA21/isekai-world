/**
 * ISEKAI WORLD - Main Configuration
 * Phaser handles ALL canvas sizing via Scale.RESIZE.
 * No manual viewport detection needed.
 */
const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container',
    scale: {
        mode: Phaser.Scale.RESIZE,
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

console.log('[Isekai World] Game initialized.');
