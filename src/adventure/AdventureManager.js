/**
 * AdventureManager - Core logic for Adventure Mode.
 * Manages area configuration, player state, and game logic.
 * Reusable by: Portal Monster, Hutan, Tambang, Memancing, Dungeon, Arena Boss.
 */
class AdventureManager {
    /**
     * Create a new AdventureManager.
     * @param {Object} config - Area configuration
     * @param {string} config.areaId - Unique area identifier
     * @param {string} config.areaName - Display name
     * @param {number} config.mapWidth - Map width in tiles
     * @param {number} config.mapHeight - Map height in tiles
     * @param {number} config.tileSize - Tile size in pixels
     * @param {Object} config.player - Player data from save
     */
    constructor(config) {
        this.areaId = config.areaId || 'unknown';
        this.areaName = config.areaName || 'Unknown Area';
        this.mapWidth = config.mapWidth || 60;
        this.mapHeight = config.mapHeight || 60;
        this.tileSize = config.tileSize || 16;
        this.player = config.player || {};
        
        // Player state
        this.playerX = 0;
        this.playerY = 0;
        this.facing = 'down';
        this.isMoving = false;
        this.animFrame = 0;
        this.animTimer = 0;
        
        // Movement settings
        this.moveSpeed = 120;
        this.diagonalSpeed = this.moveSpeed * 0.707; // Normalize diagonal speed
        
        // Area bounds
        this.bounds = {
            left: 0,
            top: 0,
            right: this.mapWidth * this.tileSize,
            bottom: this.mapHeight * this.tileSize
        };
    }
    
    /**
     * Initialize player position.
     * @param {number} x - Start X position
     * @param {number} y - Start Y position
     */
    initPlayer(x, y) {
        this.playerX = x;
        this.playerY = y;
    }
    
    /**
     * Update player movement based on input.
     * @param {Object} velocity - {x, y} velocity vector
     * @param {number} delta - Time delta in ms
     */
    updateMovement(velocity, delta) {
        // Normalize diagonal movement
        let vx = velocity.x;
        let vy = velocity.y;
        
        if (vx !== 0 && vy !== 0) {
            vx *= this.diagonalSpeed / this.moveSpeed;
            vy *= this.diagonalSpeed / this.moveSpeed;
        }
        
        // Apply velocity
        const dt = delta / 1000;
        this.playerX += vx * dt;
        this.playerY += vy * dt;
        
        // Clamp to bounds
        this.playerX = Phaser.Math.Clamp(this.playerX, this.bounds.left + 8, this.bounds.right - 8);
        this.playerY = Phaser.Math.Clamp(this.playerY, this.bounds.top + 8, this.bounds.bottom - 8);
        
        // Update facing direction
        if (vx !== 0 || vy !== 0) {
            this.isMoving = true;
            if (Math.abs(vx) > Math.abs(vy)) {
                this.facing = vx > 0 ? 'right' : 'left';
            } else {
                this.facing = vy > 0 ? 'down' : 'up';
            }
        } else {
            this.isMoving = false;
        }
        
        // Update animation
        if (this.isMoving) {
            this.animTimer += delta;
            if (this.animTimer >= 150) {
                this.animTimer = 0;
                this.animFrame = (this.animFrame + 1) % 4;
            }
        } else {
            this.animFrame = 0;
        }
    }
    
    /**
     * Get player data for saving.
     * @returns {Object} Player save data
     */
    getPlayerSaveData() {
        return {
            x: this.playerX,
            y: this.playerY,
            facing: this.facing,
            areaId: this.areaId
        };
    }
    
    /**
     * Get area configuration for map generation.
     * @returns {Object} Area config
     */
    getAreaConfig() {
        return {
            areaId: this.areaId,
            areaName: this.areaName,
            mapWidth: this.mapWidth,
            mapHeight: this.mapHeight,
            tileSize: this.tileSize
        };
    }
}
