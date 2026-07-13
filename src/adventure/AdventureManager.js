/**
 * AdventureManager - Core logic for Adventure Mode.
 * Manages area configuration, player state, and game logic.
 * Reusable by: Portal Monster, Hutan, Tambang, Memancing, Dungeon, Arena Boss.
 */
class AdventureManager {
    constructor(config) {
        this.areaId = config.areaId || 'unknown';
        this.areaName = config.areaName || 'Unknown Area';
        this.mapWidth = config.mapWidth || 60;
        this.mapHeight = config.mapHeight || 60;
        this.tileSize = config.tileSize || 16;
        this.player = config.player || {};
        
        this.playerX = 0;
        this.playerY = 0;
        this.facing = 'down';
        this.isMoving = false;
        this.animFrame = 0;
        this.animTimer = 0;
        
        this.moveSpeed = 120;
        this.diagonalSpeed = this.moveSpeed * 0.707;
        
        this.bounds = {
            left: 0,
            top: 0,
            right: this.mapWidth * this.tileSize,
            bottom: this.mapHeight * this.tileSize
        };
    }
    
    initPlayer(x, y) {
        this.playerX = x;
        this.playerY = y;
    }
    
    updateMovement(velocity, delta) {
        let vx = velocity.x;
        let vy = velocity.y;
        
        if (vx !== 0 && vy !== 0) {
            vx *= this.diagonalSpeed / this.moveSpeed;
            vy *= this.diagonalSpeed / this.moveSpeed;
        }
        
        const dt = delta / 1000;
        this.playerX += vx * this.moveSpeed * dt;
        this.playerY += vy * this.moveSpeed * dt;
        
        this.playerX = Phaser.Math.Clamp(this.playerX, this.bounds.left + 16, this.bounds.right - 16);
        this.playerY = Phaser.Math.Clamp(this.playerY, this.bounds.top + 16, this.bounds.bottom - 16);
        
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
    
    getPlayerSaveData() {
        return {
            x: this.playerX,
            y: this.playerY,
            facing: this.facing,
            areaId: this.areaId
        };
    }
    
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
