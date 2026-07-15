/**
 * PlayerController - Handles player movement, animation, and collision.
 * Desktop: WASD + Arrow Keys
 * Mobile: Large D-Pad buttons (always visible, bottom-left)
 */
class PlayerController {
    constructor(scene, map, saveData) {
        this.scene = scene;
        this.map = map;
        this.saveData = saveData;

        this.x = map.getSpawnPixelX();
        this.y = map.getSpawnPixelY();

        if (saveData?.progress?.areaX != null) {
            this.x = saveData.progress.areaX;
            this.y = saveData.progress.areaY;
        }

        this.facing = 'down';
        this.isMoving = false;
        this.animFrame = 0;
        this.animTimer = 0;
        this.moveSpeed = 120;
        this.bodyW = 8;
        this.bodyH = 4;

        this.gfx = scene.add.graphics().setDepth(10);

        // Input state
        this.inputVx = 0;
        this.inputVy = 0;

        // Keyboard
        this._setupKeyboard();

        // Mobile D-Pad
        this.dpadContainer = null;
        this.dpadButtons = { up:false, down:false, left:false, right:false };
        this._setupMobileDpad();

        this.gender = saveData?.player?.gender || 'male';
    }

    _setupKeyboard() {
        const kb = this.scene.input.keyboard;
        if (!kb) return;
        this.cursors = kb.createCursorKeys();
        this.keyW = kb.addKey('W');
        this.keyA = kb.addKey('A');
        this.keyS = kb.addKey('S');
        this.keyD = kb.addKey('D');
        kb.addCapture(['UP','DOWN','LEFT','RIGHT','W','A','S','D']);
    }

    _setupMobileDpad() {
        const w = this.scene.cameras.main.width;
        const h = this.scene.cameras.main.height;

        this.dpadContainer = this.scene.add.container(0, 0).setDepth(200).setScrollFactor(0);

        // D-Pad config - big and visible
        const btnSize = 56;
        const gap = 6;
        const cx = btnSize * 1.6 + 16;
        const cy = h - btnSize * 1.6 - 30;

        const dirs = [
            { key:'up',    x:cx, y:cy - btnSize - gap, label:'▲' },
            { key:'down',  x:cx, y:cy + btnSize + gap, label:'▼' },
            { key:'left',  x:cx - btnSize - gap, y:cy, label:'◀' },
            { key:'right', x:cx + btnSize + gap, y:cy, label:'▶' },
        ];

        for (const d of dirs) {
            this._createDpadButton(d, btnSize);
        }

        // Center decoration
        const center = this.scene.add.graphics();
        center.fillStyle(0xffffff, 0.1);
        center.fillCircle(cx, cy, btnSize * 0.5);
        this.dpadContainer.add(center);
    }

    _createDpadButton(d, btnSize) {
        const r = btnSize / 2;

        // Background
        const bg = this.scene.add.graphics();
        this._drawBtnBg(bg, d.x, d.y, r, false);
        this.dpadContainer.add(bg);

        // Arrow text
        const label = this.scene.add.text(d.x, d.y, d.label, {
            fontSize: '22px', fontFamily: 'Arial', color: '#ffffff'
        }).setOrigin(0.5).setAlpha(0.7);
        this.dpadContainer.add(label);

        // Big invisible hit area (easier to tap)
        const hitSize = btnSize + 20;
        const hit = this.scene.add.rectangle(d.x, d.y, hitSize, hitSize, 0x000000, 0);

        // Use scene-level input to avoid conflicts
        hit.setInteractive({ draggable: false });

        hit.on('pointerdown', (pointer) => {
            this.dpadButtons[d.key] = true;
            label.setAlpha(1);
            this._drawBtnBg(bg, d.x, d.y, r, true);
        });

        hit.on('pointerup', () => {
            this.dpadButtons[d.key] = false;
            label.setAlpha(0.7);
            this._drawBtnBg(bg, d.x, d.y, r, false);
        });

        hit.on('pointerout', () => {
            this.dpadButtons[d.key] = false;
            label.setAlpha(0.7);
            this._drawBtnBg(bg, d.x, d.y, r, false);
        });

        hit.on('pointerover', (pointer) => {
            if (pointer.isDown) {
                this.dpadButtons[d.key] = true;
                label.setAlpha(1);
                this._drawBtnBg(bg, d.x, d.y, r, true);
            }
        });

        this.dpadContainer.add(hit);
    }

    _drawBtnBg(g, x, y, r, pressed) {
        g.clear();
        if (pressed) {
            g.fillStyle(0xffffff, 0.3);
            g.fillCircle(x, y, r);
            g.lineStyle(3, 0xffffff, 0.7);
            g.strokeCircle(x, y, r);
        } else {
            g.fillStyle(0x000000, 0.25);
            g.fillCircle(x, y, r);
            g.lineStyle(2, 0xffffff, 0.35);
            g.strokeCircle(x, y, r);
        }
    }

    // === COLLISION ===

    _canMoveTo(px, py) {
        const hw = this.bodyW / 2;
        const hh = this.bodyH / 2;
        const S = this.map.tileSize;
        const corners = [
            [Math.floor((px - hw) / S), Math.floor((py - hh) / S)],
            [Math.floor((px + hw) / S), Math.floor((py - hh) / S)],
            [Math.floor((px - hw) / S), Math.floor((py + hh) / S)],
            [Math.floor((px + hw) / S), Math.floor((py + hh) / S)],
        ];
        for (const [tx, ty] of corners) {
            if (!this.map.isWalkable(tx, ty)) return false;
        }
        return true;
    }

    // === UPDATE ===

