/**
 * InteractionUI - Popup interaksi responsive.
 * Muncul di atas objek saat player dekat.
 * Ikuti camera, tidak bergeser.
 */
class InteractionUI {
    constructor(scene) {
        this.scene = scene;
        this.container = null;
        this.currentTarget = null;
        this.visible = false;
        this.recalcSizes();
    }

    recalcSizes() {
        const w = this.scene.cameras.main.width;
        const h = this.scene.cameras.main.height;
        this.isPortrait = h > w;
        this.popupW = this.isPortrait ? Math.min(200, w * 0.5) : Math.min(220, w * 0.22);
        this.popupH = this.isPortrait ? 56 : 60;
        this.fontSize = this.isPortrait ? '11px' : '12px';
        this.nameFontSize = this.isPortrait ? '13px' : '14px';
    }

    show(obj) {
        if (this.currentTarget === obj && this.visible) return;
        this.currentTarget = obj;
        this.visible = true;
        this.recalcSizes();
        this.buildPopup();
    }

    hide() {
        if (!this.visible) return;
        this.visible = false;
        this.currentTarget = null;
        if (this.container) { this.container.destroy(); this.container = null; }
    }

    buildPopup() {
        if (this.container) this.container.destroy();
        const obj = this.currentTarget;
        if (!obj) return;

        const pw = this.popupW, ph = this.popupH;
        this.container = this.scene.add.container(0, 0).setDepth(180).setScrollFactor(0);

        // Background
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x0a0a20, 0.93);
        bg.fillRoundedRect(-pw / 2, -ph / 2, pw, ph, 10);
        bg.lineStyle(2, 0x6644aa, 0.9);
        bg.strokeRoundedRect(-pw / 2, -ph / 2, pw, ph, 10);
        // Glow
        bg.fillStyle(0x6644aa, 0.08);
        bg.fillRoundedRect(-pw / 2 - 2, -ph / 2 - 2, pw + 4, ph + 4, 12);
        this.container.add(bg);

        // Name
        this.container.add(this.scene.add.text(0, -ph / 2 + 12, obj.name, {
            fontSize: this.nameFontSize,
            fontFamily: 'Arial, sans-serif',
            color: '#ffdd88',
            fontStyle: 'bold'
        }).setOrigin(0.5));

        // Action with key hint
        const isTouch = this.scene.sys.game.device.input.touch;
        const keyHint = isTouch ? '👆 Tekan tombol' : 'Tekan [E]';
        this.container.add(this.scene.add.text(0, -ph / 2 + 32, keyHint + ' ' + obj.action, {
            fontSize: this.fontSize,
            fontFamily: 'Arial, sans-serif',
            color: '#ccccdd'
        }).setOrigin(0.5));

        // Pulse animation
        this.container.setAlpha(0).setScale(0.9);
        this.scene.tweens.add({
            targets: this.container,
            alpha: 1, scaleX: 1, scaleY: 1,
            duration: 200, ease: 'Back.easeOut'
        });
    }

    updatePosition(obj, camera) {
        if (!this.container || !obj) return;
        const w = this.scene.cameras.main.width;
        const h = this.scene.cameras.main.height;
        const z = camera.zoom || 1;

        // Object screen position
        const sx = (obj.worldX - camera.scrollX) * z;
        const sy = (obj.worldY - camera.scrollY) * z;

        // Position above object, clamped to screen
        let px = Math.max(this.popupW / 2 + 8, Math.min(w - this.popupW / 2 - 8, sx));
        let py = sy - 40 * z;
        if (py < this.popupH / 2 + 8) py = sy + 40 * z;
        py = Math.max(this.popupH / 2 + 8, Math.min(h - this.popupH / 2 - 8, py));

        this.container.setPosition(px, py);
    }

    destroy() { this.hide(); }
}
