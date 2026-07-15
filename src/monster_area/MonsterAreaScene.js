/**
 * MonsterAreaScene - Main scene for monster areas.
 * Template scene reusable for all monster areas.
 * Player walks around, camera follows, collision active.
 */
class MonsterAreaScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MonsterAreaScene' });
    }

    init(data) {
        this.areaId = data.areaId || 'beginner_grassland';
        this.areaName = data.areaName || 'Beginner Grassland';
        this.mapWidth = data.mapWidth || 80;
        this.mapHeight = data.mapHeight || 80;
        this.spawnX = data.spawnX || 40;
        this.spawnY = data.spawnY || 70;
    }

    create() {
        this.saveData = this._loadSave();

        // Generate map
        this.areaMap = new MonsterAreaMap({
            areaId: this.areaId,
            areaName: this.areaName,
            tileSize: 16,
            mapWidth: this.mapWidth,
            mapHeight: this.mapHeight,
            spawnX: this.spawnX,
            spawnY: this.spawnY
        });

        // Render map
        this.mapGfx = this.add.graphics().setDepth(0);
        this._renderMap();

        // Player
        this.player = new PlayerController(this, this.areaMap, this.saveData);

        // Camera
        this.areaCamera = new MonsterAreaCamera(this, this.player, this.areaMap);
        this.areaCamera.init();

        // UI
        this.areaUI = new MonsterAreaUI(this, this.saveData, this.areaName);
        this.areaUI.create(
            () => this._exitArea(),
            () => this._showNotif('Inventory tersedia setelah sistem selesai.')
        );

        // Fade in
        this.cameras.main.fadeIn(400, 0, 0, 0);

        // Resize
        this.scale.on('resize', (sz) => this.onResize(sz));

        // Auto-save timer
        this.lastSaveTime = 0;
    }

    update(time, delta) {
        this.player.update(delta);
        this.areaCamera.update(delta);

        // Auto-save every 15 seconds
        if (time - this.lastSaveTime > 15000) {
            this._autoSave();
            this.lastSaveTime = time;
        }
    }

    // === MAP RENDERING ===

    _renderMap() {
        const g = this.mapGfx;
        const T = this.areaMap.T;
        const S = this.areaMap.tileSize;
        const grid = this.areaMap.grid;

        for (let y = 0; y < this.areaMap.mapHeight; y++) {
            for (let x = 0; x < this.areaMap.mapWidth; x++) {
                const px = x * S;
                const py = y * S;
                const tile = grid[y][x];

                switch (tile) {
                    case T.GRASS:
                        g.fillStyle(0x5a9a3a, 1);
                        g.fillRect(px, py, S, S);
                        if (Math.random() < 0.1) { g.fillStyle(0x4a8a2a, 0.4); g.fillRect(px+2, py+4, 2, 5); }
                        break;
                    case T.GRASS_DARK:
                        g.fillStyle(0x4a8a2a, 1);
                        g.fillRect(px, py, S, S);
                        break;
                    case T.PATH:
                        g.fillStyle(0xc4a86a, 1);
                        g.fillRect(px, py, S, S);
                        g.fillStyle(0xb8985a, 0.3);
                        g.fillRect(px+3, py+2, 4, 3);
                        break;
                    case T.WATER:
                        g.fillStyle(0x3388cc, 1);
                        g.fillRect(px, py, S, S);
                        g.fillStyle(0x44aaee, 0.3);
                        g.fillRect(px+2, py+3, 6, 2);
                        break;
                    case T.BRIDGE:
                        g.fillStyle(0x8b6b4a, 1);
                        g.fillRect(px, py, S, S);
                        g.lineStyle(1, 0x6b4b2a, 0.4);
                        g.lineBetween(px, py, px+S, py);
                        g.lineBetween(px, py+S-1, px+S, py+S-1);
                        break;
                    case T.TREE:
                        g.fillStyle(0x5a9a3a, 1);
                        g.fillRect(px, py, S, S);
                        g.fillStyle(0x5a3a1a, 1);
                        g.fillRect(px+6, py+10, 4, 6);
                        g.fillStyle(0x2d7a1e, 1);
                        g.fillCircle(px+8, py+7, 7);
                        g.fillStyle(0x3a9a2a, 0.5);
                        g.fillCircle(px+7, py+5, 5);
                        break;
                    case T.TREE_SM:
                        g.fillStyle(0x5a9a3a, 1);
                        g.fillRect(px, py, S, S);
                        g.fillStyle(0x5a3a1a, 1);
                        g.fillRect(px+7, py+10, 2, 6);
                        g.fillStyle(0x3a8a2a, 1);
                        g.fillCircle(px+8, py+8, 5);
                        break;
                    case T.ROCK:
                        g.fillStyle(0x5a9a3a, 1);
                        g.fillRect(px, py, S, S);
                        g.fillStyle(0x888888, 1);
                        g.fillCircle(px+8, py+9, 6);
                        g.fillStyle(0x999999, 0.6);
                        g.fillCircle(px+7, py+8, 4);
                        break;
                    case T.ROCK_SM:
                        g.fillStyle(0x5a9a3a, 1);
                        g.fillRect(px, py, S, S);
                        g.fillStyle(0x888888, 0.8);
                        g.fillCircle(px+8, py+10, 4);
                        break;
                    case T.FENCE:
                        g.fillStyle(0x5a9a3a, 1);
                        g.fillRect(px, py, S, S);
                        g.fillStyle(0x8b6b4a, 1);
                        g.fillRect(px, py+4, S, 3);
                        g.fillRect(px+3, py+2, 2, 8);
                        g.fillRect(px+11, py+2, 2, 8);
                        break;
                    case T.FLOWERS:
                        g.fillStyle(0x5a9a3a, 1);
                        g.fillRect(px, py, S, S);
                        g.fillStyle(0xff6688, 1);
                        g.fillCircle(px+5, py+8, 2);
                        g.fillStyle(0xffcc44, 1);
                        g.fillCircle(px+11, py+6, 2);
                        g.fillStyle(0xff88cc, 0.6);
                        g.fillCircle(px+8, py+12, 2);
                        break;
                    case T.SHRUB:
                        g.fillStyle(0x5a9a3a, 1);
                        g.fillRect(px, py, S, S);
                        g.fillStyle(0x3a7a2a, 1);
                        g.fillEllipse(px+8, py+10, 12, 8);
                        break;
                    case T.HILL:
                        g.fillStyle(0x6aaa4a, 1);
                        g.fillRect(px, py, S, S);
                        g.fillStyle(0x5a9a3a, 0.5);
                        g.fillRect(px+2, py+4, 12, 2);
                        break;
                    case T.BUSH:
                        g.fillStyle(0x5a9a3a, 1);
                        g.fillRect(px, py, S, S);
                        g.fillStyle(0x2d6a1e, 1);
                        g.fillEllipse(px+8, py+9, 14, 10);
                        break;
                    case T.SAND:
                        g.fillStyle(0xddcc88, 1);
                        g.fillRect(px, py, S, S);
                        break;
                    case T.WALL:
                        g.fillStyle(0x888888, 1);
                        g.fillRect(px, py, S, S);
                        break;
                    case T.SIGN:
                        g.fillStyle(0x5a9a3a, 1);
                        g.fillRect(px, py, S, S);
                        g.fillStyle(0x8b6b4a, 1);
                        g.fillRect(px+6, py+6, 4, 10);
                        g.fillRect(px+3, py+3, 10, 5);
                        g.fillStyle(0xffffff, 0.7);
                        g.fillRect(px+4, py+4, 8, 3);
                        break;
                    default:
                        g.fillStyle(0x5a9a3a, 1);
                        g.fillRect(px, py, S, S);
                }
            }
        }
    }

    // === NAVIGATION ===

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
        notif.add(this.add.text(0, 0, msg, {
            fontSize: Math.max(11, Math.min(14, w * 0.014)) + 'px',
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

    // === SAVE ===

    _autoSave() {
        if (!this.saveData) return;
        this.saveData.progress = this.saveData.progress || {};
        this.saveData.progress.areaX = this.player.x;
        this.saveData.progress.areaY = this.player.y;
        try {
            localStorage.setItem('isekai_world_save', JSON.stringify(this.saveData));
        } catch (e) {}
    }

    _loadSave() {
        try {
            const r = localStorage.getItem('isekai_world_save');
            return r ? JSON.parse(r) : null;
        } catch (e) { return null; }
    }

    onResize(sz) {
        this.areaCamera.onResize(sz.width, sz.height);
        this.areaUI.create(
            () => this._exitArea(),
            () => this._showNotif('Inventory tersedia setelah sistem selesai.')
        );
    }

    shutdown() {
        this._autoSave();
        if (this.player) this.player.destroy();
        if (this.areaUI) this.areaUI.destroy();
    }
}
