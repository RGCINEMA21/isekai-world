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

        // Pinch zoom (mobile) - only when two fingers and enough distance
        this.lastPinchDist = 0;
        this.isPinching = false;
        this.input.on('pointermove', (p) => {
            if (this.input.pointer1.isDown && this.input.pointer2.isDown) {
                const d = Phaser.Math.Distance.Between(
                    this.input.pointer1.x, this.input.pointer1.y,
                    this.input.pointer2.x, this.input.pointer2.y
                );
                if (d > 30) {
                    this.isPinching = true;
                    this.isDragging = false;
                }
                if (this.isPinching && this.lastPinchDist > 0) {
                    const diff = d - this.lastPinchDist;
                    const newZoom = Phaser.Math.Clamp(this.cameras.main.zoom + diff * 0.005, 0.5, 3);
                    this.cameras.main.zoom = newZoom;
                }
                this.lastPinchDist = d;
            }
        });
        this.input.on('pointerup', () => { this.lastPinchDist = 0; this.isPinching = false; });

        // UI
        this.createUI();

        // Inventory
        this.inventory = InventorySave.load(20);
        this.invUI = new InventoryUI(this, this.inventory);

        // Keyboard: I/B for inventory
        this.keys = this.input.keyboard.addKeys({ inventory: 'I' });
        this.input.keyboard.on('keydown-B', () => this.toggleInventory());
        this.input.keyboard.on('keydown-I', () => this.toggleInventory());

        // Fade in
        this.cameras.main.fadeIn(400, 0, 0, 0);

        // Resize listener
        this.scale.on("resize", (sz) => this.onResize(sz));
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
        // Don't start drag if clicking on interactive object (building/NPC)
        if (ptr.downElement && ptr.downElement !== this.sys.game.canvas) {
            return;
        }
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

        // Paths
        for (let y = 0; y < this.MAP_H; y++) { this.grid[y][35] = T.PATH; this.grid[y][36] = T.PATH; }
        for (let x = 0; x < this.MAP_W; x++) { this.grid[35][x] = T.PATH; this.grid[36][x] = T.PATH; }

        // River
        for (let x = 0; x < this.MAP_W; x++) {
            const ry = 50 + Math.floor(Math.sin(x * 0.1) * 2);
            if (ry >= 0 && ry < this.MAP_H) { this.grid[ry][x] = T.WATER; this.grid[ry + 1][x] = T.WATER; }
        }

        // Forest edges
        for (let y = 0; y < this.MAP_H; y++) {
            for (let x = 0; x < this.MAP_W; x++) {
                if (x < 4 || x >= this.MAP_W - 4 || y < 4 || y >= this.MAP_H - 4) {
                    if (Math.random() < 0.6) this.grid[y][x] = T.TREE;
                }
            }
        }

        // Trees scattered
        for (let i = 0; i < 200; i++) {
            const tx = Phaser.Math.Between(5, this.MAP_W - 5);
            const ty = Phaser.Math.Between(5, this.MAP_H - 5);
            if (this.grid[ty][tx] === T.GRASS) this.grid[ty][tx] = T.TREE;
        }

        // Rocks
        for (let i = 0; i < 30; i++) {
            const rx = Phaser.Math.Between(5, this.MAP_W - 5);
            const ry = Phaser.Math.Between(5, this.MAP_H - 5);
            if (this.grid[ry][rx] === T.GRASS) this.grid[ry][rx] = T.ROCK;
        }

        // Flowers
        for (let i = 0; i < 40; i++) {
            const fx = Phaser.Math.Between(5, this.MAP_W - 5);
            const fy = Phaser.Math.Between(5, this.MAP_H - 5);
            if (this.grid[fy][fx] === T.GRASS) this.grid[fy][fx] = T.FLOWERS;
        }

        // Buildings
        this.placeBuilding(32, 32, '🏠 Rumah',      'rumah');
        this.placeBuilding(42, 30, '📦 Gudang',      'gudang');
        this.placeBuilding(25, 22, '⚔ Portal',       'portal');
        this.placeBuilding(20, 40, '🌾 Pertanian',    'pertanian');
        this.placeBuilding(48, 40, '🍳 Dapur',        'dapur');
        this.placeBuilding(50, 25, '🐄 Peternakan',   'peternakan');
        this.placeBuilding(60, 35, '⚒ Blacksmith',   'blacksmith');
        this.placeBuilding(55, 20, '🧪 Laboratorium', 'lab');
        this.placeBuilding(60, 50, '🏪 Marketplace',  'marketplace');
        this.placeBuilding(45, 15, '🏛 Guild Hall',   'guild');
        this.placeBuilding(25, 58, '⛏ Tambang',       'tambang');
        this.placeBuilding(55, 58, '🎣 Memancing',     'memancing');
        this.placeBuilding(15, 15, '🏟 Arena Boss',   'arena');
        this.placeBuilding(19, 12, '🌲 Hutan',        'hutan');
    }

    placeBuilding(tx, ty, name, id) {
        const T = this.TILES;
        // Clear tiles for building
        for (let dy = 0; dy < 3; dy++) {
            for (let dx = 0; dx < 4; dx++) {
                if (ty + dy < this.MAP_H && tx + dx < this.MAP_W) {
                    if (dy === 0) this.grid[ty + dy][tx + dx] = T.ROOF;
                    else if (dy === 2 && dx === 1) this.grid[ty + dy][tx + dx] = T.DOOR;
                    else this.grid[ty + dy][tx + dx] = T.WALL;
                }
            }
        }
        this.buildingList.push({ tx, ty, name, id });

        // Signpost for Hutan
        if (id === 'hutan') {
            this.set(19, 12, T.SIGN);
        }
    }

    set(x, y, tile) {
        if (y >= 0 && y < this.MAP_H && x >= 0 && x < this.MAP_W) this.grid[y][x] = tile;
    }

    /* =============================================
     *  RENDER MAP
     * ============================================= */
    renderMap() {
        if (this._mapRendered) return;
        this._mapRendered = true;

        const g = this.mapGfx;
        g.clear();
        const T = this.TILES;

        for (let y = 0; y < this.MAP_H; y++) {
            for (let x = 0; x < this.MAP_W; x++) {
                const px = x * this.TILE;
                const py = y * this.TILE;
                const tile = this.grid[y][x];

                switch (tile) {
                    case T.GRASS:
                        g.fillStyle(0x5a9a3a, 1); g.fillRect(px, py, this.TILE, this.TILE);
                        if (Math.random() < 0.15) { g.fillStyle(0x4a8a2a, 0.5); g.fillRect(px + 2, py + 4, 2, 5); }
                        break;
                    case T.PATH:
                        g.fillStyle(0xc4a86a, 1); g.fillRect(px, py, this.TILE, this.TILE);
                        g.fillStyle(0xb8985a, 0.4); g.fillRect(px + 2, py + 2, 4, 4);
                        break;
                    case T.WATER:
                        g.fillStyle(0x3388cc, 1); g.fillRect(px, py, this.TILE, this.TILE);
                        g.fillStyle(0x44aaee, 0.3); g.fillRect(px + 2, py + 3, 6, 2);
                        break;
                    case T.TREE:
                        g.fillStyle(0x5a9a3a, 1); g.fillRect(px, py, this.TILE, this.TILE);
                        g.fillStyle(0x5a3a1a, 1); g.fillRect(px + 6, py + 10, 4, 6);
                        g.fillStyle(0x2d7a1e, 1); g.fillCircle(px + 8, py + 7, 7);
                        g.fillStyle(0x3a9a2a, 0.5); g.fillCircle(px + 7, py + 5, 5);
                        break;
                    case T.ROCK:
                        g.fillStyle(0x5a9a3a, 1); g.fillRect(px, py, this.TILE, this.TILE);
                        g.fillStyle(0x888888, 1); g.fillCircle(px + 8, py + 9, 6);
                        g.fillStyle(0x999999, 0.6); g.fillCircle(px + 7, py + 8, 4);
                        break;
                    case T.WALL:
                        g.fillStyle(0x8b6b4a, 1); g.fillRect(px, py, this.TILE, this.TILE);
                        g.lineStyle(1, 0x6b4b2a, 0.5); g.strokeRect(px, py, this.TILE, this.TILE);
                        break;
                    case T.ROOF:
                        g.fillStyle(0xaa3322, 1); g.fillRect(px, py, this.TILE, this.TILE);
                        g.lineStyle(1, 0x882211, 0.4); g.lineBetween(px, py + 8, px + this.TILE, py + 8);
                        break;
                    case T.DOOR:
                        g.fillStyle(0x8b6b4a, 1); g.fillRect(px, py, this.TILE, this.TILE);
                        g.fillStyle(0x6b4b2a, 1); g.fillRect(px + 3, py, 10, this.TILE);
                        g.fillStyle(0xccaa44, 1); g.fillCircle(px + 11, py + 8, 1.5);
                        break;
                    case T.FENCE:
                        g.fillStyle(0x5a9a3a, 1); g.fillRect(px, py, this.TILE, this.TILE);
                        g.fillStyle(0x8b6b4a, 1); g.fillRect(px, py + 4, this.TILE, 3);
                        g.fillRect(px + 3, py + 2, 2, 8); g.fillRect(px + 11, py + 2, 2, 8);
                        break;
                    case T.FLOWERS:
                        g.fillStyle(0x5a9a3a, 1); g.fillRect(px, py, this.TILE, this.TILE);
                        g.fillStyle(0xff6688, 1); g.fillCircle(px + 5, py + 8, 2);
                        g.fillStyle(0xffcc44, 1); g.fillCircle(px + 11, py + 6, 2);
                        g.fillStyle(0xff88cc, 0.6); g.fillCircle(px + 8, py + 12, 2);
                        break;
                    case T.SIGN:
                        g.fillStyle(0x5a9a3a, 1); g.fillRect(px, py, this.TILE, this.TILE);
                        g.fillStyle(0x8b6b4a, 1); g.fillRect(px + 6, py + 6, 4, 10);
                        g.fillRect(px + 3, py + 3, 10, 5);
                        g.fillStyle(0xffffff, 0.7); g.fillRect(px + 4, py + 4, 8, 3);
                        break;
                    default:
                        g.fillStyle(0x5a9a3a, 1); g.fillRect(px, py, this.TILE, this.TILE);
                }
            }
        }

        // Draw buildings on map
        this.buildingList.forEach(b => {
            const px = b.tx * this.TILE;
            const py = b.ty * this.TILE;
            g.lineStyle(1, 0xc9a84c, 0.6);
            g.strokeRect(px - 2, py - 2, this.TILE * 4 + 4, this.TILE * 3 + 4);
        });
    }

    /* =============================================
     *  BUILDING ZONES (clickable)
     * ============================================= */
    createBuildingZones() {
        this.buildingList.forEach(b => {
            const px = b.tx * this.TILE;
            const py = b.ty * this.TILE;
            const w = this.TILE * 4;
            const h = this.TILE * 3;

            const zone = this.add.rectangle(px + w / 2, py + h / 2, w, h, 0x000000, 0)
                .setInteractive({ useHandCursor: true })
                .setDepth(5);

            zone.on('pointerdown', () => this.onBuildingClick(b));
            zone.on('pointerover', () => this.showBuildingLabel(b, px + w / 2, py - 8));
            zone.on('pointerout', () => this.hideBuildingLabel());

            this.buildingZones.push(zone);
        });
    }

    showBuildingLabel(building, worldX, worldY) {
        this.hideBuildingLabel();
        // Convert world coords to screen coords
        const cam = this.cameras.main;
        const zoom = cam.zoom || 1;
        const sx = (worldX - cam.scrollX) * zoom;
        const sy = (worldY - cam.scrollY) * zoom;
        this.buildingLabel = this.add.text(sx, sy, building.name, {
            fontSize: Math.max(10, Math.min(13, this.cameras.main.width * 0.012)) + 'px',
            fontFamily: 'Arial', color: '#ffffff',
            stroke: '#000000', strokeThickness: 3,
            backgroundColor: '#00000088', padding: { x: 6, y: 3 }
        }).setOrigin(0.5).setDepth(200).setScrollFactor(0);
    }

    hideBuildingLabel() {
        if (this.buildingLabel) { this.buildingLabel.destroy(); this.buildingLabel = null; }
    }

    /* =============================================
     *  NPC SYSTEM
     * ============================================= */
    createNPCs() {
        NPCData.list.forEach(nd => {
            const npc = new VillageNPC(this, nd, this.TILE);
            npc.onTap = (n) => this.onBuildingClick({ id: nd.building, name: n.name });
            this.npcs.push(npc);
        });
    }

    /* =============================================
     *  BUILDING INTERACTIONS
     * ============================================= */
    onBuildingClick(building) {
        this.hideBuildingLabel();
        const T = this.TILE;

        switch (building.id) {
            case 'rumah':
                this.saveGame();
                this.cameras.main.fadeOut(400, 0, 0, 0);
                this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('HomeScene'));
                break;

            case 'gudang':
                this.saveGame();
                this.cameras.main.fadeOut(400, 0, 0, 0);
                this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('WarehouseScene'));
                break;

            case 'portal':
                this.saveGame();
                this.cameras.main.fadeOut(400, 0, 0, 0);
                this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('PortalScene'));
                break;

            case 'tambang':
                this.enterAdventureMode('tambang', '⛏ Tambang', 30, 30, 60, 60);
                break;

            case 'memancing':
                this.enterAdventureMode('memancing', '🎣 Area Memancing', 30, 30, 60, 60);
                break;

            case 'hutan':
                this.enterAdventureMode('hutan', '🌲 Hutan', 30, 30, 80, 80);
                break;

            case 'pertanian':
                this.showNotification('🌾 Pertanian akan dibuka pada Prompt berikutnya.');
                break;

            case 'dapur':
                this.showNotification('🍳 Dapur akan dibuka pada Prompt berikutnya.');
                break;

            case 'peternakan':
                this.showNotification('🐄 Peternakan akan dibuka pada Prompt berikutnya.');
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

            case 'arena':
                this.showNotification('🏟 Arena Boss akan dibuka pada Prompt berikutnya.');
                break;
        }
    }

    /* =============================================
     *  ADVENTURE MODE
     * ============================================= */
    enterAdventureMode(areaId, areaName, startX, startY, mapWidth, mapHeight) {
        this.saveGame();
        this.cameras.main.fadeOut(400, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('AdventureScene', {
                areaId: areaId,
                areaName: areaName,
                startX: startX,
                startY: startY,
                mapWidth: mapWidth,
                mapHeight: mapHeight
            });
        });
    }

    /* =============================================
     *  NOTIFICATION
     * ============================================= */
    showNotification(msg) {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;

        const notif = this.add.container(w / 2, h * 0.8).setDepth(300).setScrollFactor(0).setAlpha(0);

        const bg = this.add.graphics();
        bg.fillStyle(0x2c1810, 0.9);
        bg.fillRoundedRect(-180, -18, 360, 36, 10);
        bg.lineStyle(2, 0xc9a84c, 0.7);
        bg.strokeRoundedRect(-180, -18, 360, 36, 10);
        notif.add(bg);

        notif.add(this.add.text(0, 0, msg, {
            fontSize: '13px', fontFamily: 'Arial', color: '#ffd700', fontStyle: 'bold'
        }).setOrigin(0.5));

        this.tweens.add({ targets: notif, alpha: 1, duration: 200 });
        this.tweens.add({ targets: notif, alpha: 0, duration: 300, delay: 2000, onComplete: () => notif.destroy() });
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
            bg.fillStyle(0x2c1810, 0.88);
            bg.fillRoundedRect(4, 4, w - 8, 80, 6);
            bg.lineStyle(2, 0xc9a84c, 0.6);
            bg.strokeRoundedRect(4, 4, w - 8, 80, 6);
            this.uiContainer.add(bg);
            const fs = Math.max(9, Math.min(12, w * 0.02)) + 'px';
            const lh = 15;
            let y1 = 12;
            const add = (l, v, col) => {
                this.uiContainer.add(this.add.text(12, y1, l, { fontSize: fs, fontFamily: 'Arial', color: '#aa8844' }));
                this.uiContainer.add(this.add.text(80, y1, String(v), { fontSize: fs, fontFamily: 'Arial', color: col || '#f0e0c0', fontStyle: 'bold' }));
                y1 += lh;
            };
            add('Nama:', p.name || '???', '#ffdd88');
            add('Lv:', s.level || 1, '#44ccff');
            add('HP:', (s.hp || 100) + '/' + (s.maxHp || 100), '#44cc44');
            add('Gold:', String(c.gold || 0).replace(/\B(?=(\d{3})+(?!\d))/g, ','), '#ffaa44');
        } else {
            bg.fillStyle(0x2c1810, 0.85);
            bg.fillRoundedRect(6, 6, 220, 115, 8);
            bg.lineStyle(2, 0xc9a84c, 0.5);
            bg.strokeRoundedRect(6, 6, 220, 115, 8);
            this.uiContainer.add(bg);
            const fs = Math.max(10, Math.min(12, w * 0.012)) + 'px';
            let y = 14;
            const add = (l, v, col) => {
                this.uiContainer.add(this.add.text(14, y, l, { fontSize: fs, fontFamily: 'Arial', color: '#aa8844' }));
                this.uiContainer.add(this.add.text(80, y, String(v), { fontSize: fs, fontFamily: 'Arial', color: col || '#f0e0c0', fontStyle: 'bold' }));
                y += 15;
            };
            add('Nama:', p.name || '???', '#ffdd88');
            add('Level:', s.level || 1, '#44ccff');
            add('HP:', (s.hp || 100) + '/' + (s.maxHp || 100), '#44cc44');
            add('Energy:', (s.energy || 100) + '/' + (s.maxEnergy || 100), '#ffcc44');
            add('Gold:', String(c.gold || 0).replace(/\B(?=(\d{3})+(?!\d))/g, ','), '#ffaa44');
            add('Diamond:', String(c.diamond || 0), '#44ddff');
        }

        // Hint text
        const hint = this.add.text(w / 2, h - 20, '👆 Geser untuk pan · Scroll untuk zoom · Klik bangunan/NPC', {
            fontSize: Math.max(9, Math.min(11, w * 0.011)) + 'px',
            fontFamily: 'Arial', color: '#887755', fontStyle: 'italic'
        }).setOrigin(0.5).setDepth(100).setScrollFactor(0);
        this.uiContainer.add(hint);
        this.tweens.add({ targets: hint, alpha: 0, duration: 1000, delay: 3000 });

        // Inventory button (always visible on top-right)
        this.createInventoryButton(w, h, isP);

        // Warehouse button (always visible)
        this.createWarehouseButton(w, h, isP);
    }

    createInventoryButton(w, h, isP) {
        const ibX = w - 36;
        const ibY = isP ? h - 50 : 36;

        const ibBg = this.add.graphics();
        ibBg.fillStyle(0x6b3a0a, 0.8);
        ibBg.fillCircle(ibX, ibY, 22);
        ibBg.lineStyle(2, 0xc9a84c, 0.8);
        ibBg.strokeCircle(ibX, ibY, 22);
        this.uiContainer.add(ibBg);

        const ibIcon = this.add.text(ibX, ibY, '🎒', { fontSize: '18px' }).setOrigin(0.5);
        this.uiContainer.add(ibIcon);

        const ibHit = this.add.rectangle(ibX, ibY, 48, 48, 0x000000, 0)
            .setInteractive({ useHandCursor: true }).setDepth(101).setScrollFactor(0);
        ibHit.on('pointerdown', () => this.toggleInventory());
        this.uiContainer.add(ibHit);
    }

    createWarehouseButton(w, h, isP) {
        const wbX = w - 36;
        const wbY = isP ? h - 100 : 80;

        const wbBg = this.add.graphics();
        wbBg.fillStyle(0x3a5a8a, 0.8);
        wbBg.fillCircle(wbX, wbY, 22);
        wbBg.lineStyle(2, 0x66aacc, 0.8);
        wbBg.strokeCircle(wbX, wbY, 22);
        this.uiContainer.add(wbBg);

        const wbIcon = this.add.text(wbX, wbY, '📦', { fontSize: '18px' }).setOrigin(0.5);
        this.uiContainer.add(wbIcon);

        const wbHit = this.add.rectangle(wbX, wbY, 48, 48, 0x000000, 0)
            .setInteractive({ useHandCursor: true }).setDepth(101).setScrollFactor(0);
        wbHit.on('pointerdown', () => {
            this.saveGame();
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('WarehouseScene'));
        });
        this.uiContainer.add(wbHit);
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
        try { localStorage.setItem('isekai_world_save', JSON.stringify(this.saveData)); } catch (e) { }
    }
    loadSave() {
        try { const r = localStorage.getItem('isekai_world_save'); return r ? JSON.parse(r) : null; } catch (e) { return null; }
    }

    /* =============================================
     *  UPDATE
     * ============================================= */
    update(time, delta) {
        this.renderMap();
        this.npcs.forEach(npc => npc.update(delta));
    }

    onResize(sz) {
        this.createUI();
    }

    shutdown() { this.saveGame(); }
}
