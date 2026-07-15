/**
 * PlayerController - Movement, animation, collision for Monster Area.
 * Desktop: WASD + Arrow Keys
 * Mobile: Always-visible virtual joystick bottom-left.
 */
class PlayerController {
    constructor(scene, map, saveData) {
        this.scene = scene;
        this.map = map;
        this.saveData = saveData;

        this.x = map.getSpawnPixelX();
        this.y = map.getSpawnPixelY();
        if (saveData?.progress?.areaX != null && saveData?.progress?.areaY != null) {
            const sx = saveData.progress.areaX;
            const sy = saveData.progress.areaY;
            if (sx > 0 && sx < map.getPixelWidth() && sy > 0 && sy < map.getPixelHeight()) {
                this.x = sx;
                this.y = sy;
            }
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

        // Keyboard
        this.cursors = null;
        this.keys = null;
        if (scene.input.keyboard) {
            try {
                this.cursors = scene.input.keyboard.createCursorKeys();
                this.keys = scene.input.keyboard.addKeys({
                    up: 'W', down: 'S', left: 'A', right: 'D'
                });
            } catch (e) {
                console.warn('[PlayerController] Keyboard init failed:', e);
            }
        }

        // Joystick state
        this.joystickActive = false;
        this.joystickBaseX = 0;
        this.joystickBaseY = 0;
        this.joystickStickX = 0;
        this.joystickStickY = 0;
        this.joystickDX = 0;
        this.joystickDY = 0;
        this.joystickPointerId = -1;
        this.joystickRadius = 50;
        this.stickRadius = 22;

        // Joystick graphics
        this.joyBaseGfx = scene.add.graphics().setDepth(150).setScrollFactor(0);
        this.joyStickGfx = scene.add.graphics().setDepth(151).setScrollFactor(0);

        this.isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || !!window.matchMedia('(pointer: coarse)').matches;

        // Always show joystick on touch devices
        if (this.isTouchDevice) {
            this._initJoystickPosition();
            this._showJoystick();
        } else {
            // Desktop: joystick hidden until touch
            this.joyBaseGfx.setAlpha(0);
            this.joyStickGfx.setAlpha(0);
        }

        scene.playerController = this;
    }

    _initJoystickPosition() {
        const w = this.scene.cameras.main.width;
        const h = this.scene.cameras.main.height;
        this.joystickBaseX = 80;
        this.joystickBaseY = h - 120;
        this.joystickStickX = this.joystickBaseX;
        this.joystickStickY = this.joystickBaseY;
    }

    _showJoystick() {
        this._drawBase();
        this._drawStick();
        this.joyBaseGfx.setAlpha(0.35);
        this.joyStickGfx.setAlpha(0.55);
    }

    _drawBase() {
        this.joyBaseGfx.clear();
        this.joyBaseGfx.fillStyle(0xffffff, 0.12);
        this.joyBaseGfx.fillCircle(this.joystickBaseX, this.joystickBaseY, this.joystickRadius);
        this.joyBaseGfx.lineStyle(2, 0xffffff, 0.25);
        this.joyBaseGfx.strokeCircle(this.joystickBaseX, this.joystickBaseY, this.joystickRadius);
    }

    _drawStick() {
        this.joyStickGfx.clear();
        this.joyStickGfx.fillStyle(0xffffff, 0.45);
        this.joyStickGfx.fillCircle(this.joystickStickX, this.joystickStickY, this.stickRadius);
        this.joyStickGfx.lineStyle(2, 0xffffff, 0.55);
        this.joyStickGfx.strokeCircle(this.joystickStickX, this.joystickStickY, this.stickRadius);
    }

    getTileX() { return Math.floor(this.x / this.map.tileSize); }
    getTileY() { return Math.floor(this.y / this.map.tileSize); }

    _canMoveTo(px, py) {
        const hw = this.bodyW / 2;
        const hh = this.bodyH / 2;
        const tiles = [
            [Math.floor((px - hw) / this.map.tileSize), Math.floor((py - hh) / this.map.tileSize)],
            [Math.floor((px + hw) / this.map.tileSize), Math.floor((py - hh) / this.map.tileSize)],
            [Math.floor((px - hw) / this.map.tileSize), Math.floor((py + hh) / this.map.tileSize)],
            [Math.floor((px + hw) / this.map.tileSize), Math.floor((py + hh) / this.map.tileSize)],
        ];
        for (const [tx, ty] of tiles) {
            if (!this.map.isWalkable(tx, ty)) return false;
        }
        return true;
    }

    update(delta) {
        let vx = 0;
        let vy = 0;

        // Keyboard input
        if (this.cursors) {
            if (this.cursors.left.isDown || (this.keys && this.keys.left.isDown)) vx = -1;
            if (this.cursors.right.isDown || (this.keys && this.keys.right.isDown)) vx = 1;
            if (this.cursors.up.isDown || (this.keys && this.keys.up.isDown)) vy = -1;
            if (this.cursors.down.isDown || (this.keys && this.keys.down.isDown)) vy = 1;
        }

        // Touch/pointer joystick input
        this._processTouchInput();

        if (Math.abs(this.joystickDX) > 0.1 || Math.abs(this.joystickDY) > 0.1) {
            vx = this.joystickDX;
            vy = this.joystickDY;
        }

        // Normalize diagonal
        const len = Math.sqrt(vx * vx + vy * vy);
        if (len > 1) { vx /= len; vy /= len; }

        // Apply movement
        const dt = delta / 1000;
        const dx = vx * this.moveSpeed * dt;
        const dy = vy * this.moveSpeed * dt;

        this.isMoving = Math.abs(vx) > 0.1 || Math.abs(vy) > 0.1;

        if (this.isMoving) {
            // Update facing
            if (Math.abs(vx) > Math.abs(vy)) {
                this.facing = vx > 0 ? 'right' : 'left';
            } else {
                this.facing = vy > 0 ? 'down' : 'up';
            }

            // Try X movement
            if (dx !== 0 && this._canMoveTo(this.x + dx, this.y)) {
                this.x += dx;
            }
            // Try Y movement
            if (dy !== 0 && this._canMoveTo(this.x, this.y + dy)) {
                this.y += dy;
            }

            // Clamp to map
            this.x = Phaser.Math.Clamp(this.x, 16, this.map.getPixelWidth() - 16);
            this.y = Phaser.Math.Clamp(this.y, 16, this.map.getPixelHeight() - 16);

            // Animation
            this.animTimer += delta;
            if (this.animTimer > 150) {
                this.animFrame = (this.animFrame + 1) % 4;
                this.animTimer = 0;
            }
        }

        this.draw();
    }

    _processTouchInput() {
        const pointers = this.scene.input.manager.pointers;
        let foundPointer = false;

        for (let i = 0; i < pointers.length; i++) {
            const p = pointers[i];
            if (!p.isDown) continue;

            if (this.joystickPointerId === -1) {
                // Check if touch is in left half of screen (joystick zone)
                if (p.x < this.scene.cameras.main.width * 0.5) {
                    this.joystickPointerId = p.id;
                    this.joystickActive = true;
                    this.joystickBaseX = p.x;
                    this.joystickBaseY = p.y;
                    this.joystickStickX = p.x;
                    this.joystickStickY = p.y;

                    this._drawBase();
                    this._drawStick();
                    this.joyBaseGfx.setAlpha(0.5);
                    this.joyStickGfx.setAlpha(0.7);
                }
            }

            if (p.id === this.joystickPointerId) {
                foundPointer = true;
                const dx = p.x - this.joystickBaseX;
                const dy = p.y - this.joystickBaseY;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist <= this.joystickRadius) {
                    this.joystickStickX = p.x;
                    this.joystickStickY = p.y;
                } else {
                    this.joystickStickX = this.joystickBaseX + (dx / dist) * this.joystickRadius;
                    this.joystickStickY = this.joystickBaseY + (dy / dist) * this.joystickRadius;
                }

                this.joystickDX = (this.joystickStickX - this.joystickBaseX) / this.joystickRadius;
                this.joystickDY = (this.joystickStickY - this.joystickBaseY) / this.joystickRadius;

                this._drawStick();
            }
        }

        if (!foundPointer && this.joystickActive) {
            this.joystickActive = false;
            this.joystickPointerId = -1;
            this.joystickDX = 0;
            this.joystickDY = 0;

            // Reset stick to center
            this.joystickStickX = this.joystickBaseX;
            this.joystickStickY = this.joystickBaseY;
            this._drawStick();

            // Show idle joystick on touch devices
            if (this.isTouchDevice) {
                this.joyBaseGfx.setAlpha(0.35);
                this.joyStickGfx.setAlpha(0.55);
            } else {
                this.scene.tweens.add({
                    targets: [this.joyBaseGfx, this.joyStickGfx],
                    alpha: 0.15,
                    duration: 300
                });
            }
        }
    }

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

