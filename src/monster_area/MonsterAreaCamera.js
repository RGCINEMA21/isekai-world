/**
 * MonsterAreaCamera - Smooth camera following player.
 * Responsive zoom, bounds checking, smooth interpolation.
 * Optimized for 25x25 tile maps (400x400 px).
 */
class MonsterAreaCamera {
    constructor(scene, playerController, map) {
        this.scene = scene;
        this.player = playerController;
        this.map = map;
        this.camera = scene.cameras.main;

        this.smoothFactor = 0.1;
        this.targetX = 0;
        this.targetY = 0;
        this.zoomLevel = 2;
    }

    init() {
        const w = this.camera.width;
        const h = this.camera.height;
        const isPortrait = h > w;

        const mapPxW = this.map.getPixelWidth();
        const mapPxH = this.map.getPixelHeight();

        // Set bounds
        this.camera.setBounds(0, 0, mapPxW, mapPxH);

        // Calculate zoom: fit map nicely on screen
        // For 25x25 map at 16px = 400x400 pixel map
        if (isPortrait) {
            // Portrait: zoom so map width fills ~80% of screen width
            this.zoomLevel = (w * 0.85) / mapPxW;
            this.zoomLevel = Phaser.Math.Clamp(this.zoomLevel, 1.0, 2.5);
        } else {
            // Landscape: zoom so map height fills ~75% of screen height
            this.zoomLevel = (h * 0.75) / mapPxH;
            this.zoomLevel = Phaser.Math.Clamp(this.zoomLevel, 1.0, 2.5);
        }

        this.camera.setZoom(this.zoomLevel);

        // Center on player
        this.camera.scrollX = this.player.x - (w / this.zoomLevel) / 2;
        this.camera.scrollY = this.player.y - (h / this.zoomLevel) / 2;
        this.clampScroll();
    }

    update(delta) {
        const zoom = this.camera.zoom || this.zoomLevel;
        const viewW = this.camera.width / zoom;
        const viewH = this.camera.height / zoom;

        this.targetX = this.player.x - viewW / 2;
        this.targetY = this.player.y - viewH / 2;

        // Smooth follow
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
        const mapPxW = this.map.getPixelWidth();
        const mapPxH = this.map.getPixelHeight();

        if (isPortrait) {
            this.zoomLevel = (w * 0.85) / mapPxW;
            this.zoomLevel = Phaser.Math.Clamp(this.zoomLevel, 1.0, 2.5);
        } else {
            this.zoomLevel = (h * 0.75) / mapPxH;
            this.zoomLevel = Phaser.Math.Clamp(this.zoomLevel, 1.0, 2.5);
        }

        this.camera.setZoom(this.zoomLevel);
        this.clampScroll();
    }
}
