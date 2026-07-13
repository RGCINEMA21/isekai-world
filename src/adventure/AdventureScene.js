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
     * @param {Object} data - Scene data
     * @param {string} data.areaId - Area identifier
     * @param {string} data.areaName - Area display name
     * @param {number} data.startX - Player start X position
     * @param {number} data.startY - Player start Y position
     * @param {number} data.mapWidth - Map width in tiles
     * @param {number} data.mapHeight - Map height in tiles
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
        
        // Create managers
        this.manager = new AdventureManager({
            areaId: this.areaId,
            areaName: this.areaName,
            mapWidth: this.mapWidth,
            mapHeight: this.mapHeight,
            tileSize: 16,
            player: this.saveData?.player || {}
        });
        
        this.camera = new AdventureCamera(this, this.manager);
        this.ui = new AdventureUI(this, this.manager);
        this.transition = new TransitionManager(this);
        
        // Initialize player position
        const startX = this.startX * this.manager.tileSize;
        const startY = this.startY * this.manager.tileSize;
        this.manager.initPlayer(startX, startY);
        
        // Generate map
        this.generateMap();
        
        // Create player graphics
        this.playerGfx = this.add.graphics().setDepth(10);
        
        // Initialize camera
        this.camera.init();
        
        // Initialize UI
        this.ui.init();
        
        // Input setup
        this.setupInput();
        
        // Fade in
        this.transition.fadeIn();
        
        // Resize handler
        this.scale.on('resize', (sz) => this.onResize(sz));
    }
    
    /**
     * Generate the adventure map.
     */
    generateMap() {
        const width = this.manager.mapWidth;
        const height = this.manager.mapHeight;
        const tileSize = this.manager.tileSize;
        
        this.mapGfx = this.add.graphics().setDepth(0);
        
        // Simple procedural generation
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const px = x * tileSize;
                const py = y * tileSize;
                
                // Base ground
                this.mapGfx.fillStyle(0x4a8a3a, 1);
                this.mapGfx.fillRect(px, py, tileSize, tileSize);
                
                // Add some variation
                const noise = Math.sin(x * 0.5) * Math.cos(y * 0.5);
                if (noise > 0.3) {
                    // Tall grass
                    this.mapGfx.fillStyle(0x3a7a2a, 1);
                    this.mapGfx.fillRect(px, py, tileSize, tileSize);
                    this.mapGfx.fillStyle(0x559944, 0.6);
                    this.mapGfx.fillRect(px + 3, py + 5, 2, 8);
                    this.mapGfx.fillRect(px + 9, py + 3, 2, 10);
                } else if (noise < -0.3) {
                    // Path
                    this.mapGfx.fillStyle(0x8b7355, 1);
                    this.mapGfx.fillRect(px, py, tileSize, tileSize);
                }
                
                // Random trees (sparse)
                if (Math.random() < 0.02 && x > 2 && x < width - 2 && y > 2 && y < height - 2) {
                    this.mapGfx.fillStyle(0x5a3a1a, 1);
                    this.mapGfx.fillRect(px + 6, py + 10, 4, 6);
                    this.mapGfx.fillStyle(0x2d7a1e, 1);
                    this.mapGfx.fillCircle(px + 8, py + 7, 6);
                    this.mapGfx.fillStyle(0x3a9a2a, 0.6);
                    this.mapGfx.fillCircle(px + 7, py + 5, 4);
                }
            }
        }
        
        // Draw spawn point marker
        this.mapGfx.fillStyle(0xffaa44, 0.5);
        this.mapGfx.fillCircle(this.startX * tileSize + 8, this.startY * tileSize + 8, 12);
    }
    
    /**
     * Setup input handlers.
     */
    setupInput() {
        // Keyboard input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys({
            up: 'W',
            down: 'S',
            left: 'A',
            right: 'D'
        });
        
        // Touch/joystick placeholder
        this.touchInput = { x: 0, y: 0 };
    }
    
    /**
     * Get movement velocity from input.
     * @returns {Object} Velocity vector {x, y}
     */
    getMovementVelocity() {
        let vx = 0;
        let vy = 0;
        
        // Keyboard input
        if (this.cursors.left.isDown || this.keys.left.isDown) vx -= 1;
        if (this.cursors.right.isDown || this.keys.right.isDown) vx += 1;
        if (this.cursors.up.isDown || this.keys.up.isDown) vy -= 1;
        if (this.cursors.down.isDown || this.keys.down.isDown) vy += 1;
        
        // Touch input (placeholder for virtual joystick)
        if (this.touchInput.x !== 0 || this.touchInput.y !== 0) {
            vx += this.touchInput.x;
            vy += this.touchInput.y;
        }
        
        // Normalize
        const len = Math.sqrt(vx * vx + vy * vy);
        if (len > 0) {
            vx = vx / len;
            vy = vy / len;
        }
        
        return { x: vx * this.manager.moveSpeed, y: vy * this.manager.moveSpeed };
    }
    
    /**
     * Draw the player character.
     */
    drawPlayer() {
        const g = this.playerGfx;
        g.clear();
        
        const px = this.manager.playerX;
        const py = this.manager.playerY;
        const facing = this.manager.facing;
        const moving = this.manager.isMoving;
        const frame = this.manager.animFrame;
        
        // Character colors
        const skin = 0xffcc99;
        const hair = 0x442200;
        const shirt = 0x2266aa;
        const pants = 0x334466;
        const boot = 0x3a2a1a;
        
        // Shadow
        g.fillStyle(0x000000, 0.2);
        g.fillEllipse(px, py + 7, 10, 4);
        
        // Walk bob animation
        const bob = moving ? Math.sin(frame * Math.PI * 0.5) * 0.5 : 0;
        const y = py + bob;
        
        // Boots
        const step = moving && frame % 2 === 1 ? 1 : 0;
        g.fillStyle(boot, 1);
        g.fillRect(px - 3, y + 3, 2, 3 + (facing !== 'up' ? step : 0));
        g.fillRect(px + 1, y + 3, 2, 3 + (facing !== 'up' ? -step : 0));
        
        // Pants
        g.fillStyle(pants, 1);
        g.fillRect(px - 3, y - 1, 2, 5);
        g.fillRect(px + 1, y - 1, 2, 5);
        
        // Shirt
        g.fillStyle(shirt, 1);
        g.fillRect(px - 4, y - 6, 8, 6);
        
        // Arms
        const armSwing = moving ? Math.sin(frame * Math.PI) * 2 : 0;
        g.fillStyle(skin, 1);
        g.fillRect(px - 5, y - 4 + armSwing, 2, 5);
        g.fillRect(px + 3, y - 4 - armSwing, 2, 5);
        
        // Head
        g.fillStyle(skin, 1);
        g.fillRect(px - 3, y - 12, 6, 7);
        
        // Hair
        g.fillStyle(hair, 1);
        g.fillRect(px - 3, y - 13, 6, 3);
        if (facing === 'down') {
            g.fillRect(px - 4, y - 12, 1, 4);
            g.fillRect(px + 3, y - 12, 1, 4);
        } else if (facing === 'up') {
            g.fillRect(px - 4, y - 13, 8, 4);
        } else if (facing === 'left') {
            g.fillRect(px - 4, y - 13, 6, 3);
            g.fillRect(px - 4, y - 11, 1, 4);
        } else {
            g.fillRect(px - 2, y - 13, 6, 3);
            g.fillRect(px + 3, y - 11, 1, 4);
        }
        
        // Eyes
        if (facing !== 'up') {
            g.fillStyle(0xffffff, 1);
            if (facing === 'down') {
                g.fillRect(px - 2, y - 10, 2, 2);
                g.fillRect(px + 1, y - 10, 2, 2);
                g.fillStyle(0x2244aa, 1);
                g.fillRect(px - 1, y - 9, 1, 1);
                g.fillRect(px + 1, y - 9, 1, 1);
            } else if (facing === 'left') {
                g.fillRect(px - 3, y - 10, 2, 2);
                g.fillStyle(0x2244aa, 1);
                g.fillRect(px - 2, y - 9, 1, 1);
            } else {
                g.fillRect(px + 1, y - 10, 2, 2);
                g.fillStyle(0x2244aa, 1);
                g.fillRect(px + 2, y - 9, 1, 1);
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
        // Save current state
        this.saveGame();
        
        // Transition back to village
        this.transition.fadeToScene('MainVillageScene', {}, () => {
            this.ui.destroy();
        });
    }
    
    /**
     * Save game data.
     */
    saveGame() {
        if (!this.saveData) return;
        
        // Update save data with current state
        const playerStats = {
            hp: this.saveData.stats?.hp || 100,
            maxHp: this.saveData.stats?.maxHp || 100,
            energy: this.saveData.stats?.energy || 100,
            maxEnergy: this.saveData.stats?.maxEnergy || 100,
            exp: this.saveData.stats?.exp || 0,
            gold: this.saveData.currency?.gold || 0,
            diamond: this.saveData.currency?.diamond || 0,
            playerX: this.manager.playerX,
            playerY: this.manager.playerY
        };
        
        AdventureSave.saveToMainSave(this.saveData, playerStats);
    }
    
    /**
     * Load save data.
     * @returns {Object} Save data
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
     * @param {Object} size - New size {width, height}
     */
    onResize(size) {
        this.camera.onResize(size.width, size.height);
        this.ui.createHUD();
    }
    
    /**
     * Update game logic.
     * @param {number} time - Current time
     * @param {number} delta - Time delta
     */
    update(time, delta) {
        // Check for transition
        if (this.transition.isCurrentlyTransitioning()) return;
        
        // Get movement input
        const velocity = this.getMovementVelocity();
        
        // Update player movement
        this.manager.updateMovement(velocity, delta);
        
        // Update camera
        this.camera.update(delta);
        
        // Draw player
        this.drawPlayer();
        
        // Auto-save every 30 seconds
        if (!this.lastSaveTime) this.lastSaveTime = 0;
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
        if (this.invUI) this.invUI.destroy();
    }
}
