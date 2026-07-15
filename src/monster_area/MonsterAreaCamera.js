/**
 * MonsterAreaCamera - Smooth camera following player.
 * Responsive zoom, bounds checking, smooth interpolation.
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
        this.zoomLevel = 1.5;
    }

    init() {
        const w = this.camera.width;
        const h = this.camera.height;
        const isPortrait = h > w;

        const mapPxW = this.map.getPixelWidth();
        const mapPxH = this.map.getPixelHeight();

        this.camera.setBounds(0, 0, mapPxW, mapPxH);

        // Zoom: 1.2x-1.5x for comfortable view
        if (isPortrait) {
            this.zoomLevel = Math.min(1.5, Math.max(1.0, w / 350));
        } else {
            this.zoomLevel = Math.min(1.5, Math.max(1.0, w / 500));
        }

        this.camera.setZoom(this.zoomLevel);

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
            this.zoomLevel = Math.min(1.5, Math.max(1.0, w / 350));
        } else {
            this.zoomLevel = Math.min(1.5, Math.max(1.0, w / 500));
        }
        this.camera.setZoom(this.zoomLevel);
        this.clampScroll();
    }
}
