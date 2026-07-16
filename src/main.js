/**
 * ISEKAI WORLD - Main Configuration
 */
const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game-container',
    width: window.innerWidth,
    height: window.innerHeight,
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    input: { activePointers: 3 },
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 }, debug: false }
    },
    backgroundColor: '#1a1a2e',
    fps: { target: 60, forceSetTimeOut: false },
    scene: [
        BootScene, MainMenuScene, CharacterCreatorScene,
        MainVillageScene, VillageScene, MonsterAreaScene,
        HomeScene, WarehouseScene, PortalScene, AdventureScene
    ],
    antialias: false,
    pixelArt: true,
    roundPixels: true
});
