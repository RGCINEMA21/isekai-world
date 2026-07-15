/**
 * MonsterAreaScene - Main scene for monster areas.
 * Integrates map, player, camera, UI, monster spawning, and battle.
 */
class MonsterAreaScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MonsterAreaScene' });
    }

    init(data) {
        this.areaId = data.areaId || 'beginner_grassland';
        this.areaName = data.areaName || 'Beginner Grassland';
        this.mapWidth = data.mapWidth || 25;
        this.mapHeight = data.mapHeight || 25;
        this.spawnX = data.spawnX || 12;
        this.spawnY = data.spawnY || 22;
        this.theme = data.theme || 'grassland';
    }

    create() {
        this.saveData = this._loadSave();
        this.playerGfx = null;

        // Set background color EARLY
        const areaData = MonsterAreaDatabase.getArea(this.areaId);
        const bgColor = (areaData && areaData.bgColor) ? areaData.bgColor : 0x5a9a3a;
        this.cameras.main.setBackgroundColor(bgColor);

        try {
            // Map
            this.areaMap = new MonsterAreaMap({
                areaId: this.areaId,
                areaName: this.areaName,
                tileSize: 16,
                mapWidth: this.mapWidth,
                mapHeight: this.mapHeight,
                spawnX: this.spawnX,
                spawnY: this.spawnY,
                theme: this.theme
            });

            // Render map tiles
            this.mapGfx = this.add.graphics().setDepth(0);
            this._renderMap();

            // Player
            this.player = new PlayerController(this, this.areaMap, this.saveData);
            this.playerGfx = this.player.gfx;

            // Camera
            this.areaCamera = new MonsterAreaCamera(this, this.player, this.areaMap);
            this.areaCamera.init();

            // Monster Spawner
            this.monsterSpawner = new MonsterSpawner(this, {
                areaId: this.areaId,
                tileSize: 16,
                playerX: this.player.x,
                playerY: this.player.y,
                moveSpeed: 120,
                facing: 'down',
                isMoving: false,
                bounds: {
                    left: 0,
                    top: 0,
                    right: this.areaMap.getPixelWidth(),
                    bottom: this.areaMap.getPixelHeight()
                }
            });
            this.monsterSpawner.init();

            // Reward Manager
            try {
                this.rewardManager = new RewardManager(this, this.saveData);
            } catch (e) {
                console.warn('[MonsterAreaScene] RewardManager init failed:', e);
                this.rewardManager = null;
            }

            // Battle Manager
            try {
                this.battleManager = new BattleManager(this, this.monsterSpawner.manager, this.monsterSpawner, this.rewardManager);
            } catch (e) {
                console.warn('[MonsterAreaScene] BattleManager init failed:', e);
                this.battleManager = null;
            }

            // UI
            this.areaUI = new MonsterAreaUI(this, this.saveData, this.areaName);
            this.areaUI.create(
                () => this._exitArea(),
                () => this._showNotif('Inventory tersedia setelah sistem selesai.')
            );

            // Setup monster click handlers
            this._setupMonsterClicks();

        } catch (e) {
            console.error('[MonsterAreaScene] Create error:', e);
            const w = this.cameras.main.width;
            const h = this.cameras.main.height;
            this.add.text(w / 2, h / 2 - 20, '⚠️ Error: ' + e.message, {
                fontSize: '14px', color: '#ff4444', fontFamily: 'Arial',
                stroke: '#000000', strokeThickness: 3,
                wordWrap: { width: w * 0.8 }
            }).setOrigin(0.5);
            this.add.text(w / 2, h / 2 + 20, 'Tap untuk kembali ke desa', {
                fontSize: '12px', color: '#ffffff', fontFamily: 'Arial'
            }).setOrigin(0.5);
            this.input.once('pointerdown', () => this._exitArea());
        }

        this.cameras.main.fadeIn(400, 0, 0, 0);
        this.scale.on('resize', (sz) => this.onResize(sz));
        this.lastSaveTime = 0;
    }

    update(time, delta) {
        if (this.player) {
            this.player.update(delta);
            if (this.monsterSpawner && this.monsterSpawner.manager) {
                this.monsterSpawner.manager.playerX = this.player.x;
                this.monsterSpawner.manager.playerY = this.player.y;
                this.monsterSpawner.manager.facing = this.player.facing;
                this.monsterSpawner.manager.isMoving = this.player.isMoving;
            }
        }
        if (this.areaCamera) this.areaCamera.update(delta);
        if (this.monsterSpawner) this.monsterSpawner.update(delta);
        if (this.battleManager) this.battleManager.update(delta);

        if (time - this.lastSaveTime > 15000) {
            this._autoSave();
            this.lastSaveTime = time;
        }
    }

    _renderMap() {
        const g = this.mapGfx;
        g.clear();
        const grid = this.areaMap.grid;
        const T = this.areaMap.T;
        const S = this.areaMap.tileSize;

        for (let y = 0; y < this.areaMap.mapHeight; y++) {
            for (let x = 0; x < this.areaMap.mapWidth; x++) {
                const px = x * S;
                const py = y * S;
                const tile = grid[y][x];
                switch (tile) {
                    case T.GRASS:
                        g.fillStyle(0x5a9a3a, 1); g.fillRect(px, py, S, S);
                        if (Math.random() < 0.1) { g.fillStyle(0x4a8a2a, 0.4); g.fillRect(px + 3, py + 5, 2, 4); }
                        break;
                    case T.GRASS_DARK:
                        g.fillStyle(0x4a8a30, 1); g.fillRect(px, py, S, S); break;
                    case T.PATH:
                        g.fillStyle(0xc4a86a, 1); g.fillRect(px, py, S, S);
                        g.fillStyle(0xb8985a, 0.3); g.fillRect(px + 3, py + 2, 4, 3); break;
                    case T.WATER:
                        g.fillStyle(0x3388cc, 1); g.fillRect(px, py, S, S);
                        g.fillStyle(0x44aaee, 0.3); g.fillRect(px + 2, py + 3, 6, 2); break;
                    case T.BRIDGE:
                        g.fillStyle(0x8b6b4a, 1); g.fillRect(px, py, S, S);
                        g.lineStyle(1, 0x6b4b2a, 0.5);
                        g.lineBetween(px, py, px + S, py);
                        g.lineBetween(px, py + S - 1, px + S, py + S - 1); break;
                    case T.TREE:
                        g.fillStyle(0x5a9a3a, 1); g.fillRect(px, py, S, S);
                        g.fillStyle(0x5a3a1a, 1); g.fillRect(px + 6, py + 10, 4, 6);
                        g.fillStyle(0x2d7a1e, 1); g.fillCircle(px + 8, py + 7, 7);
                        g.fillStyle(0x3a9a2a, 0.5); g.fillCircle(px + 7, py + 5, 5); break;
                    case T.TREE_SM:
                        g.fillStyle(0x5a9a3a, 1); g.fillRect(px, py, S, S);
                        g.fillStyle(0x5a3a1a, 1); g.fillRect(px + 7, py + 10, 2, 6);
                        g.fillStyle(0x3a8a2a, 1); g.fillCircle(px + 8, py + 8, 5); break;
                    case T.ROCK:
                        g.fillStyle(0x5a9a3a, 1); g.fillRect(px, py, S, S);
                        g.fillStyle(0x888888, 1); g.fillCircle(px + 8, py + 9, 6); break;
                    case T.ROCK_SM:
                        g.fillStyle(0x5a9a3a, 1); g.fillRect(px, py, S, S);
                        g.fillStyle(0x888888, 0.8); g.fillCircle(px + 8, py + 10, 4); break;
                    case T.FENCE:
                        g.fillStyle(0x5a9a3a, 1); g.fillRect(px, py, S, S);
                        g.fillStyle(0x8b6b4a, 1); g.fillRect(px, py + 4, S, 3); break;
                    case T.FLOWERS:
                        g.fillStyle(0x5a9a3a, 1); g.fillRect(px, py, S, S);
                        g.fillStyle(0xff6688, 1); g.fillCircle(px + 5, py + 8, 2);
                        g.fillStyle(0xffcc44, 1); g.fillCircle(px + 11, py + 6, 2); break;
                    case T.SHRUB:
                        g.fillStyle(0x5a9a3a, 1); g.fillRect(px, py, S, S);
                        g.fillStyle(0x3a7a2a, 1); g.fillEllipse(px + 8, py + 10, 12, 8); break;
                    case T.HILL:
                        g.fillStyle(0x6aaa4a, 1); g.fillRect(px, py, S, S); break;
                    case T.BUSH:
                        g.fillStyle(0x5a9a3a, 1); g.fillRect(px, py, S, S);
                        g.fillStyle(0x2d6a1e, 1); g.fillEllipse(px + 8, py + 9, 14, 10); break;
                    case T.SAND:
                        g.fillStyle(0xddcc88, 1); g.fillRect(px, py, S, S); break;
                    case T.WALL:
                        g.fillStyle(0x888888, 1); g.fillRect(px, py, S, S); break;
                    case T.SIGN:
                        g.fillStyle(0x5a9a3a, 1); g.fillRect(px, py, S, S);
                        g.fillStyle(0x8b6b4a, 1); g.fillRect(px + 6, py + 6, 4, 10); break;
                    default:
                        g.fillStyle(0x5a9a3a, 1); g.fillRect(px, py, S, S);
                }
            }
        }
    }

    _setupMonsterClicks() {
        // Connect monster entity clicks to BattleManager
        if (!this.battleManager || !this.monsterSpawner || !this.monsterSpawner.spawnManager) return;
        
        const bm = this.battleManager;
        const pool = this.monsterSpawner.spawnManager.pool;
        if (!pool) return;

        // Override pool acquire to attach click handler
        const originalAcquire = pool.acquire.bind(pool);
        pool.acquire = (monsterData, x, y, spawnPointId) => {
            const entity = originalAcquire(monsterData, x, y, spawnPointId);
            entity.onMonsterClick = (ent) => bm.onMonsterClicked(ent);
            return entity;
        };

        // Also attach to already-active monsters
        for (const entity of pool.active) {
            entity.onMonsterClick = (ent) => bm.onMonsterClicked(ent);
        }
    }

    exitAdventure() {
        this._exitArea();
    }

    _exitArea() {
        this._autoSave();
        this.cameras.main.fadeOut(400, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('VillageScene');
        });
    }

    _showNotif(msg) {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        const notif = this.add.container(w / 2, h * 0.85).setDepth(500).setScrollFactor(0).setAlpha(0);
        const fs = Math.max(11, Math.min(14, w * 0.016)) + 'px';
        notif.add(this.add.text(0, 0, msg, {
            fontSize: fs,
            fontFamily: 'Arial', color: '#ffffff', fontStyle: 'bold',
            stroke: '#000000', strokeThickness: 3,
            backgroundColor: '#2c1810ee', padding: { x: 16, y: 10 }
        }).setOrigin(0.5));
        this.tweens.add({
            targets: notif, alpha: 1, y: h * 0.8, duration: 300,
            onComplete: () => {
                this.tweens.add({
                    targets: notif, alpha: 0, y: h * 0.75, duration: 400, delay: 2000,
                    onComplete: () => notif.destroy()
                });
            }
        });
    }

    _autoSave() {
        if (!this.saveData || !this.player) return;
        this.saveData.progress = this.saveData.progress || {};
        this.saveData.progress.areaX = this.player.x;
        this.saveData.progress.areaY = this.player.y;
        try { localStorage.setItem('isekai_world_save', JSON.stringify(this.saveData)); } catch (e) {}
    }

    _loadSave() {
        try { const r = localStorage.getItem('isekai_world_save'); return r ? JSON.parse(r) : null; } catch (e) { return null; }
    }

    onRewardProcessed(rewardResult) {
        if (this.areaUI) {
            this.areaUI.create(
                () => this._exitArea(),
                () => this._showNotif('Inventory tersedia setelah sistem selesai.')
            );
        }
    }

    get playerX() { return this.player ? this.player.x : 0; }
    get playerY() { return this.player ? this.player.y : 0; }
    set playerX(v) { if (this.player) this.player.x = v; }
    set playerY(v) { if (this.player) this.player.y = v; }

    onResize(sz) {
        if (this.areaCamera) this.areaCamera.onResize(sz.width, sz.height);
        if (this.player) this.player.onResize();
        if (this.areaUI) {
            this.areaUI.create(
                () => this._exitArea(),
                () => this._showNotif('Inventory tersedia setelah sistem selesai.')
            );
        }
    }

    shutdown() {
        this._autoSave();
        if (this.player) this.player.destroy();
        if (this.areaUI) this.areaUI.destroy();
        if (this.monsterSpawner) this.monsterSpawner.destroy();
        if (this.battleManager) this.battleManager.destroy();
    }
}
