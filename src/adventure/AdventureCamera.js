/**
 * AdventureCamera - Camera system for Adventure Mode.
 * Follows player smoothly with bounds checking.
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
        
        // Smooth follow settings
        this.smoothFactor = 0.1;
        this.targetX = 0;
        this.targetY = 0;
    }
    
    /**
     * Initialize camera settings.
     */
    init() {
        const bounds = this.manager.bounds;
        this.camera.setBounds(bounds.left, bounds.top, bounds.right, bounds.bottom);
        
        // Start camera at player position
        this.camera.scrollX = this.manager.playerX - this.camera.width / 2;
        this.camera.scrollY = this.manager.playerY - this.camera.height / 2;
        
        // Set zoom based on screen size
        const w = this.camera.width;
        const h = this.camera.height;
        if (h > w) {
            // Portrait mode
            this.camera.setZoom(Math.min(w / 400, h / 600));
        } else {
            // Landscape mode
            this.camera.setZoom(Math.min(w / 600, h / 400));
        }
    }
    
    /**
     * Update camera to follow player.
     * @param {number} delta - Time delta in ms
     */
    update(delta) {
        // Calculate target position (center player on screen)
        this.targetX = this.manager.playerX - this.camera.width / (2 * this.camera.zoom);
        this.targetY = this.manager.playerY - this.camera.height / (2 * this.camera.zoom);
        
        // Smooth follow
        this.camera.scrollX += (this.targetX - this.camera.scrollX) * this.smoothFactor;
        this.camera.scrollY += (this.targetY - this.camera.scrollY) * this.smoothFactor;
        
        // Clamp to bounds
        const bounds = this.manager.bounds;
        this.camera.scrollX = Phaser.Math.Clamp(
            this.camera.scrollX,
            bounds.left,
            bounds.right - this.camera.width / this.camera.zoom
        );
        this.camera.scrollY = Phaser.Math.Clamp(
            this.camera.scrollY,
            bounds.top,
            bounds.bottom - this.camera.height / this.camera.zoom
        );
    }
    
    /**
     * Handle screen resize.
     * @param {number} width - New width
     * @param {number} height - New height
     */
    onResize(width, height) {
        // Recalculate zoom
        if (height > width) {
            this.camera.setZoom(Math.min(width / 400, height / 600));
        } else {
            this.camera.setZoom(Math.min(width / 600, height / 400));
        }
    }
}
