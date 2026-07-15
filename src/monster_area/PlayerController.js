/**
 * PlayerController - Movement, animation, collision for Monster Area.
 * Desktop: WASD + Arrow Keys
 * Mobile: Fixed virtual joystick bottom-left + touch on monsters.
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
        this.joystickRadius = 45;
        this.stickRadius = 20;

        // Joystick graphics (created once, positioned fixed)
        this.joyBaseGfx = scene.add.graphics().setDepth(150).setScrollFactor(0).setAlpha(0);
        this.joyStickGfx = scene.add.graphics().setDepth(151).setScrollFactor(0).setAlpha(0);

        // Auto-show joystick on touch devices
        this.isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        if (this.isTouchDevice) {
            this._showJoystickAnchor();
        }

        // Store reference for monster clicking
        scene.playerController = this;
    }

    _showJoystickAnchor() {
        const w = this.scene.cameras.main.width;
        const h = this.scene.cameras.main.height;
        this.joystickBaseX = 80;
        this.joystickBaseY = h - 100;
        this.joystickStickX = this.joystickBaseX;
        this.joystickStickY = this.joystickBaseY;

        // Draw base circle
        this.joyBaseGfx.clear();
        this.joyBaseGfx.fillStyle(0xffffff, 0.15);
        this.joyBaseGfx.fillCircle(this.joystickBaseX, this.joystickBaseY, this.joystickRadius);
        this.joyBaseGfx.lineStyle(2, 0xffffff, 0.3);
        this.joyBaseGfx.strokeCircle(this.joystickBaseX, this.joystickBaseY, this.joystickRadius);
        this.joyBaseGfx.setAlpha(0.4);

        // Draw stick
        this._drawStick();
    }

    _drawStick() {
        this.joyStickGfx.clear();
        this.joyStickGfx.fillStyle(0xffffff, 0.5);
        this.joyStickGfx.fillCircle(this.joystickStickX, this.joystickStickY, this.stickRadius);
        this.joyStickGfx.lineStyle(2, 0xffffff, 0.6);
        this.joyStickGfx.strokeCircle(this.joystickStickX, this.joystickStickY, this.stickRadius);
        this.joyStickGfx.setAlpha(0.6);
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
        if (vx !== 0 && vy !== 0) {
            const inv = 1 / Math.sqrt(2);
            vx *= inv;
            vy *= inv;
        }

        // Movement
        const dt = delta / 1000;
        const newX = this.x + vx * this.moveSpeed * dt;
        const newY = this.y + vy * this.moveSpeed * dt;

        if (vx !== 0 && this._canMoveTo(newX, this.y)) this.x = newX;
        if (vy !== 0 && this._canMoveTo(this.x, newY)) this.y = newY;

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

    /** Process touch/pointer input for joystick */
    _processTouchInput() {
        if (!this.isTouchDevice) return;

        const pointers = this.scene.input.manager.pointers;
        const w = this.scene.cameras.main.width;
        const h = this.scene.cameras.main.height;

        // Joystick area: left half of screen, bottom portion
        const joystickZoneW = w * 0.5;
        const joystickZoneY = h * 0.4; // bottom 60% of screen

        // Find active pointer in joystick zone
        let activePointer = null;
        for (let i = 0; i < pointers.length; i++) {
            const p = pointers[i];
            if (p.isDown && p.x < joystickZoneW && p.y > joystickZoneY) {
                // Don't grab pointer that's on UI buttons (right side)
                if (p.x > w * 0.7 && p.y < h * 0.4) continue;
                activePointer = p;
                break;
            }
        }

        if (activePointer) {
            if (!this.joystickActive) {
                // Start new joystick
                this.joystickActive = true;
                this.joystickPointerId = activePointer.id;
                this.joystickBaseX = activePointer.x;
                this.joystickBaseY = activePointer.y;
                this.joystickStickX = activePointer.x;
                this.joystickStickY = activePointer.y;

                this.joyBaseGfx.clear();
                this.joyBaseGfx.fillStyle(0xffffff, 0.15);
                this.joyBaseGfx.fillCircle(this.joystickBaseX, this.joystickBaseY, this.joystickRadius);
                this.joyBaseGfx.lineStyle(2, 0xffffff, 0.3);
                this.joyBaseGfx.strokeCircle(this.joystickBaseX, this.joystickBaseY, this.joystickRadius);
                this.joyBaseGfx.setAlpha(0.6);
            }

            if (activePointer.id === this.joystickPointerId) {
                const dx = activePointer.x - this.joystickBaseX;
                const dy = activePointer.y - this.joystickBaseY;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist <= this.joystickRadius) {
                    this.joystickStickX = activePointer.x;
                    this.joystickStickY = activePointer.y;
                } else {
                    this.joystickStickX = this.joystickBaseX + (dx / dist) * this.joystickRadius;
                    this.joystickStickY = this.joystickBaseY + (dy / dist) * this.joystickRadius;
                }

                this.joystickDX = (this.joystickStickX - this.joystickBaseX) / this.joystickRadius;
                this.joystickDY = (this.joystickStickY - this.joystickBaseY) / this.joystickRadius;

                this._drawStick();
                this.joyStickGfx.setAlpha(0.6);
            }
        } else {
            // No active pointer in joystick zone - release
            if (this.joystickActive) {
                this.joystickActive = false;
                this.joystickPointerId = -1;
                this.joystickDX = 0;
                this.joystickDY = 0;

                // Reset stick to center
                this.joystickStickX = this.joystickBaseX;
                this.joystickStickY = this.joystickBaseY;
                this._drawStick();

                // Fade out joystick
                this.scene.tweens.add({
                    targets: [this.joyBaseGfx, this.joyStickGfx],
                    alpha: 0.15,
                    duration: 300
                });
            }
        }
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
