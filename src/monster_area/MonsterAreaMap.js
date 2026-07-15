/**
 * MonsterAreaMap - Tile-based map generator for monster areas.
 * Generates terrain, collision data, and decoration.
 * Reusable template: change theme config to create different areas.
 */
class MonsterAreaMap {
    /**
     * @param {Object} config - Area configuration
     */
    constructor(config) {
        this.areaId = config.areaId || 'beginner_grassland';
        this.areaName = config.areaName || 'Beginner Grassland';
        this.tileSize = config.tileSize || 16;
        this.mapWidth = config.mapWidth || 80;
        this.mapHeight = config.mapHeight || 80;
        this.theme = config.theme || 'grassland';
        this.spawnX = config.spawnX || 40;
        this.spawnY = config.spawnY || 70;

        // Tile types
        this.T = {
            GRASS:0, GRASS_DARK:1, PATH:2, WATER:3, BRIDGE:4,
            TREE:5, TREE_SM:6, ROCK:7, ROCK_SM:8, FENCE:9,
            FLOWERS:10, SHRUB:11, HILL:12, BUSH:13, SAND:14,
            WALL:15, SIGN:16
        };

        // Collision map (true = blocked)
        this.collision = [];
        this.grid = [];

        this.generate();
    }

    generate() {
        const T = this.T;
        const w = this.mapWidth;
        const h = this.mapHeight;

        // Init grid and collision
        for (let y = 0; y < h; y++) {
            this.grid[y] = [];
            this.collision[y] = [];
            for (let x = 0; x < w; x++) {
                this.grid[y][x] = T.GRASS;
                this.collision[y][x] = false;
            }
        }

        // === TERRAIN ===
        this._generateTerrain(T, w, h);

        // === WATER FEATURES ===
        this._generateWater(T, w, h);

        // === PATHS ===
        this._generatePaths(T, w, h);

        // === COLLISION OBJECTS ===
        this._placeCollisionObjects(T, w, h);

        // === DECORATIONS (no collision) ===
        this._placeDecorations(T, w, h);

        // === MAP BORDER ===
        this._placeBorder(T, w, h);
    }

