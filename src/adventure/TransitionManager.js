/**
 * TransitionManager - Handles scene transitions with fade effects.
 * Provides consistent transition experience across all scenes.
 */
class TransitionManager {
    /**
     * Create a new TransitionManager.
     * @param {Phaser.Scene} scene - The scene to manage transitions for
     */
    constructor(scene) {
        this.scene = scene;
        this.isTransitioning = false;
        this.transitionDuration = 500; // ms
    }
    
    /**
     * Fade out and transition to another scene.
     * @param {string} targetScene - Target scene key
     * @param {Object} data - Data to pass to the new scene
     * @param {Function} callback - Optional callback before transition
     */
    fadeToScene(targetScene, data, callback) {
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        
        if (callback) callback();
        
        this.scene.cameras.main.fadeOut(this.transitionDuration, 0, 0, 0);
        this.scene.cameras.main.once('camerafadeoutcomplete', () => {
            this.isTransitioning = false;
            this.scene.scene.start(targetScene, data);
        });
    }
    
    /**
     * Fade in when entering a scene.
     * @param {Function} callback - Optional callback after fade in
     */
    fadeIn(callback) {
        this.isTransitioning = false;
        this.scene.cameras.main.fadeIn(this.transitionDuration, 0, 0, 0);
        if (callback) {
            this.scene.cameras.main.once('camerafadeincomplete', () => {
                callback();
            });
        }
    }
    
    /**
     * Fade out and restart current scene.
     * @param {Object} data - Data to pass to the restarted scene
     */
    fadeRestart(data) {
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        
        this.scene.cameras.main.fadeOut(this.transitionDuration, 0, 0, 0);
        this.scene.cameras.main.once('camerafadeoutcomplete', () => {
            this.isTransitioning = false;
            this.scene.scene.restart(data);
        });
    }
    
    /**
     * Check if a transition is in progress.
     * @returns {boolean} True if transitioning
     */
    isCurrentlyTransitioning() {
        return this.isTransitioning;
    }
    
    /**
     * Reset transition state.
     */
    reset() {
        this.isTransitioning = false;
    }
}
