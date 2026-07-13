/**
 * WarehouseUI - Panel visual gudang.
 * Responsive portrait/landscape.
 * Tab kategori, sorting, grid item.
 */
class WarehouseUI {
    constructor(scene, warehouseManager, saveData) {
        this.scene = scene;
        this.wm = warehouseManager;
        this.saveData = saveData || {};
        this.isOpen = false;
        this.container = null;
        this.currentCategory = 'all';
        this.currentSort = 'name';
        this.slotGraphics = [];
        this.currentPage = 0;
        this.slotsPerPage = 50;
    }

    /** Buka panel gudang */
    open(saveData) {
        if (this.isOpen) return;
        this.isOpen = true;
        if (saveData) this.saveData = saveData;
        this.currentPage = 0;
        this.currentCategory = 'all';
        this.build();
    }

    /** Tutup panel gudang */
    close() {
        if (!this.isOpen) return;
        this.isOpen = false;
        this.destroy();
    }

    /** Toggle buka/tutup */
    toggle(saveData) {
        if (this.isOpen) this.close();
        else this.open(saveData);
    }

    /** Bangun seluruh UI */
    build() {
        this.destroy();
        const w = this.scene.cameras.main.width;
        const h = this.scene.cameras.main.height;
        const isP = h > w;

        this.container = this.scene.add.container(0, 0).setDepth(500).setScrollFactor(0);

        // Overlay gelap
        const dim = this.scene.add.graphics();
        dim.fillStyle(0x000000, 0.4);
        dim.fillRect(0, 0, w, h);
        this.container.add(dim);

        // Dim clickable to close
        const dimHit = this.scene.add.rectangle(w/2, h/2, w, h, 0x000000, 0)
            .setInteractive();
        dimHit.on('pointerdown', () => this.close());
        this.container.add(dimHit);

        // Panel utama
        const pw = isP ? w * 0.94 : Math.min(700, w * 0.65);
        const ph = isP ? h * 0.82 : Math.min(520, h * 0.85);
        const px = w / 2;
        const py = h / 2;

        this.drawPanel(px, py, pw, ph, isP, w, h);

        // Fade in
        this.container.setAlpha(0);
        this.scene.tweens.add({ targets: this.container, alpha: 1, duration: 200 });
    }

