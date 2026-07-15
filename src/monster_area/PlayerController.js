/**
 * PlayerController - Movement, animation, collision.
 * Desktop: WASD + Arrow Keys
 * Mobile: Virtual Analog Joystick (touch anywhere on screen)
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
        this.gender = saveData?.player?.gender || 'male';

        this.gfx = scene.add.graphics().setDepth(10);

        // === INPUT STATE ===
        this.inputVx = 0;
        this.inputVy = 0;

        // === KEYBOARD ===
        this._setupKeyboard();

        // === VIRTUAL ANALOG JOYSTICK ===
        this.joyBase = null;
        this.joyStick = null;
        this.joyActive = false;
        this.joyBaseX = 0;
        this.joyBaseY = 0;
        this.joyStickX = 0;
        this.joyStickY = 0;
        this.joyDx = 0;
        this.joyDy = 0;
        this.joyRadius = 50;
        this.joyStickRadius = 20;
        this.joyPointerId = -1;

        this._setupTouchJoystick();
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
    // Touch ANYWHERE on screen to create joystick at that position
    // Drag to move, release to stop

    _setupTouchJoystick() {
        const scene = this.scene;

        // Use scene-level input on the entire canvas
        scene.input.on('pointerdown', (pointer) => {
            if (this.joyActive) return; // Already using a pointer
            // Don't create joystick if touching UI buttons
            if (pointer.y < 120) return; // Top HUD area
            const w = scene.cameras.main.width;
            const h = scene.cameras.main.height;
            // Don't create if touching bottom-right buttons
            if (pointer.x > w - 70 && pointer.y > h - 130) return;

            this.joyActive = true;
            this.joyPointerId = pointer.id;
            this.joyBaseX = pointer.x;
            this.joyBaseY = pointer.y;
            this.joyStickX = pointer.x;
            this.joyStickY = pointer.y;
            this.joyDx = 0;
            this.joyDy = 0;

            this._drawJoystick();
        });

        scene.input.on('pointermove', (pointer) => {
            if (!this.joyActive || pointer.id !== this.joyPointerId) return;

            const dx = pointer.x - this.joyBaseX;
            const dy = pointer.y - this.joyBaseY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist <= this.joyRadius) {
                this.joyStickX = pointer.x;
                this.joyStickY = pointer.y;
            } else {
                this.joyStickX = this.joyBaseX + (dx / dist) * this.joyRadius;
                this.joyStickY = this.joyBaseY + (dy / dist) * this.joyRadius;
            }

            // Normalize -1 to 1
            this.joyDx = (this.joyStickX - this.joyBaseX) / this.joyRadius;
            this.joyDy = (this.joyStickY - this.joyBaseY) / this.joyRadius;

            this._drawJoystick();
        });

        scene.input.on('pointerup', (pointer) => {
            if (pointer.id !== this.joyPointerId) return;
            this._destroyJoystick();
        });
    }

    _drawJoystick() {
        if (!this.joyBase) {
            this.joyBase = this.scene.add.graphics().setDepth(180).setScrollFactor(0);
        }
        if (!this.joyStick) {
            this.joyStick = this.scene.add.graphics().setDepth(181).setScrollFactor(0);
        }

        // Base circle
        this.joyBase.clear();
        this.joyBase.fillStyle(0xffffff, 0.12);
        this.joyBase.fillCircle(this.joyBaseX, this.joyBaseY, this.joyRadius);
        this.joyBase.lineStyle(2, 0xffffff, 0.25);
        this.joyBase.strokeCircle(this.joyBaseX, this.joyBaseY, this.joyRadius);

        // Inner ring
        this.joyBase.lineStyle(1, 0xffffff, 0.1);
        this.joyBase.strokeCircle(this.joyBaseX, this.joyBaseY, this.joyRadius * 0.5);

        // Stick
        this.joyStick.clear();
        this.joyStick.fillStyle(0xffffff, 0.4);
        this.joyStick.fillCircle(this.joyStickX, this.joyStickY, this.joyStickRadius);
        this.joyStick.lineStyle(2, 0xffffff, 0.6);
        this.joyStick.strokeCircle(this.joyStickX, this.joyStickY, this.joyStickRadius);
    }

    _destroyJoystick() {
        this.joyActive = false;
        this.joyPointerId = -1;
        this.joyDx = 0;
        this.joyDy = 0;
        if (this.joyBase) { this.joyBase.clear(); }
        if (this.joyStick) { this.joyStick.clear(); }
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
        if (vx === 0 && vy === 0) {
            if (this.joyActive) {
                vx = this.joyDx;
                vy = this.joyDy;
            }
        }

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
    }
}
