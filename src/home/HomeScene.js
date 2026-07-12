/**
 * HomeScene - Interior Rumah pemain.
 * Scene kecil dengan kasur, meja, karpet, pintu keluar.
 * Mendukung: masuk/keluar, tidur (pulihkan HP+Energy), responsive.
 */
class HomeScene extends Phaser.Scene {
    constructor() {
        super({ key: 'HomeScene' });
    }

    create() {
        const D = HomeData;
        this.TILE = D.tileSize;
        this.MAP_W = D.mapW;
        this.MAP_H = D.mapH;
        this.PX_W = this.MAP_W * this.TILE;
        this.PX_H = this.MAP_H * this.TILE;

        // Load save
        this.saveData = this.loadSave();

        // Build interior
        this.buildInterior();

        // World bounds
        this.physics.world.setBounds(0, 0, this.PX_W, this.PX_H);

        // Player
        this.createPlayer();

        // Interaction objects
        this.interactables = [];
        this.setupInteractables();

        // Camera
        this.cameras.main.setBounds(0, 0, this.PX_W, this.PX_H);
        this.cameras.main.startFollow(this.playerBody, true, 0.12, 0.12);
        const cw = this.cameras.main.width;
        const ch = this.cameras.main.height;
        this.cameras.main.setZoom(Math.min(cw / 200, ch / 160));

        // Input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys({
            up: 'W', down: 'S', left: 'A', right: 'D',
            interact: 'E'
        });

        // Touch state
        this.joystick = { active: false, startX: 0, startY: 0, dx: 0, dy: 0 };
        this.touchInteract = false;
        this.isPortrait = ch > cw;
        this.setupTouch();

        // Current interaction target
        this.currentTarget = null;
        this.popupContainer = null;

        // Sleeping flag
        this.isSleeping = false;

        // Fade in
        this.cameras.main.fadeIn(500, 0, 0, 0);
    }

    /* =============================================
     *  INTERIOR MAP
     * ============================================= */
    buildInterior() {
        const D = HomeData;
        const T = this.TILE;
        const W = this.MAP_W;
        const H = this.MAP_H;

        // Floor
        this.floorGfx = this.add.graphics().setDepth(0);
        // Walls
        this.wallGfx = this.add.graphics().setDepth(1);
        // Furniture
        this.furnitureGfx = this.add.graphics().setDepth(2);

        // Collision map
        this.collisionGrid = [];
        for (let y = 0; y < H; y++) {
            this.collisionGrid[y] = [];
            for (let x = 0; x < W; x++) {
                this.collisionGrid[y][x] = 0; // 0 = walkable
            }
        }

        // --- Floor (wood planks) ---
        this.floorGfx.fillStyle(0x8b7355, 1);
        this.floorGfx.fillRect(0, 0, W * T, H * T);
        // Wood grain lines
        for (let y = 0; y < H; y++) {
            this.floorGfx.lineStyle(1, 0x7a6345, 0.3);
            this.floorGfx.lineBetween(0, y * T, W * T, y * T);
            for (let x = 0; x < W; x++) {
                if ((x + y) % 3 === 0) {
                    this.floorGfx.lineStyle(1, 0x6b5535, 0.15);
                    this.floorGfx.lineBetween(x * T + 4, y * T, x * T + 4, y * T + T);
                }
            }
        }

        // --- Walls (top & sides) ---
        // Top wall
        for (let x = 0; x < W; x++) {
            this.wallGfx.fillStyle(0x6b4b2a, 1);
            this.wallGfx.fillRect(x * T, 0, T, T * 2);
            this.wallGfx.lineStyle(1, 0x5a3a1a, 0.5);
            this.wallGfx.strokeRect(x * T, 0, T, T * 2);
            this.setCollision(x, 0, 1);
            this.setCollision(x, 1, 1);
        }
        // Left wall
        for (let y = 0; y < H; y++) {
            this.wallGfx.fillStyle(0x6b4b2a, 1);
            this.wallGfx.fillRect(0, y * T, T, T);
            this.wallGfx.lineStyle(1, 0x5a3a1a, 0.5);
            this.wallGfx.strokeRect(0, y * T, T, T);
            this.setCollision(0, y, 1);
        }
        // Right wall
        for (let y = 0; y < H; y++) {
            this.wallGfx.fillStyle(0x6b4b2a, 1);
            this.wallGfx.fillRect((W - 1) * T, y * T, T, T);
            this.wallGfx.lineStyle(1, 0x5a3a1a, 0.5);
            this.wallGfx.strokeRect((W - 1) * T, y * T, T, T);
            this.setCollision(W - 1, y, 1);
        }
        // Bottom wall (with door opening)
        for (let x = 0; x < W; x++) {
            if (x >= 9 && x <= 11) continue; // door opening
            this.wallGfx.fillStyle(0x6b4b2a, 1);
            this.wallGfx.fillRect(x * T, (H - 1) * T, T, T);
            this.wallGfx.lineStyle(1, 0x5a3a1a, 0.5);
            this.wallGfx.strokeRect(x * T, (H - 1) * T, T, T);
            this.setCollision(x, H - 1, 1);
        }

        // --- Window on top wall ---
        this.wallGfx.fillStyle(0x88bbee, 0.6);
        this.wallGfx.fillRect(4 * T, 0, T * 2, T);
        this.wallGfx.lineStyle(2, 0x5a3a1a, 1);
        this.wallGfx.strokeRect(4 * T, 0, T * 2, T);
        this.wallGfx.lineBetween(5 * T, 0, 5 * T, T);

        this.wallGfx.fillStyle(0x88bbee, 0.6);
        this.wallGfx.fillRect(14 * T, 0, T * 2, T);
        this.wallGfx.lineStyle(2, 0x5a3a1a, 1);
        this.wallGfx.strokeRect(14 * T, 0, T * 2, T);
        this.wallGfx.lineBetween(15 * T, 0, 15 * T, T);

        // --- Furniture ---
        const bed = D.objects.bed;
        const table = D.objects.table;
        const chair = D.objects.chair;
        const carpet = D.objects.carpet;
        const wardrobe = D.objects.wardrobe;
        const exit = D.objects.exitDoor;

        // Bed
        this.drawFurniture(bed.tileX, bed.tileY, 3, 2, 0x886644, 0xcc8866, 'Kasur');
        this.setCollision(bed.tileX, bed.tileY, 1);
        this.setCollision(bed.tileX + 1, bed.tileY, 1);
        this.setCollision(bed.tileX + 2, bed.tileY, 1);
        this.setCollision(bed.tileX, bed.tileY + 1, 1);
        this.setCollision(bed.tileX + 1, bed.tileY + 1, 1);
        this.setCollision(bed.tileX + 2, bed.tileY + 1, 1);

        // Table
        this.drawFurniture(table.tileX, table.tileY, 2, 2, 0x6b4b2a, 0x8b6b4a, 'Meja');
        this.setCollision(table.tileX, table.tileY, 1);
        this.setCollision(table.tileX + 1, table.tileY, 1);
        this.setCollision(table.tileX, table.tileY + 1, 1);
        this.setCollision(table.tileX + 1, table.tileY + 1, 1);

        // Chair
        this.drawFurniture(chair.tileX, chair.tileY, 1, 1, 0x5a3a1a, 0x6b4b2a, 'Kursi');
        this.setCollision(chair.tileX, chair.tileY, 1);

        // Carpet (decorative, walkable)
        this.floorGfx.fillStyle(0x884444, 0.5);
        this.floorGfx.fillRoundedRect(
            carpet.tileX * T - 4, carpet.tileY * T - 4,
            T * 3 + 8, T * 2 + 8, 4
        );
        this.floorGfx.lineStyle(1, 0xaa6644, 0.5);
        this.floorGfx.strokeRoundedRect(
            carpet.tileX * T - 4, carpet.tileY * T - 4,
            T * 3 + 8, T * 2 + 8, 4
        );

        // Wardrobe
        this.drawFurniture(wardrobe.tileX, wardrobe.tileY, 2, 2, 0x5a3a1a, 0x6b4b2a, 'Lemari');
        this.setCollision(wardrobe.tileX, wardrobe.tileY, 1);
        this.setCollision(wardrobe.tileX + 1, wardrobe.tileY, 1);
        this.setCollision(wardrobe.tileX, wardrobe.tileY + 1, 1);
        this.setCollision(wardrobe.tileX + 1, wardrobe.tileY + 1, 1);

        // Exit door marker
        this.floorGfx.fillStyle(0x4a3a2a, 0.6);
        this.floorGfx.fillRect(exit.tileX * T - 4, exit.tileY * T - 4, T + 8, T * 2 + 8);
        this.floorGfx.lineStyle(2, 0x3a2a10, 1);
        this.floorGfx.strokeRect(exit.tileX * T - 4, exit.tileY * T - 4, T + 8, T * 2 + 8);
        // Arrow indicator
        this.floorGfx.fillStyle(0xccaa44, 0.8);
        this.floorGfx.fillTriangle(
            exit.tileX * T + T/2, exit.tileY * T + T + 6,
            exit.tileX * T + T/2 - 6, exit.tileY * T + T - 2,
            exit.tileX * T + T/2 + 6, exit.tileY * T + T - 2
        );
    }

    drawFurniture(tx, ty, tw, th, borderColor, fillColor, label) {
        const T = this.TILE;
        this.furnitureGfx.fillStyle(fillColor, 1);
        this.furnitureGfx.fillRect(tx * T, ty * T, tw * T, th * T);
        this.furnitureGfx.lineStyle(1.5, borderColor, 1);
        this.furnitureGfx.strokeRect(tx * T, ty * T, tw * T, th * T);

        // Label
        this.add.text(tx * T + (tw * T) / 2, ty * T + (th * T) / 2, label, {
            fontSize: '7px', fontFamily: 'Arial', color: '#ffffff',
            stroke: '#000', strokeThickness: 1
        }).setOrigin(0.5).setDepth(3);
    }

    setCollision(x, y, v) {
        if (x >= 0 && x < this.MAP_W && y >= 0 && y < this.MAP_H)
            this.collisionGrid[y][x] = v;
    }
    getCollision(x, y) {
        return (x >= 0 && x < this.MAP_W && y >= 0 && y < this.MAP_H) ? this.collisionGrid[y][x] : 1;
    }

    /* =============================================
     *  PLAYER
     * ============================================= */
    createPlayer() {
        const D = HomeData;
        const T = this.TILE;
        let sx = D.spawnInside.tileX * T;
        let sy = D.spawnInside.tileY * T;

        this.playerBody = this.physics.add.sprite(sx, sy, null);
        this.playerBody.setVisible(false);
        this.playerBody.setSize(8, 8);
        this.playerBody.setOffset(-4, -4);
        this.playerBody.setCollideWorldBounds(true);
        this.playerBody.setMaxVelocity(80, 80);
        this.playerBody.setDamping(true);
        this.playerBody.setDrag(0.85);

        this.playerGfx = this.add.graphics().setDepth(10);
        this.facing = 'up';
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

        g.fillStyle(0x000000, 0.15); g.fillEllipse(px, py + 7, 10, 4);
        const step = m && this.animFrame%2===1 ? 1 : 0;
        const S=0xffcc99,H=0x442200,Sh=0x2266aa,P=0x334466,B=0x3a2a1a;

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
     *  INTERACTABLES (bed + exit)
     * ============================================= */
    setupInteractables() {
        const D = HomeData;
        const T = this.TILE;

        // Bed
        const bed = D.objects.bed;
        this.bedZone = {
            x: (bed.tileX + 1) * T,
            y: (bed.tileY + 2) * T + 8,
            radius: 40,
            name: bed.name,
            action: bed.action
        };

        // Exit door
        const exit = D.objects.exitDoor;
        this.exitZone = {
            x: exit.tileX * T + T / 2,
            y: (exit.tileY + 1) * T,
            radius: 60,
            name: exit.name,
            action: exit.action
        };
    }

    findNearestInteractable(px, py) {
        let best = null, bestDist = Infinity;
        for (const zone of [this.bedZone, this.exitZone]) {
            const dx = zone.x - px, dy = zone.y - py;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist <= zone.radius && dist < bestDist) {
                best = zone;
                bestDist = dist;
            }
        }
        return best;
    }

    /* =============================================
     *  POPUP UI
     * ============================================= */
    showPopup(zone) {
        if (this.popupContainer) this.popupContainer.destroy();
        const pw = this.isPortrait ? 160 : 180;
        const ph = 44;

        this.popupContainer = this.add.container(0, 0).setDepth(200).setScrollFactor(0);

        const bg = this.add.graphics();
        bg.fillStyle(0x0a0a20, 0.92);
        bg.fillRoundedRect(-pw/2, -ph/2, pw, ph, 8);
        bg.lineStyle(1.5, 0x6644aa, 0.8);
        bg.strokeRoundedRect(-pw/2, -ph/2, pw, ph, 8);
        this.popupContainer.add(bg);

        this.popupContainer.add(this.add.text(0, -10, zone.name, {
            fontSize: '12px', fontFamily: 'Arial', color: '#ffdd88', fontStyle: 'bold'
        }).setOrigin(0.5));

        const keyHint = this.sys.game.device.input.touch ? '👆 Tekan' : '[E]';
        this.popupContainer.add(this.add.text(0, 8, keyHint + ' ' + zone.action, {
            fontSize: '11px', fontFamily: 'Arial', color: '#aaaacc'
        }).setOrigin(0.5));

        this.popupContainer.setAlpha(0);
        this.tweens.add({ targets: this.popupContainer, alpha: 1, duration: 150 });
    }

    hidePopup() {
        if (this.popupContainer) {
            this.popupContainer.destroy();
            this.popupContainer = null;
        }
    }

    updatePopupPos(zone) {
        if (!this.popupContainer) return;
        const cam = this.cameras.main;
        const sx = (zone.x - cam.scrollX) * cam.zoom;
        const sy = (zone.y - cam.scrollY) * cam.zoom;
        const w = cam.width, h = cam.height;
        const px = Math.max(90, Math.min(w - 90, sx));
        let py = sy - 25 * cam.zoom;
        if (py < 30) py = sy + 25 * cam.zoom;
        py = Math.max(30, Math.min(h - 30, py));
        this.popupContainer.setPosition(px, py);
    }

    /* =============================================
     *  TOUCH CONTROLS
     * ============================================= */
    setupTouch() {
        if (!this.sys.game.device.input.touch) return;
        this.input.on('pointerdown', (p) => this.onPtrDown(p));
        this.input.on('pointermove', (p) => this.onPtrMove(p));
        this.input.on('pointerup', () => { this.joystick.active = false; });
        this.drawTouchZones();
    }

    drawTouchZones() {
        if (!this.sys.game.device.input.touch) return;
        const w = this.cameras.main.width, h = this.cameras.main.height;
        const g = this.add.graphics().setDepth(200).setScrollFactor(0);
        // Joystick
        g.fillStyle(0xffffff, 0.06); g.fillCircle(80, h - 90, 45);
        g.lineStyle(1, 0xffffff, 0.12); g.strokeCircle(80, h - 90, 45);
        // Interact
        g.fillStyle(0x44aaff, 0.12); g.fillCircle(w - 70, h - 90, 30);
        g.lineStyle(2, 0x44aaff, 0.25); g.strokeCircle(w - 70, h - 90, 30);

        this.touchPositions = { joystick: { x: 80, y: h - 90 }, interact: { x: w - 70, y: h - 90 } };

        this.add.text(80, h - 90, '🕹', { fontSize: '18px' }).setOrigin(0.5).setDepth(201).setScrollFactor(0);
        this.add.text(w - 70, h - 90, 'E', { fontSize: '13px', fontFamily: 'Arial', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5).setDepth(201).setScrollFactor(0);
    }

    onPtrDown(ptr) {
        if (!this.touchPositions) return;
        const tp = this.touchPositions;
        if (Phaser.Math.Distance.Between(ptr.x, ptr.y, tp.joystick.x, tp.joystick.y) < 55) {
            this.joystick.active = true;
            this.joystick.startX = ptr.x; this.joystick.startY = ptr.y;
        }
        if (Phaser.Math.Distance.Between(ptr.x, ptr.y, tp.interact.x, tp.interact.y) < 35) {
            this.touchInteract = true;
        }
    }
    onPtrMove(ptr) {
        if (this.joystick.active) {
            this.joystick.dx = ptr.x - this.joystick.startX;
            this.joystick.dy = ptr.y - this.joystick.startY;
        }
    }

    /* =============================================
     *  SLEEP SYSTEM
     * ============================================= */
    doSleep() {
        if (this.isSleeping) return;
        this.isSleeping = true;
        this.hidePopup();
        this.playerBody.setVelocity(0, 0);

        const D = HomeData.sleep;

        // Fade out
        this.cameras.main.fadeOut(D.fadeOutTime, 0, 0, 0);

        this.time.delayedCall(D.fadeOutTime + D.waitTime, () => {
            // Restore HP & Energy
            if (this.saveData && this.saveData.stats) {
                this.saveData.stats.hp = this.saveData.stats.maxHp;
                this.saveData.stats.energy = this.saveData.stats.maxEnergy;
            }
            this.saveGame();

            // Fade in
            this.cameras.main.fadeIn(D.fadeInTime, 0, 0, 0);

            this.time.delayedCall(D.fadeInTime + 200, () => {
                this.showNotification('HP dan Energy telah dipulihkan.');
                this.isSleeping = false;
            });
        });
    }

    showNotification(text) {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        const t = this.add.text(w / 2, h * 0.35, text, {
            fontSize: Math.max(11, Math.min(14, w * 0.015)) + 'px',
            fontFamily: 'Arial', color: '#44cc44', fontStyle: 'bold',
            stroke: '#000', strokeThickness: 3
        }).setOrigin(0.5).setDepth(300).setScrollFactor(0);

        this.tweens.add({
            targets: t, alpha: 0, y: t.y - 15, duration: 600, delay: 1500,
            onComplete: () => t.destroy()
        });
    }

    /* =============================================
     *  EXIT HOUSE
     * ============================================= */
    exitHouse() {
        this.saveGame();
        this.cameras.main.fadeOut(400, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('MainVillageScene');
        });
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
        if (this.isSleeping) return;

        // Movement
        let mx = 0, my = 0;
        if (this.cursors.left.isDown || this.keys.left.isDown) mx = -1;
        else if (this.cursors.right.isDown || this.keys.right.isDown) mx = 1;
        if (this.cursors.up.isDown || this.keys.up.isDown) my = -1;
        else if (this.cursors.down.isDown || this.keys.down.isDown) my = 1;

        // Touch joystick
        if (this.joystick.active) {
            const d = Math.sqrt(this.joystick.dx**2 + this.joystick.dy**2);
            if (d > 10) {
                mx = Math.max(-1, Math.min(1, this.joystick.dx / 50));
                my = Math.max(-1, Math.min(1, this.joystick.dy / 50));
            }
        }

        if (mx !== 0 && my !== 0) { const len = Math.sqrt(mx*mx + my*my); mx /= len; my /= len; }

        const spd = 80;
        let vx = mx * spd, vy = my * spd;

        // Collision
        const T = this.TILE;
        const txN = Math.floor((this.playerBody.x + vx * delta/1000) / T);
        const tyN = Math.floor((this.playerBody.y + vy * delta/1000) / T);
        const txC = Math.floor(this.playerBody.x / T);
        const tyC = Math.floor(this.playerBody.y / T);
        if (this.getCollision(txN, tyC)) vx = 0;
        if (this.getCollision(txC, tyN)) vy = 0;

        this.playerBody.setVelocity(vx, vy);
        this.isMoving = (vx !== 0 || vy !== 0);

        if (Math.abs(mx) > 0.1 || Math.abs(my) > 0.1) {
            if (Math.abs(mx) > Math.abs(my)) this.facing = mx < 0 ? 'left' : 'right';
            else this.facing = my < 0 ? 'up' : 'down';
        }

        if (this.isMoving) {
            this.animTimer += delta;
            if (this.animTimer >= 150) { this.animTimer = 0; this.animFrame = (this.animFrame+1)%4; }
        } else { this.animFrame = 0; }

        this.drawPlayer();

        // Interaction check
        const near = this.findNearestInteractable(this.playerBody.x, this.playerBody.y);
        if (near) {
            if (near !== this.currentTarget) { this.currentTarget = near; this.showPopup(near); }
            this.updatePopupPos(near);
        } else {
            if (this.currentTarget) { this.currentTarget = null; this.hidePopup(); }
        }

        // Interact input
        if (Phaser.Input.Keyboard.JustDown(this.keys.interact) || this.touchInteract) {
            this.touchInteract = false;
            if (this.currentTarget) {
                if (this.currentTarget === this.bedZone) this.doSleep();
                else if (this.currentTarget === this.exitZone) this.exitHouse();
            }
        }
    }

    shutdown() { this.saveGame(); }
}
