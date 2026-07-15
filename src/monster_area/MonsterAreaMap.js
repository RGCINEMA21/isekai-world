/**
 * MonsterAreaMap - Tile-based map generator with theme support.
 * Different themes produce different terrain colors and features.
 * Reusable template for all 10 monster areas.
 */
class MonsterAreaMap {
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
            GROUND:0, GROUND_DARK:1, PATH:2, WATER:3, BRIDGE:4,
            TREE:5, TREE_SM:6, ROCK:7, ROCK_SM:8, FENCE:9,
            FLOWERS:10, BUSH:11, HILL:12, SPECIAL:13, SAND:14,
            BORDER:15
        };

        this.grid = [];
        this.collision = [];
        this.themeColors = this._getThemeColors();

        this.generate();
    }

    _getThemeColors() {
        const themes = {
            grassland: {
                ground: 0x5a9a3a, groundDark: 0x4a8a2a, path: 0xc4a86a,
                tree: 0x2d7a1e, treeTrunk: 0x5a3a1a, rock: 0x888888,
                water: 0x3388cc, hill: 0x6aaa4a, fence: 0x8b6b4a
            },
            valley: {
                ground: 0x7aaa3a, groundDark: 0x6a9a2a, path: 0xbbaa66,
                tree: 0x558822, treeTrunk: 0x6a4a1a, rock: 0x998877,
                water: 0x4499bb, hill: 0x8aaa5a, fence: 0x8b6b4a
            },
            forest: {
                ground: 0x2d6a1e, groundDark: 0x1d5a0e, path: 0x8a7a5a,
                tree: 0x1a4a0a, treeTrunk: 0x4a2a0a, rock: 0x667766,
                water: 0x2266aa, hill: 0x3a7a2a, fence: 0x6a5a3a
            },
            canyon: {
                ground: 0x8a7a5a, groundDark: 0x7a6a4a, path: 0xaa9966,
                tree: 0x665533, treeTrunk: 0x5a3a1a, rock: 0x999988,
                water: 0x5588aa, hill: 0x9a8a6a, fence: 0x7a6a4a
            },
            snow: {
                ground: 0xccddcc, groundDark: 0xbbccbb, path: 0xaabbcc,
                tree: 0x446644, treeTrunk: 0x5a3a1a, rock: 0x99aabb,
                water: 0x6688cc, hill: 0xddddcc, fence: 0x8899aa
            },
            volcano: {
                ground: 0x6a3a1a, groundDark: 0x5a2a0a, path: 0x8a6a4a,
                tree: 0x443322, treeTrunk: 0x3a2a0a, rock: 0x555555,
                water: 0xcc4422, hill: 0x7a4a2a, fence: 0x5a4a3a
            },
            cave: {
                ground: 0x4a3a5a, groundDark: 0x3a2a4a, path: 0x6a5a7a,
                tree: 0x5544aa, treeTrunk: 0x3a2a4a, rock: 0x667788,
                water: 0x4466aa, hill: 0x5a4a6a, fence: 0x4a4a5a
            },
            ruins: {
                ground: 0x554488, groundDark: 0x443377, path: 0x7766aa,
                tree: 0x6655bb, treeTrunk: 0x4a3a6a, rock: 0x8888aa,
                water: 0x5577cc, hill: 0x6655aa, fence: 0x5a5a7a
            },
            swamp: {
                ground: 0x2a3a2a, groundDark: 0x1a2a1a, path: 0x4a5a3a,
                tree: 0x1a3a1a, treeTrunk: 0x2a1a0a, rock: 0x445544,
                water: 0x334433, hill: 0x3a4a3a, fence: 0x3a3a2a
            },
            dragon: {
                ground: 0x3a1a2a, groundDark: 0x2a0a1a, path: 0x5a3a4a,
                tree: 0x4a1a2a, treeTrunk: 0x2a0a0a, rock: 0x554455,
                water: 0x662244, hill: 0x4a2a3a, fence: 0x4a2a3a
            }
        };
        return themes[this.theme] || themes.grassland;
    }

    generate() {
        const T = this.T;
        const w = this.mapWidth;
        const h = this.mapHeight;

        for (let y = 0; y < h; y++) {
            this.grid[y] = [];
            this.collision[y] = [];
            for (let x = 0; x < w; x++) {
                this.grid[y][x] = T.GROUND;
                this.collision[y][x] = false;
            }
        }

        // Ground variation
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                if (Math.random() < 0.25) this.grid[y][x] = T.GROUND_DARK;
            }
        }

        // Water features
        this._addWater(T, w, h);

        // Paths
        this._addPaths(T, w, h);

        // Collision objects
        this._addCollisionObjects(T, w, h);

        // Decorations
        this._addDecorations(T, w, h);

        // Border
        this._addBorder(T, w, h);
    }

    _addWater(T, w, h) {
        const waterType = this.theme === 'swamp' ? 0.08 : 0.04;
        // River
        for (let x = 5; x < w * 0.3; x++) {
            const y = Math.floor(h * 0.2 + Math.sin(x * 0.3) * 3);
            if (y >= 0 && y < h) {
                this.grid[y][x] = T.WATER; this.collision[y][x] = true;
                if (y+1 < h) { this.grid[y+1][x] = T.WATER; this.collision[y+1][x] = true; }
            }
        }
        // Bridge
        for (let x = Math.floor(w*0.15); x < Math.floor(w*0.15)+4; x++) {
            for (let dy = -1; dy <= 2; dy++) {
                const y = Math.floor(h*0.2) + dy;
                if (y >= 0 && y < h) { this.grid[y][x] = T.BRIDGE; this.collision[y][x] = false; }
            }
        }
        // Pond
        const px = Math.floor(w * 0.75);
        const py = Math.floor(h * 0.3);
        for (let dy = -2; dy <= 2; dy++) {
            for (let dx = -3; dx <= 3; dx++) {
                if (dx*dx + dy*dy <= 7) {
                    const x = px+dx, y = py+dy;
                    if (x > 0 && x < w-1 && y > 0 && y < h-1) {
                        this.grid[y][x] = T.WATER; this.collision[y][x] = true;
                    }
                }
            }
        }
    }

    _addPaths(T, w, h) {
        // Main horizontal
        for (let x = 5; x < w-5; x++) {
            if (this.grid[this.spawnY][x] !== T.WATER && this.grid[this.spawnY][x] !== T.BRIDGE) {
                this.grid[this.spawnY][x] = T.PATH; this.collision[this.spawnY][x] = false;
            }
        }
        // Main vertical
        for (let y = 10; y < h-5; y++) {
            if (this.grid[y][this.spawnX] !== T.WATER && this.grid[y][this.spawnX] !== T.BRIDGE) {
                this.grid[y][this.spawnX] = T.PATH; this.collision[y][this.spawnX] = false;
            }
        }
        // Branches
        const branchY1 = Math.floor(h * 0.4);
        const branchY2 = Math.floor(h * 0.6);
        for (let x = Math.floor(w*0.2); x < Math.floor(w*0.6); x++) {
            if (this.grid[branchY1][x] === T.GROUND || this.grid[branchY1][x] === T.GROUND_DARK) {
                this.grid[branchY1][x] = T.PATH;
            }
        }
        const branchX1 = Math.floor(w * 0.3);
        const branchX2 = Math.floor(w * 0.7);
        for (let y = Math.floor(h*0.25); y < Math.floor(h*0.65); y++) {
            if (this.grid[y][branchX1] === T.GROUND || this.grid[y][branchX1] === T.GROUND_DARK) {
                this.grid[y][branchX1] = T.PATH;
            }
            if (this.grid[y][branchX2] === T.GROUND || this.grid[y][branchX2] === T.GROUND_DARK) {
                this.grid[y][branchX2] = T.PATH;
            }
        }
    }

    _addCollisionObjects(T, w, h) {
        // Trees
        for (let i = 0; i < Math.floor(w * h * 0.008); i++) {
            const tx = Phaser.Math.Between(3, w-4);
            const ty = Phaser.Math.Between(3, h-4);
            if (this.grid[ty][tx] === T.GROUND || this.grid[ty][tx] === T.GROUND_DARK) {
                this.grid[ty][tx] = T.TREE; this.collision[ty][tx] = true;
            }
        }
        // Small trees
        for (let i = 0; i < Math.floor(w * h * 0.005); i++) {
            const tx = Phaser.Math.Between(3, w-4);
            const ty = Phaser.Math.Between(3, h-4);
            if (this.grid[ty][tx] === T.GROUND || this.grid[ty][tx] === T.GROUND_DARK) {
                this.grid[ty][tx] = T.TREE_SM; this.collision[ty][tx] = true;
            }
        }
        // Rocks
        for (let i = 0; i < Math.floor(w * h * 0.003); i++) {
            const tx = Phaser.Math.Between(3, w-4);
            const ty = Phaser.Math.Between(3, h-4);
            if (this.grid[ty][tx] === T.GROUND || this.grid[ty][tx] === T.GROUND_DARK) {
                this.grid[ty][tx] = T.ROCK; this.collision[ty][tx] = true;
            }
        }
        // Fences
        for (let i = 0; i < 12; i++) {
            const tx = Phaser.Math.Between(5, w-6);
            const ty = Phaser.Math.Between(5, h-6);
            const horiz = Math.random() > 0.5;
            const len = Phaser.Math.Between(3, 6);
            for (let j = 0; j < len; j++) {
                const fx = horiz ? tx+j : tx;
                const fy = horiz ? ty : ty+j;
                if (fx > 0 && fx < w-1 && fy > 0 && fy < h-1) {
                    if (this.grid[fy][fx] === T.GROUND || this.grid[fy][fx] === T.GROUND_DARK) {
                        this.grid[fy][fx] = T.FENCE; this.collision[fy][fx] = true;
                    }
                }
            }
        }
        // Clear spawn
        for (let dy = -2; dy <= 2; dy++) {
            for (let dx = -2; dx <= 2; dx++) {
                const x = this.spawnX+dx, y = this.spawnY+dy;
                if (x >= 0 && x < w && y >= 0 && y < h) {
                    if (this.collision[y][x]) { this.grid[y][x] = T.GROUND; this.collision[y][x] = false; }
                }
            }
        }
    }

    _addDecorations(T, w, h) {
        for (let i = 0; i < 50; i++) {
            const fx = Phaser.Math.Between(2, w-3);
            const fy = Phaser.Math.Between(2, h-3);
            if (this.grid[fy][fx] === T.GROUND || this.grid[fy][fx] === T.GROUND_DARK) {
                this.grid[fy][fx] = T.FLOWERS;
            }
        }
        for (let i = 0; i < 20; i++) {
            const bx = Phaser.Math.Between(3, w-4);
            const by = Phaser.Math.Between(3, h-4);
            if (this.grid[by][bx] === T.GROUND || this.grid[by][bx] === T.GROUND_DARK) {
                this.grid[by][bx] = T.BUSH;
            }
        }
        for (let i = 0; i < 20; i++) {
            const rx = Phaser.Math.Between(2, w-3);
            const ry = Phaser.Math.Between(2, h-3);
            if (this.grid[ry][rx] === T.GROUND || this.grid[ry][rx] === T.GROUND_DARK) {
                this.grid[ry][rx] = T.ROCK_SM;
            }
        }
    }

    _addBorder(T, w, h) {
        for (let x = 0; x < w; x++) {
            this.grid[0][x] = T.BORDER; this.collision[0][x] = true;
            this.grid[h-1][x] = T.BORDER; this.collision[h-1][x] = true;
        }
        for (let y = 0; y < h; y++) {
            this.grid[y][0] = T.BORDER; this.collision[y][0] = true;
            this.grid[y][w-1] = T.BORDER; this.collision[y][w-1] = true;
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
