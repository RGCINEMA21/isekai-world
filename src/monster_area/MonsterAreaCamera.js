/**
 * MonsterAreaCamera — smooth follow, responsive zoom.
 * Zoom adapts so the player + surrounding area are always
 * comfortably visible regardless of screen size or orientation.
 */
class MonsterAreaCamera {
    constructor(scene, playerController, map) {
        this.scene = scene;
        this.player = playerController;
        this.map = map;
        this.camera = scene.cameras.main;
        this.rl = new ResponsiveLayout(scene);

        this.smoothFactor = 0.12;
        this.targetX = 0;
        this.targetY = 0;
        this.zoomLevel = 3;
    }

    init() {
        this.rl.recalculate();
        const { w, h, isPortrait } = this.rl;
        const mapPxW = this.map.getPixelWidth();
        const mapPxH = this.map.getPixelHeight();

        this.camera.setBounds(0, 0, mapPxW, mapPxH);
        this.zoomLevel = this._calcZoom(w, h, mapPxW, mapPxH);
        this.camera.setZoom(this.zoomLevel);
        this._centerOnPlayer();
        this.clampScroll();
    }

    /**
     * Pick zoom so a reasonable number of tiles are visible.
     * On a 25×25 map (400px @ 16px/tile):
     *   Portrait  (e.g. 400×700)  → ~10-12 tiles wide
     *   Landscape (e.g. 1280×720) → ~16-20 tiles wide
     */
    _calcZoom(w, h, mapPxW, mapPxH) {
        const S = this.map.tileSize; // 16
        const isPortrait = h > w;
        // Target: show enough tiles so the player (16px sprite) is ~5-6% of screen
        const targetTilesWide = isPortrait
            ? Math.max(8, Math.min(14, w / 38))
            : Math.max(12, Math.min(22, w / 40));
        let z = w / (targetTilesWide * S);
        // Don't zoom in past 4× or out past the map
        z = Phaser.Math.Clamp(z, 1, 5);
        // Never zoom out so much that the map is smaller than the screen
        const zoomFitW = w / mapPxW;
        const zoomFitH = h / mapPxH;
        z = Math.max(z, Math.max(zoomFitW, zoomFitH) * 0.8);
        return z;
    }

    _centerOnPlayer() {
        const zoom = this.camera.zoom || this.zoomLevel;
        const viewW = this.camera.width / zoom;
        const viewH = this.camera.height / zoom;
        this.camera.scrollX = Phaser.Math.Clamp(
            this.player.x - viewW / 2, 0, Math.max(0, this.map.getPixelWidth() - viewW));
        this.camera.scrollY = Phaser.Math.Clamp(
            this.player.y - viewH / 2, 0, Math.max(0, this.map.getPixelHeight() - viewH));
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
        this.rl.recalculate();
        const mapPxW = this.map.getPixelWidth();
        const mapPxH = this.map.getPixelHeight();
        this.zoomLevel = this._calcZoom(w, h, mapPxW, mapPxH);
        this.camera.setZoom(this.zoomLevel);
        this.clampScroll();
    }
}