    /** Gambar panel utama */
    drawPanel(px, py, pw, ph, isP, w, h) {
        const g = this.scene.add.graphics();

        // Shadow
        g.fillStyle(0x000000, 0.3);
        g.fillRoundedRect(px - pw/2 + 4, py - ph/2 + 4, pw, ph, 14);

        // Background panel
        g.fillStyle(0x2c1810, 0.95);
        g.fillRoundedRect(px - pw/2, py - ph/2, pw, ph, 12);

        // Inner lighter area
        g.fillStyle(0x3a2415, 0.5);
        g.fillRoundedRect(px - pw/2 + 6, py - ph/2 + 6, pw - 12, ph - 12, 10);

        // Gold border
        g.lineStyle(3, 0xc9a84c, 0.9);
        g.strokeRoundedRect(px - pw/2, py - ph/2, pw, ph, 12);

        // Inner decorative border
        g.lineStyle(1, 0x8b6914, 0.3);
        g.strokeRoundedRect(px - pw/2 + 8, py - ph/2 + 8, pw - 16, ph - 16, 10);

        this.container.add(g);

        // Corner gems
        const corners = [
            [px - pw/2 + 12, py - ph/2 + 12],
            [px + pw/2 - 12, py - ph/2 + 12],
            [px - pw/2 + 12, py + ph/2 - 12],
            [px + pw/2 - 12, py + ph/2 - 12]
        ];
        corners.forEach(([cx, cy]) => {
            const gem = this.scene.add.graphics();
            gem.fillStyle(0x66aaff, 0.7);
            gem.fillCircle(cx, cy, 5);
            gem.fillStyle(0xaaddff, 0.4);
            gem.fillCircle(cx - 1, cy - 1, 3);
            this.container.add(gem);
        });

        // Title area
        const titleY = py - ph/2 + 12;
        const titleBg = this.scene.add.graphics();
        titleBg.fillStyle(0x6b3a0a, 0.7);
        titleBg.fillRoundedRect(px - 110, titleY, 220, 32, 8);
        this.container.add(titleBg);

        const titleFs = Math.max(14, Math.min(20, w * 0.02)) + 'px';
        this.container.add(this.scene.add.text(px, titleY + 16, '📦 GUDANG', {
            fontSize: titleFs, fontFamily: 'Georgia, serif', color: '#ffd700', fontStyle: 'bold',
            stroke: '#2c1810', strokeThickness: 2
        }).setOrigin(0.5));

        // Info bar
        const infoY = titleY + 40;
        const infoFs = Math.max(10, Math.min(13, w * 0.013)) + 'px';
        const used = this.wm.usedSlots();
        const total = this.wm.maxSlots;
        const p = this.saveData.player || {};
        const c = this.saveData.currency || {};

        const infoBg = this.scene.add.graphics();
        infoBg.fillStyle(0x1a3a1a, 0.5);
        infoBg.fillRoundedRect(px - pw/2 + 12, infoY - 4, pw - 24, 22, 6);
        this.container.add(infoBg);

        this.container.add(this.scene.add.text(px, infoY + 7,
            `Lv.${WarehouseData.level}  ·  Slot: ${used}/${total}  ·  💰 ${String(c.gold||0).replace(/\B(?=(\d{3})+(?!\d))/g,',')}  ·  💎 ${c.diamond||0}`, {
            fontSize: infoFs, fontFamily: 'Arial', color: '#c9a84c', fontStyle: 'bold'
        }).setOrigin(0.5));

        // Tabs
        const tabY = infoY + 28;
        this.drawTabs(px, tabY, pw, isP, w);

        // Sort buttons
        const sortY = tabY + (isP ? 30 : 28);
        this.drawSortButtons(px, sortY, pw, w);

        // Grid
        const gridTop = sortY + (isP ? 32 : 28);
        this.drawGrid(px, gridTop, pw, ph, isP, w, h);

        // Close button
        const closeFs = Math.max(13, Math.min(17, w * 0.017)) + 'px';
        const closeBg = this.scene.add.graphics();
        closeBg.fillStyle(0x8b3a0a, 0.9);
        closeBg.fillRoundedRect(px - 50, py + ph/2 - 44, 100, 32, 8);
        closeBg.lineStyle(2, 0xc9a84c, 0.7);
        closeBg.strokeRoundedRect(px - 50, py + ph/2 - 44, 100, 32, 8);
        this.container.add(closeBg);

        this.container.add(this.scene.add.text(px, py + ph/2 - 28, '✕ Tutup', {
            fontSize: closeFs, fontFamily: 'Arial', color: '#ffd700', fontStyle: 'bold',
            stroke: '#2c1810', strokeThickness: 1
        }).setOrigin(0.5));

        const closeHit = this.scene.add.rectangle(px, py + ph/2 - 28, 100, 32, 0x000000, 0)
            .setInteractive({ useHandCursor: true });
        this.container.add(closeHit);
        closeHit.on('pointerdown', (ptr, localX, localY, event) => {
            event.stopPropagation();
            this.close();
        });
    }

