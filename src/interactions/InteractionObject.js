/**
 * InteractionObject - Represents a single interactable object in the world.
 * Holds position, metadata, and provides distance/status checks.
 */
class InteractionObject {
    /**
     * @param {Phaser.Scene} scene - The active scene
     * @param {Object} data - Configuration from InteractionData
     * @param {number} tileSize - Tile size in pixels (e.g. 16)
     */
    constructor(scene, data, tileSize) {
        this.scene = scene;
        this.id = data.id;
        this.name = data.name;
        this.type = data.type;
        this.radius = data.radius || 56;
        this.status = data.status || 'available';
        this.action = data.action || 'Interaksi';
        this.description = data.description || '';

        // World position (pixel coords)
        this.worldX = data.tileX * tileSize + tileSize;
        this.worldY = data.tileY * tileSize + tileSize;

        // Debug graphics
        this.debugGfx = null;
        this.debugVisible = false;
    }

    /** Get distance from a point to this object */
    distanceTo(x, y) {
        const dx = this.worldX - x;
        const dy = this.worldY - y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /** Check if a point is within interaction range */
    isInRange(x, y) {
        return this.distanceTo(x, y) <= this.radius;
    }

    /** Check if this object can be interacted with */
    canInteract() {
        return this.status === 'available';
    }

    /** Get the screen position relative to camera */
    getScreenPos(camera) {
        return {
            x: (this.worldX - camera.scrollX) * camera.zoom,
            y: (this.worldY - camera.scrollY) * camera.zoom
        };
    }

    /** Show debug visualization */
    showDebug() {
        this.debugVisible = true;
        if (!this.debugGfx) {
            this.debugGfx = this.scene.add.graphics().setDepth(150);
        }
        this.drawDebug();
    }

    /** Hide debug visualization */
    hideDebug() {
        this.debugVisible = false;
        if (this.debugGfx) {
            this.debugGfx.clear();
        }
    }

    /** Draw debug circle and label */
    drawDebug() {
        if (!this.debugGfx || !this.debugVisible) return;
        const g = this.debugGfx;
        g.clear();

        // Interaction radius circle
        g.lineStyle(1, 0x00ff00, 0.4);
        g.strokeCircle(this.worldX, this.worldY, this.radius);

        // Fill slightly
        g.fillStyle(0x00ff00, 0.05);
        g.fillCircle(this.worldX, this.worldY, this.radius);

        // Center dot
        g.fillStyle(0x00ff00, 0.8);
        g.fillCircle(this.worldX, this.worldY, 3);

        // Label (only if on screen)
        const cam = this.scene.cameras.main;
        if (this.debugGfx.scene) {
            // Remove old text
            if (this._debugText) this._debugText.destroy();
            this._debugText = this.scene.add.text(
                this.worldX, this.worldY - this.radius - 8,
                `[${this.id}] ${this.name}`,
                { fontSize: '8px', fontFamily: 'monospace', color: '#00ff00', stroke: '#000', strokeThickness: 1 }
            ).setOrigin(0.5).setDepth(151);
        }
    }

    /** Clean up debug graphics */
    destroyDebug() {
        if (this.debugGfx) { this.debugGfx.destroy(); this.debugGfx = null; }
        if (this._debugText) { this._debugText.destroy(); this._debugText = null; }
    }
}
