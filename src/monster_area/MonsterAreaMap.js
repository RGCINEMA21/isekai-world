/**
 * MonsterAreaMap - Tile-based map generator for monster areas.
 * Generates terrain, collision data, and decoration.
 * Optimized for 25x25 tile maps.
 */
class MonsterAreaMap {
    constructor(config) {
        this.areaId = config.areaId || 'beginner_grassland';
        this.areaName = config.areaName || 'Beginner Grassland';
        this.tileSize = config.tileSize || 16;
        this.mapWidth = config.mapWidth || 25;
        this.mapHeight = config.mapHeight || 25;
        this.theme = config.theme || 'grassland';
        this.spawnX = config.spawnX || 12;
        this.spawnY = config.spawnY || 22;

        this.T = {
            GRASS: 0, GRASS_DARK: 1, PATH: 2, WATER: 3, BRIDGE: 4,
            TREE: 5, TREE_SM: 6, ROCK: 7, ROCK_SM: 8, FENCE: 9,
            FLOWERS: 10, SHRUB: 11, HILL: 12, BUSH: 13, SAND: 14,
            WALL: 15, SIGN: 16
        };

        this.collision = [];
        this.grid = [];
        this.generate();
    }

    generate() {
        const T = this.T;
        const w = this.mapWidth;
        const h = this.mapHeight;

        // Init
        for (let y = 0; y < h; y++) {
            this.grid[y] = [];
            this.collision[y] = [];
            for (let x = 0; x < w; x++) {
                this.grid[y][x] = T.GRASS;
                this.collision[y][x] = false;
            }
        }

        this._generateTerrain(T, w, h);
        this._generateWater(T, w, h);
        this._generatePaths(T, w, h);
        this._placeCollisionObjects(T, w, h);
        this._placeDecorations(T, w, h);
        this._placeBorder(T, w, h);
    }

