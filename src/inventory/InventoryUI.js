/**
 * InventoryUI - Panel visual inventory (Adventure Mode only).
 * Hanya menampilkan: Food, Potion, Weapon, Armor, Accessory, Tool, Quest.
 * Resource tidak ditampilkan di inventory (ada di Gudang).
 */
class InventoryUI {
    constructor(scene, inventoryManager) {
        this.scene = scene;
        this.inv = inventoryManager;
        this.isOpen = false;
        this.container = null;
        this.slotGraphics = [];
        this.slotTexts = [];
        this.infoPanel = null;
        this.selectedSlot = -1;
    }

    open(saveData) {
        if (this.isOpen) return;
        this.isOpen = true;
        this.saveData = saveData;
        this.build();
    }

    close() {
        if (!this.isOpen) return;
        this.isOpen = false;
        this.destroy();
    }

    toggle(saveData) {
        if (this.isOpen) this.close();
        else this.open(saveData);
    }

    build() {
        this.destroy();
        const w = this.scene.cameras.main.width;
        const h = this.scene.cameras.main.height;
        const isP = h > w;

        this.container = this.scene.add.container(0, 0).setDepth(500).setScrollFactor(0);

        // Soft overlay
        const dim = this.scene.add.graphics();
        dim.fillStyle(0x000000, 0.35);
        dim.fillRect(0, 0, w, h);
        this.container.add(dim);

        // Panel
        const pw = isP ? w * 0.92 : Math.min(520, w * 0.55);
        const ph = isP ? h * 0.72 : Math.min(400, h * 0.78);
        const px = w / 2;
        const py = h / 2;

        const bg = this.scene.add.graphics();
        bg.fillStyle(0x2c1810, 0.92);
        bg.fillRoundedRect(px - pw/2, py - ph/2, pw, ph, 12);
        bg.lineStyle(3, 0xc9a84c, 0.9);
        bg.strokeRoundedRect(px - pw/2, py - ph/2, pw, ph, 12);
        bg.lineStyle(1, 0x8b6914, 0.3);
        bg.fillRoundedRect(px - pw/2 + 6, py - ph/2 + 6, pw - 12, ph - 12, 10);
        bg.strokeRoundedRect(px - pw/2 + 6, py - ph/2 + 6, pw - 12, ph - 12, 10);
        this.container.add(bg);

        // Corner gems
        [[px - pw/2 + 10, py - ph/2 + 10], [px + pw/2 - 10, py - ph/2 + 10],
         [px - pw/2 + 10, py + ph/2 - 10], [px + pw/2 - 10, py + ph/2 - 10]].forEach(([cx, cy]) => {
            const gem = this.scene.add.graphics();
            gem.fillStyle(0x66aaff, 0.7);
            gem.fillCircle(cx, cy, 5);
            this.container.add(gem);
        });

        // Title
        const titleFs = Math.max(14, Math.min(20, w * 0.02)) + 'px';
        const titleBg = this.scene.add.graphics();
        titleBg.fillStyle(0x6b3a0a, 0.7);
        titleBg.fillRoundedRect(px - 90, py - ph/2 + 8, 180, 30, 8);
        this.container.add(titleBg);

        this.container.add(this.scene.add.text(px, py - ph/2 + 23, '🎒 INVENTORY', {
            fontSize: titleFs, fontFamily: 'Georgia, serif', color: '#ffd700', fontStyle: 'bold',
            stroke: '#2c1810', strokeThickness: 2
        }).setOrigin(0.5));

        // Info bar
        const infoY = py - ph/2 + 48;
        const infoFs = Math.max(10, Math.min(13, w * 0.013)) + 'px';
        const used = this.inv.usedSlots();
        const total = this.inv.maxSlots;

        const infoBg = this.scene.add.graphics();
        infoBg.fillStyle(0x1a3a1a, 0.5);
        infoBg.fillRoundedRect(px - pw/2 + 12, infoY - 4, pw - 24, 20, 6);
        this.container.add(infoBg);

        this.container.add(this.scene.add.text(px, infoY + 6,
            `${used}/${total} slot  ·  ⚔️ Senjata  🛡️ Armor  🧪 Potion  🍎 Food  🔧 Tool`, {
            fontSize: infoFs, fontFamily: 'Arial', color: '#c9a84c'
        }).setOrigin(0.5));

        // Separator
        const sep = this.scene.add.graphics();
        sep.lineStyle(1, 0xc9a84c, 0.3);
        sep.lineBetween(px - pw/2 + 16, infoY + 20, px + pw/2 - 16, infoY + 20);
        this.container.add(sep);

        // Grid (5 cols x 4 rows = 20 slots)
        const gridTop = infoY + 28;
        const cols = this.inv.cols;
        const rows = this.inv.rows;
        const slotGap = 6;
        const maxSlotW = (pw - 40) / cols - slotGap;
        const maxSlotH = (ph - 110) / rows - slotGap;
        const slotSize = Math.min(maxSlotW, maxSlotH, isP ? 56 : 64);
        const gridW = cols * (slotSize + slotGap) - slotGap;
        const gridH = rows * (slotSize + slotGap) - slotGap;
        const gridX = px - gridW / 2;
        const gridY = gridTop + 8;

        this.slotGraphics = [];
        this.slotTexts = [];

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const idx = r * cols + c;
                const sx = gridX + c * (slotSize + slotGap);
                const sy = gridY + r * (slotSize + slotGap);

                const slotBg = this.scene.add.graphics();
                slotBg.fillStyle(0x4a3520, 0.85);
                slotBg.fillRoundedRect(sx, sy, slotSize, slotSize, 6);
                slotBg.lineStyle(1, 0x8b6914, 0.6);
                slotBg.strokeRoundedRect(sx, sy, slotSize, slotSize, 6);
                this.container.add(slotBg);
                this.slotGraphics.push({ g: slotBg, x: sx, y: sy, size: slotSize, idx: idx });

                const slot = this.inv.getSlot(idx);
                if (slot && !slot.isEmpty()) {
                    const iconSize = Math.max(14, slotSize * 0.5) + 'px';
                    this.container.add(this.scene.add.text(sx + slotSize/2, sy + slotSize/2 - 4, slot.item.icon, {
                        fontSize: iconSize
                    }).setOrigin(0.5));

                    if (slot.item.quantity > 1) {
                        const qSize = Math.max(8, slotSize * 0.22) + 'px';
                        const qText = this.scene.add.text(sx + slotSize - 4, sy + slotSize - 4, '×' + slot.item.quantity, {
                            fontSize: qSize, fontFamily: 'Arial', color: '#ffffff', fontStyle: 'bold',
                            stroke: '#2c1810', strokeThickness: 2
                        }).setOrigin(1, 1);
                        this.container.add(qText);
                        this.slotTexts.push(qText);
                    }

                    // Category color indicator
                    const catColors = { Food: '#44cc44', Potion: '#66aaff', Weapon: '#ff6644', Armor: '#ffaa44', Accessory: '#cc66ff', Tool: '#aaaaaa', Quest: '#ffdd44' };
                    const catColor = catColors[slot.item.category] || '#888888';
                    const dot = this.scene.add.graphics();
                    dot.fillStyle(Phaser.Display.Color.HexStringToColor(catColor).color, 0.8);
                    dot.fillCircle(sx + 8, sy + 8, 3);
                    this.container.add(dot);
                }

                const hit = this.scene.add.rectangle(sx + slotSize/2, sy + slotSize/2, slotSize, slotSize, 0x000000, 0)
                    .setInteractive({ useHandCursor: true });
                this.container.add(hit);
                hit.on('pointerover', () => this.showItemInfo(idx, sx, sy, slotSize));
                hit.on('pointerout', () => this.hideItemInfo());
                hit.on('pointerdown', () => this.onSlotTap(idx));
            }
        }

        // Close button
        const closeFs = Math.max(13, Math.min(17, w * 0.017)) + 'px';
        const closeBg = this.scene.add.graphics();
        closeBg.fillStyle(0x8b3a0a, 0.9);
        closeBg.fillRoundedRect(px - 50, py + ph/2 - 40, 100, 30, 8);
        closeBg.lineStyle(2, 0xc9a84c, 0.7);
        closeBg.strokeRoundedRect(px - 50, py + ph/2 - 40, 100, 30, 8);
        this.container.add(closeBg);

        this.container.add(this.scene.add.text(px, py + ph/2 - 25, '✕ Tutup', {
            fontSize: closeFs, fontFamily: 'Arial', color: '#ffd700', fontStyle: 'bold',
            stroke: '#2c1810', strokeThickness: 1
        }).setOrigin(0.5));

        const closeHit = this.scene.add.rectangle(px, py + ph/2 - 25, 100, 30, 0x000000, 0)
            .setInteractive({ useHandCursor: true });
        this.container.add(closeHit);
        closeHit.on('pointerdown', () => this.close());

        // Fade in
        this.container.setAlpha(0);
        this.scene.tweens.add({ targets: this.container, alpha: 1, duration: 200 });
    }

    showItemInfo(idx, sx, sy, slotSize) {
        this.hideItemInfo();
        const slot = this.inv.getSlot(idx);
        if (!slot || slot.isEmpty()) return;

        const item = slot.item;
        const w = this.scene.cameras.main.width;
        const pw = Math.min(240, w * 0.3);
        const ph = 72;

        let ix = sx + slotSize + 8;
        let iy = sy;
        if (ix + pw > w - 10) ix = sx - pw - 8;
        if (iy + ph > this.scene.cameras.main.height - 10) iy = this.scene.cameras.main.height - ph - 10;

        this.infoPanel = this.scene.add.container(ix, iy).setDepth(510).setScrollFactor(0);
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x2c1810, 0.95);
        bg.fillRoundedRect(0, 0, pw, ph, 8);
        bg.lineStyle(1, 0xc9a84c, 0.7);
        bg.strokeRoundedRect(0, 0, pw, ph, 8);
        this.infoPanel.add(bg);

        const fs = Math.max(10, Math.min(13, w * 0.013)) + 'px';
        this.infoPanel.add(this.scene.add.text(10, 8, item.icon + ' ' + item.name, {
            fontSize: fs, fontFamily: 'Arial', color: '#ffd700', fontStyle: 'bold'
        }));
        this.infoPanel.add(this.scene.add.text(10, 28, item.category + '  |  ×' + slot.item.quantity, {
            fontSize: Math.max(9, Math.min(11, w * 0.011)) + 'px', fontFamily: 'Arial', color: '#aa8844'
        }));
        this.infoPanel.add(this.scene.add.text(10, 44, item.desc, {
            fontSize: Math.max(9, Math.min(11, w * 0.011)) + 'px', fontFamily: 'Arial', color: '#d4c4a0',
            wordWrap: { width: pw - 20 }
        }));

        this.infoPanel.setAlpha(0);
        this.scene.tweens.add({ targets: this.infoPanel, alpha: 1, duration: 100 });
    }

    hideItemInfo() {
        if (this.infoPanel) { this.infoPanel.destroy(); this.infoPanel = null; }
    }

    onSlotTap(idx) {
        const slot = this.inv.getSlot(idx);
        if (!slot || slot.isEmpty()) return;
        const sg = this.slotGraphics[idx];
        if (sg) {
            const flash = this.scene.add.graphics();
            flash.fillStyle(0xc9a84c, 0.3);
            flash.fillRoundedRect(sg.x, sg.y, sg.size, sg.size, 6);
            this.container.add(flash);
            this.scene.tweens.add({ targets: flash, alpha: 0, duration: 300, onComplete: () => flash.destroy() });
        }
    }

    refresh(saveData) {
        if (this.isOpen) { this.saveData = saveData; this.build(); }
    }

    destroy() {
        this.hideItemInfo();
        if (this.container) { this.container.destroy(); this.container = null; }
        this.slotGraphics = [];
        this.slotTexts = [];
    }
}