    /** Gambar tab kategori */
    drawTabs(px, tabY, pw, isP, w) {
        const cats = WarehouseData.categories;
        const tabFs = Math.max(9, Math.min(12, w * 0.012)) + 'px';
        const tabW = isP ? Math.min(65, (pw - 24) / cats.length) : Math.min(68, (pw - 24) / cats.length);
        const totalW = cats.length * tabW;
        const startX = px - totalW / 2;

        cats.forEach((cat, i) => {
            const tx = startX + i * tabW + tabW / 2;
            const isActive = this.currentCategory === cat.id;

            const tabBg = this.scene.add.graphics();
            tabBg.fillStyle(isActive ? 0xc9a84c : 0x4a3520, isActive ? 0.9 : 0.7);
            tabBg.fillRoundedRect(tx - tabW/2 + 1, tabY, tabW - 2, isP ? 26 : 24, 4);
            if (isActive) {
                tabBg.lineStyle(1, 0xffd700, 0.8);
                tabBg.strokeRoundedRect(tx - tabW/2 + 1, tabY, tabW - 2, isP ? 26 : 24, 4);
            }
            this.container.add(tabBg);

            const tabText = this.scene.add.text(tx, tabY + (isP ? 13 : 12),
                cat.icon + (isP ? '' : ' ' + cat.label), {
                fontSize: tabFs, fontFamily: 'Arial',
                color: isActive ? '#2c1810' : '#d4c4a0',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            this.container.add(tabText);

            const tabHit = this.scene.add.rectangle(tx, tabY + (isP ? 13 : 12), tabW, isP ? 26 : 24, 0x000000, 0)
                .setInteractive({ useHandCursor: true });
            this.container.add(tabHit);
            tabHit.on('pointerdown', (ptr, localX, localY, event) => {
                event.stopPropagation();
                this.currentCategory = cat.id;
                this.currentPage = 0;
                this.build();
            });
        });
    }

    /** Gambar tombol sort */
    drawSortButtons(px, sortY, pw, w) {
        const sorts = WarehouseData.sortOptions;
        const btnFs = Math.max(9, Math.min(11, w * 0.011)) + 'px';
        const btnW = Math.min(80, (pw - 20) / sorts.length);
        const totalW = sorts.length * btnW;
        const startX = px - totalW / 2;

        // Label
        this.container.add(this.scene.add.text(startX - 10, sortY + 8, 'Urutkan:', {
            fontSize: btnFs, fontFamily: 'Arial', color: '#8b6914'
        }).setOrigin(1, 0.5));

        sorts.forEach((sort, i) => {
            const bx = startX + 10 + i * btnW + btnW / 2;
            const isActive = this.currentSort === sort.id;

            const btnBg = this.scene.add.graphics();
            btnBg.fillStyle(isActive ? 0x6b3a0a : 0x3a2415, 0.8);
            btnBg.fillRoundedRect(bx - btnW/2 + 2, sortY, btnW - 4, 18, 4);
            this.container.add(btnBg);

            this.container.add(this.scene.add.text(bx, sortY + 9, sort.label, {
                fontSize: btnFs, fontFamily: 'Arial',
                color: isActive ? '#ffd700' : '#aa8844'
            }).setOrigin(0.5));

            const btnHit = this.scene.add.rectangle(bx, sortY + 9, btnW, 18, 0x000000, 0)
                .setInteractive({ useHandCursor: true });
            this.container.add(btnHit);
            btnHit.on('pointerdown', (ptr, localX, localY, event) => {
                event.stopPropagation();
                this.currentSort = sort.id;
                this.build();
            });
        });
    }

    /** Gambar grid item */
    drawGrid(px, gridTop, pw, ph, isP, w, h) {
        // Dapatkan item berdasarkan kategori
        let items = this.wm.getItemsByCategory(this.currentCategory);
        items = this.wm.sortItems(items, this.currentSort);

        // Pagination
        const totalItems = items.length;
        const totalPages = Math.max(1, Math.ceil(totalItems / this.slotsPerPage));
        if (this.currentPage >= totalPages) this.currentPage = totalPages - 1;
        const pageItems = items.slice(this.currentPage * this.slotsPerPage, (this.currentPage + 1) * this.slotsPerPage);

        // Grid dimensions
        const cols = isP ? 5 : 10;
        const rows = isP ? 5 : 5;
        const slotGap = 5;
        const maxSlotW = (pw - 30) / cols - slotGap;
        const maxSlotH = (ph - 200) / rows - slotGap;
        const slotSize = Math.min(maxSlotW, maxSlotH, isP ? 54 : 48);
        const gridW = cols * (slotSize + slotGap) - slotGap;
        const gridX = px - gridW / 2;
        const gridY = gridTop + 8;

        this.slotGraphics = [];

        // Grid background
        const gridBg = this.scene.add.graphics();
        gridBg.fillStyle(0x1a0f08, 0.5);
        gridBg.fillRoundedRect(gridX - 6, gridY - 6, gridW + 12, rows * (slotSize + slotGap) + 8, 6);
        this.container.add(gridBg);

        // Draw empty slots for grid
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const idx = r * cols + c;
                const sx = gridX + c * (slotSize + slotGap);
                const sy = gridY + r * (slotSize + slotGap);

                const slotBg = this.scene.add.graphics();
                slotBg.fillStyle(0x4a3520, 0.7);
                slotBg.fillRoundedRect(sx, sy, slotSize, slotSize, 5);
                slotBg.lineStyle(1, 0x6b4b2a, 0.5);
                slotBg.strokeRoundedRect(sx, sy, slotSize, slotSize, 5);
                this.container.add(slotBg);
                this.slotGraphics.push({ g: slotBg, x: sx, y: sy, size: slotSize, idx: idx });
            }
        }

        // Draw items on top of slots
        pageItems.forEach((slot, i) => {
            if (i >= cols * rows) return;
            const r = Math.floor(i / cols);
            const c = i % cols;
            const sx = gridX + c * (slotSize + slotGap);
            const sy = gridY + r * (slotSize + slotGap);

            // Item icon
            const iconFs = Math.max(16, slotSize * 0.5) + 'px';
            this.container.add(this.scene.add.text(sx + slotSize/2, sy + slotSize/2 - 4, slot.item.icon, {
                fontSize: iconFs
            }).setOrigin(0.5));

            // Quantity
            if (slot.quantity > 1) {
                const qFs = Math.max(8, slotSize * 0.22) + 'px';
                this.container.add(this.scene.add.text(sx + slotSize - 3, sy + slotSize - 3, '×' + slot.quantity, {
                    fontSize: qFs, fontFamily: 'Arial', color: '#ffffff', fontStyle: 'bold',
                    stroke: '#2c1810', strokeThickness: 2
                }).setOrigin(1, 1));
            }

            // Interactive hit area
            const hit = this.scene.add.rectangle(sx + slotSize/2, sy + slotSize/2, slotSize, slotSize, 0x000000, 0)
                .setInteractive({ useHandCursor: true });
            this.container.add(hit);

            const itemSlot = slot;
            hit.on('pointerover', () => this.showItemInfo(itemSlot, sx + slotSize, sy, w, h));
            hit.on('pointerout', () => this.hideItemInfo());
            hit.on('pointerdown', (ptr, localX, localY, event) => {
                event.stopPropagation();
                this.onSlotTap(itemSlot);
            });
        });

        // Pagination
        if (totalPages > 1) {
            const pageY = gridY + rows * (slotSize + slotGap) + 8;
            const pageFs = Math.max(10, Math.min(13, w * 0.013)) + 'px';

            // Prev button
            if (this.currentPage > 0) {
                const prevBg = this.scene.add.graphics();
                prevBg.fillStyle(0x6b3a0a, 0.8);
                prevBg.fillRoundedRect(px - 120, pageY, 60, 22, 4);
                this.container.add(prevBg);
                this.container.add(this.scene.add.text(px - 90, pageY + 11, '◀ Prev', {
                    fontSize: pageFs, fontFamily: 'Arial', color: '#ffd700'
                }).setOrigin(0.5));
                const prevHit = this.scene.add.rectangle(px - 90, pageY + 11, 60, 22, 0x000000, 0)
                    .setInteractive({ useHandCursor: true });
                this.container.add(prevHit);
                prevHit.on('pointerdown', (ptr, lx, ly, ev) => {
                    ev.stopPropagation();
                    this.currentPage--;
                    this.build();
                });
            }

            // Page indicator
            this.container.add(this.scene.add.text(px, pageY + 11,
                `${this.currentPage + 1} / ${totalPages}`, {
                fontSize: pageFs, fontFamily: 'Arial', color: '#d4c4a0'
            }).setOrigin(0.5));

            // Next button
            if (this.currentPage < totalPages - 1) {
                const nextBg = this.scene.add.graphics();
                nextBg.fillStyle(0x6b3a0a, 0.8);
                nextBg.fillRoundedRect(px + 60, pageY, 60, 22, 4);
                this.container.add(nextBg);
                this.container.add(this.scene.add.text(px + 90, pageY + 11, 'Next ▶', {
                    fontSize: pageFs, fontFamily: 'Arial', color: '#ffd700'
                }).setOrigin(0.5));
                const nextHit = this.scene.add.rectangle(px + 90, pageY + 11, 60, 22, 0x000000, 0)
                    .setInteractive({ useHandCursor: true });
                this.container.add(nextHit);
                nextHit.on('pointerdown', (ptr, lx, ly, ev) => {
                    ev.stopPropagation();
                    this.currentPage++;
                    this.build();
                });
            }
        }
    }