        // Shadow
        g.fillStyle(0x000000, 0.2);
        g.fillEllipse(x, y + 12, 14, 5);

        // Boots
        g.fillStyle(boot, 1);
        g.fillRect(x - 3, y + 3 + (this.isMoving && this.facing !== 'up' ? step : 0), 2, 3);
        g.fillRect(x + 1, y + 3 + (this.isMoving && this.facing !== 'up' ? step : 0), 2, 3);

        // Pants
        g.fillStyle(pants, 1);
        g.fillRect(x - 3, y + 1, 6, 4);

        // Shirt
        g.fillStyle(shirt, 1);
        g.fillRect(x - 3, y - 4, 6, 6);

        // Arms
        const armSwing = this.isMoving ? Math.sin(this.animFrame * Math.PI) * 2 : 0;
        g.fillStyle(skin, 1);
        g.fillRect(x - 5, y - 4 + armSwing, 2, 5);
        g.fillRect(x + 3, y - 4 - armSwing, 2, 5);

        // Head
        g.fillStyle(skin, 1);
        g.fillRect(x - 3, y - 12, 6, 7);

        // Hair
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

        // Eyes
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
        if (this.joyBaseGfx) this.joyBaseGfx.destroy();
        if (this.joyStickGfx) this.joyStickGfx.destroy();
    }
}
