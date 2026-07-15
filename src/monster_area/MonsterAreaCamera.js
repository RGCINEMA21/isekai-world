/**
 * MonsterAreaCamera - Smooth camera following player.
 * Responsive zoom that keeps map comfortably visible with player.
 * Works well on both portrait (mobile) and landscape (desktop).
 */
class MonsterAreaCamera {
    constructor(scene, playerController, map) {
        this.scene = scene;
        this.player = playerController;
        this.map = map;
        this.camera = scene.cameras.main;
        this.smoothFactor = 0.12;
        this.targetX = 0;
        this.targetY = 0;
        this.zoomLevel = 3;
    }

    init() {
        const w = this.camera.width;
        const h = this.camera.height;
        const isPortrait = h > w;
        const mapPxW = this.map.getPixelWidth();
        const mapPxH = this.map.getPixelHeight();

        this.camera.setBounds(0, 0, mapPxW, mapPxH);

        // Calculate zoom to show a comfortable portion of the map
        // Player should be clearly visible, not tiny
        if (isPortrait) {
            // Portrait: show about 12-15 tiles across
            const targetTilesWide = 14;
            this.zoomLevel = w / (targetTilesWide * this.map.tileSize);
        } else {
            // Landscape: show about 18-22 tiles across
            const targetTilesWide = 18;
            this.zoomLevel = w / (targetTilesWide * this.map.tileSize);
        }

        // Clamp to reasonable range
        this.zoomLevel = Phaser.Math.Clamp(this.zoomLevel, 1.5, 5);

        this.camera.setZoom(this.zoomLevel);
        this._centerOnPlayer();
        this.clampScroll();
    }

    _centerOnPlayer() {
        const zoom = this.camera.zoom || this.zoomLevel;
        const viewW = this.camera.width / zoom;
        const viewH = this.camera.height / zoom;
        this.camera.scrollX = Phaser.Math.Clamp(
            this.player.x - viewW / 2, 0,
            Math.max(0, this.map.getPixelWidth() - viewW)
        );
        this.camera.scrollY = Phaser.Math.Clamp(
            this.player.y - viewH / 2, 0,
            Math.max(0, this.map.getPixelHeight() - viewH)
        );
    }

    update(delta) {
        const zoom = this.camera.zoom || this.zoomLevel;
        const viewW = this.camera.width / zoom;
        const viewH = this.camera.height / zoom;

        this.targetX = this.player.x - viewW / 2;
        this.targetY = this.player.y - viewH / 2;

        this.camera.scrollX += (this.targetX - this.camera.scrollX) * this.smoothFactor;
        this.camera.scrollY += (this.targetY - this.camera.scrollY) * this.smoothFactor;

        this.clampScroll();
    }

    clampScroll() {
        const zoom = this.camera.zoom || 1;
        const viewW = this.camera.width / zoom;
        const viewH = this.camera.height / zoom;
        this.camera.scrollX = Phaser.Math.Clamp(this.camera.scrollX, 0, Math.max(0, this.map.getPixelWidth() - viewW));
        this.camera.scrollY = Phaser.Math.Clamp(this.camera.scrollY, 0, Math.max(0, this.map.getPixelHeight() - viewH));
    }

    onResize(w, h) {
        const isPortrait = h > w;
        if (isPortrait) {
            const targetTilesWide = 14;
            this.zoomLevel = w / (targetTilesWide * this.map.tileSize);
        } else {
            const targetTilesWide = 18;
            this.zoomLevel = w / (targetTilesWide * this.map.tileSize);
        }
        this.zoomLevel = Phaser.Math.Clamp(this.zoomLevel, 1.5, 5);
        this.camera.setZoom(this.zoomLevel);
        this.clampScroll();
    }
}
