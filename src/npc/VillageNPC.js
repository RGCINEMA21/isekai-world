/**
 * VillageNPC - NPC pixel art dengan animasi idle.
 * Berdiri di dekat bangunan, diklik untuk interaksi.
 */
class VillageNPC {
    constructor(scene, data, tileSize) {
        this.scene = scene;
        this.id = data.id;
        this.name = data.name;
        this.building = data.building;
        this.shirtColor = data.shirtColor;
        this.hairColor = data.hairColor;
        this.role = data.role;

        // World position (center of tile)
        this.worldX = data.tileX * tileSize + tileSize / 2;
        this.worldY = data.tileY * tileSize + tileSize / 2;

        // Graphics
        this.gfx = scene.add.graphics().setDepth(15);
        this.nameTag = null;

        // Animation state
        this.animTimer = Math.random() * 1000;
        this.blinkTimer = 0;
        this.isBlinking = false;
        this.headTurn = 0; // -1 left, 0 center, 1 right
        this.headTurnTimer = 0;
        this.handWave = 0;
        this.bobOffset = 0;

        // Interactive
        this.hitArea = scene.add.rectangle(this.worldX, this.worldY, tileSize * 2.5, tileSize * 3, 0x000000, 0)
            .setInteractive({ useHandCursor: true }).setDepth(16);

        this.hitArea.on('pointerdown', (pointer, localX, localY, event) => {
            if (event && event.stopPropagation) event.stopPropagation();
            if (this.onTap) this.onTap(this);
        });

        this.hitArea.on('pointerover', () => {
            this.showNameTag();
        });

        this.hitArea.on('pointerout', () => {
            this.hideNameTag();
        });

        this.onTap = null;
        this.draw();
    }

    showNameTag() {
        if (this.nameTag) this.nameTag.destroy();
        this.nameTag = this.scene.add.text(this.worldX, this.worldY - 28, this.name, {
            fontSize: '9px', fontFamily: 'Arial', color: '#ffffff',
            stroke: '#000000', strokeThickness: 2,
            backgroundColor: '#00000088', padding: { x: 4, y: 2 }
        }).setOrigin(0.5).setDepth(20);
    }

    hideNameTag() {
        if (this.nameTag) { this.nameTag.destroy(); this.nameTag = null; }
    }

    draw() {
        const g = this.gfx;
        g.clear();
        const x = this.worldX;
        const y = this.worldY;
        const s = 1.2; // scale

        const skin = 0xffcc99;
        const hair = this.hairColor;
        const shirt = this.shirtColor;
        const pants = 0x444455;
        const boot = 0x3a2a1a;

        // Shadow
        g.fillStyle(0x000000, 0.15);
        g.fillEllipse(x, y + 10 * s, 12 * s, 4 * s);

        // Bob
        const bob = Math.sin(this.animTimer * 0.003) * 0.8;
        const py = y + bob;

        // Boots
        g.fillStyle(boot, 1);
        g.fillRect(x - 3 * s, py + 5 * s, 3 * s, 4 * s);
        g.fillRect(x + 1 * s, py + 5 * s, 3 * s, 4 * s);

        // Pants
        g.fillStyle(pants, 1);
        g.fillRect(x - 3 * s, py - 1 * s, 3 * s, 7 * s);
        g.fillRect(x + 1 * s, py - 1 * s, 3 * s, 7 * s);

        // Shirt
        g.fillStyle(shirt, 1);
        g.fillRect(x - 4 * s, py - 7 * s, 8 * s, 7 * s);

        // Arms with wave
        g.fillStyle(skin, 1);
        const wave = Math.sin(this.handWave) * 2;
        g.fillRect(x - 6 * s, py - 5 * s + wave, 2 * s, 6 * s);
        g.fillRect(x + 4 * s, py - 5 * s - wave, 2 * s, 6 * s);

        // Head
        g.fillStyle(skin, 1);
        g.fillRect(x - 3 * s, py - 15 * s, 6 * s, 9 * s);

        // Hair
        g.fillStyle(hair, 1);
        g.fillRect(x - 3 * s, py - 16 * s, 6 * s, 3 * s);
        g.fillRect(x - 4 * s, py - 15 * s, 1.5 * s, 5 * s);
        g.fillRect(x + 2.5 * s, py - 15 * s, 1.5 * s, 5 * s);

        // Eyes (with blink)
        if (!this.isBlinking) {
            g.fillStyle(0xffffff, 1);
            g.fillRect(x - 2 * s + this.headTurn * s, py - 12 * s, 2 * s, 2 * s);
            g.fillRect(x + 1 * s + this.headTurn * s, py - 12 * s, 2 * s, 2 * s);
            g.fillStyle(0x222222, 1);
            g.fillRect(x - 1.5 * s + this.headTurn * s, py - 11.5 * s, 1 * s, 1 * s);
            g.fillRect(x + 1.5 * s + this.headTurn * s, py - 11.5 * s, 1 * s, 1 * s);
        } else {
            g.fillStyle(0x222222, 1);
            g.fillRect(x - 2 * s, py - 11.5 * s, 2 * s, 0.5 * s);
            g.fillRect(x + 1 * s, py - 11.5 * s, 2 * s, 0.5 * s);
        }

        // Mouth
        g.fillStyle(0xcc8866, 1);
        g.fillRect(x - 1 * s, py - 9 * s, 2 * s, 0.8 * s);
    }

    update(delta) {
        this.animTimer += delta;

        // Blink every 3-6 seconds
        this.blinkTimer += delta;
        if (this.blinkTimer > 4000 + Math.random() * 2000) {
            this.blinkTimer = 0;
            this.isBlinking = true;
            this.scene.time.delayedCall(150, () => { this.isBlinking = false; });
        }

        // Head turn every 5-8 seconds
        this.headTurnTimer += delta;
        if (this.headTurnTimer > 5000 + Math.random() * 3000) {
            this.headTurnTimer = 0;
            this.headTurn = Phaser.Math.Between(-1, 1);
        }

        // Hand wave occasionally
        if (Math.sin(this.animTimer * 0.002) > 0.95) {
            this.handWave += delta * 0.01;
        } else {
            this.handWave *= 0.95;
        }

        this.draw();
    }

    destroy() {
        if (this.gfx) this.gfx.destroy();
        if (this.hitArea) this.hitArea.destroy();
        if (this.nameTag) this.nameTag.destroy();
    }
}
