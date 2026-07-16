/**
 * PlayerController — movement, animation, collision, joystick.
 * Desktop: WASD + Arrow Keys.
 * Mobile: Virtual joystick (always visible on touch devices).
 * All sizes derived from ResponsiveLayout so they fit any screen.
 */
class PlayerController {
    constructor(scene, map, saveData) {
        this.scene = scene;
        this.map = map;
        this.saveData = saveData;
        this.rl = new ResponsiveLayout(scene);

        // Position
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

        // Player graphics (world space)
        this.gfx = scene.add.graphics().setDepth(10);

        // Keyboard
        this.cursors = null;
        this.keys = null;
        if (scene.input.keyboard) {
            try {
                this.cursors = scene.input.keyboard.createCursorKeys();
                this.keys = scene.input.keyboard.addKeys({ up: 'W', down: 'S', left: 'A', right: 'D' });
            } catch (e) { console.warn('[PlayerController] Keyboard init failed:', e); }
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

        this.isTouchDevice = ('ontouchstart' in window)
            || (navigator.maxTouchPoints > 0)
            || !!window.matchMedia('(pointer: coarse)').matches;

        // Joystick graphics (UI layer, fixed to screen)
        this.joyBaseGfx = scene.add.graphics().setDepth(150).setScrollFactor(0);
        this.joyStickGfx = scene.add.graphics().setDepth(151).setScrollFactor(0);

        this._positionJoystick();
        if (this.isTouchDevice) {
            this._drawJoystick(0.3, 0.5);
        } else {
            this.joyBaseGfx.setAlpha(0);
            this.joyStickGfx.setAlpha(0);
        }

        scene.playerController = this;
    }

    /* ── Joystick helpers ────────────────────────── */

    _positionJoystick() {
        this.rl.recalculate();
        const r = this.rl.joystickRadius();
        this._jr = r;
        this._sr = this.rl.stickRadius();
        this.joystickBaseX = r + this.rl.pad() + 4;
        this.joystickBaseY = this.rl.h - r - this.rl.pad() - 16;
        this.joystickStickX = this.joystickBaseX;
        this.joystickStickY = this.joystickBaseY;
    }

    _drawJoystick(baseAlpha, stickAlpha) {
        const { joystickBaseX: bx, joystickBaseY: by, _jr: r, _sr: sr,
                joystickStickX: sx, joystickStickY: sy } = this;

        this.joyBaseGfx.clear();
        this.joyBaseGfx.fillStyle(0xffffff, 0.12);
        this.joyBaseGfx.fillCircle(bx, by, r);
        this.joyBaseGfx.lineStyle(2, 0xffffff, 0.28);
        this.joyBaseGfx.strokeCircle(bx, by, r);

        this.joyStickGfx.clear();
        this.joyStickGfx.fillStyle(0xffffff, 0.42);
        this.joyStickGfx.fillCircle(sx, sy, sr);
        this.joyStickGfx.lineStyle(2, 0xffffff, 0.52);
        this.joyStickGfx.strokeCircle(sx, sy, sr);

        this.joyBaseGfx.setAlpha(baseAlpha);
        this.joyStickGfx.setAlpha(stickAlpha);
    }

    /* ── Tile helpers ────────────────────────────── */

    getTileX() { return Math.floor(this.x / this.map.tileSize); }
    getTileY() { return Math.floor(this.y / this.map.tileSize); }

    _canMoveTo(px, py) {
        const hw = this.bodyW / 2;
        const hh = this.bodyH / 2;
        const corners = [
            [Math.floor((px - hw) / this.map.tileSize), Math.floor((py - hh) / this.map.tileSize)],
            [Math.floor((px + hw) / this.map.tileSize), Math.floor((py - hh) / this.map.tileSize)],
            [Math.floor((px - hw) / this.map.tileSize), Math.floor((py + hh) / this.map.tileSize)],
            [Math.floor((px + hw) / this.map.tileSize), Math.floor((py + hh) / this.map.tileSize)],
        ];
        for (const [tx, ty] of corners) {
            if (!this.map.isWalkable(tx, ty)) return false;
        }
        return true;
    }

    /* ── Main update ─────────────────────────────── */

    update(delta) {
        let vx = 0;
        let vy = 0;

        // Keyboard
        if (this.cursors) {
            if (this.cursors.left.isDown || (this.keys && this.keys.left.isDown)) vx = -1;
            if (this.cursors.right.isDown || (this.keys && this.keys.right.isDown)) vx = 1;
            if (this.cursors.up.isDown || (this.keys && this.keys.up.isDown)) vy = -1;
            if (this.cursors.down.isDown || (this.keys && this.keys.down.isDown)) vy = 1;
        }

        // Joystick
        if (this.joystickActive && (Math.abs(this.joystickDX) > 0.12 || Math.abs(this.joystickDY) > 0.12)) {
            vx = this.joystickDX;
            vy = this.joystickDY;
        }

        // Normalize diagonal
        if (vx !== 0 && vy !== 0) {
            const inv = 1 / Math.sqrt(2);
            vx *= inv;
            vy *= inv;
        }

        // Facing
        if (Math.abs(vx) > 0.1 || Math.abs(vy) > 0.1) {
            if (Math.abs(vx) > Math.abs(vy)) {
                this.facing = vx < 0 ? 'left' : 'right';
            } else {
                this.facing = vy < 0 ? 'up' : 'down';
            }
        }
        this.isMoving = (vx !== 0 || vy !== 0);

        // Move with collision
        if (this.isMoving) {
            const dt = delta / 1000;
            const newX = this.x + vx * this.moveSpeed * dt;
            const newY = this.y + vy * this.moveSpeed * dt;
            if (this._canMoveTo(newX, this.y)) this.x = newX;
            if (this._canMoveTo(this.x, newY)) this.y = newY;
            this.x = Phaser.Math.Clamp(this.x, 16, this.map.getPixelWidth() - 16);
            this.y = Phaser.Math.Clamp(this.y, 16, this.map.getPixelHeight() - 16);
        }

        // Animation
        if (this.isMoving) {
            this.animTimer += delta * 0.008;
            this.animFrame = this.animTimer;
        } else {
            this.animFrame = 0;
        }

        this.draw();
        this._handleJoystickInput();
    }

    _handleJoystickInput() {
        if (!this.isTouchDevice) return;
        const pointers = this.scene.input.manager.pointers;
        let foundPointer = false;

        for (const p of pointers) {
            if (!p.isDown) continue;

            // Start joystick on new touch in left 60% of screen
            if (!this.joystickActive && p.x < this.rl.w * 0.6) {
                this.joystickPointerId = p.id;
                this.joystickActive = true;
                this.joystickBaseX = p.x;
                this.joystickBaseY = p.y;
                this.joystickStickX = p.x;
                this.joystickStickY = p.y;
                this._drawJoystick(0.5, 0.7);
            }

            if (p.id === this.joystickPointerId) {
                foundPointer = true;
                const dx = p.x - this.joystickBaseX;
                const dy = p.y - this.joystickBaseY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const r = this._jr;

                if (dist <= r) {
                    this.joystickStickX = p.x;
                    this.joystickStickY = p.y;
                } else {
                    this.joystickStickX = this.joystickBaseX + (dx / dist) * r;
                    this.joystickStickY = this.joystickBaseY + (dy / dist) * r;
                }

                this.joystickDX = (this.joystickStickX - this.joystickBaseX) / r;
                this.joystickDY = (this.joystickStickY - this.joystickBaseY) / r;

                // Redraw stick only (base stays)
                this.joyStickGfx.clear();
                this.joyStickGfx.fillStyle(0xffffff, 0.42);
                this.joyStickGfx.fillCircle(this.joystickStickX, this.joystickStickY, this._sr);
                this.joyStickGfx.lineStyle(2, 0xffffff, 0.52);
                this.joyStickGfx.strokeCircle(this.joystickStickX, this.joystickStickY, this._sr);
                this.joyStickGfx.setAlpha(0.7);
            }
        }

        if (!foundPointer && this.joystickActive) {
            this.joystickActive = false;
            this.joystickPointerId = -1;
            this.joystickDX = 0;
            this.joystickDY = 0;
            this.joystickStickX = this.joystickBaseX;
            this.joystickStickY = this.joystickBaseY;
            this._drawJoystick(this.isTouchDevice ? 0.3 : 0, this.isTouchDevice ? 0.5 : 0);
        }
    }

    /* ── Draw player sprite (placeholder) ────────── */

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

        g.fillStyle(0x000000, 0.2); g.fillEllipse(x, y + 12, 14, 5);
        g.fillStyle(boot, 1);
        g.fillRect(x - 3, y + 3 + (this.isMoving && this.facing !== 'up' ? step : 0), 2, 3);
        g.fillRect(x + 1, y + 3 + (this.isMoving && this.facing !== 'up' ? step : 0), 2, 3);
        g.fillStyle(pants, 1); g.fillRect(x - 3, y + 1, 6, 4);
        g.fillStyle(shirt, 1); g.fillRect(x - 3, y - 4, 6, 6);
        const armSwing = this.isMoving ? Math.sin(this.animFrame * Math.PI) * 2 : 0;
        g.fillStyle(skin, 1);
        g.fillRect(x - 5, y - 4 + armSwing, 2, 5);
        g.fillRect(x + 3, y - 4 - armSwing, 2, 5);
        g.fillStyle(skin, 1); g.fillRect(x - 3, y - 12, 6, 7);
        g.fillStyle(hair, 1); g.fillRect(x - 3, y - 13, 6, 3);
        if (this.facing === 'down') { g.fillRect(x - 4, y - 12, 1, 4); g.fillRect(x + 3, y - 12, 1, 4); }
        else if (this.facing === 'up') { g.fillRect(x - 4, y - 13, 8, 4); }
        else if (this.facing === 'left') { g.fillRect(x - 4, y - 13, 6, 3); g.fillRect(x - 4, y - 11, 1, 4); }
        else { g.fillRect(x - 2, y - 13, 6, 3); g.fillRect(x + 3, y - 11, 1, 4); }
        if (this.facing !== 'up') {
            g.fillStyle(0xffffff, 1);
            if (this.facing === 'down') {
                g.fillRect(x - 2, y - 10, 2, 2); g.fillRect(x + 1, y - 10, 2, 2);
                g.fillStyle(0x2244aa, 1); g.fillRect(x - 1, y - 9, 1, 1); g.fillRect(x + 1, y - 9, 1, 1);
            } else if (this.facing === 'left') {
                g.fillRect(x - 3, y - 10, 2, 2);
                g.fillStyle(0x2244aa, 1); g.fillRect(x - 2, y - 9, 1, 1);
            } else {
                g.fillRect(x + 1, y - 10, 2, 2);
                g.fillStyle(0x2244aa, 1); g.fillRect(x + 1, y - 9, 1, 1);
            }
        }
    }

    onResize() {
        this._positionJoystick();
        if (this.isTouchDevice) this._drawJoystick(0.3, 0.5);
    }

    destroy() {
        if (this.gfx) this.gfx.destroy();
        if (this.joyBaseGfx) this.joyBaseGfx.destroy();
        if (this.joyStickGfx) this.joyStickGfx.destroy();
    }
}
