/**
 * AdventureScene - Main adventure mode scene.
 * Handles player movement, camera, UI, and area exploration.
 * Reusable by: Portal Monster, Hutan, Tambang, Memancing, Dungeon, Arena Boss.
 */
class AdventureScene extends Phaser.Scene {
    constructor() {
        super({ key: 'AdventureScene' });
    }
    
    /**
     * Initialize scene with data from previous scene.
     */
    init(data) {
        this.areaId = data.areaId || 'forest';
        this.areaName = data.areaName || 'Forest';
        this.startX = data.startX || 30;
        this.startY = data.startY || 30;
        this.mapWidth = data.mapWidth || 60;
        this.mapHeight = data.mapHeight || 60;
    }
    
    create() {
        // Load save data
        this.saveData = this.loadSave();
        
        // Create manager first
        this.manager = new AdventureManager({
            areaId: this.areaId,
            areaName: this.areaName,
            mapWidth: this.mapWidth,
            mapHeight: this.mapHeight,
            tileSize: 16,
            player: this.saveData?.player || {}
        });
        
        // Initialize player position
        this.manager.initPlayer(this.startX * this.manager.tileSize, this.startY * this.manager.tileSize);
        
        // Generate map (draw the world)
        this.generateMap();
        
        // Create player graphics (drawn on top of map)
        this.playerGfx = this.add.graphics().setDepth(10);
        
        // Setup camera AFTER map and player are created
        this.cam = new AdventureCamera(this, this.manager);
        this.cam.init();
        
        // Setup input
        this.setupInput();
        
        // UI
        this.ui = new AdventureUI(this, this.manager);
        this.ui.init();
        
        // Transition
        this.transition = new TransitionManager(this);
        
        // Auto-save timer
        this.lastSaveTime = 0;
        
        // Resize handler
        this.scale.on('resize', (sz) => this.onResize(sz));
        
        // Fade in with slight delay to ensure rendering
        this.time.delayedCall(50, () => {
            this.cameras.main.fadeIn(400, 0, 0, 0);
        });
    }
    
