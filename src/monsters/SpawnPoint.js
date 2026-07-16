/**
 * SpawnPoint - Titik spawn individual untuk monster.
 * Mengelola respawn timer, batas max monster, dan pool monster lokal.
 */
class SpawnPoint {
    /**
     * @param {Object} config - Konfigurasi dari SpawnDatabase
     * @param {number} tileSize - Ukuran tile dalam pixel
     */
    constructor(config, tileSize) {
        this.id = config.id;
        this.tileX = config.x;
        this.tileY = config.y;
        this.x = config.x * tileSize + tileSize / 2;
        this.y = config.y * tileSize + tileSize / 2;
        this.radius = config.radius || 80;
        this.maxMonsters = config.maxMonsters || 3;
        this.respawnTime = config.respawnTime || 8000;
        this.monsterPoolIds = config.monsterPool || [];
        this.active = config.active !== false;

        // Monster aktif di spawn point ini
        this.monsters = [];

        // Respawn timer
        this.respawnTimer = 0;
        this.needsRespawn = false;

        // Debug
        this.debugVisible = false;
        this.debugGfx = null;
    }

    /**
     * Spawn awal saat area dimuat
     * @param {MonsterPool} pool
     */
    initialSpawn(pool) {
        if (!this.active) return;
        for (let i = 0; i < this.maxMonsters; i++) {
            this._spawnOne(pool);
        }
    }

    /**
     * Spawn 1 monster di posisi random dalam radius
     * @param {MonsterPool} pool
     * @returns {MonsterEntity|null}
     */
    _spawnOne(pool) {
        if (this.monsters.length >= this.maxMonsters) return null;
        if (this.monsterPoolIds.length === 0) return null;

        // Pilih random monster dari pool IDs
        const monsterId = Phaser.Utils.Array.GetRandom(this.monsterPoolIds);

        // Load data dari MonsterDatabase
        const level = Phaser.Math.Between(1, 3);
        const monsterData = MonsterDatabase.getMonsterInfo(monsterId, level);
        if (!monsterData) return null;

        return this._spawnAtRandomPos(pool, monsterData);
    }

    /** Spawn di posisi random dalam radius, cek tumpukan */
    _spawnAtRandomPos(pool, monsterData) {
        const maxAttempts = 15;
        for (let i = 0; i < maxAttempts; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * this.radius;
            const sx = this.x + Math.cos(angle) * dist;
            const sy = this.y + Math.sin(angle) * dist;

            // Cek tumpukan: pastikan tidak terlalu dekat dengan monster lain
            if (this._isPositionClear(sx, sy, 24)) {
                const entity = pool.acquire(monsterData, sx, sy, this.id);
                this.monsters.push(entity);
                return entity;
            }
        }
        return null;
    }

    /** Cek apakah posisi aman dari tumpukan */
    _isPositionClear(x, y, minDist) {
        for (const m of this.monsters) {
            if (!m.active) continue;
            const dx = m.x - x;
            const dy = m.y - y;
            if (Math.sqrt(dx * dx + dy * dy) < minDist) {
                return false;
            }
        }
        return true;
    }

    /**
     * Update respawn timer
     * @param {number} delta - Time delta ms
     * @param {MonsterPool} pool
     */
    update(delta, pool) {
        // Hapus monster tidak aktif dari list
        this.monsters = this.monsters.filter(m => m.active);

        // Cek kebutuhan respawn
        if (this.monsters.length < this.maxMonsters) {
            if (!this.needsRespawn) {
                this.needsRespawn = true;
                this.respawnTimer = this.respawnTime;
            }
        }

        // Hitung respawn timer
        if (this.needsRespawn) {
            this.respawnTimer -= delta;
            if (this.respawnTimer <= 0) {
                this._spawnOne(pool);
                this.respawnTimer = this.respawnTime;
                if (this.monsters.length >= this.maxMonsters) {
                    this.needsRespawn = false;
                }
            }
        }

        // Update debug
        if (this.debugVisible && this.debugGfx) {
            this._drawDebug();
        }
    }

    /** Nonaktifkan semua monster di spawn point ini */
    deactivateAll(pool) {
        for (const m of this.monsters) {
            pool.release(m);
        }
        this.monsters = [];
        this.needsRespawn = false;
    }

    /** Tampilkan debug info */
    showDebug(gfx) {
        this.debugVisible = true;
        this.debugGfx = gfx;
        this._drawDebug();
    }

    /** Sembunyikan debug info */
    hideDebug() {
        this.debugVisible = false;
    }

    _drawDebug() {
        if (!this.debugGfx) return;
        const g = this.debugGfx;

        // Lingkaran radius
        g.lineStyle(1, 0x00ff00, 0.3);
        g.strokeCircle(this.x, this.y, this.radius);

        // Titik tengah
        g.fillStyle(0x00ff00, 0.5);
        g.fillCircle(this.x, this.y, 3);

        // Label
        if (!this._debugLabel) {
            this._debugLabel = this.debugGfx.scene.add.text(
                this.x, this.y - this.radius - 10,
                this.id + '\n' + this.monsters.length + '/' + this.maxMonsters,
                { fontSize: '8px', fontFamily: 'monospace', color: '#00ff00', align: 'center' }
            ).setOrigin(0.5).setDepth(200);
        }
        this._debugLabel.setText(this.id + '\n' + this.monsters.length + '/' + this.maxMonsters);
    }

    /** Hapus debug label */
    destroyDebug() {
        if (this._debugLabel) {
            this._debugLabel.destroy();
            this._debugLabel = null;
        }
    }
}
