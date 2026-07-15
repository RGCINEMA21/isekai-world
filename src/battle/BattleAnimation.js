/**
 * BattleAnimation - Animasi sederhana untuk pertarungan.
 * Menangani: attack lunge, hurt flash, death fade, damage number popup.
 */
class BattleAnimation {
    /**
     * @param {Phaser.Scene} scene
     */
    constructor(scene) {
        this.scene = scene;
    }

    /**
     * Animasi serangan: maju sedikit lalu mundur
     * @param {Phaser.GameObjects.Graphics} gfx - Graphics objek (player atau monster)
     * @param {number} originX - Posisi X asal
     * @param {number} originY - Posisi Y asal
     * @param {number} targetX - Posisi X target (ke arah mana maju)
     * @param {number} targetY - Posisi Y target
     * @param {number} distance - Jarak maju (pixel)
     * @param {number} duration - Durasi animasi (ms)
     * @returns {Promise}
     */
    attackLunge(gfx, originX, originY, targetX, targetY, distance = 8, duration = 150, manager) {
        return new Promise((resolve) => {
            const dx = targetX - originX;
            const dy = targetY - originY;
            const len = Math.sqrt(dx * dx + dy * dy) || 1;
            const nx = (dx / len) * distance;
            const ny = (dy / len) * distance;

            let elapsed = 0;
            const halfDur = duration / 2;

            const timer = this.scene.time.addEvent({
                delay: 16,
                loop: true,
                callback: () => {
                    elapsed += 16;
                    if (elapsed < halfDur) {
                        const t = elapsed / halfDur;
                        if (manager) {
                            manager.drawOffsetX = nx * t;
                            manager.drawOffsetY = ny * t;
                        }
                    } else if (elapsed < duration) {
                        const t = (elapsed - halfDur) / halfDur;
                        if (manager) {
                            manager.drawOffsetX = nx * (1 - t);
                            manager.drawOffsetY = ny * (1 - t);
                        }
                    } else {
                        if (manager) {
                            manager.drawOffsetX = 0;
                            manager.drawOffsetY = 0;
                        }
                        timer.remove();
                        resolve();
                    }
                }
            });
        });
    }

    /**
     * Animasi menerima damage: kedip merah
     * @param {Phaser.GameObjects.Graphics} gfx
     * @param {number} duration - Durasi kedip (ms)
     * @returns {Promise}
     */
    hurtFlash(gfx, duration = 200) {
        return new Promise((resolve) => {
            let elapsed = 0;
            let visible = true;
            const interval = 50;

            const timer = this.scene.time.addEvent({
                delay: interval,
                loop: true,
                callback: () => {
                    elapsed += interval;
                    visible = !visible;
                    gfx.setAlpha(visible ? 1 : 0.3);
                    if (elapsed >= duration) {
                        gfx.setAlpha(1);
                        timer.remove();
                        resolve();
                    }
                }
            });
        });
    }

    /**
     * Animasi monster kalah: mengecil + fade out
     * @param {Phaser.GameObjects.Graphics} gfx
     * @param {number} duration - Durasi animasi (ms)
     * @returns {Promise}
     */
    deathFade(gfx, duration = 400) {
        return new Promise((resolve) => {
            this.scene.tweens.add({
                targets: gfx,
                scaleX: 0.1,
                scaleY: 0.1,
                alpha: 0,
                duration: duration,
                ease: 'Power2',
                onComplete: () => {
                    gfx.setScale(1);
                    gfx.setAlpha(1);
                    resolve();
                }
            });
        });
    }

    /**
     * Tampilkan damage number floating
     * @param {number} x - Posisi X
     * @param {number} y - Posisi Y
     * @param {number} damage - Jumlah damage
     * @param {string} color - Warna teks
     * @param {number} zoom - Zoom kamera
     */
    showDamageNumber(x, y, damage, color = '#ff4444', zoom = 1) {
        const text = this.scene.add.text(x, y, '-' + damage, {
            fontSize: Math.max(10, 14 * zoom) + 'px',
            fontFamily: 'Arial',
            color: color,
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(200);

        this.scene.tweens.add({
            targets: text,
            y: y - 30 * zoom,
            alpha: 0,
            duration: 800,
            ease: 'Power2',
            onComplete: () => text.destroy()
        });
    }

    /**
     * Animasi player knockout: jatuh ke samping
     * @param {Phaser.GameObjects.Graphics} gfx
     * @returns {Promise}
     */
    knockout(gfx) {
        return new Promise((resolve) => {
            this.scene.tweens.add({
                targets: gfx,
                angle: 90,
                alpha: 0.5,
                duration: 500,
                ease: 'Power2',
                onComplete: () => {
                    gfx.setAngle(0);
                    gfx.setAlpha(1);
                    resolve();
                }
            });
        });
    }
}
