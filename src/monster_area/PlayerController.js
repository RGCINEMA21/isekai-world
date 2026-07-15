/**
 * PlayerController - Handles player movement, animation, and collision.
 * Supports WASD + Arrow keys (desktop) and virtual joystick (mobile).
 */
class PlayerController {
    /**
     * @param {Phaser.Scene} scene
     * @param {MonsterAreaMap} map
     * @param {Object} saveData
     */
    constructor(scene, map, saveData) {
        this.scene = scene;
        this.map = map;
        this.saveData = saveData;

        // Position (pixel coords, center of player)
        this.x = map.getSpawnPixelX();
        this.y = map.getSpawnPixelY();

        // Try to restore saved position
        if (saveData?.progress?.areaX != null) {
            this.x = saveData.progress.areaX;
            this.y = saveData.progress.areaY;
        }

        this.facing = 'down';
        this.isMoving = false;
        this.animFrame = 0;
        this.animTimer = 0;
        this.moveSpeed = 120;

        // Size of player body for collision
        this.bodyW = 8;
        this.bodyH = 4;

        // Graphics
        this.gfx = scene.add.graphics().setDepth(10);

        // Input
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.keys = scene.input.keyboard.addKeys({
            up: 'W', down: 'S', left: 'A', right: 'D'
        });

        // Joystick
        this.joystickActive = false;
        this.joystickBase = null;
        this.joystickStick = null;
        this.joystickData = null;
        this.joystickPointer = null;

        // Player gender from save
        this.gender = saveData?.player?.gender || 'male';
    }

    /** Get current tile position */
    getTileX() { return Math.floor(this.x / this.map.tileSize); }
    getTileY() { return Math.floor(this.y / this.map.tileSize); }

