/**
 * MainVillageScene - Village Mode (FINAL).
 * Kamera bergerak, tidak ada karakter.
 * Klik bangunan/NPC → interaksi instan.
 * Drag untuk geser, scroll/pinch untuk zoom.
 */
class MainVillageScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainVillageScene' });
    }

    create() {
        // Map constants
        this.TILES = { GRASS:0, PATH:1, WATER:2, TREE:3, ROCK:4, WALL:5, ROOF:6, DOOR:7, FENCE:8, FLOWERS:9, DARK:10, BRIDGE:11, TALL:12, SAND:13, SIGN:14 };
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

        // Render map
        this.mapGfx = this.add.graphics().setDepth(0);

        // Buildings (clickable)
        this.buildingZones = [];
        this.createBuildingZones();

        // NPCs
        this.npcs = [];
        this.createNPCs();

        // Camera setup (Village Mode)
        this.setupCamera();

        // Drag to pan
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.camStartX = 0;
        this.camStartY = 0;

        this.input.on('pointerdown', (p) => this.onDragStart(p));
        this.input.on('pointermove', (p) => this.onDragMove(p));
        this.input.on('pointerup', () => this.onDragEnd());

        // Zoom (scroll wheel)
        this.input.on('wheel', (pointer, gameObjects, dx, dy) => {
            const newZoom = Phaser.Math.Clamp(this.cameras.main.zoom - dy * 0.001, 0.5, 3);
            this.cameras.main.zoom = newZoom;
        });

        // Pinch zoom (mobile)
        this.lastPinchDist = 0;
        this.input.on('pointermove', (p) => {
            if (this.input.pointer1.isDown && this.input.pointer2.isDown) {
                const d = Phaser.Math.Distance.Between(
                    this.input.pointer1.x, this.input.pointer1.y,
                    this.input.pointer2.x, this.input.pointer2.y
                );
                if (this.lastPinchDist > 0) {
                    const diff = d - this.lastPinchDist;
                    const newZoom = Phaser.Math.Clamp(this.cameras.main.zoom + diff * 0.005, 0.5, 3);
                    this.cameras.main.zoom = newZoom;
                }
                this.lastPinchDist = d;
            }
        });
        this.input.on('pointerup', () => { this.lastPinchDist = 0; });

        // UI
        this.createUI();

        // Inventory
        this.inventory = InventorySave.load(20);
        this.invUI = new InventoryUI(this, this.inventory);
        this.touchInventory = false;

        // Keyboard: I/B for inventory
        this.keys = this.input.keyboard.addKeys({ inventory: 'I' });
        this.input.keyboard.on('keydown-B', () => this.toggleInventory());
        this.input.keyboard.on('keydown-I', () => this.toggleInventory());

        // Fade in
        this.cameras.main.fadeIn(500, 0, 0, 0);
    }

    /* =============================================
     *  CAMERA (Village Mode)
     * ============================================= */
    setupCamera() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        this.isPortrait = h > w;

        this.cameras.main.setBounds(0, 0, this.PX_W, this.PX_H);

        // Start centered on village
        this.cameras.main.scrollX = this.PX_W / 2 - w / 2;
        this.cameras.main.scrollY = this.PX_H / 2 - h / 2;

        // Initial zoom
        if (this.isPortrait) {
            this.cameras.main.setZoom(Math.min(w / 400, h / 600));
        } else {
            this.cameras.main.setZoom(Math.min(w / 600, h / 400));
        }
    }

    onDragStart(ptr) {
        this.isDragging = true;
        this.dragStartX = ptr.x;
        this.dragStartY = ptr.y;
        this.camStartX = this.cameras.main.scrollX;
        this.camStartY = this.cameras.main.scrollY;
    }

    onDragMove(ptr) {
        if (!this.isDragging) return;
        const zoom = this.cameras.main.zoom;
        const dx = (this.dragStartX - ptr.x) / zoom;
        const dy = (this.dragStartY - ptr.y) / zoom;
        this.cameras.main.scrollX = Phaser.Math.Clamp(this.camStartX + dx, 0, this.PX_W - this.cameras.main.width / zoom);
        this.cameras.main.scrollY = Phaser.Math.Clamp(this.camStartY + dy, 0, this.PX_H - this.cameras.main.height / zoom);
    }

    onDragEnd() {
        this.isDragging = false;
    }

    /* =============================================
     *  MAP GENERATION
     * ============================================= */
    generateMap() {
        const T = this.TILES;
        for (let y = 0; y < this.MAP_H; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.MAP_W; x++) this.grid[y][x] = T.GRASS;
        }

        // River
        for (let x = 0; x < this.MAP_W; x++) {
            const ry = 25 + Math.round(Math.sin(x * 0.1) * 2);
            this.set(x, ry, T.WATER); this.set(x, ry + 1, T.WATER);
        }
        for (let x = 38; x <= 42; x++) {
            const ry = 25 + Math.round(Math.sin(x * 0.1) * 2);
            this.set(x, ry, T.BRIDGE); this.set(x, ry + 1, T.BRIDGE);
        }

        // Main paths
        for (let x = 8; x < 72; x++) { this.set(x, 40, T.PATH); this.set(x, 41, T.PATH); }
        for (let y = 8; y < 72; y++) { this.set(40, y, T.PATH); this.set(41, y, T.PATH); }
        for (let x = 25; x <= 58; x++) { this.set(x, 32, T.PATH); this.set(x, 52, T.PATH); }
        for (let y = 32; y <= 52; y++) { this.set(25, y, T.PATH); this.set(58, y, T.PATH); }

        // Buildings
        this.placeBuilding(32, 35, '🏠 Rumah',       'rumah');
        this.placeBuilding(50, 35, '📦 Gudang',       'gudang');
        this.placeBuilding(32, 45, '🍳 Dapur',        'dapur');
        this.placeBuilding(50, 45, '🌾 Pertanian',    'pertanian');
        this.placeBuilding(25, 22, '⚔ Portal',       'portal');
        this.placeBuilding(55, 22, '🐄 Ternak',       'peternakan');
        this.placeBuilding(25, 58, '⛏ Tambang',       'tambang');
        this.placeBuilding(55, 58, '🎣 Memancing',     'memancing');

        // Extra buildings (placeholder locations)
        this.placeBuilding(38, 33, '⚒ Blacksmith',    'blacksmith');
        this.placeBuilding(44, 33, '🧪 Laboratorium',  'lab');
        this.placeBuilding(38, 50, '🏪 Marketplace',   'marketplace');
        this.placeBuilding(44, 50, '🏛 Guild Hall',    'guild');

        // Forest west
        for (let y = 3; y < 20; y++) for (let x = 3; x < 18; x++) {
            if (this.grid[y][x] === T.GRASS && Math.random() < 0.35) this.set(x, y, T.TREE);
        }
        this.set(19, 12, T.SIGN); this.buildingList.push({ tx: 19, ty: 12, name: '🌲 Hutan', id: 'hutan' });

        // Forest east
        for (let y = 3; y < 18; y++) for (let x = 65; x < 78; x++) {
            if (this.grid[y][x] === T.GRASS && Math.random() < 0.3) this.set(x, y, T.TREE);
        }

        // Rocks, flowers, dark grass
        for (let i = 0; i < 15; i++) {
            const rx = Phaser.Math.Between(5, 75), ry = Phaser.Math.Between(5, 75);
            if (this.grid[ry][rx] === T.GRASS) this.set(rx, ry, T.ROCK);
        }
        for (let i = 0; i < 40; i++) {
            const fx = Phaser.Math.Between(5, 75), fy = Phaser.Math.Between(5, 75);
            if (this.grid[fy][fx] === T.GRASS) this.set(fx, fy, T.FLOWERS);
        }
        for (let i = 0; i < 15; i++) {
            const px = Phaser.Math.Between(10, 70), py = Phaser.Math.Between(10, 70);
            for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
                if (Math.random() < 0.5) this.set(px+dx, py+dy, T.DARK);
            }
        }

        // Fences
        for (let x = 23; x < 60; x++) {
            if (this.grid[29][x] === T.GRASS) this.set(x, 29, T.FENCE);
            if (this.grid[55][x] === T.GRASS) this.set(x, 55, T.FENCE);
        }
        for (let y = 29; y < 56; y++) {
            if (this.grid[y][23] === T.GRASS) this.set(23, y, T.FENCE);
            if (this.grid[y][59] === T.GRASS) this.set(59, y, T.FENCE);
        }
        this.set(40, 29, T.PATH); this.set(41, 29, T.PATH);
        this.set(40, 55, T.PATH); this.set(41, 55, T.PATH);
    }

    placeBuilding(tx, ty, name, id) {
        const T = this.TILES;
        for (let dx = -1; dx <= 1; dx++) this.set(tx+dx, ty-1, T.ROOF);
        for (let dx = -1; dx <= 1; dx++) for (let dy = 0; dy <= 1; dy++) this.set(tx+dx, ty+dy, T.WALL);
        this.set(tx, ty+1, T.DOOR);
        this.set(tx+2, ty+1, T.SIGN);
        this.buildingList.push({ tx: tx+2, ty: ty+1, name, id });
    }

    set(x, y, v) { if (x >= 0 && x < this.MAP_W && y >= 0 && y < this.MAP_H) this.grid[y][x] = v; }
    get(x, y) { return (x >= 0 && x < this.MAP_W && y >= 0 && y < this.MAP_H) ? this.grid[y][x] : -1; }

    /* =============================================
     *  BUILDING ZONES (clickable)
     * ============================================= */
    createBuildingZones() {
        const T = this.TILE;
        this.buildingList.forEach(b => {
            const wx = b.tx * T + T;
            const wy = b.ty * T;
            const hit = this.add.rectangle(wx, wy, T * 4, T * 4, 0x000000, 0)
                .setInteractive({ useHandCursor: true }).setDepth(5);
            hit.on('pointerdown', () => this.onBuildingTap(b.id || b.name));
            this.buildingZones.push(hit);
        });
    }

    /* =============================================
     *  NPCS
     * ============================================= */
    createNPCs() {
        NPCData.getAll().forEach(data => {
            const npc = new VillageNPC(this, data, this.TILE);
            npc.onTap = (n) => this.onBuildingTap(n.building);
            this.npcs.push(npc);
        });
    }

    /* =============================================
     *  INTERACTION (same function for NPC or building)
     * ============================================= */
    onBuildingTap(buildingId) {
        // Inventory check - if open, close it first
        if (this.invUI && this.invUI.isOpen) {
            this.invUI.close();
            return;
        }

        const T = this.TILE;

        switch (buildingId) {
            case 'rumah':
                this.saveData.progress = this.saveData.progress || {};
                this.saveData.progress.playerX = 32 * T;
                this.saveData.progress.playerY = 37 * T;
                this.saveGame();
                this.cameras.main.fadeOut(400, 0, 0, 0);
                this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('HomeScene'));
                break;

            case 'gudang':
                this.showNotification('📦 Gudang akan dibuka pada Prompt berikutnya.');
                break;
            case 'pertanian':
                this.showNotification('🌾 Pertanian akan dibuka pada Prompt berikutnya.');
                break;
            case 'dapur':
                this.showNotification('🍳 Dapur akan dibuka pada Prompt berikutnya.');
                break;
            case 'portal':
                this.showNotification('⚔ Portal Monster akan dibuka pada Prompt berikutnya.');
                break;
            case 'peternakan':
                this.showNotification('🐄 Peternakan akan dibuka pada Prompt berikutnya.');
                break;
            case 'tambang':
                this.showNotification('⛏ Tambang akan dibuka pada Prompt berikutnya.');
                break;
            case 'memancing':
                this.showNotification('🎣 Memancing akan dibuka pada Prompt berikutnya.');
                break;
            case 'hutan':
                this.showNotification('🌲 Hutan akan dibuka pada Prompt berikutnya.');
                break;
            case 'blacksmith':
                this.showNotification('⚒ Blacksmith akan dibuka pada Prompt berikutnya.');
                break;
            case 'lab':
                this.showNotification('🧪 Laboratorium akan dibuka pada Prompt berikutnya.');
                break;
            case 'marketplace':
                this.showNotification('🏪 Marketplace akan dibuka pada Prompt berikutnya.');
                break;
            case 'guild':
                this.showNotification('🏛 Guild Hall akan dibuka pada Prompt berikutnya.');
                break;
            default:
                this.showNotification(buildingId + ' akan dibuka pada Prompt berikutnya.');
        }
    }

    showNotification(text) {
        const w = this.cameras.main.width;
        const t = this.add.text(w / 2, 60, text, {
            fontSize: Math.max(11, Math.min(14, w * 0.015)) + 'px',
            fontFamily: 'Arial', color: '#ffffff', fontStyle: 'bold',
            stroke: '#000000', strokeThickness: 3,
            backgroundColor: '#00000088', padding: { x: 12, y: 6 }
        }).setOrigin(0.5).setDepth(500).setScrollFactor(0);
        this.tweens.add({
            targets: t, alpha: 0, y: 50, duration: 500, delay: 1800,
            onComplete: () => t.destroy()
        });
    }

    /* =============================================
     *  MAP RENDERING (camera-culled)
     * ============================================= */
    renderMap() {
        const g = this.mapGfx; g.clear();
        const cam = this.cameras.main;
        const s = this.TILE;
        const z = cam.zoom || 1;
        const sx = Math.max(0, Math.floor((cam.scrollX - 32) / s));
        const sy = Math.max(0, Math.floor((cam.scrollY - 32) / s));
        const ex = Math.min(this.MAP_W, Math.ceil((cam.scrollX + cam.width / z + 32) / s));
        const ey = Math.min(this.MAP_H, Math.ceil((cam.scrollY + cam.height / z + 32) / s));

        const C = { 0:0x4a7c3f, 1:0x8b7355, 2:0x2255aa, 3:0x2d5a1e, 4:0x777777, 5:0x8b6b4a, 6:0xaa3333, 7:0x5a3a1a, 8:0x6b5030, 9:0x4a7c3f, 10:0x3d6b34, 11:0x7a6040, 12:0x558c44, 13:0xc2a64e, 14:0x8b7355 };

        for (let y = sy; y < ey; y++) for (let x = sx; x < ex; x++) {
            const t = this.grid[y][x];
            g.fillStyle(C[t] || 0x4a7c3f, 1);
            g.fillRect(x*s, y*s, s, s);
            this.drawDetail(g, t, x*s, y*s, x, y);
        }

        // Building name tags
        this.buildingList.forEach(b => {
            const bx = b.tx * s + s, by = b.ty * s - 4;
            if (bx > cam.scrollX - 80 && bx < cam.scrollX + cam.width/z + 80 &&
                by > cam.scrollY - 15 && by < cam.scrollY + cam.height/z + 15) {
                g.fillStyle(0x3a2a10, 0.85);
                g.fillRoundedRect(bx - 32, by - 6, 64, 12, 3);
            }
        });
    }

    drawDetail(g, t, px, py, tx, ty) {
        const s = this.TILE;
        if (t === 2) { g.fillStyle(0x3366bb, 0.3); g.fillRect(px+3, py+6, 8, 1); }
        else if (t === 3) {
            g.fillStyle(0x5a3a1a, 1); g.fillRect(px+6, py+10, 4, 6);
            g.fillStyle(0x2d7a1e, 1); g.fillCircle(px+8, py+7, 6);
        } else if (t === 4) { g.fillStyle(0x999999, 0.5); g.fillCircle(px+8, py+10, 5); }
        else if (t === 5) { g.fillStyle(0x88bbee, 0.4); g.fillRect(px+4, py+3, 8, 6); }
        else if (t === 6) { g.fillStyle(0x882222, 0.3); g.fillRect(px, py+5, s, 2); }
        else if (t === 7) {
            g.fillStyle(0x3a2a10, 1); g.fillRect(px+3, py+1, s-6, s-2);
            g.fillStyle(0xccaa44, 1); g.fillCircle(px+11, py+8, 1);
        } else if (t === 8) {
            g.fillStyle(0x5a4020, 0.5);
            g.fillRect(px+1, py+3, 2, s-3); g.fillRect(px+s-3, py+3, 2, s-3);
            g.fillRect(px, py+6, s, 1); g.fillRect(px, py+10, s, 1);
        } else if (t === 9) {
            g.fillStyle(0xff6688, 0.8); g.fillCircle(px+5, py+7, 2);
            g.fillStyle(0xffaa33, 0.8); g.fillCircle(px+11, py+5, 2);
        } else if (t === 11) {
            g.lineStyle(1, 0x5a4020, 0.4);
            g.lineBetween(px+4, py, px+4, py+s); g.lineBetween(px+8, py, px+8, py+s);
        } else if (t === 12) {
            g.fillStyle(0x559944, 0.5);
            g.fillRect(px+4, py+5, 1, 8); g.fillRect(px+9, py+7, 1, 6);
        } else if (t === 14) {
            g.fillStyle(0x5a3a1a, 1); g.fillRect(px+7, py+8, 2, 8);
            g.fillStyle(0x8b6b4a, 1); g.fillRect(px+2, py+3, 12, 7);
        }
    }

    /* =============================================
     *  UI HUD
     * ============================================= */
    createUI() {
        if (this.uiContainer) this.uiContainer.destroy();
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        const isP = h > w;

        this.uiContainer = this.add.container(0, 0).setDepth(100).setScrollFactor(0);
        const bg = this.add.graphics();
        const d = this.saveData || {};
        const p = d.player || {}, s = d.stats || {}, c = d.currency || {};

        if (isP) {
            bg.fillStyle(0x000000, 0.7);
            bg.fillRoundedRect(4, 4, w - 8, 80, 6);
            this.uiContainer.add(bg);
            const fs = Math.max(9, Math.min(12, w * 0.02)) + 'px';
            const lh = 15;
            let y1 = 12;
            const add = (l, v, col) => {
                this.uiContainer.add(this.add.text(12, y1, l, { fontSize: fs, fontFamily: 'Arial', color: '#8888aa' }));
                this.uiContainer.add(this.add.text(80, y1, String(v), { fontSize: fs, fontFamily: 'Arial', color: col || '#fff', fontStyle: 'bold' }));
                y1 += lh;
            };
            add('Nama:', p.name||'???', '#ffdd88');
            add('Lv:', s.level||1, '#44ccff');
            add('HP:', (s.hp||100)+'/'+(s.maxHp||100), '#44cc44');
        } else {
            bg.fillStyle(0x000000, 0.65);
            bg.fillRoundedRect(6, 6, 180, 110, 8);
            this.uiContainer.add(bg);
            const fs = Math.max(10, Math.min(12, w * 0.012)) + 'px';
            let y = 14;
            const add = (l, v, col) => {
                this.uiContainer.add(this.add.text(14, y, l, { fontSize: fs, fontFamily: 'Arial', color: '#8888aa' }));
                this.uiContainer.add(this.add.text(80, y, String(v), { fontSize: fs, fontFamily: 'Arial', color: col || '#fff', fontStyle: 'bold' }));
                y += 15;
            };
            add('Nama:', p.name||'???', '#ffdd88');
            add('Level:', s.level||1, '#44ccff');
            add('HP:', (s.hp||100)+'/'+(s.maxHp||100), '#44cc44');
            add('Energy:', (s.energy||100)+'/'+(s.maxEnergy||100), '#ffcc44');
            add('Gold:', String(c.gold||0).replace(/\B(?=(\d{3})+(?!\d))/g, ','), '#ffaa44');
        }

        // Village mode hint
        const hint = this.add.text(w / 2, h - 20, '👆 Geser untuk pan · Scroll untuk zoom · Klik bangunan/NPC', {
            fontSize: Math.max(9, Math.min(11, w * 0.011)) + 'px',
            fontFamily: 'Arial', color: '#666688', fontStyle: 'italic'
        }).setOrigin(0.5).setDepth(100).setScrollFactor(0);
        this.uiContainer.add(hint);
        this.tweens.add({ targets: hint, alpha: 0, duration: 1000, delay: 3000 });
    }

    /* =============================================
     *  INVENTORY
     * ============================================= */
    toggleInventory() {
        if (this.invUI.isOpen) { this.invUI.close(); }
        else { this.invUI.open(this.saveData); }
    }

    /* =============================================
     *  SAVE/LOAD
     * ============================================= */
    saveGame() {
        if (!this.saveData) return;
        try { localStorage.setItem('isekai_world_save', JSON.stringify(this.saveData)); } catch(e) {}
    }
    loadSave() {
        try { const r = localStorage.getItem('isekai_world_save'); return r ? JSON.parse(r) : null; } catch(e) { return null; }
    }

    /* =============================================
     *  UPDATE
     * ============================================= */
    update(time, delta) {
        this.renderMap();
        this.npcs.forEach(npc => npc.update(delta));

        // Inventory key
        if (Phaser.Input.Keyboard.JustDown(this.keys.inventory) || this.touchInventory) {
            this.touchInventory = false;
            this.toggleInventory();
        }
    }

    shutdown() { this.saveGame(); }
}
