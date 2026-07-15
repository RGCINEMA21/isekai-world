/**
 * ISEKAI WORLD - Main Configuration
 * Responsive: auto-detect portrait/landscape, adjusts viewport & UI.
 */

// Use visual viewport for mobile (accounts for on-screen keyboard, URL bar)
function getViewport() {
    const v = window.visualViewport || window;
    return {
        width: Math.floor(v.width || window.innerWidth),
        height: Math.floor(v.height || window.innerHeight)
    };
}

const vp = getViewport();

const config = {
    type: Phaser.AUTO,
    width: vp.width,
    height: vp.height,
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

// Resize handler - fires on viewport changes (orientation, URL bar hide, etc.)
function handleResize() {
    const v = getViewport();
    if (game.scale && game.scale.resize) {
        game.scale.resize(v.width, v.height);
    }
}

window.addEventListener('resize', handleResize);
window.addEventListener('orientationchange', () => {
    setTimeout(handleResize, 200);
});

// For mobile browsers that change viewport when scrolling
if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', handleResize);
}

console.log('[Isekai World] Game initialized. Viewport:', vp.width, 'x', vp.height);