    /** Check if a pixel position is walkable */
    _canMoveTo(px, py) {
        // Check all 4 corners of player body
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

    /** Update movement and animation */
    update(delta) {
        let vx = 0;
        let vy = 0;

        // Keyboard input
        if (this.cursors.left.isDown || this.keys.left.isDown) vx = -1;
        if (this.cursors.right.isDown || this.keys.right.isDown) vx = 1;
        if (this.cursors.up.isDown || this.keys.up.isDown) vy = -1;
        if (this.cursors.down.isDown || this.keys.down.isDown) vy = 1;

        // Joystick input
        const jsVel = this._getJoystickVelocity();
        if (Math.abs(jsVel.x) > 0.1 || Math.abs(jsVel.y) > 0.1) {
            vx = jsVel.x;
            vy = jsVel.y;
        }

        // Normalize diagonal
        if (vx !== 0 && vy !== 0) {
            const inv = 1 / Math.sqrt(2);
            vx *= inv;
            vy *= inv;
        }

        // Apply movement with collision
        const dt = delta / 1000;
        const newX = this.x + vx * this.moveSpeed * dt;
        const newY = this.y + vy * this.moveSpeed * dt;

        // Try X movement
        if (vx !== 0 && this._canMoveTo(newX, this.y)) {
            this.x = newX;
        }
        // Try Y movement
        if (vy !== 0 && this._canMoveTo(this.x, newY)) {
            this.y = newY;
        }

        // Clamp to map bounds
        this.x = Phaser.Math.Clamp(this.x, this.map.tileSize, this.map.getPixelWidth() - this.map.tileSize);
        this.y = Phaser.Math.Clamp(this.y, this.map.tileSize, this.map.getPixelHeight() - this.map.tileSize);

        // Facing & moving state
        if (vx !== 0 || vy !== 0) {
            this.isMoving = true;
            if (Math.abs(vx) > Math.abs(vy)) {
                this.facing = vx > 0 ? 'right' : 'left';
            } else {
                this.facing = vy > 0 ? 'down' : 'up';
            }
        } else {
            this.isMoving = false;
        }

        // Animation
        if (this.isMoving) {
            this.animTimer += delta;
            if (this.animTimer >= 150) {
                this.animTimer = 0;
                this.animFrame = (this.animFrame + 1) % 4;
            }
        } else {
            this.animFrame = 0;
        }

        // Draw player
        this.draw();

        // Update joystick visuals
        this._updateJoystickVisuals();

        // Handle touch joystick creation
        this._handleJoystickInput();
    }

    /** Draw player character (pixel art placeholder) */
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
        g.fillRect(x + 1, y + 3 + (this.isMoving && this.facing !== 'up' ? -step : 0), 2, 3);

        // Pants
        g.fillStyle(pants, 1);
        g.fillRect(x - 3, y - 1, 2, 5);
        g.fillRect(x + 1, y - 1, 2, 5);

        // Shirt
        g.fillStyle(shirt, 1);
        g.fillRect(x - 4, y - 6, 8, 6);

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

    // === VIRTUAL JOYSTICK ===

    _handleJoystickInput() {
        const hasTouch = this.scene.sys.game.device.input.touch;
        if (!hasTouch) {
            if (this.joystickActive) this._destroyJoystick();
            return;
        }

        const pointers = this.scene.input.manager.pointers;
        let leftPointer = null;
        const w = this.scene.cameras.main.width;
        for (const p of pointers) {
            if (p.isDown && p.x < w * 0.6) {
                leftPointer = p;
                break;
            }
        }

        if (leftPointer && !this.joystickActive) {
            this.joystickActive = true;
            this.joystickPointer = leftPointer.id;
            this._createJoystick(leftPointer.x, leftPointer.y);
            this._updateJoystickData(leftPointer);
        } else if (leftPointer && this.joystickActive && leftPointer.id === this.joystickPointer) {
            this._updateJoystickData(leftPointer);
        } else if (!leftPointer && this.joystickActive) {
            this._destroyJoystick();
        }
    }

    _createJoystick(x, y) {
        this._destroyJoystick();
        const baseRadius = 35;
        const stickRadius = 15;

        this.joystickBase = this.scene.add.graphics().setDepth(150).setScrollFactor(0);
        this.joystickBase.fillStyle(0xffffff, 0.15);
        this.joystickBase.fillCircle(x, y, baseRadius);
        this.joystickBase.lineStyle(2, 0xffffff, 0.3);
        this.joystickBase.strokeCircle(x, y, baseRadius);

        this.joystickStick = this.scene.add.graphics().setDepth(151).setScrollFactor(0);
        this.joystickStick.fillStyle(0xffffff, 0.4);
        this.joystickStick.fillCircle(x, y, stickRadius);

        this.joystickData = { baseX: x, baseY: y, stickX: x, stickY: y, baseRadius, stickRadius, dx: 0, dy: 0 };
    }

    _updateJoystickData(pointer) {
        if (!this.joystickData) return;
        const jd = this.joystickData;
        const dx = pointer.x - jd.baseX;
        const dy = pointer.y - jd.baseY;
        const dist = Math.sqrt(dx*dx + dy*dy);

        if (dist <= jd.baseRadius) {
            jd.stickX = pointer.x;
            jd.stickY = pointer.y;
        } else {
            jd.stickX = jd.baseX + (dx/dist) * jd.baseRadius;
            jd.stickY = jd.baseY + (dy/dist) * jd.baseRadius;
        }

        const normDist = Math.min(dist, jd.baseRadius) / jd.baseRadius;
        jd.dx = (jd.stickX - jd.baseX) / jd.baseRadius;
        jd.dy = (jd.stickY - jd.baseY) / jd.baseRadius;
    }

    _updateJoystickVisuals() {
        if (!this.joystickData || !this.joystickStick) return;
        const jd = this.joystickData;
        this.joystickStick.clear();
        this.joystickStick.fillStyle(0xffffff, 0.4);
        this.joystickStick.fillCircle(jd.stickX, jd.stickY, jd.stickRadius);
    }

    _destroyJoystick() {
        if (this.joystickBase) { this.joystickBase.destroy(); this.joystickBase = null; }
        if (this.joystickStick) { this.joystickStick.destroy(); this.joystickStick = null; }
        this.joystickData = null;
        this.joystickActive = false;
        this.joystickPointer = null;
    }

    _getJoystickVelocity() {
        if (!this.joystickData) return { x: 0, y: 0 };
        return { x: this.joystickData.dx, y: this.joystickData.dy };
    }

    destroy() {
        if (this.gfx) this.gfx.destroy();
        this._destroyJoystick();
    }
}