    _generateTerrain(T, w, h) {
        // Grass variation
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                if (Math.random() < 0.25) {
                    this.grid[y][x] = T.GRASS_DARK;
                }
            }
        }

        // Hills (higher ground)
        for (let i = 0; i < 8; i++) {
            const cx = Phaser.Math.Between(10, w - 10);
            const cy = Phaser.Math.Between(10, h - 10);
            const r = Phaser.Math.Between(3, 5);
            for (let dy = -r; dy <= r; dy++) {
                for (let dx = -r; dx <= r; dx++) {
                    if (dx*dx + dy*dy <= r*r) {
                        const x = cx + dx;
                        const y = cy + dy;
                        if (x > 0 && x < w - 1 && y > 0 && y < h - 1) {
                            this.grid[y][x] = T.HILL;
                            this.collision[y][x] = false; // Hills walkable
                        }
                    }
                }
            }
        }
    }

    _generateWater(T, w, h) {
        // Small river across upper area
        for (let x = 5; x < 25; x++) {
            const y = 15 + Math.floor(Math.sin(x * 0.3) * 2);
            if (y >= 0 && y < h) {
                this.grid[y][x] = T.WATER;
                this.collision[y][x] = true;
                if (y + 1 < h) { this.grid[y+1][x] = T.WATER; this.collision[y+1][x] = true; }
            }
        }

        // Small pond
        for (let dy = -2; dy <= 2; dy++) {
            for (let dx = -3; dx <= 3; dx++) {
                if (dx*dx + dy*dy <= 7) {
                    const x = 65 + dx;
                    const y = 25 + dy;
                    if (x > 0 && x < w-1 && y > 0 && y < h-1) {
                        this.grid[y][x] = T.WATER;
                        this.collision[y][x] = true;
                    }
                }
            }
        }

        // Bridge over river
        for (let x = 13; x < 17; x++) {
            for (let dy = -1; dy <= 2; dy++) {
                const y = 15 + dy;
                if (y >= 0 && y < h) {
                    this.grid[y][x] = T.BRIDGE;
                    this.collision[y][x] = false;
                }
            }
        }
    }

    _generatePaths(T, w, h) {
        // Main horizontal path
        for (let x = 5; x < w - 5; x++) {
            const y = this.spawnY;
            if (x >= 0 && x < w && y >= 0 && y < h) {
                this.grid[y][x] = T.PATH;
                this.collision[y][x] = false;
            }
        }

        // Main vertical path
        for (let y = 10; y < h - 5; y++) {
            const x = this.spawnX;
            if (x >= 0 && x < w && y >= 0 && y < h) {
                this.grid[y][x] = T.PATH;
                this.collision[y][x] = false;
            }
        }

        // Branch paths
        for (let x = 15; x < 50; x++) {
            const y = 40;
            if (this.grid[y][x] !== T.WATER) {
                this.grid[y][x] = T.PATH;
                this.collision[y][x] = false;
            }
        }
        for (let y = 20; y < 55; y++) {
            const x = 30;
            if (this.grid[y][x] !== T.WATER) {
                this.grid[y][x] = T.PATH;
                this.collision[y][x] = false;
            }
        }
        for (let y = 20; y < 55; y++) {
            const x = 60;
            if (this.grid[y][x] !== T.WATER) {
                this.grid[y][x] = T.PATH;
                this.collision[y][x] = false;
            }
        }
    }

    _placeCollisionObjects(T, w, h) {
        // Trees (big, with collision)
        const treeSpots = [];
        for (let i = 0; i < 60; i++) {
            const tx = Phaser.Math.Between(3, w - 4);
            const ty = Phaser.Math.Between(3, h - 4);
            if (this.grid[ty][tx] === T.GRASS || this.grid[ty][tx] === T.GRASS_DARK) {
                this.grid[ty][tx] = T.TREE;
                this.collision[ty][tx] = true;
                treeSpots.push([tx, ty]);
            }
        }

        // Small trees (collision)
        for (let i = 0; i < 40; i++) {
            const tx = Phaser.Math.Between(3, w - 4);
            const ty = Phaser.Math.Between(3, h - 4);
            if (this.grid[ty][tx] === T.GRASS || this.grid[ty][tx] === T.GRASS_DARK) {
                this.grid[ty][tx] = T.TREE_SM;
                this.collision[ty][tx] = true;
            }
        }

        // Big rocks (collision)
        for (let i = 0; i < 20; i++) {
            const tx = Phaser.Math.Between(3, w - 4);
            const ty = Phaser.Math.Between(3, h - 4);
            if (this.grid[ty][tx] === T.GRASS || this.grid[ty][tx] === T.GRASS_DARK) {
                this.grid[ty][tx] = T.ROCK;
                this.collision[ty][tx] = true;
            }
        }

        // Fences (collision)
        for (let i = 0; i < 15; i++) {
            const tx = Phaser.Math.Between(5, w - 6);
            const ty = Phaser.Math.Between(5, h - 6);
            const horizontal = Math.random() > 0.5;
            const len = Phaser.Math.Between(3, 6);
            for (let j = 0; j < len; j++) {
                const fx = horizontal ? tx + j : tx;
                const fy = horizontal ? ty : ty + j;
                if (fx > 0 && fx < w - 1 && fy > 0 && fy < h - 1) {
                    if (this.grid[fy][fx] === T.GRASS || this.grid[fy][fx] === T.GRASS_DARK) {
                        this.grid[fy][fx] = T.FENCE;
                        this.collision[fy][fx] = true;
                    }
                }
            }
        }

        // Ensure spawn area is clear
        for (let dy = -2; dy <= 2; dy++) {
            for (let dx = -2; dx <= 2; dx++) {
                const x = this.spawnX + dx;
                const y = this.spawnY + dy;
                if (x >= 0 && x < w && y >= 0 && y < h) {
                    if (this.collision[y][x]) {
                        this.grid[y][x] = T.GRASS;
                        this.collision[y][x] = false;
                    }
                }
            }
        }
    }

    _placeDecorations(T, w, h) {
        // Small rocks (no collision)
        for (let i = 0; i < 30; i++) {
            const rx = Phaser.Math.Between(2, w - 3);
            const ry = Phaser.Math.Between(2, h - 3);
            if (this.grid[ry][rx] === T.GRASS || this.grid[ry][rx] === T.GRASS_DARK) {
                this.grid[ry][rx] = T.ROCK_SM;
            }
        }

        // Flowers
        for (let i = 0; i < 60; i++) {
            const fx = Phaser.Math.Between(2, w - 3);
            const fy = Phaser.Math.Between(2, h - 3);
            if (this.grid[fy][fx] === T.GRASS || this.grid[fy][fx] === T.GRASS_DARK) {
                this.grid[fy][fx] = T.FLOWERS;
            }
        }

        // Bushes
        for (let i = 0; i < 25; i++) {
            const bx = Phaser.Math.Between(3, w - 4);
            const by = Phaser.Math.Between(3, h - 4);
            if (this.grid[by][bx] === T.GRASS || this.grid[by][bx] === T.GRASS_DARK) {
                this.grid[by][bx] = T.BUSH;
            }
        }

        // Shrubs
        for (let i = 0; i < 20; i++) {
            const sx = Phaser.Math.Between(3, w - 4);
            const sy = Phaser.Math.Between(3, h - 4);
            if (this.grid[sy][sx] === T.GRASS || this.grid[sy][sx] === T.GRASS_DARK) {
                this.grid[sy][sx] = T.SHRUB;
            }
        }

        // Signs
        this.grid[10][this.spawnX] = T.SIGN;
        this.collision[10][this.spawnX] = true;
    }

    _placeBorder(T, w, h) {
        for (let x = 0; x < w; x++) {
            this.grid[0][x] = T.FENCE; this.collision[0][x] = true;
            this.grid[h-1][x] = T.FENCE; this.collision[h-1][x] = true;
        }
        for (let y = 0; y < h; y++) {
            this.grid[y][0] = T.FENCE; this.collision[y][0] = true;
            this.grid[y][w-1] = T.FENCE; this.collision[y][w-1] = true;
        }
    }

    /** Check if tile at (tx, ty) is walkable */
    isWalkable(tx, ty) {
        if (tx < 0 || tx >= this.mapWidth || ty < 0 || ty >= this.mapHeight) return false;
        return !this.collision[ty][tx];
    }

    /** Get pixel size of map */
    getPixelWidth() { return this.mapWidth * this.tileSize; }
    getPixelHeight() { return this.mapHeight * this.tileSize; }

    /** Get spawn position in pixels */
    getSpawnPixelX() { return this.spawnX * this.tileSize + this.tileSize / 2; }
    getSpawnPixelY() { return this.spawnY * this.tileSize + this.tileSize / 2; }
}
