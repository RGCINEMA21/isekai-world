/**
 * SpawnDebugger - Debug overlay untuk sistem spawn.
 * Tampilkan info spawn point, jumlah monster, radius, dan status.
 * Aktifkan dengan menekan tombol debug di UI atau keyboard.
 */
class SpawnDebugger {
    /**
     * @param {Phaser.Scene} scene
     */
    constructor(scene) {
        this.scene = scene;
        this.active = false;
        this.container = null;
        this.infoText = null;
    }

    /**
     * Update debug display
     * @param {MonsterSpawner} spawner
     */
    updateDisplay(spawner) {
        if (!this.active || !this.container) return;

        const info = spawner.getInfo();
        if (!info) return;

        const camera = this.scene.cameras.main;
        const lines = [
            '=== SPAWN DEBUG ===',
            'Area: ' + info.areaId,
            'Spawn Points: ' + info.spawnPoints,
            'Active Monsters: ' + info.activeMonsters,
            'Pool Available: ' + info.poolAvailable,
            '',
            '[D] Toggle Debug',
            'Press D to close'
        ];
        this.infoText.setText(lines.join('\n'));
    }

    /** Tampilkan debug overlay */
    show() {
        this.active = true;
        if (!this.container) {
            const w = this.scene.cameras.main.width;

            this.container = this.scene.add.container(10, 50).setDepth(300).setScrollFactor(0);

            const bg = this.scene.add.graphics();
            bg.fillStyle(0x000000, 0.7);
            bg.fillRect(0, 0, 180, 120);
            this.container.add(bg);

            this.infoText = this.scene.add.text(8, 4, '', {
                fontSize: '9px',
                fontFamily: 'monospace',
                color: '#00ff00',
                lineSpacing: 2
            });
            this.container.add(this.infoText);
        }
        this.container.setVisible(true);
    }

    /** Sembunyikan debug overlay */
    hide() {
        this.active = false;
        if (this.container) {
            this.container.setVisible(false);
        }
    }

    /** Toggle */
    toggle() {
        if (this.active) this.hide();
        else this.show();
        return this.active;
    }

    destroy() {
        if (this.container) {
            this.container.destroy();
            this.container = null;
        }
        this.active = false;
    }
}
