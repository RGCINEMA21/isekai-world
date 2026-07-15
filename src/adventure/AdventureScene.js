/**
 * AdventureScene - Main adventure mode scene.
 * Handles player movement, camera, UI, area exploration, and auto battle.
 * Reusable by: Portal Monster, Hutan, Tambang, Memancing, Dungeon, Arena Boss.
 */
class AdventureScene extends Phaser.Scene {
    constructor() {
        super({ key: 'AdventureScene' });
    }
    
    init(data) {
        this.areaId = data.areaId || 'forest';
        this.areaName = data.areaName || 'Forest';
        this.startX = data.startX || 30;
        this.startY = data.startY || 30;
        this.mapWidth = data.mapWidth || 60;
        this.mapHeight = data.mapHeight || 60;
    }
    
    create() {
        this.saveData = this.loadSave();
        
        this.manager = new AdventureManager({
            areaId: this.areaId,
            areaName: this.areaName,
            mapWidth: this.mapWidth,
            mapHeight: this.mapHeight,
            tileSize: 16,
            player: this.saveData?.player || {}
        });
        
        this.manager.initPlayer(this.startX * this.manager.tileSize, this.startY * this.manager.tileSize);
        
        this.generateMap();
        this.playerGfx = this.add.graphics().setDepth(10);
        
        this.spawner = new MonsterSpawner(this, this.manager);
        this.spawner.init();
        
        this.battleManager = new BattleManager(this, this.manager, this.spawner, null);
        

        // Reward System
        this.rewardManager = new RewardManager(this, this.saveData);
        this.battleManager.rewardManager = this.rewardManager;


        // Load warehouse untuk Storage Manager
        this.warehouseManager = WarehouseSave.loadOrCreate();
        this.inventoryManager = InventorySave.load(20);
        this.storageManager = new StorageManager(this.inventoryManager, this.warehouseManager);
        this.rewardManager.initStorage(this.storageManager);

        this.spawnDebugger = new SpawnDebugger(this);
        this.debugMode = false;
        
        this.cam = new AdventureCamera(this, this.manager);
        this.cam.init();
        
        this.setupInput();
        
        // Virtual joystick for mobile
        this.joystick = null;
        this.joystickActive = false;
        this.joystickBase = null;
        this.joystickStick = null;
        this.joystickPointer = null;
        
        this.ui = new AdventureUI(this, this.manager);
        this.ui.init();
        
        this.transition = new TransitionManager(this);
        this.lastSaveTime = 0;
        
        this.scale.on('resize', (sz) => this.onResize(sz));
        
        this.time.delayedCall(50, () => {
            this.cameras.main.fadeIn(400, 0, 0, 0);
        });
    }
    
