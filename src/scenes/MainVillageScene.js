/**
 * MainVillageScene - Desa Utama ISEKAI WORLD.
 * Responsive: auto portrait/landscape, modular input, dynamic UI.
 * Map: 80x80 tiles (16px) = 1280x1280 world.
 */
class MainVillageScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainVillageScene' });
    }

    create() {
        // === MAP CONSTANTS ===
        this.T = { GRASS:0, PATH:1, WATER:2, TREE:3, ROCK:4, WALL:5, ROOF:6, DOOR:7, FENCE:8, FLOWERS:9, DARK:10, BRIDGE:11, TALL:12, SAND:13, SIGN:14 };
        this.TILE = 16;
        this.MAP_W = 80;
        this.MAP_H = 80;
        this.PX_W = this.MAP_W * this.TILE;
        this.PX_H = this.MAP_H * this.TILE;

        // === SAVE DATA ===
        this.saveData = this.loadSave();

        // === GENERATE MAP ===
        this.grid = [];
        this.buildingList = [];
        this.blockedSet = new Set([2, 3, 4, 5, 6, 8, 14]);
        this.generateMap();

        // === RENDER MAP ===
        this.mapGfx = this.add.graphics().setDepth(0);

        // === PLAYER ===
        this.createPlayer();

        // === WORLD BOUNDS ===
        this.physics.world.setBounds(0, 0, this.PX_W, this.PX_H);

        // === CAMERA ===
        this.isPortrait = false;
        this.setupCamera();

        // === INPUT SYSTEM (modular) ===
        this.inputState = { x: 0, y: 0, attack: false, interact: false, inventory: false };
        this.setupInput();

        // === TOUCH CONTROLS (placeholder) ===
        this.touchZones = [];
        this.setupTouchControls();

        // === UI HUD ===
        this.uiContainer = null;
        this.createUI();

        // === RESIZE LISTENER ===
        this.scale.on('resize', (sz) => this.onResize(sz));

        // === INTERACTION SYSTEM ===
        this.interactionMgr = new InteractionManager(this);
        this.interactionMgr.setup("main_village", this.TILE);
        this.interactionMgr.setInteractCallback((obj) => this.onObjectInteract(obj));

        // === CLICKABLE BUILDINGS ===
        this.createBuildingClickZones();

        // === AUTO-SAVE ===
        this.setupAutoSave();

        // === FADE IN ===
        this.cameras.main.fadeIn(500, 0, 0, 0);
    }

    /* =============================================
     *  CAMERA SETUP
     * ============================================= */
    setupCamera() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        this.isPortrait = h > w;

        this.cameras.main.setBounds(0, 0, this.PX_W, this.PX_H);
        this.cameras.main.startFollow(this.playerBody, true, 0.1, 0.1);

        // Zoom: portrait = tighter (see less), landscape = wider (see more)
        if (this.isPortrait) {
            this.cameras.main.setZoom(Math.min(w / 320, h / 500));
        } else {
            this.cameras.main.setZoom(Math.min(w / 500, h / 350));
        }
    }

    onResize(sz) {
        this.setupCamera();
        if (this.uiContainer) this.createUI();
        this.updateTouchZones();
    }

    /* =============================================
     *  INPUT SYSTEM (modular - keyboard, touch, future joystick)
     * ============================================= */
    setupInput() {
        // Keyboard
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys({
            up: 'W', down: 'S', left: 'A', right: 'D',
            attack: 'SPACE', interact: 'E', inventory: 'I'
        });

        // Touch joystick state
        this.joystick = { active: false, startX: 0, startY: 0, dx: 0, dy: 0 };
        this.touchAttack = false;
        // touchInteract cleared in update after use
    }

    /** Returns normalized movement vector (-1 to 1) from any input source */
    getMovementInput() {
        let mx = 0, my = 0;

        // Keyboard
        if (this.cursors.left.isDown || this.keys.left.isDown) mx = -1;
        else if (this.cursors.right.isDown || this.keys.right.isDown) mx = 1;
        if (this.cursors.up.isDown || this.keys.up.isDown) my = -1;
        else if (this.cursors.down.isDown || this.keys.down.isDown) my = 1;

        // Virtual joystick (touch)
        if (this.joystick.active) {
            const dist = Math.sqrt(this.joystick.dx * this.joystick.dx + this.joystick.dy * this.joystick.dy);
            if (dist > 10) {
                const maxDist = 60;
                mx = Math.max(-1, Math.min(1, this.joystick.dx / maxDist));
                my = Math.max(-1, Math.min(1, this.joystick.dy / maxDist));
            }
        }

        // Normalize diagonal
        if (mx !== 0 && my !== 0) {
            const len = Math.sqrt(mx * mx + my * my);
            mx /= len;
            my /= len;
        }

        return { x: mx, y: my };
    }

    isAttackPressed() {
        return Phaser.Input.Keyboard.JustDown(this.keys.attack) || this.touchAttack;
    }
    isInteractPressed() {
        return Phaser.Input.Keyboard.JustDown(this.keys.interact) || this.touchInteract;
    }
    isInventoryPressed() {
        return Phaser.Input.Keyboard.JustDown(this.keys.inventory);
    }

    /* =============================================
     *  TOUCH CONTROLS (placeholder zones)
     * ============================================= */
    setupTouchControls() {
        // Only enable on touch devices
        if (!this.sys.game.device.input.touch) return;

        this.input.on('pointerdown', (ptr) => this.onPointerDown(ptr));
        this.input.on('pointermove', (ptr) => this.onPointerMove(ptr));
        this.input.on('pointerup', (ptr) => this.onPointerUp(ptr));

        this.createTouchZones();
    }

    createTouchZones() {
        this.clearTouchZones();
        if (!this.sys.game.device.input.touch) return;

        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        const g = this.add.graphics().setDepth(200).setScrollFactor(0);

        // Joystick zone (bottom-left)
        const jR = 50;
        const jX = 90, jY = h - 100;
        g.fillStyle(0xffffff, 0.08);
        g.fillCircle(jX, jY, jR);
        g.lineStyle(1, 0xffffff, 0.15);
        g.strokeCircle(jX, jY, jR);
        g.lineStyle(1, 0xffffff, 0.1);
        g.strokeCircle(jX, jY, 15);

        // Attack button (bottom-right)
        const aX = w - 80, aY = h - 100;
        g.fillStyle(0xff4444, 0.15);
        g.fillCircle(aX, aY, 35);
        g.lineStyle(2, 0xff4444, 0.3);
        g.strokeCircle(aX, aY, 35);

        // Interact button (above attack)
        const iX = w - 150, iY = h - 80;
        g.fillStyle(0x44aaff, 0.15);
        g.fillCircle(iX, iY, 28);
        g.lineStyle(2, 0x44aaff, 0.3);
        g.strokeCircle(iX, iY, 28);

        // Labels
        const fs = Math.max(9, Math.min(12, w * 0.013)) + 'px';
        this.add.text(jX, jY, '🕹', { fontSize: '20px' }).setOrigin(0.5).setDepth(201).setScrollFactor(0);
        this.add.text(aX, aY, '⚔', { fontSize: '18px' }).setOrigin(0.5).setDepth(201).setScrollFactor(0);
        this.add.text(iX, iY, 'E', { fontSize: fs, fontFamily: 'Arial', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5).setDepth(201).setScrollFactor(0);

        this.touchZones.push(g, 
            this.children.list[this.children.list.length - 1],
            this.children.list[this.children.list.length - 2],
            this.children.list[this.children.list.length - 3]
        );

        // Store positions for hit detection
        this.touchPos = { joystick: { x: jX, y: jY }, attack: { x: aX, y: aY }, interact: { x: iX, y: iY } };
    }

    clearTouchZones() {
        this.touchZones.forEach(z => { if (z && z.destroy) z.destroy(); });
        this.touchZones = [];
    }

    updateTouchZones() {
        this.clearTouchZones();
        this.createTouchZones();
    }

    onPointerDown(ptr) {
        if (!this.touchPos) return;
        const tp = this.touchPos;

        // Check joystick zone
        const jd = Phaser.Math.Distance.Between(ptr.x, ptr.y, tp.joystick.x, tp.joystick.y);
        if (jd < 60) {
            this.joystick.active = true;
            this.joystick.startX = ptr.x;
            this.joystick.startY = ptr.y;
            this.joystick.dx = 0;
            this.joystick.dy = 0;
        }

        // Check attack zone
        const ad = Phaser.Math.Distance.Between(ptr.x, ptr.y, tp.attack.x, tp.attack.y);
        if (ad < 40) this.touchAttack = true;

        // Check interact zone
        const id = Phaser.Math.Distance.Between(ptr.x, ptr.y, tp.interact.x, tp.interact.y);
        if (id < 35) this.touchInteract = true;
    }

    onPointerMove(ptr) {
        if (this.joystick.active) {
            this.joystick.dx = ptr.x - this.joystick.startX;
            this.joystick.dy = ptr.y - this.joystick.startY;
        }
    }

    onPointerUp(ptr) {
        this.joystick.active = false;
        this.joystick.dx = 0;
        this.joystick.dy = 0;
        this.touchAttack = false;
        this.touchInteract = false;
    }

    /* =============================================
     *  MAP GENERATION
     * ============================================= */
    generateMap() {
        const T = this.T;
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
        for (let y = 32; y <= 40; y++) { this.set(25, y, T.PATH); this.set(58, y, T.PATH); }

        // Buildings
        this.placeBuilding(32, 35, '🏠 Rumah');
        this.placeBuilding(50, 35, '📦 Gudang');
        this.placeBuilding(32, 45, '🍳 Dapur');
        this.placeBuilding(50, 45, '🌾 Pertanian');
        this.placeBuilding(25, 22, '⚔ Portal');
        this.placeBuilding(55, 22, '🐄 Ternak');
        this.placeBuilding(25, 58, '⛏ Tambang');
        this.placeBuilding(55, 58, '🎣 Memancing');

        // Forest west
        for (let y = 3; y < 23; y++) for (let x = 3; x < 20; x++) {
            if (this.grid[y][x] === T.GRASS && Math.random() < 0.35) this.set(x, y, T.TREE);
        }
        this.set(21, 12, T.SIGN); this.buildingList.push({ tx: 21, ty: 12, name: '🌲 Hutan' });

        // Forest east
        for (let y = 3; y < 20; y++) for (let x = 65; x < 78; x++) {
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

        // Spawn area
        for (let dy = -1; dy <= 2; dy++) for (let dx = -1; dx <= 2; dx++) {
            const sx = 39+dx, sy = 37+dy;
            if (this.grid[sy] && this.grid[sy][sx] !== undefined) {
                const t = this.grid[sy][sx];
                if (t === T.GRASS || t === T.FLOWERS) this.set(sx, sy, T.PATH);
            }
        }
    }

    placeBuilding(tx, ty, name) {
        const T = this.T;
        for (let dx = -1; dx <= 1; dx++) this.set(tx+dx, ty-1, T.ROOF);
        for (let dx = -1; dx <= 1; dx++) for (let dy = 0; dy <= 1; dy++) this.set(tx+dx, ty+dy, T.WALL);
        this.set(tx, ty+1, T.DOOR);
        this.set(tx+2, ty+1, T.SIGN);
        this.buildingList.push({ tx: tx+2, ty: ty+1, name });
    }

    set(x, y, v) { if (x >= 0 && x < this.MAP_W && y >= 0 && y < this.MAP_H) this.grid[y][x] = v; }
    get(x, y) { return (x >= 0 && x < this.MAP_W && y >= 0 && y < this.MAP_H) ? this.grid[y][x] : -1; }

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

        // Building tags
        this.buildingList.forEach(b => {
            const bx = b.tx * s + s, by = b.ty * s - 2;
            if (bx > cam.scrollX - 80 && bx < cam.scrollX + cam.width/z + 80 &&
                by > cam.scrollY - 15 && by < cam.scrollY + cam.height/z + 15) {
                g.fillStyle(0x3a2a10, 0.8);
                g.fillRoundedRect(bx - 28, by - 5, 56, 10, 2);
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
     *  PLAYER
     * ============================================= */
    createPlayer() {
        let sx = 40 * this.TILE, sy = 38 * this.TILE;
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
        const g = this.playerGfx; g.clear();
        const px = this.playerBody.x, py = this.playerBody.y;
        const f = this.facing, m = this.isMoving;
        const bob = m ? Math.sin(this.animFrame * Math.PI * 0.5) * 0.5 : 0;
        const y = py + bob;

        g.fillStyle(0x000000, 0.2); g.fillEllipse(px, py+7, 10, 4);
        const step = m && this.animFrame%2===1 ? 1 : 0;
        const S=0xffcc99, H=0x442200, Sh=0x2266aa, P=0x334466, B=0x3a2a1a;

        g.fillStyle(B,1); g.fillRect(px-3,y+3,2,3+step); g.fillRect(px+1,y+3,2,3-step);
        g.fillStyle(P,1); g.fillRect(px-3,y-1,2,5); g.fillRect(px+1,y-1,2,5);
        g.fillStyle(Sh,1); g.fillRect(px-4,y-6,8,6);
        const arm=m?Math.sin(this.animFrame*Math.PI)*2:0;
        g.fillStyle(S,1); g.fillRect(px-5,y-4+arm,2,5); g.fillRect(px+3,y-4-arm,2,5);
        g.fillStyle(S,1); g.fillRect(px-3,y-12,6,7);
        g.fillStyle(H,1); g.fillRect(px-3,y-13,6,3);
        if(f==='down'){g.fillRect(px-4,y-12,1,4);g.fillRect(px+3,y-12,1,4);}
        else if(f==='up'){g.fillRect(px-4,y-13,8,4);}
        else if(f==='left'){g.fillRect(px-4,y-13,6,3);g.fillRect(px-4,y-11,1,4);}
        else{g.fillRect(px-2,y-13,6,3);g.fillRect(px+3,y-11,1,4);}
        if(f!=='up'){
            g.fillStyle(0xffffff,1);
            if(f==='down'){g.fillRect(px-2,y-10,2,2);g.fillRect(px+1,y-10,2,2);}
            else if(f==='left'){g.fillRect(px-3,y-10,2,2);}
            else{g.fillRect(px+1,y-10,2,2);}
            g.fillStyle(0x2244aa,1);
            if(f==='down'){g.fillRect(px-1,y-9,1,1);g.fillRect(px+1,y-9,1,1);}
            else if(f==='left'){g.fillRect(px-2,y-9,1,1);}
            else{g.fillRect(px+2,y-9,1,1);}
        }
    }

    /* =============================================
     *  UI HUD (responsive layout)
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
            // Portrait: compact top bar
            bg.fillStyle(0x000000, 0.7);
            bg.fillRoundedRect(4, 4, w - 8, 90, 6);
            this.uiContainer.add(bg);

            const fs = Math.max(9, Math.min(12, w * 0.02)) + 'px';
            const x1 = 12, x2 = w / 2 + 10;
            let y1 = 12;
            const lh = Math.max(13, Math.min(16, h * 0.015));

            const addP = (label, val, col) => {
                this.uiContainer.add(this.add.text(x1, y1, label, { fontSize: fs, fontFamily: 'Arial', color: '#8888aa' }));
                this.uiContainer.add(this.add.text(x1 + 70, y1, String(val), { fontSize: fs, fontFamily: 'Arial', color: col || '#fff', fontStyle: 'bold' }));
                y1 += lh;
            };
            let y2 = 12;
            const addP2 = (label, val, col) => {
                this.uiContainer.add(this.add.text(x2, y2, label, { fontSize: fs, fontFamily: 'Arial', color: '#8888aa' }));
                this.uiContainer.add(this.add.text(x2 + 70, y2, String(val), { fontSize: fs, fontFamily: 'Arial', color: col || '#fff', fontStyle: 'bold' }));
                y2 += lh;
            };
            addP('Nama:', p.name||'???', '#ffdd88');
            addP('Lv:', s.level||1, '#44ccff');
            addP('HP:', (s.hp||100)+'/'+(s.maxHp||100), '#44cc44');
            addP2('Energy:', (s.energy||100)+'/'+(s.maxEnergy||100), '#ffcc44');
            addP2('Gold:', String(c.gold||0).replace(/\B(?=(\d{3})+(?!\d))/g, ','), '#ffaa44');
            addP2('💎', String(c.diamond||0), '#44ddff');
        } else {
            // Landscape: side panel
            bg.fillStyle(0x000000, 0.65);
            bg.fillRoundedRect(6, 6, 190, 120, 8);
            this.uiContainer.add(bg);

            const fs = Math.max(10, Math.min(12, w * 0.012)) + 'px';
            const x = 14; let y = 14;
            const lh = 15;
            const add = (label, val, col) => {
                this.uiContainer.add(this.add.text(x, y, label, { fontSize: fs, fontFamily: 'Arial', color: '#8888aa' }));
                this.uiContainer.add(this.add.text(x + 80, y, String(val), { fontSize: fs, fontFamily: 'Arial', color: col || '#fff', fontStyle: 'bold' }));
                y += lh;
            };
            add('Nama:', p.name||'???', '#ffdd88');
            add('Level:', s.level||1, '#44ccff');
            add('HP:', (s.hp||100)+'/'+(s.maxHp||100), '#44cc44');
            add('Energy:', (s.energy||100)+'/'+(s.maxEnergy||100), '#ffcc44');
            add('Gold:', String(c.gold||0).replace(/\B(?=(\d{3})+(?!\d))/g, ','), '#ffaa44');
            add('Diamond:', String(c.diamond||0), '#44ddff');
            add('Map Lv:', String(d.progress?.mapLevel||0), '#aaaaff');
        }
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
        try { localStorage.setItem('isekai_world_save', JSON.stringify(this.saveData)); } catch(e) {}
    }
    loadSave() {
        try { const r = localStorage.getItem('isekai_world_save'); return r ? JSON.parse(r) : null; } catch(e) { return null; }
    }

    /* =============================================
     *  UPDATE (per frame)
     * ============================================= */
    update(time, delta) {
        // Get input from any source
        const mv = this.getMovementInput();
        const spd = 100;

        // Collision check
        const nextX = this.playerBody.x + mv.x * spd * (delta / 1000);
        const nextY = this.playerBody.y + mv.y * spd * (delta / 1000);
        const txN = Math.floor(nextX / this.TILE);
        const tyN = Math.floor(nextY / this.TILE);
        const txC = Math.floor(this.playerBody.x / this.TILE);
        const tyC = Math.floor(this.playerBody.y / this.TILE);

        let vx = mv.x * spd, vy = mv.y * spd;
        if (this.blockedSet.has(this.get(txN, tyC))) vx = 0;
        if (this.blockedSet.has(this.get(txC, tyN))) vy = 0;

        this.playerBody.setVelocity(vx, vy);
        this.isMoving = (vx !== 0 || vy !== 0);

        // Facing
        if (Math.abs(mv.x) > 0.1 || Math.abs(mv.y) > 0.1) {
            if (Math.abs(mv.x) > Math.abs(mv.y)) {
                this.facing = mv.x < 0 ? 'left' : 'right';
            } else {
                this.facing = mv.y < 0 ? 'up' : 'down';
            }
        }

        // Animation
        if (this.isMoving) {
            this.animTimer += delta;
            if (this.animTimer >= 150) { this.animTimer = 0; this.animFrame = (this.animFrame + 1) % 4; }
        } else {
            this.animFrame = 0;
        }

        this.drawPlayer();
        this.renderMap();

        // Update interaction system
        if (this.interactionMgr) {
            this.interactionMgr.update(this.playerBody.x, this.playerBody.y, this.cameras.main);
        }

        // Check interact key (E) or touch button
        if (this.interactionMgr && (Phaser.Input.Keyboard.JustDown(this.keys.interact) || this.touchInteract)) {
            this.touchInteract = false;
            const target = this.interactionMgr.onInteract();
            if (target) this.onObjectInteract(target);
        }
    }

    /* =============================================
     *  INTERACTION CALLBACK
     * ============================================= */
    createBuildingClickZones() {
        this.input.on("pointerdown", (pointer) => {
            const cam = this.cameras.main;
            const worldX = pointer.x / cam.zoom + cam.scrollX;
            const worldY = pointer.y / cam.zoom + cam.scrollY;
            const objects = InteractionData.getObjects("main_village");
            for (const obj of objects) {
                const T = this.TILE;
                const objX = obj.tileX * T + T;
                const objY = (obj.tileY + 2) * T;
                const dist = Phaser.Math.Distance.Between(worldX, worldY, objX, objY);
                if (dist < T * 3) {
                    const pd = Phaser.Math.Distance.Between(this.playerBody.x, this.playerBody.y, objX, objY);
                    if (pd < obj.radius + 30) {
                        this.onObjectInteract(obj);
                    } else {
                        this.showFloatingText("Dekati " + obj.name + " dulu!", "#ff8844");
                    }
                    return;
                }
            }
        });
    }

    showFloatingText(msg, color) {
        const w = this.cameras.main.width;
        const t = this.add.text(w / 2, this.cameras.main.height * 0.4, msg, {
            fontSize: "14px", fontFamily: "Arial", color: color || "#ffffff",
            fontStyle: "bold", stroke: "#000", strokeThickness: 3
        }).setOrigin(0.5).setDepth(300).setScrollFactor(0);
        this.tweens.add({
            targets: t, alpha: 0, y: t.y - 20, duration: 600, delay: 800,
            onComplete: () => t.destroy()
        });
    }

    onObjectInteract(obj) {
        // Rumah: masuk ke interior
        if (obj.id === 'rumah') {
            this.saveGame();
            this.cameras.main.fadeOut(400, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('HomeScene');
            });
            return;
        }
        // Placeholder lainnya: tampilkan notifikasi
        const w = this.cameras.main.width;
        const msg = obj.name + " - " + obj.action;
        const t = this.add.text(w / 2, this.cameras.main.height - (this.isPortrait ? 180 : 60), msg, {
            fontSize: "13px", fontFamily: "Arial", color: "#ffffff",
            fontStyle: "bold", stroke: "#000000", strokeThickness: 3
        }).setOrigin(0.5).setDepth(250).setScrollFactor(0);
        this.tweens.add({
            targets: t, alpha: 0, y: t.y - 20, duration: 500, delay: 1200,
            onComplete: () => t.destroy()
        });
    }

    shutdown() { this.saveGame(); if (this.interactionMgr) this.interactionMgr.destroy(); }
}