    /** Tooltip info item */
    showItemInfo(slot, x, y, w, h) {
        this.hideItemInfo();
        if (!slot || slot.isEmpty()) return;

        const item = slot.item;
        const tipW = Math.min(200, w * 0.28);
        const tipH = 80;

        let tx = x + 8;
        let ty = y;
        if (tx + tipW > w - 10) tx = x - tipW - 8;
        if (ty + tipH > h - 10) ty = h - tipH - 10;

        this.infoPanel = this.scene.add.container(tx, ty).setDepth(520).setScrollFactor(0);
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x2c1810, 0.95);
        bg.fillRoundedRect(0, 0, tipW, tipH, 8);
        bg.lineStyle(1, 0xc9a84c, 0.7);
        bg.strokeRoundedRect(0, 0, tipW, tipH, 8);
        this.infoPanel.add(bg);

        const fs = Math.max(10, Math.min(13, w * 0.013)) + 'px';
        this.infoPanel.add(this.scene.add.text(10, 8, item.icon + ' ' + item.name, {
            fontSize: fs, fontFamily: 'Arial', color: '#ffd700', fontStyle: 'bold'
        }));
        this.infoPanel.add(this.scene.add.text(10, 28, item.category + '  |  ×' + slot.quantity, {
            fontSize: Math.max(9, Math.min(11, w * 0.011)) + 'px', fontFamily: 'Arial', color: '#aa8844'
        }));
        if (item.rarity) {
            this.infoPanel.add(this.scene.add.text(10, 44, 'Rarity: ' + item.rarity, {
                fontSize: Math.max(9, Math.min(11, w * 0.011)) + 'px', fontFamily: 'Arial', color: '#88aacc'
            }));
        }
        this.infoPanel.add(this.scene.add.text(10, 58, item.desc || '', {
            fontSize: Math.max(9, Math.min(11, w * 0.011)) + 'px', fontFamily: 'Arial', color: '#d4c4a0',
            wordWrap: { width: tipW - 20 }
        }));

        this.infoPanel.setAlpha(0);
        this.scene.tweens.add({ targets: this.infoPanel, alpha: 1, duration: 100 });
    }

    hideItemInfo() {
        if (this.infoPanel) { this.infoPanel.destroy(); this.infoPanel = null; }
    }

    /** Aksi saat slot diklik */
    onSlotTap(slot) {
        if (!slot || slot.isEmpty()) return;
        // Flash highlight
        const sg = this.slotGraphics.find(s => s.idx === this.slotGraphics.indexOf(s));
        // Placeholder untuk future: pindah item ke inventory
    }

    /** Tutup dan bersihkan */
    destroy() {
        this.hideItemInfo();
        if (this.container) { this.container.destroy(); this.container = null; }
        this.slotGraphics = [];
    }
}
