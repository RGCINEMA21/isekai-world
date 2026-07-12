/**
 * InteractionUI - Renders the interaction popup and icon.
 * Responsive: adapts to portrait/landscape automatically.
 * Follows the interactable object's screen position.
 */
class InteractionUI {
    constructor(scene) {
        this.scene = scene;
        this.container = null;
        this.iconContainer = null;
        this.currentTarget = null;
        this.visible = false;

        // Responsive sizing
        this.recalcSizes();
    }

    /** Recalculate sizes based on current screen */
    recalcSizes() {
        const w = this.scene.cameras.main.width;
        const h = this.scene.cameras.main.height;
        this.isPortrait = h > w;

        this.popupW = this.isPortrait ? Math.min(180, w * 0.45) : Math.min(200, w * 0.2);
        this.popupH = this.isPortrait ? 52 : 56;
        this.fontSize = this.isPortrait ? '11px' : '12px';
        this.nameFontSize = this.isPortrait ? '12px' : '13px';
        this.iconSize = this.isPortrait ? 22 : 26;
    }

    /**
     * Show interaction popup for an object.
     * @param {InteractionObject} obj - The nearby interactable
     */
    show(obj) {
        if (this.currentTarget === obj && this.visible) return;
        this.currentTarget = obj;
        this.visible = true;
        this.recalcSizes();
        this.buildPopup();
    }

    /** Hide and destroy the popup */
    hide() {
        if (!this.visible) return;
        this.visible = false;
        this.currentTarget = null;
        if (this.container) {
            this.container.destroy();
            this.container = null;
        }
    }

    /** Build the popup UI elements */
    buildPopup() {
        if (this.container) this.container.destroy();
        const obj = this.currentTarget;
        if (!obj) return;

        const pw = this.popupW;
        const ph = this.popupH;

        this.container = this.scene.add.container(0, 0).setDepth(180).setScrollFactor(0);

        // Background panel
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x0a0a20, 0.92);
        bg.fillRoundedRect(-pw / 2, -ph / 2, pw, ph, 8);
        bg.lineStyle(1.5, 0x6644aa, 0.8);
        bg.strokeRoundedRect(-pw / 2, -ph / 2, pw, ph, 8);
        this.container.add(bg);

        // Object name
        this.container.add(this.scene.add.text(0, -ph / 2 + 10, obj.name, {
            fontSize: this.nameFontSize,
            fontFamily: 'Arial, sans-serif',
            color: '#ffdd88',
            fontStyle: 'bold'
        }).setOrigin(0.5));

        // Action text with key hint
        const keyHint = this.scene.sys.game.device.input.touch ? '👆 Tekan' : '[E]';
        this.container.add(this.scene.add.text(0, -ph / 2 + 28, keyHint + ' ' + obj.action, {
            fontSize: this.fontSize,
            fontFamily: 'Arial, sans-serif',
            color: '#aaaacc'
        }).setOrigin(0.5));

        // Subtle animation
        this.container.setAlpha(0);
        this.scene.tweens.add({ targets: this.container, alpha: 1, duration: 150 });
    }

    /**
     * Update popup position to follow the object on screen.
     * @param {InteractionObject} obj
     * @param {Phaser.Cameras.Scene2D.Camera} camera
     */
    updatePosition(obj, camera) {
        if (!this.container || !obj) return;

        const w = this.scene.cameras.main.width;
        const h = this.scene.cameras.main.height;

        // Convert world pos to screen pos
        const screenX = (obj.worldX - camera.scrollX) * camera.zoom;
        const screenY = (obj.worldY - camera.scrollY) * camera.zoom;

        // Position popup above the object, clamped to screen
        let px = Math.max(this.popupW / 2 + 4, Math.min(w - this.popupW / 2 - 4, screenX));
        let py = screenY - 30 * camera.zoom;

        // If popup would go above screen, show below instead
        if (py < this.popupH / 2 + 4) {
            py = screenY + 30 * camera.zoom;
        }
        // Clamp Y
        py = Math.max(this.popupH / 2 + 4, Math.min(h - this.popupH / 2 - 4, py));

        this.container.setPosition(px, py);
    }

    /** Destroy everything */
    destroy() {
        this.hide();
    }
}
