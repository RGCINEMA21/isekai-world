/**
 * VillageMap - Generation of the main village tile map.
 * Uses a grid-based tile system with 16x16 pixel tiles.
 * Layout: central square with buildings arranged around it.
 */
class VillageMap {
    constructor(tileSize) {
        this.TILE = tileSize || 16;
        this.MAP_W = 100;
        this.MAP_H = 100;

        // Tile types
        this.T = {
            GRASS:0, PATH:1, WATER:2, BRIDGE:3, TREE:4, TREE_SM:5,
            ROCK:6, WALL:7, ROOF:8, DOOR:9, FENCE:10, FLOWERS:11,
            FOUNTAIN:12, LAMP:13, BENCH:14, POT:15, SHRUB:16,
            SAND:17, DARK:18, SIGN:19, BUSH:20
        };

        this.grid = [];
        this.buildings = [];
        this.decorations = [];
        this.generate();
    }

    generate() {
        const T = this.T;
        const g = this.grid;

        // Reset grid
        for (let y = 0; y < this.MAP_H; y++) {
            g[y] = [];
            for (let x = 0; x < this.MAP_W; x++) {
                g[y][x] = T.GRASS;
            }
        }

        // === LANDSCAPE FEATURES ===

        // River (diagonal from top-left to bottom-right area)
        for (let y = 10; y < 55; y++) {
            const rx = Math.floor(10 + (y - 10) * 0.15) + Math.floor(Math.sin(y * 0.25) * 2);
            if (rx >= 0 && rx < this.MAP_W) g[y][rx] = T.WATER;
            if (rx + 1 < this.MAP_W) g[y][rx + 1] = T.WATER;
        }

        // Smaller river branch
        for (let y = 55; y < 85; y++) {
            const rx = Math.floor(22 + (y - 55) * 0.3) + Math.floor(Math.sin(y * 0.2) * 1.5);
            if (rx >= 0 && rx < this.MAP_W) g[y][rx] = T.WATER;
        }

        // Bridge over river (roads cross rivers)
        for (let y = 28; y < 32; y++) {
            for (let x = 10; x < 14; x++) {
                if (x >= 0 && x < this.MAP_W && y >= 0 && y < this.MAP_H) g[y][x] = T.BRIDGE;
            }
        }

        // === ROADS (batu) ===
        // Main horizontal road (central)
        for (let y of [47, 48, 49]) {
            for (let x = 20; x < 80; x++) {
                if (x >= 0 && x < this.MAP_W && y >= 0 && y < this.MAP_H) {
                    if (g[y][x] !== T.WATER && g[y][x] !== T.BRIDGE) g[y][x] = T.PATH;
                }
            }
        }

        // Main vertical road (central)
        for (let y = 15; y < 85; y++) {
            for (let x of [47, 48, 49]) {
                if (x >= 0 && x < this.MAP_W && y >= 0 && y < this.MAP_H) {
                    if (g[y][x] !== T.WATER && g[y][x] !== T.BRIDGE) g[y][x] = T.PATH;
                }
            }
        }

        // Side roads connecting buildings
        // Horizontal roads at different Y levels
        for (let y of [30, 65]) {
            for (let x = 25; x < 75; x++) {
                if (x >= 0 && x < this.MAP_W && y >= 0 && y < this.MAP_H) {
                    if (g[y][x] !== T.WATER && g[y][x] !== T.BRIDGE) g[y][x] = T.PATH;
                }
            }
        }

        // === BUILDINGS ===
        this._addBuilding(40, 32, 'rumah',       '🏠 Rumah');
        this._addBuilding(55, 32, 'gudang',      '📦 Gudang');
        this._addBuilding(40, 55, 'pertanian',   '🌾 Pertanian');
        this._addBuilding(55, 55, 'dapur',       '🍳 Dapur');
        this._addBuilding(25, 45, 'blacksmith',  '⚒ Blacksmith');
        this._addBuilding(70, 45, 'laboratorium','🧪 Laboratorium');
        this._addBuilding(48, 22, 'portal',      '⚔ Portal Monster');
        this._addBuilding(48, 66, 'marketplace', '🛒 Marketplace');
        this._addBuilding(33, 45, 'portal_quest','📜 Portal Quest');

        // === CENTRAL FOUNTAIN (alun-alun) ===
        this._placeFountain(48, 48);

        // === DECORATIONS ===
        this._addDecorations();

        // === TREES ===
        this._placeTrees();
    }

    _addBuilding(tx, ty, id, name) {
        const T = this.T;
        const w = 5; // width in tiles
        const h = 4; // height in tiles

        for (let dy = 0; dy < h; dy++) {
            for (let dx = 0; dx < w; dx++) {
                if (ty + dy < this.MAP_H && tx + dx < this.MAP_W) {
                    if (dy === 0) {
                        this.grid[ty + dy][tx + dx] = T.ROOF;
                    } else if (dy === h - 1 && dx === Math.floor(w / 2)) {
                        this.grid[ty + dy][tx + dx] = T.DOOR;
                    } else {
                        this.grid[ty + dy][tx + dx] = T.WALL;
                    }
                }
            }
        }

        // Door position (world pixel coords)
        const doorTileX = tx + Math.floor(w / 2);
        const doorTileY = ty + h - 1;

        this.buildings.push({
            id, name, tx, ty, w, h,
            doorTileX, doorTileY,
            doorWorldX: doorTileX * this.TILE + this.TILE / 2,
            doorWorldY: doorTileY * this.TILE + this.TILE
        });
    }