    generateMap() {
        const width = this.manager.mapWidth;
        const height = this.manager.mapHeight;
        const tileSize = this.manager.tileSize;
        
        this.mapGfx = this.add.graphics().setDepth(0);
        
        let seed = this.areaId.length * 1337;
        const seededRandom = () => {
            seed = (seed * 9301 + 49297) % 233280;
            return seed / 233280;
        };
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const px = x * tileSize;
                const py = y * tileSize;
                
                let baseColor = 0x4a8a3a;
                if (this.areaId === 'tambang') baseColor = 0x8a7a5a;
                else if (this.areaId === 'memancing') baseColor = 0x3a8a6a;
                
                this.mapGfx.fillStyle(baseColor, 1);
                this.mapGfx.fillRect(px, py, tileSize, tileSize);
                
                const noise = Math.sin(x * 0.5) * Math.cos(y * 0.5);
                if (noise > 0.3) {
                    this.mapGfx.fillStyle(0x3a7a2a, 1);
                    this.mapGfx.fillRect(px, py, tileSize, tileSize);
                    this.mapGfx.fillStyle(0x559944, 0.6);
                    this.mapGfx.fillRect(px + 3, py + 5, 2, 8);
                    this.mapGfx.fillRect(px + 9, py + 3, 2, 10);
                } else if (noise < -0.3) {
                    this.mapGfx.fillStyle(0x8b7355, 1);
                    this.mapGfx.fillRect(px, py, tileSize, tileSize);
                }
                
                if (x === 0 || y === 0 || x === width - 1 || y === height - 1) {
                    this.mapGfx.fillStyle(0x5a3a1a, 1);
                    this.mapGfx.fillRect(px, py, tileSize, tileSize);
                    this.mapGfx.fillStyle(0x3a2a0a, 0.5);
                    this.mapGfx.fillRect(px, py, tileSize, tileSize);
                }
                
                if (seededRandom() < 0.02 && x > 3 && x < width - 3 && y > 3 && y < height - 3) {
                    this.mapGfx.fillStyle(0x5a3a1a, 1);
                    this.mapGfx.fillRect(px + 6, py + 10, 4, 6);
                    this.mapGfx.fillStyle(0x2d7a1e, 1);
                    this.mapGfx.fillCircle(px + 8, py + 7, 6);
                    this.mapGfx.fillStyle(0x3a9a2a, 0.6);
                    this.mapGfx.fillCircle(px + 7, py + 5, 4);
                }
            }
        }
        
        this.mapGfx.fillStyle(0xffaa44, 0.5);
        this.mapGfx.fillCircle(this.startX * tileSize + 8, this.startY * tileSize + 8, 12);
    }
    
    setupInput() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys({
            up: 'W',
            down: 'S',
            left: 'A',
            right: 'D'
        });
        
        this.input.keyboard.on('keydown-F1', () => {
            this.debugMode = !this.debugMode;
            if (this.debugMode) {
                this.spawnDebugger.show();
                if (this.spawner) this.spawner.toggleDebug();
            } else {
                this.spawnDebugger.hide();
                if (this.spawner) this.spawner.toggleDebug();
            }
        });
        
        // Monster click/touch handling
        this.input.on('pointerdown', (pointer) => {
            if (this.battleManager && this.battleManager.isInBattle) return;
            // If pointer is on joystick area, don't process monster click
            if (this.joystickActive) return;
            
            const zoom = this.cameras.main.zoom || 1;
            const worldX = pointer.x / zoom + this.cameras.main.scrollX;
            const worldY = pointer.y / zoom + this.cameras.main.scrollY;
            
            if (this.spawner && this.spawner.spawnManager) {
                const monsters = this.spawner.spawnManager.getAllActiveMonsters();
                let closestMonster = null;
                let closestDist = 30;
                
                for (const monster of monsters) {
                    if (!monster.active) continue;
                    const dist = Phaser.Math.Distance.Between(worldX, worldY, monster.x, monster.y);
                    if (dist < closestDist) {
                        closestDist = dist;
                        closestMonster = monster;
                    }
                }
                
                if (closestMonster) {
                    this.battleManager.onMonsterClicked(closestMonster);
                }
            }
        });
    }
    
    /* =============================================
     *  VIRTUAL JOYSTICK
     * ============================================= */
    createJoystick(x, y) {
        if (this.joystickBase) this.destroyJoystick();
        
        const baseRadius = 40;
        const stickRadius = 18;
        
        this.joystickBase = this.add.graphics().setDepth(150).setScrollFactor(0);
        this.joystickBase.fillStyle(0xffffff, 0.15);
        this.joystickBase.fillCircle(x, y, baseRadius);
        this.joystickBase.lineStyle(2, 0xffffff, 0.3);
        this.joystickBase.strokeCircle(x, y, baseRadius);
        
        this.joystickStick = this.add.graphics().setDepth(151).setScrollFactor(0);
        this.joystickStick.fillStyle(0xffffff, 0.4);
        this.joystickStick.fillCircle(x, y, stickRadius);
        
        this.joystickData = {
            baseX: x,
            baseY: y,
            stickX: x,
            stickY: y,
            baseRadius: baseRadius,
            stickRadius: stickRadius,
            dx: 0,
            dy: 0
        };
    }
    
    updateJoystick(pointer) {
        if (!this.joystickData) return;
        const jd = this.joystickData;
        
        const dx = pointer.x - jd.baseX;
        const dy = pointer.y - jd.baseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist <= jd.baseRadius) {
            jd.stickX = pointer.x;
            jd.stickY = pointer.y;
        } else {
            jd.stickX = jd.baseX + (dx / dist) * jd.baseRadius;
            jd.stickY = jd.baseY + (dy / dist) * jd.baseRadius;
        }
        
        const normDist = Math.min(dist, jd.baseRadius) / jd.baseRadius;
        jd.dx = (jd.stickX - jd.baseX) / jd.baseRadius;
        jd.dy = (jd.stickY - jd.baseY) / jd.baseRadius;
        
        // Redraw stick
        if (this.joystickStick) {
            this.joystickStick.clear();
            this.joystickStick.fillStyle(0xffffff, 0.5);
            this.joystickStick.fillCircle(jd.stickX, jd.stickY, jd.stickRadius);
        }
    }
    
    destroyJoystick() {
        if (this.joystickBase) { this.joystickBase.destroy(); this.joystickBase = null; }
        if (this.joystickStick) { this.joystickStick.destroy(); this.joystickStick = null; }
        this.joystickData = null;
        this.joystickActive = false;
        this.joystickPointer = null;
    }
    
    getJoystickVelocity() {
        if (!this.joystickData) return { x: 0, y: 0 };
        return { x: this.joystickData.dx, y: this.joystickData.dy };
    }
    
    getMovementVelocity() {
        let vx = 0;
        let vy = 0;
        
        if (this.cursors.left.isDown || this.keys.left.isDown) vx = -1;
        if (this.cursors.right.isDown || this.keys.right.isDown) vx = 1;
        if (this.cursors.up.isDown || this.keys.up.isDown) vy = -1;
        if (this.cursors.down.isDown || this.keys.down.isDown) vy = 1;
        
        return { x: vx, y: vy };
    }
    
    drawPlayer() {
        if (!this.playerGfx) return;
        this.playerGfx.clear();
        
        const x = Math.round(this.manager.playerX + (this.manager.drawOffsetX || 0));
        const y = Math.round(this.manager.playerY + (this.manager.drawOffsetY || 0));
        const facing = this.manager.facing;
        const moving = this.manager.isMoving;
        const frame = this.manager.animFrame;
        
        const gender = this.saveData?.player?.gender || 'male';
        const skin = 0xffcc99;
        const hair = gender === 'female' ? 0xcc6633 : 0x443322;
        const shirt = gender === 'female' ? 0xcc4488 : 0x4466aa;
        const pants = 0x444466;
        const boot = 0x3a2a1a;
        
        const step = moving ? Math.sin(frame * Math.PI) * 2 : 0;
        
        this.playerGfx.fillStyle(0x000000, 0.2);
        this.playerGfx.fillEllipse(x, y + 12, 14, 5);
        
        this.playerGfx.fillStyle(boot, 1);
        this.playerGfx.fillRect(x - 3, y + 3 + (moving && facing !== 'up' ? step : 0), 2, 3);
        this.playerGfx.fillRect(x + 1, y + 3 + (moving && facing !== 'up' ? -step : 0), 2, 3);
        
        this.playerGfx.fillStyle(pants, 1);
        this.playerGfx.fillRect(x - 3, y - 1, 2, 5);
        this.playerGfx.fillRect(x + 1, y - 1, 2, 5);
        
        this.playerGfx.fillStyle(shirt, 1);
        this.playerGfx.fillRect(x - 4, y - 6, 8, 6);
        
        const armSwing = moving ? Math.sin(frame * Math.PI) * 2 : 0;
        this.playerGfx.fillStyle(skin, 1);
        this.playerGfx.fillRect(x - 5, y - 4 + armSwing, 2, 5);
        this.playerGfx.fillRect(x + 3, y - 4 - armSwing, 2, 5);
        
        this.playerGfx.fillStyle(skin, 1);
        this.playerGfx.fillRect(x - 3, y - 12, 6, 7);
        
        this.playerGfx.fillStyle(hair, 1);
        this.playerGfx.fillRect(x - 3, y - 13, 6, 3);
        if (facing === 'down') {
            this.playerGfx.fillRect(x - 4, y - 12, 1, 4);
            this.playerGfx.fillRect(x + 3, y - 12, 1, 4);
        } else if (facing === 'up') {
            this.playerGfx.fillRect(x - 4, y - 13, 8, 4);
        } else if (facing === 'left') {
            this.playerGfx.fillRect(x - 4, y - 13, 6, 3);
            this.playerGfx.fillRect(x - 4, y - 11, 1, 4);
        } else {
            this.playerGfx.fillRect(x - 2, y - 13, 6, 3);
            this.playerGfx.fillRect(x + 3, y - 11, 1, 4);
        }
        
        if (facing !== 'up') {
            this.playerGfx.fillStyle(0xffffff, 1);
            if (facing === 'down') {
                this.playerGfx.fillRect(x - 2, y - 10, 2, 2);
                this.playerGfx.fillRect(x + 1, y - 10, 2, 2);
                this.playerGfx.fillStyle(0x2244aa, 1);
                this.playerGfx.fillRect(x - 1, y - 9, 1, 1);
                this.playerGfx.fillRect(x + 1, y - 9, 1, 1);
            } else if (facing === 'left') {
                this.playerGfx.fillRect(x - 3, y - 10, 2, 2);
                this.playerGfx.fillStyle(0x2244aa, 1);
                this.playerGfx.fillRect(x - 2, y - 9, 1, 1);
            } else {
                this.playerGfx.fillRect(x + 1, y - 10, 2, 2);
                this.playerGfx.fillStyle(0x2244aa, 1);
                this.playerGfx.fillRect(x + 2, y - 9, 1, 1);
            }
        }
    }
    
    toggleInventory() {
        if (!this.invUI) {
            const inventory = InventorySave.load(20);
            this.invUI = new InventoryUI(this, inventory);
        }
        
        if (this.invUI.isOpen) {
            this.invUI.close();
        } else {
            this.invUI.open(this.saveData);
        }
    }
    
    exitAdventure() {
        this.saveGame();
        // Simpan warehouse dan inventory
        if (this.warehouseManager) WarehouseSave.save(this.warehouseManager);
        if (this.inventoryManager) InventorySave.save(this.inventoryManager);
        if (this.ui) this.ui.destroy();
        if (this.battleManager) this.battleManager.destroy();
        this.destroyJoystick();
        this.cameras.main.fadeOut(400, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('VillageScene');
        });
    }
    
    saveGame() {
        if (!this.saveData) return;
        this.saveData.progress = this.saveData.progress || {};
        this.saveData.progress.playerX = this.manager.playerX;
        this.saveData.progress.playerY = this.manager.playerY;
        try {
            localStorage.setItem('isekai_world_save', JSON.stringify(this.saveData));
        } catch (e) {
            console.error('[AdventureScene] Save failed:', e);
        }
    }
    
    loadSave() {
        try {
            const raw = localStorage.getItem('isekai_world_save');
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }
    
    onResize(size) {
        if (this.cam) this.cam.onResize(size.width, size.height);
        if (this.ui) this.ui.createHUD();
        // Recreate joystick if active
        if (this.joystickActive) {
            this.createJoystick(70, size.height - 80);
        }
    }
    
    update(time, delta) {
        const isAutoWalking = this.battleManager && this.battleManager.isAutoWalking;
        const isInBattle = this.battleManager && this.battleManager.isInBattle;
        
        // Handle joystick touch input
        const hasTouch = this.sys.game.device.input.touch;
        if (hasTouch && !isInBattle) {
            this._handleJoystickInput();
        }
        
        // Movement: combine keyboard + joystick
        if (!isAutoWalking && !isInBattle) {
            const kbVel = this.getMovementVelocity();
            const jsVel = this.getJoystickVelocity();
            
            let finalVx = kbVel.x;
            let finalVy = kbVel.y;
            
            // Joystick overrides keyboard if active
            if (Math.abs(jsVel.x) > 0.1 || Math.abs(jsVel.y) > 0.1) {
                finalVx = jsVel.x;
                finalVy = jsVel.y;
                // Normalize diagonal
                const len = Math.sqrt(finalVx * finalVx + finalVy * finalVy);
                if (len > 1) { finalVx /= len; finalVy /= len; }
            }
            
            this.manager.updateMovement({ x: finalVx, y: finalVy }, delta);
        }
        
        this.cam.update(delta);
        
        if (this.spawner) {
            this.spawner.update(delta);
        }
        
        if (this.battleManager) {
            this.battleManager.update(delta);
        }
        
        if (this.debugMode && this.spawnDebugger && this.spawner) {
            this.spawnDebugger.updateDisplay(this.spawner);
        }
        
        this.drawPlayer();
        
        if (time - this.lastSaveTime > 30000) {
            this.saveGame();
            this.lastSaveTime = time;
        }
    }
    
    _handleJoystickInput() {
        const pointers = this.input.manager.pointers;
        const isMobile = !this.sys.game.device.os.desktop;
        
        // Check for touch input (works on all touch-capable devices)
        const hasTouch = this.scene.sys.game.device.input.touch;
        if (!hasTouch) {
            if (this.joystickActive) this.destroyJoystick();
            return;
        }
        
        // Find any pointer not used by UI buttons (left side for joystick)
        let leftPointer = null;
        const w = this.cameras.main.width;
        for (const p of pointers) {
            if (p.isDown && p.x < w * 0.6) {
                leftPointer = p;
                break;
            }
        }
        
        if (leftPointer && !this.joystickActive) {
            this.joystickActive = true;
            this.joystickPointer = leftPointer.id;
            this.createJoystick(leftPointer.x, leftPointer.y);
            this.updateJoystick(leftPointer);
        } else if (leftPointer && this.joystickActive && leftPointer.id === this.joystickPointer) {
            this.updateJoystick(leftPointer);
        } else if (!leftPointer && this.joystickActive) {
            this.destroyJoystick();
        }
    }
    
    /** Callback saat reward selesai diproses */
    onRewardProcessed(rewardResult) {
        // Update UI dengan data terbaru
        if (this.ui) {
            this.ui.updateStats(this.saveData);
        }
    }

    shutdown() {
        this.saveGame();
        if (this.ui) this.ui.destroy();
        if (this.invUI) { this.invUI.destroy(); this.invUI = null; }
        if (this.spawner) { this.spawner.destroy(); this.spawner = null; }
        if (this.spawnDebugger) { this.spawnDebugger.destroy(); this.spawnDebugger = null; }
        if (this.battleManager) { this.battleManager.destroy(); this.battleManager = null; }
        if (this.rewardManager) { this.rewardManager.destroy(); this.rewardManager = null; }
        // Simpan warehouse dan inventory
        if (this.warehouseManager) WarehouseSave.save(this.warehouseManager);
        if (this.inventoryManager) InventorySave.save(this.inventoryManager);
        this.destroyJoystick();
    }
}
