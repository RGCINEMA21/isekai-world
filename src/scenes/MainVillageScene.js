/**
 * MainVillageScene - Desa Utama ISEKAI WORLD.
 * Map 80x80 tiles (16x16px) = 1280x1280 world.
 */
class MainVillageScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainVillageScene' });
    }

    create() {
        // Tile constants
        this.TILES = {
            GRASS: 0, PATH: 1, WATER: 2, TREE: 3, ROCK: 4,
            WALL: 5, ROOF: 6, DOOR: 7, FENCE: 8, FLOWERS: 9,
            DARK_GRASS: 10, BRIDGE: 11, TALL_GRASS: 12, SAND: 13, SIGN: 14
        };
        this.TILE = 16;
        this.MAP_W = 80;
        this.MAP_H = 80;
        this.PX_W = this.MAP_W * this.TILE;
        this.PX_H = this.MAP_H * this.TILE;

        // Load save
        this.saveData = this.loadSave();

        // Generate map
        this.grid = [];
        this.buildingList = [];
        this.generateMap();

        // Render map graphics
        this.mapGfx = this.add.graphics().setDepth(0);

        // World bounds
        this.physics.world.setBounds(0, 0, this.PX_W, this.PX_H);

        // Player
        this.createPlayer();

        // Collision - use simple tile check instead of static group
        this.blockedSet = new Set([2, 3, 4, 5, 6, 8, 14]);

        // Camera
        this.cameras.main.setBounds(0, 0, this.PX_W, this.PX_H);
        this.cameras.main.startFollow(this.playerBody, true, 0.1, 0.1);
        this.cameras.main.setZoom(2);

        // Input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });

        // UI
        this.createUI();

        // Auto-save
        this.setupAutoSave();

        // Fade in
        this.cameras.main.fadeIn(500, 0, 0, 0);
    }

    /* =============================================
     *  MAP GENERATION
     * ============================================= */
    generateMap() {
        const T = this.TILES;
        const W = this.MAP_W;
        const H = this.MAP_H;

        // Fill grass
        for (let y = 0; y < H; y++) {
            this.grid[y] = [];
            for (let x = 0; x < W; x++) {
                this.grid[y][x] = T.GRASS;
            }
        }

        // River (horizontal, y ~25)
        for (let x = 0; x < W; x++) {
            const ry = 25 + Math.round(Math.sin(x * 0.1) * 2);
            this.setTile(x, ry, T.WATER);
            this.setTile(x, ry + 1, T.WATER);
        }
        // Bridge
        for (let x = 38; x <= 42; x++) {
            const ry = 25 + Math.round(Math.sin(x * 0.1) * 2);
            this.setTile(x, ry, T.BRIDGE);
            this.setTile(x, ry + 1, T.BRIDGE);
        }

        // Main paths
        for (let x = 8; x < 72; x++) { this.setTile(x, 40, T.PATH); this.setTile(x, 41, T.PATH); }
        for (let y = 8; y < 72; y++) { this.setTile(40, y, T.PATH); this.setTile(41, y, T.PATH); }
        // Cross paths
        for (let x = 25; x <= 40; x++) { this.setTile(x, 32, T.PATH); }
        for (let x = 41; x <= 58; x++) { this.setTile(x, 32, T.PATH); }
        for (let x = 25; x <= 40; x++) { this.setTile(x, 52, T.PATH); }
        for (let x = 41; x <= 58; x++) { this.setTile(x, 52, T.PATH); }
        // Path to bridge
        for (let y = 27; y <= 40; y++) { this.setTile(40, y, T.PATH); this.setTile(41, y, T.PATH); }

        // Buildings
        this.placeBuilding(32, 35, '🏠 Rumah');
        this.placeBuilding(50, 35, '📦 Gudang');
        this.placeBuilding(32, 45, '🍳 Dapur');
        this.placeBuilding(50, 45, '🌾 Pertanian');
        this.placeBuilding(25, 22, '⚔ Portal');
        this.placeBuilding(55, 22, '🐄 Ternak');
        this.placeBuilding(25, 58, '⛏ Tambang');
        this.placeBuilding(55, 58, '🎣 Memancing');

        // Forest (west)
        for (let y = 3; y < 23; y++) {
            for (let x = 3; x < 20; x++) {
                if (this.grid[y][x] === T.GRASS && Math.random() < 0.35) this.setTile(x, y, T.TREE);
            }
        }
        this.setTile(21, 12, T.SIGN);
        this.buildingList.push({ tx: 21, ty: 12, name: '🌲 Hutan' });

        // Forest (east)
        for (let y = 3; y < 20; y++) {
            for (let x = 65; x < 78; x++) {
                if (this.grid[y][x] === T.GRASS && Math.random() < 0.3) this.setTile(x, y, T.TREE);
            }
        }

        // Rocks
        for (let i = 0; i < 15; i++) {
            const rx = Phaser.Math.Between(5, 75);
            const ry = Phaser.Math.Between(5, 75);
            if (this.grid[ry][rx] === T.GRASS) this.setTile(rx, ry, T.ROCK);
        }

        // Flowers
        for (let i = 0; i < 40; i++) {
            const fx = Phaser.Math.Between(5, 75);
            const fy = Phaser.Math.Between(5, 75);
            if (this.grid[fy][fx] === T.GRASS) this.setTile(fx, fy, T.FLOWERS);
        }

        // Dark grass
        for (let i = 0; i < 15; i++) {
            const px = Phaser.Math.Between(10, 70);
            const py = Phaser.Math.Between(10, 70);
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    if (Math.random() < 0.5) this.setTile(px+dx, py+dy, T.DARK_GRASS);
                }
            }
        }

        // Fences
        for (let x = 23; x < 60; x++) {
            if (this.grid[29][x] === T.GRASS) this.setTile(x, 29, T.FENCE);
            if (this.grid[55][x] === T.GRASS) this.setTile(x, 55, T.FENCE);
        }
        for (let y = 29; y < 56; y++) {
            if (this.grid[y][23] === T.GRASS) this.setTile(23, y, T.FENCE);
            if (this.grid[y][59] === T.GRASS) this.setTile(59, y, T.FENCE);
        }
        // Gates
        this.setTile(40, 29, T.PATH); this.setTile(41, 29, T.PATH);
        this.setTile(40, 55, T.PATH); this.setTile(41, 55, T.PATH);

        // Spawn area clear
        for (let dy = -1; dy <= 2; dy++) {
            for (let dx = -1; dx <= 2; dx++) {
                const sx = 39 + dx, sy = 37 + dy;
                if (this.grid[sy] && this.grid[sy][sx] !== undefined) {
                    const t = this.grid[sy][sx];
                    if (t === T.GRASS || t === T.FLOWERS) this.setTile(sx, sy, T.PATH);
                }
            }
        }
    }

    placeBuilding(tx, ty, name) {
        const T = this.TILES;
        for (let dx = -1; dx <= 1; dx++) this.setTile(tx + dx, ty - 1, T.ROOF);
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = 0; dy <= 1; dy++) this.setTile(tx + dx, ty + dy, T.WALL);
        }
        this.setTile(tx, ty + 1, T.DOOR);
        this.setTile(tx + 2, ty + 1, T.SIGN);
        this.buildingList.push({ tx: tx + 2, ty: ty + 1, name: name });
    }

    setTile(x, y, v) {
        if (x >= 0 && x < this.MAP_W && y >= 0 && y < this.MAP_H) this.grid[y][x] = v;
    }
    getTile(x, y) {
        if (x >= 0 && x < this.MAP_W && y >= 0 && y < this.MAP_H) return this.grid[y][x];
        return -1;
    }

    /* =============================================
     *  MAP RENDERING (camera-culled)
     * ============================================= */
    renderMap() {
        const g = this.mapGfx;
        g.clear();
        const cam = this.cameras.main;
        const s = this.TILE;
        const sx = Math.max(0, Math.floor((cam.scrollX - 32) / s));
        const sy = Math.max(0, Math.floor((cam.scrollY - 32) / s));
        const ex = Math.min(this.MAP_W, Math.ceil((cam.scrollX + cam.width / cam.zoom + 32) / s));
        const ey = Math.min(this.MAP_H, Math.ceil((cam.scrollY + cam.height / cam.zoom + 32) / s));

        const C = {
            0:0x4a7c3f, 1:0x8b7355, 2:0x2255aa, 3:0x2d5a1e, 4:0x777777,
            5:0x8b6b4a, 6:0xaa3333, 7:0x5a3a1a, 8:0x6b5030, 9:0x4a7c3f,
            10:0x3d6b34, 11:0x7a6040, 12:0x558c44, 13:0xc2a64e, 14:0x8b7355
        };

        for (let y = sy; y < ey; y++) {
            for (let x = sx; x < ex; x++) {
                const t = this.grid[y][x];
                const px = x * s, py = y * s;
                g.fillStyle(C[t] || 0x4a7c3f, 1);
                g.fillRect(px, py, s, s);
                this.drawTileDetail(g, t, px, py, x, y);
            }
        }

        // Building name tags
        this.buildingList.forEach(b => {
            const bx = b.tx * s + s;
            const by = b.ty * s - 2;
            if (bx > cam.scrollX - 100 && bx < cam.scrollX + cam.width / cam.zoom + 100 &&
                by > cam.scrollY - 20 && by < cam.scrollY + cam.height / cam.zoom + 20) {
                g.fillStyle(0x3a2a10, 0.8);
                g.fillRoundedRect(bx - 28, by - 5, 56, 10, 2);
            }
        });
    }

    drawTileDetail(g, t, px, py, tx, ty) {
        const s = this.TILE;
        if (t === 2) { // Water
            g.fillStyle(0x3366bb, 0.3);
            g.fillRect(px + 3, py + 6, 8, 1);
        } else if (t === 3) { // Tree
            g.fillStyle(0x5a3a1a, 1);
            g.fillRect(px + 6, py + 10, 4, 6);
            g.fillStyle(0x2d7a1e, 1);
            g.fillCircle(px + 8, py + 7, 6);
            g.fillStyle(0x3a9a2a, 0.5);
            g.fillCircle(px + 7, py + 5, 4);
        } else if (t === 4) { // Rock
            g.fillStyle(0x999999, 0.5);
            g.fillCircle(px + 8, py + 10, 5);
        } else if (t === 5) { // Wall
            g.lineStyle(1, 0x6b4b2a, 0.3);
            g.strokeRect(px + 1, py + 1, s - 2, s - 2);
            g.fillStyle(0x88bbee, 0.4);
            g.fillRect(px + 4, py + 3, 8, 6);
        } else if (t === 6) { // Roof
            g.fillStyle(0x882222, 0.3);
            g.fillRect(px, py + 5, s, 2);
        } else if (t === 7) { // Door
            g.fillStyle(0x3a2a10, 1);
            g.fillRect(px + 3, py + 1, s - 6, s - 2);
            g.fillStyle(0xccaa44, 1);
            g.fillCircle(px + 11, py + 8, 1);
        } else if (t === 8) { // Fence
            g.fillStyle(0x5a4020, 0.5);
            g.fillRect(px + 1, py + 3, 2, s - 3);
            g.fillRect(px + s - 3, py + 3, 2, s - 3);
            g.fillRect(px, py + 6, s, 1);
            g.fillRect(px, py + 10, s, 1);
        } else if (t === 9) { // Flowers
            g.fillStyle(0xff6688, 0.8);
            g.fillCircle(px + 5, py + 7, 2);
            g.fillStyle(0xffaa33, 0.8);
            g.fillCircle(px + 11, py + 5, 2);
        } else if (t === 11) { // Bridge
            g.lineStyle(1, 0x5a4020, 0.4);
            g.lineBetween(px + 4, py, px + 4, py + s);
            g.lineBetween(px + 8, py, px + 8, py + s);
        } else if (t === 12) { // Tall grass
            g.fillStyle(0x559944, 0.5);
            g.fillRect(px + 4, py + 5, 1, 8);
            g.fillRect(px + 9, py + 7, 1, 6);
        } else if (t === 14) { // Sign
            g.fillStyle(0x5a3a1a, 1);
            g.fillRect(px + 7, py + 8, 2, 8);
            g.fillStyle(0x8b6b4a, 1);
            g.fillRect(px + 2, py + 3, 12, 7);
        }
    }

    /* =============================================
     *  PLAYER
     * ============================================= */
    createPlayer() {
        let sx = 40 * this.TILE;
        let sy = 38 * this.TILE;
        if (this.saveData?.progress?.playerX !== undefined) {
            sx = this.saveData.progress.playerX;
            sy = this.saveData.progress.playerY;
        }

        this.playerBody = this.physics.add.sprite(sx, sy, null);
        this.playerBody.setVisible(false);
        this.playerBody.setSize(8, 8);
        this.playerBody.setOffset(-4, -4);
        this.playerBody.setCollideWorldBounds(true);
        this.playerBody.setMaxVelocity(120, 120);
        this.playerBody.setDamping(true);
        this.playerBody.setDrag(0.85);

        this.playerGfx = this.add.graphics().setDepth(10);
        this.facing = 'down';
        this.isMoving = false;
        this.animFrame = 0;
        this.animTimer = 0;
    }

    drawPlayer() {
        const g = this.playerGfx;
        g.clear();
        const px = this.playerBody.x;
        const py = this.playerBody.y;
        const f = this.facing;
        const m = this.isMoving;
        const bob = m ? Math.sin(this.animFrame * Math.PI * 0.5) * 0.5 : 0;
        const y = py + bob;

        // Shadow
        g.fillStyle(0x000000, 0.2);
        g.fillEllipse(px, py + 7, 10, 4);

        const step = m && this.animFrame % 2 === 1 ? 1 : 0;
        const skin = 0xffcc99, hair = 0x442200, shirt = 0x2266aa, pants = 0x334466, boot = 0x3a2a1a;

        // Boots
        g.fillStyle(boot, 1);
        g.fillRect(px - 3, y + 3, 2, 3 + step);
        g.fillRect(px + 1, y + 3, 2, 3 - step);

        // Pants
        g.fillStyle(pants, 1);
        g.fillRect(px - 3, y - 1, 2, 5);
        g.fillRect(px + 1, y - 1, 2, 5);

        // Shirt
        g.fillStyle(shirt, 1);
        g.fillRect(px - 4, y - 6, 8, 6);

        // Arms
        const arm = m ? Math.sin(this.animFrame * Math.PI) * 2 : 0;
        g.fillStyle(skin, 1);
        g.fillRect(px - 5, y - 4 + arm, 2, 5);
        g.fillRect(px + 3, y - 4 - arm, 2, 5);

        // Head
        g.fillStyle(skin, 1);
        g.fillRect(px - 3, y - 12, 6, 7);

        // Hair
        g.fillStyle(hair, 1);
        g.fillRect(px - 3, y - 13, 6, 3);
        if (f === 'down') { g.fillRect(px - 4, y - 12, 1, 4); g.fillRect(px + 3, y - 12, 1, 4); }
        else if (f === 'up') { g.fillRect(px - 4, y - 13, 8, 4); }
        else if (f === 'left') { g.fillRect(px - 4, y - 13, 6, 3); g.fillRect(px - 4, y - 11, 1, 4); }
        else { g.fillRect(px - 2, y - 13, 6, 3); g.fillRect(px + 3, y - 11, 1, 4); }

        // Eyes
        if (f !== 'up') {
            g.fillStyle(0xffffff, 1);
            if (f === 'down') { g.fillRect(px - 2, y - 10, 2, 2); g.fillRect(px + 1, y - 10, 2, 2); }
            else if (f === 'left') { g.fillRect(px - 3, y - 10, 2, 2); }
            else { g.fillRect(px + 1, y - 10, 2, 2); }
            g.fillStyle(0x2244aa, 1);
            if (f === 'down') { g.fillRect(px - 1, y - 9, 1, 1); g.fillRect(px + 1, y - 9, 1, 1); }
            else if (f === 'left') { g.fillRect(px - 2, y - 9, 1, 1); }
            else { g.fillRect(px + 2, y - 9, 1, 1); }
        }
    }

    /* =============================================
     *  COLLISION (per-frame tile check)
     * ============================================= */
    checkCollision(body, tileX, tileY) {
        const t = this.getTile(tileX, tileY);
        return this.blockedSet.has(t);
    }

    /* =============================================
     *  UI OVERLAY
     * ============================================= */
    createUI() {
        this.uiContainer = this.add.container(0, 0).setDepth(100).setScrollFactor(0);
        const bg = this.add.graphics();
        bg.fillStyle(0x000000, 0.65);
        bg.fillRoundedRect(8, 8, 200, 130, 8);
        this.uiContainer.add(bg);

        const d = this.saveData || {};
        const p = d.player || {};
        const s = d.stats || {};
        const c = d.currency || {};
        const fs = '11px';
        const ff = 'Arial';
        const x = 16;
        let y = 16;
        const lh = 16;

        const add = (label, val, col) => {
            this.uiContainer.add(this.add.text(x, y, label, { fontSize: fs, fontFamily: ff, color: '#8888aa' }));
            this.uiContainer.add(this.add.text(x + 90, y, String(val), { fontSize: fs, fontFamily: ff, color: col || '#ffffff', fontStyle: 'bold' }));
            y += lh;
        };
        add('Nama:', p.name || '???', '#ffdd88');
        add('Level:', s.level || 1, '#44ccff');
        add('HP:', (s.hp || 100) + '/' + (s.maxHp || 100), '#44cc44');
        add('Energy:', (s.energy || 100) + '/' + (s.maxEnergy || 100), '#ffcc44');
        add('Gold:', String(c.gold || 0).replace(/\B(?=(\d{3})+(?!\d))/g, ','), '#ffaa44');
        add('Diamond:', String(c.diamond || 0), '#44ddff');
        add('Map Lv:', String(d.progress?.mapLevel || 0), '#aaaaff');
    }

    /* =============================================
     *  AUTO-SAVE
     * ============================================= */
    setupAutoSave() {
        window.addEventListener('beforeunload', () => this.saveGame());
        this.time.addEvent({ delay: 30000, loop: true, callback: () => this.saveGame() });
    }

    saveGame() {
        if (!this.saveData || !this.playerBody) return;
        this.saveData.progress.playerX = this.playerBody.x;
        this.saveData.progress.playerY = this.playerBody.y;
        try { localStorage.setItem('isekai_world_save', JSON.stringify(this.saveData)); } catch (e) {}
    }

    loadSave() {
        try { const r = localStorage.getItem('isekai_world_save'); return r ? JSON.parse(r) : null; } catch (e) { return null; }
    }

    /* =============================================
     *  UPDATE
     * ============================================= */
    update(time, delta) {
        // Movement
        let vx = 0, vy = 0;
        const spd = 100;
        if (this.cursors.left.isDown || this.wasd.left.isDown) { vx = -spd; this.facing = 'left'; }
        else if (this.cursors.right.isDown || this.wasd.right.isDown) { vx = spd; this.facing = 'right'; }
        if (this.cursors.up.isDown || this.wasd.up.isDown) { vy = -spd; this.facing = 'up'; }
        else if (this.cursors.down.isDown || this.wasd.down.isDown) { vy = spd; this.facing = 'down'; }

        // Normalize diagonal
        if (vx !== 0 && vy !== 0) { const n = spd / Math.SQRT2; vx = vx > 0 ? n : -n; vy = vy > 0 ? n : -n; }

        // Collision check before moving
        const nextX = this.playerBody.x + vx * (delta / 1000);
        const nextY = this.playerBody.y + vy * (delta / 1000);
        const ntx = Math.floor(nextX / this.TILE);
        const nty = Math.floor(nextY / this.TILE);

        // Check X movement
        const txNext = Math.floor((this.playerBody.x + vx * (delta / 1000)) / this.TILE);
        const tyCur = Math.floor(this.playerBody.y / this.TILE);
        if (this.blockedSet.has(this.getTile(txNext, tyCur))) vx = 0;

        // Check Y movement
        const txCur = Math.floor(this.playerBody.x / this.TILE);
        const tyNext = Math.floor((this.playerBody.y + vy * (delta / 1000)) / this.TILE);
        if (this.blockedSet.has(this.getTile(txCur, tyNext))) vy = 0;

        this.playerBody.setVelocity(vx, vy);
        this.isMoving = (vx !== 0 || vy !== 0);

        // Animation
        if (this.isMoving) {
            this.animTimer += delta;
            if (this.animTimer >= 150) { this.animTimer = 0; this.animFrame = (this.animFrame + 1) % 4; }
        } else {
            this.animFrame = 0;
        }

        this.drawPlayer();
        this.renderMap();
    }

    shutdown() { this.saveGame(); }
}