    /**
     * Generate the adventure map using graphics.
     */
    generateMap() {
        const width = this.manager.mapWidth;
        const height = this.manager.mapHeight;
        const tileSize = this.manager.tileSize;
        
        this.mapGfx = this.add.graphics().setDepth(0);
        
        // Use a seeded random for consistent tree placement
        let seed = this.areaId.length * 1337;
        const seededRandom = () => {
            seed = (seed * 9301 + 49297) % 233280;
            return seed / 233280;
        };
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const px = x * tileSize;
                const py = y * tileSize;
                
                // Base ground color based on area type
                let baseColor = 0x4a8a3a;
                if (this.areaId === 'tambang') baseColor = 0x8a7a5a;
                else if (this.areaId === 'memancing') baseColor = 0x3a8a6a;
                
                this.mapGfx.fillStyle(baseColor, 1);
                this.mapGfx.fillRect(px, py, tileSize, tileSize);
                
                // Variation
                const noise = Math.sin(x * 0.5) * Math.cos(y * 0.5);
                if (noise > 0.3) {
                    this.mapGfx.fillStyle(0x3a7a2a, 1);
                    this.mapGfx.fillRect(px, py, tileSize, tileSize);
                    this.mapGfx.fillStyle(0x559944, 0.6);
                    this.mapGfx.fillRect(px + 3, py + 5, 2, 8);
                    this.mapGfx.fillRect(px + 9, py + 3, 2, 10);
                } else if (noise < -0.3) {
                    this.mapGfx.fillStyle(0x8b7355, 1);
                    this.mapGfx.fillRect(px, py, tileSize, tileSize);
                }
                
                // Border walls (prevent going out of map)
                if (x === 0 || y === 0 || x === width - 1 || y === height - 1) {
                    this.mapGfx.fillStyle(0x5a3a1a, 1);
                    this.mapGfx.fillRect(px, py, tileSize, tileSize);
                    this.mapGfx.fillStyle(0x3a2a0a, 0.5);
                    this.mapGfx.fillRect(px, py, tileSize, tileSize);
                }
                
                // Trees (seeded random)
                if (seededRandom() < 0.02 && x > 3 && x < width - 3 && y > 3 && y < height - 3) {
                    this.mapGfx.fillStyle(0x5a3a1a, 1);
                    this.mapGfx.fillRect(px + 6, py + 10, 4, 6);
                    this.mapGfx.fillStyle(0x2d7a1e, 1);
                    this.mapGfx.fillCircle(px + 8, py + 7, 6);
                    this.mapGfx.fillStyle(0x3a9a2a, 0.6);
                    this.mapGfx.fillCircle(px + 7, py + 5, 4);
                }
            }
        }
        
        // Spawn marker
        this.mapGfx.fillStyle(0xffaa44, 0.5);
        this.mapGfx.fillCircle(this.startX * tileSize + 8, this.startY * tileSize + 8, 12);
    }
    
    /**
     * Setup keyboard input.
     */
    setupInput() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys({
            up: 'W',
            down: 'S',
            left: 'A',
            right: 'D'
        });
    }
    
    /**
     * Get movement velocity from input.
     */
    getMovementVelocity() {
        let vx = 0, vy = 0;
        if (this.cursors.left.isDown || this.keys.left.isDown) vx = -1;
        else if (this.cursors.right.isDown || this.keys.right.isDown) vx = 1;
        if (this.cursors.up.isDown || this.keys.up.isDown) vy = -1;
        else if (this.cursors.down.isDown || this.keys.down.isDown) vy = 1;
        return { x: vx, y: vy };
    }
    
    /**
     * Draw the player character using placeholder graphics.
     */
    drawPlayer() {
        if (!this.playerGfx) return;
        this.playerGfx.clear();
        
        const x = Math.round(this.manager.playerX);
        const y = Math.round(this.manager.playerY);
        const facing = this.manager.facing;
        const moving = this.manager.isMoving;
        const frame = this.manager.animFrame;
        
        // Get gender colors from save data
        const gender = this.saveData?.player?.gender || 'male';
        
        // Character colors
        const skin = 0xffcc99;
        let hair, shirt;
        if (gender === 'female') {
            hair = 0xcc6633;
            shirt = 0xcc4488;
        } else {
            hair = 0x443322;
            shirt = 0x4466aa;
        }
        const pants = 0x444466;
        const boot = 0x3a2a1a;
        
        const s = 1;
        const step = moving ? Math.sin(frame * Math.PI) * 2 : 0;
        
        // Shadow
        this.playerGfx.fillStyle(0x000000, 0.2);
        this.playerGfx.fillEllipse(x, y + 12, 14, 5);
        
        // Boots
        this.playerGfx.fillStyle(boot, 1);
        this.playerGfx.fillRect(x - 3, y + 3 + (moving && facing !== 'up' ? step : 0), 2, 3);
        this.playerGfx.fillRect(x + 1, y + 3 + (moving && facing !== 'up' ? -step : 0), 2, 3);
        
        // Pants
        this.playerGfx.fillStyle(pants, 1);
        this.playerGfx.fillRect(x - 3, y - 1, 2, 5);
        this.playerGfx.fillRect(x + 1, y - 1, 2, 5);
        
        // Shirt
        this.playerGfx.fillStyle(shirt, 1);
        this.playerGfx.fillRect(x - 4, y - 6, 8, 6);
        
        // Arms
        const armSwing = moving ? Math.sin(frame * Math.PI) * 2 : 0;
        this.playerGfx.fillStyle(skin, 1);
        this.playerGfx.fillRect(x - 5, y - 4 + armSwing, 2, 5);
        this.playerGfx.fillRect(x + 3, y - 4 - armSwing, 2, 5);
        
        // Head
        this.playerGfx.fillStyle(skin, 1);
        this.playerGfx.fillRect(x - 3, y - 12, 6, 7);
        
        // Hair
        this.playerGfx.fillStyle(hair, 1);
        this.playerGfx.fillRect(x - 3, y - 13, 6, 3);
        if (facing === 'down') {
            this.playerGfx.fillRect(x - 4, y - 12, 1, 4);
            this.playerGfx.fillRect(x + 3, y - 12, 1, 4);
        } else if (facing === 'up') {
            this.playerGfx.fillRect(x - 4, y - 13, 8, 4);
        } else if (facing === 'left') {
            this.playerGfx.fillRect(x - 4, y - 13, 6, 3);
            this.playerGfx.fillRect(x - 4, y - 11, 1, 4);
        } else {
            this.playerGfx.fillRect(x - 2, y - 13, 6, 3);
            this.playerGfx.fillRect(x + 3, y - 11, 1, 4);
        }
        
        // Eyes
        if (facing !== 'up') {
            this.playerGfx.fillStyle(0xffffff, 1);
            if (facing === 'down') {
                this.playerGfx.fillRect(x - 2, y - 10, 2, 2);
                this.playerGfx.fillRect(x + 1, y - 10, 2, 2);
                this.playerGfx.fillStyle(0x2244aa, 1);
                this.playerGfx.fillRect(x - 1, y - 9, 1, 1);
                this.playerGfx.fillRect(x + 1, y - 9, 1, 1);
            } else if (facing === 'left') {
                this.playerGfx.fillRect(x - 3, y - 10, 2, 2);
                this.playerGfx.fillStyle(0x2244aa, 1);
                this.playerGfx.fillRect(x - 2, y - 9, 1, 1);
            } else {
                this.playerGfx.fillRect(x + 1, y - 10, 2, 2);
                this.playerGfx.fillStyle(0x2244aa, 1);
                this.playerGfx.fillRect(x + 2, y - 9, 1, 1);
            }
        }
    }
    
    /**
     * Toggle inventory UI.
     */
    toggleInventory() {
        if (!this.invUI) {
            const inventory = InventorySave.load(20);
            this.invUI = new InventoryUI(this, inventory);
        }
        
        if (this.invUI.isOpen) {
            this.invUI.close();
        } else {
            this.invUI.open(this.saveData);
        }
    }
    
    /**
     * Exit adventure mode and return to village.
     */
    exitAdventure() {
        this.saveGame();
        this.ui.destroy();
        this.cameras.main.fadeOut(400, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('MainVillageScene');
        });
    }
    
    /**
     * Save game data to localStorage.
     */
    saveGame() {
        if (!this.saveData) return;
        this.saveData.progress = this.saveData.progress || {};
        this.saveData.progress.playerX = this.manager.playerX;
        this.saveData.progress.playerY = this.manager.playerY;
        try {
            localStorage.setItem('isekai_world_save', JSON.stringify(this.saveData));
        } catch (e) {
            console.error('[AdventureScene] Save failed:', e);
        }
    }
    
    /**
     * Load save data from localStorage.
     */
    loadSave() {
        try {
            const raw = localStorage.getItem('isekai_world_save');
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }
    
    /**
     * Handle screen resize.
     */
    onResize(size) {
        if (this.cam) this.cam.onResize(size.width, size.height);
        if (this.ui) this.ui.createHUD();
    }
    
    /**
     * Update game logic every frame.
     */
    update(time, delta) {
        // Get movement input
        const velocity = this.getMovementVelocity();
        
        // Update player movement
        this.manager.updateMovement(velocity, delta);
        
        // Update camera
        this.cam.update(delta);
        
        // Draw player
        this.drawPlayer();
        
        // Auto-save every 30 seconds
        if (time - this.lastSaveTime > 30000) {
            this.saveGame();
            this.lastSaveTime = time;
        }
    }
    
    /**
     * Clean up when scene shuts down.
     */
    shutdown() {
        this.saveGame();
        if (this.ui) this.ui.destroy();
        if (this.invUI) { this.invUI.destroy(); this.invUI = null; }
    }
}
