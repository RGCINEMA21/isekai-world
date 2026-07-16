/**
 * MonsterEntity - Representasi visual monster di map.
 * Menggambar placeholder sprite dari data MonsterDatabase.
 * Objek dikelola oleh Object Pool (MonsterPool).
 */
class MonsterEntity {
    /**
     * @param {Phaser.Scene} scene
     * @param {Object} monsterData - Data dari MonsterDatabase.getMonsterInfo()
     * @param {number} x - Posisi X pixel
     * @param {number} y - Posisi Y pixel
     */
    constructor(scene, monsterData, x, y) {
        this.scene = scene;
        this.monsterData = monsterData;
        this.x = x;
        this.y = y;
        this.active = false;
        this.alive = true;
        this.spawnPointId = null;

        // Graphics object (digambar ulang tiap frame)
        this.gfx = scene.add.graphics().setDepth(8);
        this.gfx.setVisible(false);

        // Bounce animation
        this.bounceTimer = 0;
        this.bounceOffset = 0;

        // Hit area untuk interaksi nanti
        this.hitArea = null;
    }

    /** Aktifkan monster dan tampilkan */
    activate(x, y, monsterData, spawnPointId) {
        this.x = x;
        this.y = y;
        this.monsterData = monsterData;
        this.spawnPointId = spawnPointId;
        this.active = true;
        this.alive = true;
        this.gfx.setVisible(true);
        this.bounceTimer = 0;
        this.draw();
        this._createHitArea();
    }

    /** Buat hit area untuk interaksi klik/sentuh */
    _createHitArea() {
        if (this.hitArea) { this.hitArea.destroy(); this.hitArea = null; }
        const vis = this.monsterData.visual || {};
        const size = (vis.size || 12) * 2;
        this.hitArea = this.scene.add.rectangle(this.x, this.y, size, size, 0x000000, 0)
            .setInteractive({ useHandCursor: true })
            .setDepth(9);
        this.hitArea.on('pointerdown', () => {
            if (this.onMonsterClick) this.onMonsterClick(this);
        });
    }

    /** Nonaktifkan monster dan sembunyikan */
    deactivate() {
        this.active = false;
        this.gfx.setVisible(false);
        if (this.hitArea) {
            this.hitArea.destroy();
            this.hitArea = null;
        }
        this.onMonsterClick = null;
    }

    /** Gambar monster menggunakan placeholder */
    draw() {
        if (!this.active) return;
        const g = this.gfx;
        g.clear();

        const data = this.monsterData;
        const vis = data.visual;
        const s = (vis.size || 12) / 12;
        const px = this.x;
        const py = this.y + this.bounceOffset;

        // Shadow
        g.fillStyle(0x000000, 0.15);
        g.fillEllipse(px, py + 10 * s, 20 * s, 6 * s);

        const bodyColor = vis.baseColor || 0x44aa44;
        const eyeColor = vis.eyeColor || 0x224422;

        if (data.id === 'carrot_slime' || data.id === 'green_slime' || data.type === 'slime') {
            // Bentuk slime: bulat lonjong
            g.fillStyle(bodyColor, 1);
            g.fillEllipse(px, py, 10 * s, 12 * s);

            // Highlight
            g.fillStyle(0xffffff, 0.2);
            g.fillEllipse(px - 3 * s, py - 3 * s, 4 * s, 3 * s);

            // Eyes
            g.fillStyle(0xffffff, 1);
            g.fillCircle(px - 3 * s, py - 1 * s, 2 * s);
            g.fillCircle(px + 3 * s, py - 1 * s, 2 * s);
            g.fillStyle(eyeColor, 1);
            g.fillCircle(px - 3 * s, py - 1 * s, 1 * s);
            g.fillCircle(px + 3 * s, py - 1 * s, 1 * s);

            // Mulut
            g.lineStyle(1, eyeColor, 0.5);
            g.beginPath();
            g.arc(px, py + 2 * s, 2 * s, 0, Math.PI, false);
            g.strokePath();
        } else if (data.id === 'wild_rabbit' || data.type === 'beast') {
            // Bentuk kelinci: badan oval + telinga
            g.fillStyle(bodyColor, 1);
            g.fillEllipse(px, py + 2 * s, 9 * s, 10 * s);

            // Telinga
            g.fillEllipse(px - 3 * s, py - 8 * s, 3 * s, 6 * s);
            g.fillEllipse(px + 3 * s, py - 8 * s, 3 * s, 6 * s);

            // Telinga dalam
            g.fillStyle(0xffccbb, 0.6);
            g.fillEllipse(px - 3 * s, py - 8 * s, 1.5 * s, 4 * s);
            g.fillEllipse(px + 3 * s, py - 8 * s, 1.5 * s, 4 * s);

            // Mata
            g.fillStyle(0xffffff, 1);
            g.fillCircle(px - 3 * s, py, 2 * s);
            g.fillCircle(px + 3 * s, py, 2 * s);
            g.fillStyle(eyeColor, 1);
            g.fillCircle(px - 3 * s, py, 1 * s);
            g.fillCircle(px + 3 * s, py, 1 * s);

            // Hidung pink
            g.fillStyle(0xff8888, 1);
            g.fillCircle(px, py + 2 * s, 1.5 * s);
        } else {
            // Fallback generic
            g.fillStyle(bodyColor, 1);
            g.fillCircle(px, py, 8 * s);
            g.fillStyle(eyeColor, 1);
            g.fillRect(px - 2 * s, py - 2 * s, 2 * s, 2 * s);
            g.fillRect(px + 1 * s, py - 2 * s, 2 * s, 2 * s);
        }

        // Nama dan level di atas monster
        const labelSize = Math.max(7, Math.min(9, s * 6));
        this.gfx._labelText = data.name + ' Lv.' + data.level;
    }

    /** Update animasi idle (bounce) */
    update(delta) {
        if (!this.active) return;
        this.bounceTimer += delta;
        this.bounceOffset = Math.sin(this.bounceTimer * 0.003 * (this.monsterData.visual.bounceSpeed || 2)) * 2;
        this.draw();
        // Sync hitArea position with bounce
        if (this.hitArea) {
            this.hitArea.setPosition(this.x, this.y + this.bounceOffset);
        }
    }

    /** Dapatkan jarak ke titik */
    distanceTo(x, y) {
        const dx = this.x - x;
        const dy = this.y - y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /** Cek apakah dalam radius kamera */
    isInCamera(camera, margin = 100) {
        if (!camera) return true;
        const zoom = camera.zoom || 1;
        const viewW = (camera.width / zoom) + margin;
        const viewH = (camera.height / zoom) + margin;
        return (
            this.x >= camera.scrollX - margin &&
            this.x <= camera.scrollX + viewW &&
            this.y >= camera.scrollY - margin &&
            this.y <= camera.scrollY + viewH
        );
    }

    destroy() {
        if (this.gfx) this.gfx.destroy();
        if (this.hitArea) this.hitArea.destroy();
    }
}
