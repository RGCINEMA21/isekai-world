/**
 * PlayerController - Movement, animation, collision.
 * Desktop: WASD + Arrow Keys
 * Mobile: Fixed-position analog joystick (bottom-left)
 * All sizing is percentage-based for any screen size.
 */
class PlayerController {
    constructor(scene, map, saveData) {
        this.scene = scene;
        this.map = map;
        this.saveData = saveData;

        this.x = map.getSpawnPixelX();
        this.y = map.getSpawnPixelY();
        if (saveData?.progress?.areaX != null && saveData.progress.areaX !== 0) {
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
        this.gender = saveData?.player?.gender || 'male';

        this.gfx = scene.add.graphics().setDepth(10);

        // === INPUT STATE ===
        this.inputVx = 0;
        this.inputVy = 0;

        // === KEYBOARD ===
        this._setupKeyboard();

        // === VIRTUAL ANALOG JOYSTICK (fixed position, bottom-left) ===
        this.joyBase = null;
        this.joyStick = null;
        this.joyActive = false;
        this.joyBaseX = 0;
        this.joyBaseY = 0;
        this.joyStickX = 0;
        this.joyStickY = 0;
        this.joyDx = 0;
        this.joyDy = 0;
        this.joyRadius = 0;
        this.joyStickRadius = 0;
        this.joyPointerId = -1;

        this._setupJoystick();
    }

    // === KEYBOARD ===
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

    // === VIRTUAL ANALOG JOYSTICK ===
    _setupJoystick() {
        const scene = this.scene;
        const w = scene.cameras.main.width;
        const h = scene.cameras.main.height;

        // Size joystick relative to screen
        this.joyRadius = Math.max(40, Math.min(65, Math.min(w, h) * 0.08));
        this.joyStickRadius = Math.round(this.joyRadius * 0.4);

        // Position: bottom-left with margin
        this.joyBaseX = Math.max(70, w * 0.1);
        this.joyBaseY = h - Math.max(90, h * 0.12);
        this.joyStickX = this.joyBaseX;
        this.joyStickY = this.joyBaseY;

        // Create graphics layers
        this.joyBase = scene.add.graphics().setDepth(200).setScrollFactor(0);
        this.joyStick = scene.add.graphics().setDepth(201).setScrollFactor(0);

        // Draw static base
        this._drawBase();

        // Invisible interactive zone for joystick
        this.joyZone = scene.add.circle(this.joyBaseX, this.joyBaseY, this.joyRadius + 40, 0x000000, 0)
            .setInteractive({ useHandCursor: false })
            .setDepth(202)
            .setScrollFactor(0);

        this.joyZone.on('pointerdown', (pointer) => {
            this.joyActive = true;
            this.joyPointerId = pointer.id;
            this._updateStickPosition(pointer.x, pointer.y);
            this._drawStick();
        });

        scene.input.on('pointermove', (pointer) => {
            if (!this.joyActive || pointer.id !== this.joyPointerId) return;
            this._updateStickPosition(pointer.x, pointer.y);
            this._drawStick();
        });

        scene.input.on('pointerup', (pointer) => {
            if (pointer.id !== this.joyPointerId) return;
            this._resetJoystick();
        });
    }

    _updateStickPosition(px, py) {
        const dx = px - this.joyBaseX;
        const dy = py - this.joyBaseY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist <= this.joyRadius) {
            this.joyStickX = px;
            this.joyStickY = py;
        } else {
            this.joyStickX = this.joyBaseX + (dx / dist) * this.joyRadius;
            this.joyStickY = this.joyBaseY + (dy / dist) * this.joyRadius;
        }

        this.joyDx = (this.joyStickX - this.joyBaseX) / this.joyRadius;
        this.joyDy = (this.joyStickY - this.joyBaseY) / this.joyRadius;
    }

    _drawBase() {
        const g = this.joyBase;
        g.clear();
        g.lineStyle(3, 0xffffff, 0.3);
        g.strokeCircle(this.joyBaseX, this.joyBaseY, this.joyRadius);
        g.fillStyle(0xffffff, 0.08);
        g.fillCircle(this.joyBaseX, this.joyBaseY, this.joyRadius);
        g.lineStyle(1, 0xffffff, 0.1);
        g.lineBetween(this.joyBaseX - this.joyRadius, this.joyBaseY, this.joyBaseX + this.joyRadius, this.joyBaseY);
        g.lineBetween(this.joyBaseX, this.joyBaseY - this.joyRadius, this.joyBaseX, this.joyBaseY + this.joyRadius);
    }

    _drawStick() {
        const g = this.joyStick;
        g.clear();
        g.fillStyle(0xffffff, 0.15);
        g.fillCircle(this.joyStickX, this.joyStickY, this.joyStickRadius + 4);
        g.fillStyle(0xffffff, 0.45);
        g.fillCircle(this.joyStickX, this.joyStickY, this.joyStickRadius);
        g.lineStyle(2, 0xffffff, 0.7);
        g.strokeCircle(this.joyStickX, this.joyStickY, this.joyStickRadius);
        g.fillStyle(0xffffff, 0.6);
        g.fillCircle(this.joyStickX, this.joyStickY, 4);
    }

    _resetJoystick() {
        this.joyActive = false;
        this.joyPointerId = -1;
        this.joyDx = 0;
        this.joyDy = 0;
        this.joyStickX = this.joyBaseX;
        this.joyStickY = this.joyBaseY;
        this._drawStick();
    }

    /** Reposition joystick on resize */
    reposition(w, h) {
        this.joyRadius = Math.max(40, Math.min(65, Math.min(w, h) * 0.08));
        this.joyStickRadius = Math.round(this.joyRadius * 0.4);
        this.joyBaseX = Math.max(70, w * 0.1);
        this.joyBaseY = h - Math.max(90, h * 0.12);
        this.joyStickX = this.joyBaseX;
        this.joyStickY = this.joyBaseY;
        this.joyDx = 0;
        this.joyDy = 0;
        this._drawBase();
        this._drawStick();
        if (this.joyZone) {
            this.joyZone.setPosition(this.joyBaseX, this.joyBaseY);
            this.joyZone.setRadius(this.joyRadius + 40);
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

        // Analog joystick
        if (vx === 0 && vy === 0 && this.joyActive) {
            vx = this.joyDx;
            vy = this.joyDy;
        }

        // Threshold
        if (Math.abs(vx) < 0.1) vx = 0;
        if (Math.abs(vy) < 0.1) vy = 0;

        // Normalize diagonal
        if (vx !== 0 && vy !== 0) {
            const len = Math.sqrt(vx * vx + vy * vy);
            if (len > 1) { vx /= len; vy /= len; }
        }

        // Movement
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
        if (this.joyBase) this.joyBase.destroy();
        if (this.joyStick) this.joyStick.destroy();
        if (this.joyZone) this.joyZone.destroy();
    }
}
