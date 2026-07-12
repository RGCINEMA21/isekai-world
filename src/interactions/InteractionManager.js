/**
 * InteractionManager - Koordinator utama sistem interaksi.
 * Mendeteksi objek terdekat, mengelola popup, menangani input.
 */
class InteractionManager {
    constructor(scene) {
        this.scene = scene;
        this.detector = new InteractionDetector();
        this.ui = new InteractionUI(scene);
        this.objects = [];
        this.debugMode = false;
        this.currentTarget = null;
        this.onInteractCallback = null;
    }

    setup(mapKey, tileSize) {
        const data = InteractionData.getObjects(mapKey);
        this.objects = data.map(d => new InteractionObject(this.scene, d, tileSize));
        this.detector.setObjects(this.objects);
    }

    addObject(data, tileSize) {
        const obj = new InteractionObject(this.scene, data, tileSize);
        this.objects.push(obj);
        this.detector.addObject(obj);
        return obj;
    }

    removeObject(id) {
        const idx = this.objects.findIndex(o => o.id === id);
        if (idx >= 0) { this.objects[idx].destroyDebug(); this.objects.splice(idx, 1); }
        this.detector.setObjects(this.objects);
    }

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

        if (this.debugMode) {
            this.objects.forEach(obj => obj.drawDebug());
        }
    }

    onInteract() {
        if (!this.currentTarget) return null;
        if (!this.currentTarget.canInteract()) return null;
        if (this.onInteractCallback) {
            this.onInteractCallback(this.currentTarget);
        }
        return this.currentTarget;
    }

    setInteractCallback(callback) {
        this.onInteractCallback = callback;
    }

    toggleDebug() {
        this.debugMode = !this.debugMode;
        this.detector.setDebugAll(this.debugMode);
        const text = this.debugMode ? '🔍 Debug: ON' : '🔍 Debug: OFF';
        const w = this.scene.cameras.main.width;
        const notif = this.scene.add.text(w / 2, 30, text, {
            fontSize: '13px', fontFamily: 'Arial',
            color: this.debugMode ? '#44ff44' : '#ff4444',
            fontStyle: 'bold', stroke: '#000', strokeThickness: 2
        }).setOrigin(0.5).setDepth(300).setScrollFactor(0);
        this.scene.tweens.add({
            targets: notif, alpha: 0, y: 20, duration: 500, delay: 800,
            onComplete: () => notif.destroy()
        });
    }

    getCurrentTarget() { return this.currentTarget; }

    destroy() {
        this.ui.destroy();
        this.objects.forEach(o => o.destroyDebug());
        this.objects = [];
        this.detector.clear();
    }
}