    _placeFountain(cx, cy) {
        const T = this.T;
        for (let dy = -2; dy <= 2; dy++) {
            for (let dx = -2; dx <= 2; dx++) {
                const x = cx + dx;
                const y = cy + dy;
                if (x >= 0 && x < this.MAP_W && y >= 0 && y < this.MAP_H) {
                    // Path below fountain
                    if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1) {
                        this.grid[y][x] = T.FOUNTAIN;
                    } else {
                        this.grid[y][x] = T.PATH;
                    }
                }
            }
        }
    }

    _placeTrees() {
        const T = this.T;
        // Place trees around edges and in clusters
        const treeSpots = [
            // Top-left cluster
            [5,5],[6,5],[5,6],[8,8],[3,10],[4,12],
            // Top-right cluster
            [90,5],[91,6],[92,5],[88,9],[92,12],
            // Bottom-left
            [5,85],[6,86],[4,88],[8,89],[3,92],
            // Bottom-right
            [88,85],[90,86],[92,84],[89,88],[91,90],
            // Scattered near buildings
            [18,30],[22,30],[18,50],[22,50],
            [75,30],[80,30],[75,50],[80,50],
            [18,65],[22,65],[75,65],[80,65],
            // Along river
            [6,18],[8,20],[6,38],[8,40],[15,70],[17,72],
        ];

        for (const [tx, ty] of treeSpots) {
            if (tx >= 0 && tx < this.MAP_W && ty >= 0 && ty < this.MAP_H) {
                if (this.grid[ty][tx] === T.GRASS) {
                    this.grid[ty][tx] = T.TREE;
                }
            }
        }

        // Small trees
        const smallTreeSpots = [
            [15,28],[18,28],[75,28],[78,28],
            [15,52],[18,52],[75,52],[78,52],
            [28,18],[28,28],[28,50],[28,62],
            [60,18],[60,28],[60,50],[60,62],
            [35,70],[45,70],[50,70],[60,70],
        ];
        for (const [tx, ty] of smallTreeSpots) {
            if (tx >= 0 && tx < this.MAP_W && ty >= 0 && ty < this.MAP_H) {
                if (this.grid[ty][tx] === T.GRASS) {
                    this.grid[ty][tx] = T.TREE_SM;
                }
            }
        }
    }

    _addDecorations() {
        const T = this.T;

        // Flowers scattered on grass
        for (let i = 0; i < 80; i++) {
            const fx = Phaser.Math.Between(2, this.MAP_W - 3);
            const fy = Phaser.Math.Between(2, this.MAP_H - 3);
            if (this.grid[fy][fx] === T.GRASS) this.grid[fy][fx] = T.FLOWERS;
        }

        // Bushes near buildings
        const shrubSpots = [
            [35,28], [45,28], [52,28], [62,28],
            [35,52], [45,52], [52,52], [62,52],
            [28,40], [28,55], [68,40], [68,55],
            [38,75], [58,75],
        ];
        for (const [sx, sy] of shrubSpots) {
            if (sx >= 0 && sx < this.MAP_W && sy >= 0 && sy < this.MAP_H) {
                if (this.grid[sy][sx] === T.GRASS) this.grid[sy][sx] = T.SHRUB;
            }
        }

        // Lamps along main roads
        const lampSpots = [
            [35,47], [42,47], [55,47], [62,47],
            [48,28], [48,36], [48,58], [48,42],
        ];
        for (const [lx, ly] of lampSpots) {
            if (lx >= 0 && lx < this.MAP_W && ly >= 0 && ly < this.MAP_H) {
                if (this.grid[ly][lx] === T.PATH) this.grid[ly][lx] = T.LAMP;
            }
        }

        // Benches near fountain
        const benchSpots = [
            [44, 47], [52, 47], [48, 44], [48, 52]
        ];
        for (const [bx, by] of benchSpots) {
            if (bx >= 0 && bx < this.MAP_W && by >= 0 && by < this.MAP_H) {
                this.grid[by][bx] = T.BENCH;
            }
        }

        // Rocks scattered
        for (let i = 0; i < 25; i++) {
            const rx = Phaser.Math.Between(2, this.MAP_W - 3);
            const ry = Phaser.Math.Between(2, this.MAP_H - 3);
            if (this.grid[ry][rx] === T.GRASS) this.grid[ry][rx] = T.ROCK;
        }

        // Flower pots near doorways
        const potSpots = [
            [40,35], [55,35], [40,58], [55,58],
            [25,48], [70,48], [48,25], [48,69],
        ];
        for (const [px, py] of potSpots) {
            if (px >= 0 && px < this.MAP_W && py >= 0 && py < this.MAP_H) {
                if (this.grid[py][px] === T.PATH) this.grid[py][px] = T.POT;
            }
        }
    }

    getBuilding(buildingId) {
        return this.buildings.find(b => b.id === buildingId);
    }

    getBuildings() {
        return this.buildings;
    }
}