    update(delta) {
        let vx = 0;
        let vy = 0;

        // Keyboard
        if (this.cursors) {
            if (this.cursors.left.isDown)  vx = -1;
            if (this.cursors.right.isDown) vx = 1;
            if (this.cursors.up.isDown)    vy = -1;
            if (this.cursors.down.isDown)  vy = 1;
        }
        if (vx === 0 && vy === 0) {
            if (this.keyA && this.keyA.isDown) vx = -1;
            if (this.keyD && this.keyD.isDown) vx = 1;
            if (this.keyW && this.keyW.isDown) vy = -1;
            if (this.keyS && this.keyS.isDown) vy = 1;
        }

        // Mobile D-Pad
        if (vx === 0 && vy === 0) {
            if (this.dpadButtons.left)  vx = -1;
            if (this.dpadButtons.right) vx = 1;
            if (this.dpadButtons.up)    vy = -1;
            if (this.dpadButtons.down)  vy = 1;
        }

        // Normalize diagonal
        if (vx !== 0 && vy !== 0) {
            const inv = 1 / Math.sqrt(2);
            vx *= inv;
            vy *= inv;
        }

        // Movement with collision
        const dt = delta / 1000;
        const newX = this.x + vx * this.moveSpeed * dt;
        const newY = this.y + vy * this.moveSpeed * dt;

        if (vx !== 0 && this._canMoveTo(newX, this.y)) {
            this.x = newX;
        }
        if (vy !== 0 && this._canMoveTo(this.x, newY)) {
            this.y = newY;
        }

        // Clamp to map
        this.x = Phaser.Math.Clamp(this.x, this.map.tileSize, this.map.getPixelWidth() - this.map.tileSize);
        this.y = Phaser.Math.Clamp(this.y, this.map.tileSize, this.map.getPixelHeight() - this.map.tileSize);

        // Facing & animation
        if (vx !== 0 || vy !== 0) {
            this.isMoving = true;
            if (Math.abs(vx) > Math.abs(vy)) {
                this.facing = vx > 0 ? 'right' : 'left';
            } else {
                this.facing = vy > 0 ? 'down' : 'up';
            }
            this.animTimer += delta;
            if (this.animTimer >= 150) {
                this.animTimer = 0;
                this.animFrame = (this.animFrame + 1) % 4;
            }
        } else {
            this.isMoving = false;
            this.animFrame = 0;
        }

        this.draw();
    }

    // === DRAW PLAYER ===

    draw() {
        const g = this.gfx;
        g.clear();
        const x = Math.round(this.x);
        const y = Math.round(this.y);
        const skin = 0xffcc99;
        const hair = this.gender === 'female' ? 0xcc6633 : 0x443322;
        const shirt = this.gender === 'female' ? 0xcc4488 : 0x4466aa;
        const pants = 0x444466;
        const boot = 0x3a2a1a;
        const step = this.isMoving ? Math.sin(this.animFrame * Math.PI) * 2 : 0;

        g.fillStyle(0x000000, 0.2);
        g.fillEllipse(x, y + 12, 14, 5);

        g.fillStyle(boot, 1);
        g.fillRect(x - 3, y + 3 + (this.isMoving && this.facing !== 'up' ? step : 0), 2, 3);
        g.fillRect(x + 1, y + 3 + (this.isMoving && this.facing !== 'up' ? -step : 0), 2, 3);

        g.fillStyle(pants, 1);
        g.fillRect(x - 3, y - 1, 2, 5);
        g.fillRect(x + 1, y - 1, 2, 5);

        g.fillStyle(shirt, 1);
        g.fillRect(x - 4, y - 6, 8, 6);

        const armSwing = this.isMoving ? Math.sin(this.animFrame * Math.PI) * 2 : 0;
        g.fillStyle(skin, 1);
        g.fillRect(x - 5, y - 4 + armSwing, 2, 5);
        g.fillRect(x + 3, y - 4 - armSwing, 2, 5);

        g.fillStyle(skin, 1);
        g.fillRect(x - 3, y - 12, 6, 7);

        g.fillStyle(hair, 1);
        g.fillRect(x - 3, y - 13, 6, 3);
        if (this.facing === 'down') {
            g.fillRect(x - 4, y - 12, 1, 4);
            g.fillRect(x + 3, y - 12, 1, 4);
        } else if (this.facing === 'up') {
            g.fillRect(x - 4, y - 13, 8, 4);
        } else if (this.facing === 'left') {
            g.fillRect(x - 4, y - 13, 6, 3);
            g.fillRect(x - 4, y - 11, 1, 4);
        } else {
            g.fillRect(x - 2, y - 13, 6, 3);
            g.fillRect(x + 3, y - 11, 1, 4);
        }

        if (this.facing !== 'up') {
            g.fillStyle(0xffffff, 1);
            if (this.facing === 'down') {
                g.fillRect(x - 2, y - 10, 2, 2);
                g.fillRect(x + 1, y - 10, 2, 2);
                g.fillStyle(0x2244aa, 1);
                g.fillRect(x - 1, y - 9, 1, 1);
                g.fillRect(x + 1, y - 9, 1, 1);
            } else if (this.facing === 'left') {
                g.fillRect(x - 3, y - 10, 2, 2);
                g.fillStyle(0x2244aa, 1);
                g.fillRect(x - 2, y - 9, 1, 1);
            } else {
                g.fillRect(x + 1, y - 10, 2, 2);
                g.fillStyle(0x2244aa, 1);
                g.fillRect(x + 1, y - 9, 1, 1);
            }
        }
    }

    destroy() {
        if (this.gfx) this.gfx.destroy();
        if (this.dpadContainer) this.dpadContainer.destroy();
    }
}
