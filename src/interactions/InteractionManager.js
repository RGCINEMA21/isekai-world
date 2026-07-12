/**
 * InteractionManager - Central coordinator for the interaction system.
 * Manages detection, UI, debug mode, and player input.
 * Use this class from any scene to add interaction support.
 */
class InteractionManager {
    /**
     * @param {Phaser.Scene} scene - The active scene
     */
    constructor(scene) {
        this.scene = scene;
        this.detector = new InteractionDetector();
        this.ui = new InteractionUI(scene);
        this.objects = [];
        this.debugMode = false;
        this.currentTarget = null;

        // Callback when player presses interact
        this.onInteractCallback = null;

        // Debug toggle key (backtick)
        this.debugKey = scene.input.keyboard.addKey('TWO');
        this.debugKey.on('down', () => this.toggleDebug());
    }

    /**
     * Initialize interaction objects from map data.
     * @param {string} mapKey - Map identifier (e.g. 'main_village')
     * @param {number} tileSize - Tile size in pixels
     */
    setup(mapKey, tileSize) {
        const data = InteractionData.getObjects(mapKey);
        this.objects = data.map(d => new InteractionObject(this.scene, d, tileSize));
        this.detector.setObjects(this.objects);
    }

    /**
     * Register a custom interactable object (for future use).
     * @param {Object} data - InteractionData-format object
     * @param {number} tileSize
     * @returns {InteractionObject}
     */
    addObject(data, tileSize) {
        const obj = new InteractionObject(this.scene, data, tileSize);
        this.objects.push(obj);
        this.detector.addObject(obj);
        return obj;
    }

    /**
     * Remove an object by ID.
     * @param {string} id
     */
    removeObject(id) {
        const idx = this.objects.findIndex(o => o.id === id);
        if (idx >= 0) {
            this.objects[idx].destroyDebug();
            this.objects.splice(idx, 1);
        }
        this.detector.setObjects(this.objects);
    }

    /**
     * Update detection and UI every frame.
     * @param {number} playerX - Player world X
     * @param {number} playerY - Player world Y
     * @param {Phaser.Cameras.Scene2D.Camera} camera
     */
    update(playerX, playerY, camera) {
        const nearest = this.detector.findNearest(playerX, playerY);

        if (nearest) {
            if (nearest !== this.currentTarget) {
                this.currentTarget = nearest;
                this.ui.show(nearest);
            }
            this.ui.updatePosition(nearest, camera);
        } else {
            if (this.currentTarget) {
                this.currentTarget = null;
                this.ui.hide();
            }
        }

        // Update debug visuals
        if (this.debugMode) {
            this.objects.forEach(obj => obj.drawDebug());
        }
    }

    /**
     * Call when player presses the interact button (E key / touch).
     * @returns {InteractionObject|null} The object being interacted with, or null
     */
    onInteract() {
        if (!this.currentTarget) return null;
        if (!this.currentTarget.canInteract()) return null;

        // Fire callback
        if (this.onInteractCallback) {
            this.onInteractCallback(this.currentTarget);
        }

        return this.currentTarget;
    }

    /**
     * Set callback for when interaction happens.
     * @param {Function} callback - Receives InteractionObject
     */
    setInteractCallback(callback) {
        this.onInteractCallback = callback;
    }

    /** Toggle debug mode */
    toggleDebug() {
        this.debugMode = !this.debugMode;
        this.detector.setDebugAll(this.debugMode);

        // Show notification
        const text = this.debugMode ? '🔍 Debug: ON' : '🔍 Debug: OFF';
        const w = this.scene.cameras.main.width;
        const notif = this.scene.add.text(w / 2, 30, text, {
            fontSize: '13px', fontFamily: 'Arial', color: this.debugMode ? '#44ff44' : '#ff4444',
            fontStyle: 'bold', stroke: '#000', strokeThickness: 2
        }).setOrigin(0.5).setDepth(300).setScrollFactor(0);

        this.scene.tweens.add({
            targets: notif, alpha: 0, y: 20, duration: 500, delay: 800,
            onComplete: () => notif.destroy()
        });
    }

    /** Get current target */
    getCurrentTarget() {
        return this.currentTarget;
    }

    /** Cleanup */
    destroy() {
        this.ui.destroy();
        this.objects.forEach(o => o.destroyDebug());
        this.objects = [];
        this.detector.clear();
    }
}
