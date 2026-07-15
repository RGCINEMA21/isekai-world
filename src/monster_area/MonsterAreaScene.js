/**
 * MonsterAreaScene - Main scene for all monster areas.
 * Template scene reusable for all 10 areas.
 */
class MonsterAreaScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MonsterAreaScene' });
    }

    init(data) {
        this.areaId = data.areaId || 'beginner_grassland';
        this.areaName = data.areaName || 'Beginner Grassland';
        this.mapWidth = data.mapWidth || 50;
        this.mapHeight = data.mapHeight || 50;
        this.spawnX = data.spawnX || 25;
        this.spawnY = data.spawnY || 46;
        this.theme = data.theme || 'grassland';
    }

    create() {
        this.saveData = this._loadSave();

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

        this.mapGfx = this.add.graphics().setDepth(0);
        this._renderMap();

        this.player = new PlayerController(this, this.areaMap, this.saveData);

        this.areaCamera = new MonsterAreaCamera(this, this.player, this.areaMap);
        this.areaCamera.init();

        this.areaUI = new MonsterAreaUI(this, this.saveData, this.areaName);
        this.areaUI.create(
            () => this._exitArea(),
            () => this._showNotif('Inventory tersedia setelah sistem selesai.')
        );

        this.cameras.main.fadeIn(400, 0, 0, 0);
        this.scale.on('resize', (sz) => this.onResize(sz));
        this.lastSaveTime = 0;
    }

    update(time, delta) {
        this.player.update(delta);
        this.areaCamera.update(delta);
        if (time - this.lastSaveTime > 15000) {
            this._autoSave();
            this.lastSaveTime = time;
        }
    }

    _renderMap() {
        const g = this.mapGfx;
        const T = this.areaMap.T;
        const S = this.areaMap.tileSize;
        const grid = this.areaMap.grid;
        const c = this.areaMap.themeColors;

        for (let y = 0; y < this.areaMap.mapHeight; y++) {
            for (let x = 0; x < this.areaMap.mapWidth; x++) {
                const px = x * S;
                const py = y * S;
                const tile = grid[y][x];

                switch (tile) {
                    case T.GROUND:
                        g.fillStyle(c.ground, 1); g.fillRect(px, py, S, S);
                        if (Math.random() < 0.1) { g.fillStyle(c.groundDark, 0.4); g.fillRect(px+2, py+4, 2, 5); }
                        break;
                    case T.GROUND_DARK:
                        g.fillStyle(c.groundDark, 1); g.fillRect(px, py, S, S);
                        break;
                    case T.PATH:
                        g.fillStyle(c.path, 1); g.fillRect(px, py, S, S);
                        g.fillStyle(c.path - 0x111111, 0.3); g.fillRect(px+3, py+2, 4, 3);
                        break;
                    case T.WATER:
                        g.fillStyle(c.water, 1); g.fillRect(px, py, S, S);
                        g.fillStyle(0xffffff, 0.15); g.fillRect(px+2, py+3, 6, 2);
                        break;
                    case T.BRIDGE:
                        g.fillStyle(c.fence, 1); g.fillRect(px, py, S, S);
                        g.lineStyle(1, c.fence - 0x222222, 0.4);
                        g.lineBetween(px, py, px+S, py); g.lineBetween(px, py+S-1, px+S, py+S-1);
                        break;
                    case T.TREE:
                        g.fillStyle(c.ground, 1); g.fillRect(px, py, S, S);
                        g.fillStyle(c.treeTrunk, 1); g.fillRect(px+6, py+10, 4, 6);
                        g.fillStyle(c.tree, 1); g.fillCircle(px+8, py+7, 7);
                        g.fillStyle(c.tree + 0x111111, 0.4); g.fillCircle(px+7, py+5, 5);
                        break;
                    case T.TREE_SM:
                        g.fillStyle(c.ground, 1); g.fillRect(px, py, S, S);
                        g.fillStyle(c.treeTrunk, 1); g.fillRect(px+7, py+10, 2, 6);
                        g.fillStyle(c.tree, 1); g.fillCircle(px+8, py+8, 5);
                        break;
                    case T.ROCK:
                        g.fillStyle(c.ground, 1); g.fillRect(px, py, S, S);
                        g.fillStyle(c.rock, 1); g.fillCircle(px+8, py+9, 6);
                        g.fillStyle(c.rock + 0x111111, 0.5); g.fillCircle(px+7, py+8, 4);
                        break;
                    case T.ROCK_SM:
                        g.fillStyle(c.ground, 1); g.fillRect(px, py, S, S);
                        g.fillStyle(c.rock, 0.7); g.fillCircle(px+8, py+10, 4);
                        break;
                    case T.FENCE:
                        g.fillStyle(c.ground, 1); g.fillRect(px, py, S, S);
                        g.fillStyle(c.fence, 1);
                        g.fillRect(px, py+4, S, 3);
                        g.fillRect(px+3, py+2, 2, 8);
                        g.fillRect(px+11, py+2, 2, 8);
                        break;
                    case T.FLOWERS:
                        g.fillStyle(c.ground, 1); g.fillRect(px, py, S, S);
                        g.fillStyle(0xff6688, 1); g.fillCircle(px+5, py+8, 2);
                        g.fillStyle(0xffcc44, 1); g.fillCircle(px+11, py+6, 2);
                        g.fillStyle(0xff88cc, 0.5); g.fillCircle(px+8, py+12, 2);
                        break;
                    case T.BUSH:
                        g.fillStyle(c.ground, 1); g.fillRect(px, py, S, S);
                        g.fillStyle(c.tree - 0x111111, 1); g.fillEllipse(px+8, py+9, 14, 10);
                        break;
                    case T.HILL:
                        g.fillStyle(c.hill, 1); g.fillRect(px, py, S, S);
                        break;
                    case T.SPECIAL:
                        g.fillStyle(c.ground, 1); g.fillRect(px, py, S, S);
                        break;
                    case T.SAND:
                        g.fillStyle(0xddcc88, 1); g.fillRect(px, py, S, S);
                        break;
                    case T.BORDER:
                        g.fillStyle(c.fence - 0x111111, 1); g.fillRect(px, py, S, S);
                        g.lineStyle(1, c.fence - 0x222222, 0.5);
                        g.strokeRect(px, py, S, S);
                        break;
                    default:
                        g.fillStyle(c.ground, 1); g.fillRect(px, py, S, S);
                }
            }
        }
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
        const notif = this.scene.add.container(w / 2, h * 0.85).setDepth(500).setScrollFactor(0).setAlpha(0);
        notif.add(this.scene.add.text(0, 0, msg, {
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

    _autoSave() {
        if (!this.saveData) return;
        this.saveData.progress = this.saveData.progress || {};
        this.saveData.progress.areaX = this.player.x;
        this.saveData.progress.areaY = this.player.y;
        try { localStorage.setItem('isekai_world_save', JSON.stringify(this.saveData)); } catch(e) {}
    }

    _loadSave() {
        try { const r = localStorage.getItem('isekai_world_save'); return r ? JSON.parse(r) : null; } catch(e) { return null; }
    }

    onResize(sz) {
        const w = sz.width;
        const h = sz.height;
        if (this.areaCamera) this.areaCamera.onResize(w, h);
        if (this.player) this.player.reposition(w, h);
        if (this.areaUI) this.areaUI.destroy();
        this.areaUI = new MonsterAreaUI(this, this.saveData, this.areaName);
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
