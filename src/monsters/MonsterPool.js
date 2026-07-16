/**
 * MonsterPool - Object Pool untuk monster entity.
 * Menghindari pembuatan dan penghancuran objek berulang kali.
 * Performa stabil di browser dan Android.
 */
class MonsterPool {
    /**
     * @param {Phaser.Scene} scene
     * @param {number} initialSize - Jumlah pool awal
     */
    constructor(scene, initialSize = 20) {
        this.scene = scene;
        this.pool = [];
        this.active = [];

        // Pre-create pool
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(this._create());
        }
    }

    /** Buat entity baru (tidak aktif) */
    _create() {
        const dummyData = {
            id: 'dummy', name: '?', level: 1, type: 'slime',
            visual: { baseColor: 0x888888, eyeColor: 0x444444, size: 12, bounceSpeed: 1 }
        };
        const entity = new MonsterEntity(this.scene, dummyData, -1000, -1000);
        return entity;
    }

    /**
     * Ambil entity dari pool
     * @param {Object} monsterData - Data monster dari MonsterDatabase
     * @param {number} x - Posisi X
     * @param {number} y - Posisi Y
     * @param {string} spawnPointId - ID spawn point
     * @returns {MonsterEntity}
     */
    acquire(monsterData, x, y, spawnPointId) {
        let entity;
        if (this.pool.length > 0) {
            entity = this.pool.pop();
        } else {
            // Pool kosong, buat baru
            entity = this._create();
        }
        entity.activate(x, y, monsterData, spawnPointId);
        this.active.push(entity);
        return entity;
    }

    /**
     * Kembalikan entity ke pool
     * @param {MonsterEntity} entity
     */
    release(entity) {
        entity.deactivate();
        const idx = this.active.indexOf(entity);
        if (idx !== -1) {
            this.active.splice(idx, 1);
        }
        this.pool.push(entity);
    }

    /** Kembalikan semua active ke pool */
    releaseAll() {
        while (this.active.length > 0) {
            this.release(this.active[0]);
        }
    }

    /** Update semua entity aktif */
    update(delta) {
        for (let i = this.active.length - 1; i >= 0; i--) {
            this.active[i].update(delta);
        }
    }

    /** Gambar label untuk entity aktif (dipanggil dari scene) */
    drawLabels(camera) {
        for (const entity of this.active) {
            if (!entity.active) continue;
            if (!entity.isInCamera(camera)) continue;

            const zoom = camera.zoom || 1;
            const screenX = (entity.x - camera.scrollX) * zoom;
            const screenY = (entity.y - camera.scrollY) * zoom;

            // Hanya gambar jika di layar
            if (screenX < -50 || screenX > camera.width + 50) continue;
            if (screenY < -50 || screenY > camera.height + 50) continue;
        }
    }

    /** Dapatkan jumlah aktif */
    getActiveCount() {
        return this.active.length;
    }

    /** Dapatkan jumlah pool */
    getPoolCount() {
        return this.pool.length;
    }

    /** Hapus semua */
    destroy() {
        for (const e of this.pool) e.destroy();
        for (const e of this.active) e.destroy();
        this.pool = [];
        this.active = [];
    }
}
