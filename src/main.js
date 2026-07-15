/**
 * ISEKAI WORLD - Main Configuration
 * Phaser handles canvas sizing via Scale.RESIZE.
 */

const W = window.innerWidth || document.documentElement.clientWidth || 360;
const H = window.innerHeight || document.documentElement.clientHeight || 640;

const config = {
    type: Phaser.AUTO,
    width: W,
    height: H,
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

// Ensure resize on orientation change and viewport change
window.addEventListener('resize', () => {
    if (game.scale) game.scale.refresh();
});

console.log('[Isekai World] Started:', W, 'x', H);
