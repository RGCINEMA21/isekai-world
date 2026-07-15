/**
 * VillageCamera - Camera system for Village Mode.
 * Drag to pan, scroll/pinch to zoom.
 * Camera has bounds and cannot leave the map.
 */
class VillageCamera {
    constructor(scene, villageMap) {
        this.scene = scene;
        this.map = villageMap;
        this.camera = scene.cameras.main;

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
        const w = this.camera.width;
        const h = this.camera.height;
        this.isPortrait = h > w;

        this.camera.setBounds(0, 0, this.PX_W, this.PX_H);

        // Center on village
        this.camera.scrollX = this.PX_W / 2 - w / 2;
        this.camera.scrollY = this.PX_H / 2 - h / 2;

        // Initial zoom
        if (this.isPortrait) {
            this.camera.setZoom(Math.min(w / 400, h / 600));
        } else {
            this.camera.setZoom(Math.min(w / 600, h / 400));
        }

        this.clampScroll();
        this.setupInput();
    }

    setupInput() {
        this.scene.input.on('pointerdown', (p) => this.onDragStart(p));
        this.scene.input.on('pointermove', (p) => this.onDragMove(p));
        this.scene.input.on('pointerup', () => this.onDragEnd());

        // Zoom (scroll)
        this.scene.input.on('wheel', (pointer, gameObjects, dx, dy) => {
            const newZoom = Phaser.Math.Clamp(this.camera.zoom - dy * 0.001, 0.4, 3);
            this.camera.zoom = newZoom;
        });

        // Pinch zoom
        this.scene.input.on('pointermove', (p) => {
            if (this.scene.input.pointer1.isDown && this.scene.input.pointer2.isDown) {
                const d = Phaser.Math.Distance.Between(
                    this.scene.input.pointer1.x, this.scene.input.pointer1.y,
                    this.scene.input.pointer2.x, this.scene.input.pointer2.y
                );
                if (d > 30) {
                    this.isPinching = true;
                    this.isDragging = false;
                }
                if (this.isPinching && this.lastPinchDist > 0) {
                    const diff = d - this.lastPinchDist;
                    const newZoom = Phaser.Math.Clamp(this.camera.zoom + diff * 0.005, 0.4, 3);
                    this.camera.zoom = newZoom;
                }
                this.lastPinchDist = d;
            }
        });
        this.scene.input.on('pointerup', () => {
            this.lastPinchDist = 0;
            this.isPinching = false;
        });
    }

    onDragStart(ptr) {
        // Don't drag if clicking interactive object or pinching
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
        const dx = (this.dragStartX - ptr.x) / zoom;
        const dy = (this.dragStartY - ptr.y) / zoom;
        this.camera.scrollX = Phaser.Math.Clamp(this.camStartX + dx, 0, this.PX_W - this.camera.width / zoom);
        this.camera.scrollY = Phaser.Math.Clamp(this.camStartY + dy, 0, this.PX_H - this.camera.height / zoom);
    }

    onDragEnd() {
        this.isDragging = false;
    }

    clampScroll() {
        const zoom = this.camera.zoom || 1;
        const viewW = this.camera.width / zoom;
        const viewH = this.camera.height / zoom;
        this.camera.scrollX = Phaser.Math.Clamp(this.camera.scrollX, 0, Math.max(0, this.PX_W - viewW));
        this.camera.scrollY = Phaser.Math.Clamp(this.camera.scrollY, 0, Math.max(0, this.PX_H - viewH));
    }

    onResize(w, h) {
        this.isPortrait = h > w;
        if (this.isPortrait) {
            this.camera.setZoom(Math.min(w / 400, h / 600));
        } else {
            this.camera.setZoom(Math.min(w / 600, h / 400));
        }
        this.clampScroll();
    }
}
