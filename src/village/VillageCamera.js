/**
 * VillageCamera — camera for Village Mode.
 * Drag to pan, scroll/pinch to zoom.
 * Zoom adapts to screen size via ResponsiveLayout.
 */
class VillageCamera {
    constructor(scene, villageMap) {
        this.scene = scene;
        this.map = villageMap;
        this.camera = scene.cameras.main;
        this.rl = new ResponsiveLayout(scene);

        this.PX_W = this.map.MAP_W * this.map.TILE;
        this.PX_H = this.map.MAP_H * this.map.TILE;

        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.camStartX = 0;
        this.camStartY = 0;
        this.lastPinchDist = 0;
        this.isPinching = false;
    }

    init() {
        this.rl.recalculate();
        const { w, h, isPortrait } = this.rl;
        const S = this.map.TILE;

        this.camera.setBounds(0, 0, this.PX_W, this.PX_H);

        // Center on village center
        const cx = 48 * S;
        const cy = 48 * S;
        this.camera.scrollX = cx - w / 2;
        this.camera.scrollY = cy - h / 2;

        // Zoom: show enough tiles to see the village layout
        const targetTiles = isPortrait ? Math.max(20, Math.min(35, w / 20)) : Math.max(25, Math.min(50, w / 20));
        this.camera.setZoom(w / (targetTiles * S));

        this.clampScroll();
        this.setupInput();
    }

    setupInput() {
        this.scene.input.on('pointerdown', (p) => this.onDragStart(p));
        this.scene.input.on('pointermove', (p) => this.onDragMove(p));
        this.scene.input.on('pointerup', () => this.onDragEnd());
        this.scene.input.on('wheel', (pointer, gameObjects, dx, dy) => {
            const newZoom = Phaser.Math.Clamp(this.camera.zoom - dy * 0.001, 0.4, 3);
            this.camera.zoom = newZoom;
        });
        this.scene.input.on('pointermove', (p) => {
            if (this.scene.input.pointer1.isDown && this.scene.input.pointer2.isDown) {
                const d = Phaser.Math.Distance.Between(
                    this.scene.input.pointer1.x, this.scene.input.pointer1.y,
                    this.scene.input.pointer2.x, this.scene.input.pointer2.y);
                if (d > 30) { this.isPinching = true; this.isDragging = false; }
                if (this.isPinching && this.lastPinchDist > 0) {
                    const diff = d - this.lastPinchDist;
                    this.camera.zoom = Phaser.Math.Clamp(this.camera.zoom + diff * 0.005, 0.4, 3);
                }
                this.lastPinchDist = d;
            }
        });
        this.scene.input.on('pointerup', () => { this.lastPinchDist = 0; this.isPinching = false; });
    }

    onDragStart(ptr) {
        if (this.isPinching) return;
        this.isDragging = true;
        this.dragStartX = ptr.x;
        this.dragStartY = ptr.y;
        this.camStartX = this.camera.scrollX;
        this.camStartY = this.camera.scrollY;
    }

    onDragMove(ptr) {
        if (!this.isDragging || this.isPinching) return;
        const zoom = this.camera.zoom;
        this.camera.scrollX = Phaser.Math.Clamp(this.camStartX + (this.dragStartX - ptr.x) / zoom, 0, this.PX_W - this.camera.width / zoom);
        this.camera.scrollY = Phaser.Math.Clamp(this.camStartY + (this.dragStartY - ptr.y) / zoom, 0, this.PX_H - this.camera.height / zoom);
    }

    onDragEnd() { this.isDragging = false; }

    clampScroll() {
        const zoom = this.camera.zoom || 1;
        const viewW = this.camera.width / zoom;
        const viewH = this.camera.height / zoom;
        this.camera.scrollX = Phaser.Math.Clamp(this.camera.scrollX, 0, Math.max(0, this.PX_W - viewW));
        this.camera.scrollY = Phaser.Math.Clamp(this.camera.scrollY, 0, Math.max(0, this.PX_H - viewH));
    }

    onResize(w, h) {
        this.rl.recalculate();
        const S = this.map.TILE;
        const isPortrait = h > w;
        const targetTiles = isPortrait ? Math.max(20, Math.min(35, w / 20)) : Math.max(25, Math.min(50, w / 20));
        this.camera.setZoom(w / (targetTiles * S));
        this.clampScroll();
    }
}
