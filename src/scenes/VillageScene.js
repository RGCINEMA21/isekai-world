/**
 * VillageScene - Main Village scene (Village Mode).
 * Camera controlled by player, no character movement.
 * Click NPCs to interact with buildings.
 * Responsive: Mobile Portrait & Desktop Landscape.
 */
class VillageScene extends Phaser.Scene {
    constructor() {
        super({ key: 'VillageScene' });
    }

    create() {
        // Generate map
        this.villageMap = new VillageMap(16);

        // Render decorations (tiles)
        this.deco = new VillageDecoration(this, this.villageMap);
        this.deco.drawMap();
        this.deco.createAnimatedLayer();

        // Render buildings
        this.buildingMgr = new BuildingManager(this, this.villageMap);
        this.buildingMgr.drawBuildings();

        // NPC interaction handler
        this.npcInteraction = new NPCInteraction(this);

        // Create NPCs
        this.npcMgr = new NPCManager(this, this.villageMap);
        this.npcMgr.setInteractCallback((buildingId, npcData) => {
            this.npcInteraction.handleInteraction(buildingId, npcData);
        });
        this.npcMgr.createNPCs();

        // Camera
        this.villageCamera = new VillageCamera(this, this.villageMap);
        this.villageCamera.init();

        // UI
        this.villageUI = new VillageUI(this);
        this.villageUI.create();

        // Fade in
        this.cameras.main.fadeIn(400, 0, 0, 0);

        // Resize
        this.scale.on('resize', (sz) => this.onResize(sz));
    }

    update(time, delta) {
        this.npcMgr.update(delta);
        this.deco.updateAnimations(delta);
    }

    onResize(sz) {
        if (this.villageCamera) this.villageCamera.onResize(sz.width, sz.height);
        if (this.villageUI) this.villageUI.create();
    }

    saveGame() {
        try {
            const r = localStorage.getItem('isekai_world_save');
            if (r) localStorage.setItem('isekai_world_save', r);
        } catch (e) {}
    }

    shutdown() {
        this.saveGame();
        if (this.deco) this.deco.destroy();
        if (this.npcMgr) this.npcMgr.destroy();
        if (this.villageUI) this.villageUI.destroy();
    }
}
