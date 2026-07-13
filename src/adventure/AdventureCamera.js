/**
 * AdventureCamera - Camera system for Adventure Mode.
 * Follows player smoothly with bounds checking.
 * Responsive: Mobile Portrait & Desktop Landscape.
 */
class AdventureCamera {
    /**
     * Create a new AdventureCamera.
     * @param {Phaser.Scene} scene - The scene this camera belongs to
     * @param {AdventureManager} manager - The adventure manager
     */
    constructor(scene, manager) {
        this.scene = scene;
        this.manager = manager;
        this.camera = scene.cameras.main;
        
        this.smoothFactor = 0.1;
        this.targetX = 0;
        this.targetY = 0;
    }
    
    /**
     * Initialize camera settings.
     */
    init() {
        const w = this.camera.width;
        const h = this.camera.height;
        const mapPxW = this.manager.bounds.right;
        const mapPxH = this.manager.bounds.bottom;
        
        // Set bounds to full map size
        this.camera.setBounds(0, 0, mapPxW, mapPxH);
        
        // Calculate zoom: make sure the map is visible and comfortable
        // On mobile portrait: zoom so ~16-20 tiles visible horizontally
        // On desktop landscape: zoom so ~25-30 tiles visible horizontally
        const isPortrait = h > w;
        let zoom;
        
        if (isPortrait) {
            // Portrait: show enough of the map to navigate
            zoom = Math.max(1, Math.min(2.5, w / 280));
        } else {
            // Landscape: wider view
            zoom = Math.max(1, Math.min(2.5, w / 450));
        }
        
        // Make sure zoom doesn't make map smaller than screen
        if (mapPxW * zoom < w) zoom = w / mapPxW;
        if (mapPxH * zoom < h) zoom = h / mapPxH;
        
        // Clamp zoom
        zoom = Phaser.Math.Clamp(zoom, 0.5, 4);
        
        this.camera.setZoom(zoom);
        
        // Center camera on player
        this.camera.scrollX = this.manager.playerX - (w / zoom) / 2;
        this.camera.scrollY = this.manager.playerY - (h / zoom) / 2;
        
        // Clamp initial scroll to bounds
        this.clampScroll();
    }
    
    /**
     * Clamp scroll to camera bounds.
     */
    clampScroll() {
        const zoom = this.camera.zoom || 1;
        const viewW = this.camera.width / zoom;
        const viewH = this.camera.height / zoom;
        const bounds = this.manager.bounds;
        
        this.camera.scrollX = Phaser.Math.Clamp(
            this.camera.scrollX,
            bounds.left,
            Math.max(bounds.left, bounds.right - viewW)
        );
        this.camera.scrollY = Phaser.Math.Clamp(
            this.camera.scrollY,
            bounds.top,
            Math.max(bounds.top, bounds.bottom - viewH)
        );
    }
    
    /**
     * Update camera to follow player.
     * @param {number} delta - Time delta in ms
     */
    update(delta) {
        const zoom = this.camera.zoom || 1;
        const viewW = this.camera.width / zoom;
        const viewH = this.camera.height / zoom;
        
        // Target: center player on screen
        this.targetX = this.manager.playerX - viewW / 2;
        this.targetY = this.manager.playerY - viewH / 2;
        
        // Smooth follow
        this.camera.scrollX += (this.targetX - this.camera.scrollX) * this.smoothFactor;
        this.camera.scrollY += (this.targetY - this.camera.scrollY) * this.smoothFactor;
        
        // Clamp to bounds
        this.clampScroll();
    }
    
    /**
     * Handle screen resize.
     * @param {number} width - New width
     * @param {number} height - New height
     */
    onResize(width, height) {
        const isPortrait = height > width;
        const mapPxW = this.manager.bounds.right;
        const mapPxH = this.manager.bounds.bottom;
        
        let zoom;
        if (isPortrait) {
            zoom = Math.max(1, Math.min(2.5, width / 280));
        } else {
            zoom = Math.max(1, Math.min(2.5, width / 450));
        }
        
        if (mapPxW * zoom < width) zoom = width / mapPxW;
        if (mapPxH * zoom < height) zoom = height / mapPxH;
        
        zoom = Phaser.Math.Clamp(zoom, 0.5, 4);
        
        this.camera.setZoom(zoom);
        this.clampScroll();
    }
}
