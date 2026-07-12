/**
 * MainVillageScene - Desa Utama ISEKAI WORLD.
 * Map 100x100 tiles (16x16px) = 1600x1600 world.
 * Player berjalan, collision aktif, UI overlay, auto-save.
 */
class MainVillageScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainVillageScene' });
    }

    /* =============================================
     *  TILE CONSTANTS
     * ============================================= */
    static get T() {
        return {
            GRASS: 0, PATH: 1, WATER: 2, TREE: 3, ROCK: 4,
            WALL: 5, ROOF: 6, DOOR: 7, FENCE: 8, FLOWERS: 9,
            DARK_GRASS: 10, BRIDGE: 11, TALL_GRASS: 12, SAND: 13,
            SIGN: 14
        };
    }

    /* =============================================
     *  CREATE
     * ============================================= */
    create() {
        this.T = MainVillageScene.T;
        this.TILE = 16;
        this.MAP_W = 100;
        this.MAP_H = 100;
        this.PIXEL_W = this.MAP_W * this.TILE;
        this.PIXEL_H = this.MAP_H * this.TILE;

        // Load save data
        this.saveData = this.loadSave();

        // Generate map
        this.grid = [];
        this.buildings = [];
        this.generateMap();

        // Render map
        this.mapGraphics = this.add.graphics().setDepth(0);
        this.renderMap();

        // World bounds
        this.physics.world.setBounds(0, 0, this.PIXEL_W, this.PIXEL_H);

        // Create player
        this.createPlayer();

        // Create collision
        this.createCollision();

        // Camera
        this.cameras.main.setBounds(0, 0, this.PIXEL_W, this.PIXEL_H);
        this.cameras.main.startFollow(this.playerBody, true, 0.08, 0.08);
        this.cameras.main.setZoom(2.5);

        // UI
        this.createUI();

        // Input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });

        // Auto-save on page close
        this.setupAutoSave();

        // Fade in
        this.cameras.main.fadeIn(600, 0, 0, 0);

        // Interaction hint
        this.showNotification('Selamat datang di ' + (this.saveData?.player?.name || 'Desa Utama') + '!', 0x44cc44);
    }

    /* =============================================
     *  MAP GENERATION
     * ============================================= */
    generateMap() {
        const T = this.T;
        // Fill with grass
        for (let y = 0; y < this.MAP_H; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.MAP_W; x++) {
                this.grid[y][x] = T.GRASS;
            }
        }

        // === RIVER (flows horizontally through center-top) ===
        for (let x = 0; x < this.MAP_W; x++) {
            const ry = 30 + Math.round(Math.sin(x * 0.08) * 3);
            this.set(x, ry, T.WATER);
            this.set(x, ry + 1, T.WATER);
            if (x > 10 && x < 90) this.set(x, ry - 1, T.WATER);
        }
        // Sand around river
        for (let x = 0; x < this.MAP_W; x++) {
            const ry = 30 + Math.round(Math.sin(x * 0.08) * 3);
            for (let dy = -2; dy <= 3; dy++) {
                const ty = ry + dy;
                if (this.get(x, ty) === T.GRASS) this.set(x, ty, T.SAND);
            }
        }
        // Bridge
        for (let x = 48; x <= 52; x++) {
            this.set(x, 30 + Math.round(Math.sin(x * 0.08) * 3), T.BRIDGE);
            this.set(x, 31 + Math.round(Math.sin(x * 0.08) * 3), T.BRIDGE);
            this.set(x, 29 + Math.round(Math.sin(x * 0.08) * 3), T.BRIDGE);
        }

        // === MAIN PATHS ===
        // Horizontal main path
        for (let x = 10; x < 90; x++) { this.set(x, 50, T.PATH); this.set(x, 51, T.PATH); }
        // Vertical main path
        for (let y = 10; y < 90; y++) { this.set(50, y, T.PATH); this.set(51, y, T.PATH); }
        // Side paths to buildings
        for (let x = 30; x <= 50; x++) { this.set(x, 40, T.PATH); this.set(x, 41, T.PATH); }
        for (let x = 51; x <= 70; x++) { this.set(x, 40, T.PATH); this.set(x, 41, T.PATH); }
        for (let x = 30; x <= 50; x++) { this.set(x, 62, T.PATH); this.set(x, 63, T.PATH); }
        for (let x = 51; x <= 70; x++) { this.set(x, 62, T.PATH); this.set(x, 63, T.PATH); }
        for (let y = 41; y <= 50; y++) { this.set(30, y, T.PATH); this.set(31, y, T.PATH); }
        for (let y = 41; y <= 50; y++) { this.set(70, y, T.PATH); this.set(71, y, T.PATH); }
        for (let y = 51; y <= 62; y++) { this.set(30, y, T.PATH); this.set(31, y, T.PATH); }
        for (let y = 51; y <= 62; y++) { this.set(70, y, T.PATH); this.set(71, y, T.PATH); }

        // Path to river bridge
        for (let y = 33; y <= 50; y++) { this.set(50, y, T.PATH); this.set(51, y, T.PATH); }

        // === HOUSES & BUILDINGS ===
        this.buildBuilding(42, 44, '🏠 Rumah');
        this.buildBuilding(58, 44, '📦 Gudang');
        this.buildBuilding(42, 56, '🍳 Dapur');
        this.buildBuilding(58, 56, '🌾 Pertanian');

        // North buildings
        this.buildBuilding(35, 22, '⚔ Portal Monster');
        this.buildBuilding(62, 22, '🐄 Peternakan');

        // South buildings
        this.buildBuilding(35, 70, '⛏ Tambang');
        this.buildBuilding(62, 70, '🎣 Memancing');

        // Forest area (west)
        for (let y = 5; y < 28; y++) {
            for (let x = 3; x < 25; x++) {
                if (this.grid[y][x] === T.GRASS) {
                    if (Math.random() < 0.3) this.set(x, y, T.TREE);
                    else if (Math.random() < 0.1) this.set(x, y, T.TALL_GRASS);
                }
            }
        }
        // Forest sign
        this.set(26, 18, T.SIGN);
        this.buildings.push({ x: 26, y: 18, name: '🌲 Hutan' });

        // Forest (east edge)
        for (let y = 5; y < 25; y++) {
            for (let x = 80; x < 97; x++) {
                if (this.grid[y][x] === T.GRASS) {
                    if (Math.random() < 0.25) this.set(x, y, T.TREE);
                }
            }
        }

        // Rocks scattered
        for (let i = 0; i < 25; i++) {
            const rx = Phaser.Math.Between(5, 95);
            const ry = Phaser.Math.Between(5, 95);
            if (this.grid[ry][rx] === T.GRASS) this.set(rx, ry, T.ROCK);
        }

        // Flowers
        for (let i = 0; i < 50; i++) {
            const fx = Phaser.Math.Between(5, 95);
            const fy = Phaser.Math.Between(5, 95);
            if (this.grid[fy][fx] === T.GRASS) this.set(fx, fy, T.FLOWERS);
        }

        // Dark grass patches
        for (let i = 0; i < 20; i++) {
            const px = Phaser.Math.Between(10, 90);
            const py = Phaser.Math.Between(10, 90);
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    if (Math.random() < 0.5 && this.get(px+dx, py+dy) === T.GRASS) {
                        this.set(px+dx, py+dy, T.DARK_GRASS);
                    }
                }
            }
        }

        // Fences around village core
        for (let x = 28; x < 73; x++) {
            if (this.grid[38][x] === T.GRASS) this.set(x, 38, T.FENCE);
            if (this.grid[65][x] === T.GRASS) this.set(x, 65, T.FENCE);
        }
        for (let y = 38; y < 66; y++) {
            if (this.grid[y][28] === T.GRASS) this.set(28, y, T.FENCE);
            if (this.grid[y][72] === T.GRASS) this.set(72, y, T.FENCE);
        }
        // Gates
        this.set(50, 38, T.PATH); this.set(51, 38, T.PATH);
        this.set(50, 65, T.PATH); this.set(51, 65, T.PATH);
        this.set(28, 50, T.PATH); this.set(28, 51, T.PATH);
        this.set(72, 50, T.PATH); this.set(72, 51, T.PATH);

        // Player spawn point area - clear grass
        for (let dy = -1; dy <= 2; dy++) {
            for (let dx = -1; dx <= 2; dx++) {
                const sx = 48 + dx;
                const sy = 46 + dy;
                if (this.grid[sy] && this.grid[sy][sx] !== undefined) {
                    if (this.grid[sy][sx] === T.GRASS || this.grid[sy][sx] === T.FLOWERS) {
                        this.set(sx, sy, T.PATH);
                    }
                }
            }
        }
    }

    buildBuilding(tx, ty, name) {
        const T = this.T;
        // Roof
        for (let dx = -1; dx <= 1; dx++) this.set(tx + dx, ty - 1, T.ROOF);
        // Walls
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = 0; dy <= 1; dy++) this.set(tx + dx, ty + dy, T.WALL);
        }
        // Door
        this.set(tx, ty + 1, T.DOOR);
        // Sign nearby
        this.set(tx + 2, ty + 1, T.SIGN);
        this.buildings.push({ x: tx + 2, y: ty + 1, name: name });
    }

    set(x, y, tile) {
        if (x >= 0 && x < this.MAP_W && y >= 0 && y < this.MAP_H) this.grid[y][x] = tile;
    }
    get(x, y) {
        if (x >= 0 && x < this.MAP_W && y >= 0 && y < this.MAP_H) return this.grid[y][x];
        return -1;
    }

    /* =============================================
     *  MAP RENDERING
     * ============================================= */
    renderMap() {
        const T = this.T;
        const g = this.mapGraphics;
        g.clear();

        const cam = this.cameras.main;
        const startX = Math.max(0, Math.floor((cam.scrollX - 32) / this.TILE));
        const startY = Math.max(0, Math.floor((cam.scrollY - 32) / this.TILE));
        const endX = Math.min(this.MAP_W, Math.ceil((cam.scrollX + cam.width / cam.zoom + 32) / this.TILE));
        const endY = Math.min(this.MAP_H, Math.ceil((cam.scrollY + cam.height / cam.zoom + 32) / this.TILE));

        const COLORS = {
            [T.GRASS]: 0x4a7c3f, [T.PATH]: 0x8b7355, [T.WATER]: 0x2255aa,
            [T.TREE]: 0x2d5a1e, [T.ROCK]: 0x777777, [T.WALL]: 0x8b6b4a,
            [T.ROOF]: 0xaa3333, [T.DOOR]: 0x5a3a1a, [T.FENCE]: 0x6b5030,
            [T.FLOWERS]: 0x4a7c3f, [T.DARK_GRASS]: 0x3d6b34, [T.BRIDGE]: 0x7a6040,
            [T.TALL_GRASS]: 0x558c44, [T.SAND]: 0xc2a64e, [T.SIGN]: 0x8b7355
        };

        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                const tile = this.grid[y][x];
                const px = x * this.TILE;
                const py = y * this.TILE;
                g.fillStyle(COLORS[tile] || 0x4a7c3f, 1);
                g.fillRect(px, py, this.TILE, this.TILE);
                this.drawTile(g, tile, px, py, x, y);
            }
        }

        // Draw building name signs
        this.buildings.forEach(b => {
            const sx = b.x * this.TILE + this.TILE;
            const sy = b.y * this.TILE - 6;
            g.fillStyle(0x5a3a1a, 0.85);
            g.fillRoundedRect(sx - 30, sy - 6, 60, 12, 3);
        });
    }

    drawTile(g, tile, px, py, tx, ty) {
        const s = this.TILE;
        const T = this.T;

        switch (tile) {
            case T.WATER:
                g.fillStyle(0x3366bb, 0.3);
                g.fillRect(px + 3 + Math.sin((tx+ty)*1.5)*2, py + 6, 8, 1);
                g.fillRect(px + 7 - Math.sin((tx+ty)*1.5)*2, py + 11, 6, 1);
                break;
            case T.TREE:
                g.fillStyle(0x5a3a1a, 1);
                g.fillRect(px + 6, py + 10, 4, 6);
                g.fillStyle(0x2d7a1e, 1);
                g.fillCircle(px + 8, py + 7, 6);
                g.fillStyle(0x3a9a2a, 0.6);
                g.fillCircle(px + 7, py + 5, 4);
                break;
            case T.ROCK:
                g.fillStyle(0x888888, 1);
                g.fillCircle(px + 8, py + 10, 5);
                g.fillStyle(0xaaaaaa, 0.4);
                g.fillCircle(px + 6, py + 8, 3);
                break;
            case T.WALL:
                g.lineStyle(1, 0x6b4b2a, 0.4);
                g.strokeRect(px + 1, py + 1, s - 2, s - 2);
                g.fillStyle(0x88bbee, 0.5);
                g.fillRect(px + 4, py + 3, 8, 6);
                break;
            case T.ROOF:
                g.fillStyle(0x882222, 0.4);
                g.fillRect(px, py + 4, s, 2);
                g.fillRect(px, py + 10, s, 2);
                break;
            case T.DOOR:
                g.fillStyle(0x3a2a10, 1);
                g.fillRect(px + 3, py + 1, s - 6, s - 2);
                g.fillStyle(0xccaa44, 1);
                g.fillCircle(px + 11, py + 8, 1);
                break;
            case T.FENCE:
                g.fillStyle(0x5a4020, 0.6);
                g.fillRect(px + 1, py + 3, 2, s - 3);
                g.fillRect(px + s - 3, py + 3, 2, s - 3);
                g.fillRect(px, py + 5, s, 1);
                g.fillRect(px, py + 9, s, 1);
                break;
            case T.FLOWERS:
                const fc = [0xff6688, 0xffaa33, 0xff55cc, 0xffff55];
                for (let i = 0; i < 2; i++) {
                    g.fillStyle(fc[(tx+ty+i) % 4], 0.8);
                    g.fillCircle(px + 4 + i * 7, py + 6 + (i % 2) * 4, 2);
                }
                break;
            case T.PATH:
                g.fillStyle(0x7a6345, 0.2);
                g.fillCircle(px + ((tx*7)%10)+3, py + ((ty*13)%10)+3, 1);
                break;
            case T.BRIDGE:
                g.lineStyle(1, 0x5a4020, 0.5);
                for (let i = 0; i < 4; i++) g.lineBetween(px + i*4+2, py, px + i*4+2, py+s);
                break;
            case T.TALL_GRASS:
                g.fillStyle(0x559944, 0.6);
                g.fillRect(px + 3, py + 6, 1, 8);
                g.fillRect(px + 7, py + 4, 1, 10);
                g.fillRect(px + 11, py + 7, 1, 7);
                break;
            case T.SAND:
                g.fillStyle(0xd4b65e, 0.2);
                g.fillCircle(px + 5, py + 8, 1);
                break;
            case T.SIGN:
                g.fillStyle(0x5a3a1a, 1);
                g.fillRect(px + 7, py + 8, 2, 8);
                g.fillStyle(0x8b6b4a, 1);
                g.fillRect(px + 2, py + 3, 12, 7);
                g.lineStyle(1, 0x3a2a10, 0.6);
                g.strokeRect(px + 2, py + 3, 12, 7);
                break;
        }
    }

    /* =============================================
     *  PLAYER
     * ============================================= */
    createPlayer() {
        // Spawn position (in front of house)
        let spawnX = 48 * this.TILE + this.TILE;
        let spawnY = 46 * this.TILE + this.TILE;

        // Load saved position
        if (this.saveData?.progress?.playerX !== undefined) {
            spawnX = this.saveData.progress.playerX;
            spawnY = this.saveData.progress.playerY;
        }

        // Physics body
        this.playerBody = this.physics.add.sprite(spawnX, spawnY, null);
        this.playerBody.setVisible(false);
        this.playerBody.setSize(10, 8);
        this.playerBody.setOffset(-5, -4);
        this.playerBody.setCollideWorldBounds(true);
        this.playerBody.setMaxVelocity(120, 120);
        this.playerBody.setDamping(true);
        this.playerBody.setDrag(0.85);

        // Graphics for character
        this.playerGfx = this.add.graphics().setDepth(10);

        // State
        this.facing = 'down';
        this.isMoving = false;
        this.animFrame = 0;
        this.animTimer = 0;

        this.drawPlayer();
    }

    drawPlayer() {
        const g = this.playerGfx;
        g.clear();
        const px = this.playerBody.x;
        const py = this.playerBody.y;
        const f = this.facing;
        const moving = this.isMoving;

        const skin = 0xffcc99;
        const hair = 0x442200;
        const shirt = 0x2266aa;
        const pants = 0x334466;
        const boot = 0x3a2a1a;

        // Shadow
        g.fillStyle(0x000000, 0.2);
        g.fillEllipse(px, py + 7, 10, 4);

        // Walk bob
        const bob = moving ? Math.sin(this.animFrame * Math.PI * 0.5) * 0.5 : 0;
        const y = py + bob;

        // Boots
        const step = moving && this.animFrame % 2 === 1 ? 1 : 0;
        g.fillStyle(boot, 1);
        g.fillRect(px - 3, y + 3, 2, 3 + (f !== 'up' ? step : 0));
        g.fillRect(px + 1, y + 3, 2, 3 + (f !== 'up' ? -step : 0));

        // Pants
        g.fillStyle(pants, 1);
        g.fillRect(px - 3, y - 1, 2, 5);
        g.fillRect(px + 1, y - 1, 2, 5);

        // Shirt
        g.fillStyle(shirt, 1);
        g.fillRect(px - 4, y - 6, 8, 6);

        // Arms
        const armSwing = moving ? Math.sin(this.animFrame * Math.PI) * 2 : 0;
        g.fillStyle(skin, 1);
        g.fillRect(px - 5, y - 4 + armSwing, 2, 5);
        g.fillRect(px + 3, y - 4 - armSwing, 2, 5);

        // Head
        g.fillStyle(skin, 1);
        g.fillRect(px - 3, y - 12, 6, 7);

        // Hair
        g.fillStyle(hair, 1);
        g.fillRect(px - 3, y - 13, 6, 3);
        if (f === 'down') {
            g.fillRect(px - 4, y - 12, 1, 4);
            g.fillRect(px + 3, y - 12, 1, 4);
        } else if (f === 'up') {
            g.fillRect(px - 4, y - 13, 8, 4);
        } else if (f === 'left') {
            g.fillRect(px - 4, y - 13, 6, 3);
            g.fillRect(px - 4, y - 11, 1, 4);
        } else {
            g.fillRect(px - 2, y - 13, 6, 3);
            g.fillRect(px + 3, y - 11, 1, 4);
        }

        // Eyes
        if (f !== 'up') {
            g.fillStyle(0xffffff, 1);
            if (f === 'down') {
                g.fillRect(px - 2, y - 10, 2, 2);
                g.fillRect(px + 1, y - 10, 2, 2);
                g.fillStyle(0x2244aa, 1);
                g.fillRect(px - 1, y - 9, 1, 1);
                g.fillRect(px + 1, y - 9, 1, 1);
            } else if (f === 'left') {
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

    /* =============================================
     *  COLLISION
     * ============================================= */
    createCollision() {
        const blocked = new Set([this.T.WATER, this.T.TREE, this.T.ROCK, this.T.WALL, this.T.ROOF, this.T.FENCE, this.T.SIGN]);

        this.physics.add.collider(this.playerBody, this.createBlockedGroup(blocked));
    }

    createBlockedGroup(blocked) {
        const group = this.physics.add.staticGroup();

        // Create invisible collision bodies for blocked tiles
        // Batch into larger rectangles for performance
        const visited = [];
        for (let y = 0; y < this.MAP_H; y++) {
            visited[y] = [];
            for (let x = 0; x < this.MAP_W; x++) {
                visited[y][x] = false;
            }
        }

        for (let y = 0; y < this.MAP_H; y++) {
            for (let x = 0; x < this.MAP_W; x++) {
                if (visited[y][x]) continue;
                const tile = this.grid[y][x];
                if (!blocked.has(tile)) continue;

                // Find horizontal span
                let endX = x;
                while (endX < this.MAP_W && !visited[y][endX] && blocked.has(this.grid[y][endX])) {
                    endX++;
                }

                // Create one body for the span
                const bodyW = (endX - x) * this.TILE;
                const bodyH = this.TILE;
                const body = group.create(
                    x * this.TILE + bodyW / 2,
                    y * this.TILE + bodyH / 2,
                    null
                );
                body.setVisible(false);
                body.body.setSize(bodyW, bodyH);
                body.body.setOffset(-bodyW / 2, -bodyH / 2);
                body.refreshBody();

                for (let ix = x; ix < endX; ix++) visited[y][ix] = true;
            }
        }

        return group;
    }

    /* =============================================
     *  UI OVERLAY
     * ============================================= */
    createUI() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        const d = this.saveData || {};
        const p = d.player || {};
        const s = d.stats || {};
        const c = d.currency || {};

        // UI container (fixed to camera)
        this.uiContainer = this.add.container(0, 0).setDepth(100).setScrollFactor(0);

        // Background panel
        const bg = this.add.graphics();
        bg.fillStyle(0x000000, 0.6);
        bg.fillRoundedRect(8, 8, 220, 140, 8);
        this.uiContainer.add(bg);

        const fontSize = Math.max(10, Math.min(13, w * 0.012));
        const lineH = fontSize + 5;
        const x = 18;
        let y = 16;

        const addText = (label, value, color) => {
            this.uiContainer.add(this.add.text(x, y, label, {
                fontSize: fontSize + 'px', fontFamily: 'Arial', color: '#8888aa'
            }));
            this.uiContainer.add(this.add.text(x + 100, y, String(value), {
                fontSize: fontSize + 'px', fontFamily: 'Arial', color: color || '#ffffff', fontStyle: 'bold'
            }));
            y += lineH;
        };

        addText('Nama:', p.name || '???', '#ffdd88');
        addText('Level:', s.level || 1, '#44ccff');
        addText('HP:', (s.hp || 100) + '/' + (s.maxHp || 100), '#44cc44');
        addText('Energy:', (s.energy || 100) + '/' + (s.maxEnergy || 100), '#ffcc44');
        addText('Gold:', this.formatNum(c.gold || 0), '#ffaa44');
        addText('Diamond:', String(c.diamond || 0), '#44ddff');
        addText('Map Lv:', String(d.progress?.mapLevel || 0), '#aaaaff');
    }

    formatNum(n) {
        return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    /* =============================================
     *  NOTIFICATION
     * ============================================= */
    showNotification(text, color) {
        const w = this.cameras.main.width;
        const notif = this.add.text(w / 2, 50, text, {
            fontSize: '14px', fontFamily: 'Arial', color: '#' + (color || 0xffffff).toString(16).padStart(6, '0'),
            fontStyle: 'bold', stroke: '#000000', strokeThickness: 3
        }).setOrigin(0.5).setDepth(200).setScrollFactor(0).setAlpha(0);

        this.tweens.add({
            targets: notif, alpha: 1, y: 40, duration: 400, ease: 'Power2',
            onComplete: () => {
                this.tweens.add({
                    targets: notif, alpha: 0, y: 30, duration: 500, delay: 1500,
                    onComplete: () => notif.destroy()
                });
            }
        });
    }

    /* =============================================
     *  AUTO-SAVE
     * ============================================= */
    setupAutoSave() {
        this.saveGame();

        window.addEventListener('beforeunload', () => {
            this.saveGame();
        });

        // Auto-save every 30 seconds
        this.time.addEvent({
            delay: 30000, loop: true,
            callback: () => this.saveGame()
        });
    }

    saveGame() {
        if (!this.saveData) return;
        if (this.playerBody) {
            this.saveData.progress.playerX = this.playerBody.x;
            this.saveData.progress.playerY = this.playerBody.y;
        }
        try {
            localStorage.setItem('isekai_world_save', JSON.stringify(this.saveData));
        } catch (e) { /* silent */ }
    }

    loadSave() {
        try {
            const raw = localStorage.getItem('isekai_world_save');
            return raw ? JSON.parse(raw) : null;
        } catch (e) { return null; }
    }

    /* =============================================
     *  UPDATE (per frame)
     * ============================================= */
    update(time, delta) {
        this.handleMovement();
        this.updatePlayerGraphics();
        this.renderMap();

        // Update UI text with current values
        if (this.saveData && this.uiContainer) {
            // UI is static for now, will update on scene restart
        }
    }

    handleMovement() {
        let vx = 0, vy = 0;
        const speed = 100;

        if (this.cursors.left.isDown || this.wasd.left.isDown) { vx = -speed; this.facing = 'left'; }
        else if (this.cursors.right.isDown || this.wasd.right.isDown) { vx = speed; this.facing = 'right'; }

        if (this.cursors.up.isDown || this.wasd.up.isDown) { vy = -speed; this.facing = 'up'; }
        else if (this.cursors.down.isDown || this.wasd.down.isDown) { vy = speed; this.facing = 'down'; }

        this.playerBody.setVelocity(vx, vy);
        this.isMoving = (vx !== 0 || vy !== 0);

        if (vx !== 0 && vy !== 0) {
            this.playerBody.velocity.normalize().scale(speed);
        }

        // Animation
        if (this.isMoving) {
            this.animTimer += this.game.loop.delta;
            if (this.animTimer >= 150) {
                this.animTimer = 0;
                this.animFrame = (this.animFrame + 1) % 4;
            }
        } else {
            this.animFrame = 0;
        }
    }

    updatePlayerGraphics() {
        this.drawPlayer();
    }

    /* =============================================
     *  CLEANUP
     * ============================================= */
    shutdown() {
        this.saveGame();
    }
}
