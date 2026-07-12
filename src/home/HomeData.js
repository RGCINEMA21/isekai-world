/**
 * HomeData - Configuration for the Home system.
 * Default values. Future: upgradeable up to Level 15.
 */
const HomeData = {
    // Interior map size (tiles)
    mapW: 20,
    mapH: 15,
    tileSize: 16,

    // Interior objects (tile positions)
    objects: {
        bed:       { tileX: 4,  tileY: 3,  name: '🛏 Kasur',    interactable: true,  action: 'Tidur' },
        table:     { tileX: 10, tileY: 4,  name: '🪑 Meja',     interactable: false, action: '' },
        chair:     { tileX: 10, tileY: 6,  name: '🪑 Kursi',    interactable: false, action: '' },
        carpet:    { tileX: 9,  tileY: 8,  name: '🟫 Karpet',   interactable: false, action: '' },
        wardrobe:  { tileX: 16, tileY: 3,  name: '🗄 Lemari',   interactable: false, action: '' },
        exitDoor:  { tileX: 10, tileY: 13, name: '🚪 Pintu',    interactable: true,  action: 'Keluar' }
    },

    // Spawn positions
    spawnInside:  { tileX: 10, tileY: 11 }, // inside, near exit door
    spawnOutside: { tileX: 32, tileY: 37 }, // outside main village, near house door

    // Sleep config
    sleep: {
        fadeOutTime: 1000,
        waitTime: 2000,
        fadeInTime: 1000,
        hpRecovery: 100,
        energyRecovery: 100
    },

    // House upgrade structure (default level 1, future use)
    level: 1,
    maxLevel: 15,
    upgrades: {
        1:  { hpRecovery: 100, energyRecovery: 100, size: 'small',  deco: 'basic' },
        2:  { hpRecovery: 100, energyRecovery: 100, size: 'small',  deco: 'basic' },
        // Future levels up to 15...
    }
};