    _generateTerrain(T, w, h) {
        // Grass variation
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                if (Math.random() < 0.2) this.grid[y][x] = T.GRASS_DARK;
            }
        }
        // Hills
        for (let i = 0; i < 4; i++) {
            const cx = Phaser.Math.Between(4, w - 5);
            const cy = Phaser.Math.Between(4, h - 5);
            const r = Phaser.Math.Between(2, 3);
            for (let dy = -r; dy <= r; dy++) {
                for (let dx = -r; dx <= r; dx++) {
                    if (dx * dx + dy * dy <= r * r) {
                        const x = cx + dx;
                        const y = cy + dy;
                        if (x > 0 && x < w - 1 && y > 0 && y < h - 1) {
                            this.grid[y][x] = T.HILL;
                        }
                    }
                }
            }
        }
    }

    _generateWater(T, w, h) {
        // Small pond near top-right
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -2; dx <= 2; dx++) {
                if (dx * dx + dy * dy <= 4) {
                    const x = w - 5 + dx;
                    const y = 5 + dy;
                    if (x > 0 && x < w - 1 && y > 0 && y < h - 1) {
                        this.grid[y][x] = T.WATER;
                        this.collision[y][x] = true;
                    }
                }
            }
        }
        // Bridge
        for (let dx = -1; dx <= 1; dx++) {
            const bx = w - 5 + dx;
            const by = 7;
            if (bx > 0 && bx < w - 1 && by < h - 1) {
                this.grid[by][bx] = T.BRIDGE;
                this.collision[by][bx] = false;
            }
        }
    }

    _generatePaths(T, w, h) {
        const cx = Math.floor(w / 2);
        const cy = Math.floor(h / 2);

        // Main horizontal path through center
        for (let x = 2; x < w - 2; x++) {
            this.grid[cy][x] = T.PATH;
            this.collision[cy][x] = false;
        }

        // Main vertical path
        for (let y = 2; y < h - 2; y++) {
            this.grid[y][cx] = T.PATH;
            this.collision[y][cx] = false;
        }

        // Path from spawn to center
        for (let y = Math.min(this.spawnY, h - 3); y >= cy; y--) {
            if (this.grid[y][cx] !== T.WATER) {
                this.grid[y][cx] = T.PATH;
                this.collision[y][cx] = false;
            }
        }
    }

    _placeCollisionObjects(T, w, h) {
        // Trees (limited for small map)
        for (let i = 0; i < 12; i++) {
            const tx = Phaser.Math.Between(3, w - 4);
            const ty = Phaser.Math.Between(3, h - 4);
            if (this.grid[ty][tx] === T.GRASS || this.grid[ty][tx] === T.GRASS_DARK) {
                this.grid[ty][tx] = T.TREE;
                this.collision[ty][tx] = true;
            }
        }

        // Small trees
        for (let i = 0; i < 8; i++) {
            const tx = Phaser.Math.Between(3, w - 4);
            const ty = Phaser.Math.Between(3, h - 4);
            if (this.grid[ty][tx] === T.GRASS || this.grid[ty][tx] === T.GRASS_DARK) {
                this.grid[ty][tx] = T.TREE_SM;
                this.collision[ty][tx] = true;
            }
        }

        // Rocks
        for (let i = 0; i < 6; i++) {
            const tx = Phaser.Math.Between(3, w - 4);
            const ty = Phaser.Math.Between(3, h - 4);
            if (this.grid[ty][tx] === T.GRASS || this.grid[ty][tx] === T.GRASS_DARK) {
                this.grid[ty][tx] = T.ROCK;
                this.collision[ty][tx] = true;
            }
        }

        // Fences (small segments)
        for (let i = 0; i < 4; i++) {
            const tx = Phaser.Math.Between(4, w - 5);
            const ty = Phaser.Math.Between(4, h - 5);
            const len = Phaser.Math.Between(2, 3);
            const horizontal = Math.random() > 0.5;
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

        // Ensure spawn area is clear (5x5 area)
        for (let dy = -2; dy <= 2; dy++) {
            for (let dx = -2; dx <= 2; dx++) {
                const x = this.spawnX + dx;
                const y = this.spawnY + dy;
                if (x >= 0 && x < w && y >= 0 && y < h) {
                    this.grid[y][x] = T.GRASS;
                    this.collision[y][x] = false;
                }
            }
        }

        // Ensure center cross path is clear
        const cx = Math.floor(w / 2);
        const cy = Math.floor(h / 2);
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const x = cx + dx;
                const y = cy + dy;
                if (x >= 0 && x < w && y >= 0 && y < h) {
                    this.grid[y][x] = T.PATH;
                    this.collision[y][x] = false;
                }
            }
        }
    }

    _placeDecorations(T, w, h) {
        // Flowers
        for (let i = 0; i < 15; i++) {
            const fx = Phaser.Math.Between(2, w - 3);
            const fy = Phaser.Math.Between(2, h - 3);
            if (this.grid[fy][fx] === T.GRASS || this.grid[fy][fx] === T.GRASS_DARK) {
                this.grid[fy][fx] = T.FLOWERS;
            }
        }

        // Bushes
        for (let i = 0; i < 6; i++) {
            const bx = Phaser.Math.Between(3, w - 4);
            const by = Phaser.Math.Between(3, h - 4);
            if (this.grid[by][bx] === T.GRASS || this.grid[by][bx] === T.GRASS_DARK) {
                this.grid[by][bx] = T.BUSH;
            }
        }

        // Shrubs
        for (let i = 0; i < 5; i++) {
            const sx = Phaser.Math.Between(3, w - 4);
            const sy = Phaser.Math.Between(3, h - 4);
            if (this.grid[sy][sx] === T.GRASS || this.grid[sy][sx] === T.GRASS_DARK) {
                this.grid[sy][sx] = T.SHRUB;
            }
        }

        // Small rocks
        for (let i = 0; i < 8; i++) {
            const rx = Phaser.Math.Between(2, w - 3);
            const ry = Phaser.Math.Between(2, h - 3);
            if (this.grid[ry][rx] === T.GRASS || this.grid[ry][rx] === T.GRASS_DARK) {
                this.grid[ry][rx] = T.ROCK_SM;
            }
        }

        // Sign near spawn
        const signX = this.spawnX;
        const signY = this.spawnY - 3;
        if (signX > 0 && signX < w - 1 && signY > 0 && signY < h - 1) {
            this.grid[signY][signX] = T.SIGN;
            this.collision[signY][signX] = true;
        }
    }

    _placeBorder(T, w, h) {
        for (let x = 0; x < w; x++) {
            this.grid[0][x] = T.FENCE; this.collision[0][x] = true;
            this.grid[h - 1][x] = T.FENCE; this.collision[h - 1][x] = true;
        }
        for (let y = 0; y < h; y++) {
            this.grid[y][0] = T.FENCE; this.collision[y][0] = true;
            this.grid[y][w - 1] = T.FENCE; this.collision[y][w - 1] = true;
        }
    }

    isWalkable(tx, ty) {
        if (tx < 0 || tx >= this.mapWidth || ty < 0 || ty >= this.mapHeight) return false;
        return !this.collision[ty][tx];
    }

    getPixelWidth() { return this.mapWidth * this.tileSize; }
    getPixelHeight() { return this.mapHeight * this.tileSize; }
    getSpawnPixelX() { return this.spawnX * this.tileSize + this.tileSize / 2; }
    getSpawnPixelY() { return this.spawnY * this.tileSize + this.tileSize / 2; }
}
