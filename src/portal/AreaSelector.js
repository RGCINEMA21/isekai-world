/**
 * AreaSelector - Komponen pemilihan area di Portal UI.
 * Menampilkan grid area dengan status lock/unlock.
 * Responsive: Mobile Portrait & Desktop Landscape.
 */
class AreaSelector {
    constructor(scene, portalManager, config) {
        this.scene = scene;
        this.portalManager = portalManager;
        this.container = null;
        this.selectedAreaId = null;
        this.onAreaSelected = config.onAreaSelected || (() => {});
        this.onEnterArea = config.onEnterArea || (() => {});
        this.playerLevel = config.playerLevel || 1;
        this.isPortrait = config.isPortrait || false;
        this.slotSize = 0;
        this.detailPanel = null;
    }

    /** Buat area selector */
    create(parentContainer, x, y, width, height) {
        this.container = this.scene.add.container(x, y);
        parentContainer.add(this.container);

        this.width = width;
        this.height = height;

        this.renderAreaGrid();
    }

    /** Render grid area */
    renderAreaGrid() {
        this.container.removeAll(true);

        const areas = this.portalManager.areas;
        const padding = 8;
        const cols = this.isPortrait ? 2 : 3;
        const rows = Math.ceil(areas.length / cols);
        const gap = 10;

        this.slotSize = Math.min(
            (this.width - padding * 2 - gap * (cols - 1)) / cols,
            (this.height - padding * 2 - gap * (rows - 1)) / rows,
            this.isPortrait ? 90 : 100
        );

        const totalGridW = cols * this.slotSize + (cols - 1) * gap;
        const startX = (this.width - totalGridW) / 2;
        const startY = padding;

        areas.forEach((area, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const sx = startX + col * (this.slotSize + gap);
            const sy = startY + row * (this.slotSize + gap);

            this.createAreaSlot(area, sx, sy, this.slotSize);
        });
    }

    /** Buat satu slot area */
    createAreaSlot(area, x, y, size) {
        const isUnlocked = area.status === 'unlocked';
        const isSelected = this.selectedAreaId === area.id;

        // Background slot
        const bg = this.scene.add.graphics();
        if (isUnlocked) {
            bg.fillStyle(isSelected ? 0xc9a84c : 0x3a2a15, isSelected ? 0.9 : 0.8);
        } else {
            bg.fillStyle(0x2a2a2a, 0.6);
        }
        bg.fillRoundedRect(x, y, size, size, 8);
        bg.lineStyle(2, isUnlocked ? (isSelected ? 0xffd700 : 0x8b6914) : 0x555555, isUnlocked ? 0.8 : 0.4);
        bg.strokeRoundedRect(x, y, size, size, 8);
        this.container.add(bg);

        // Icon
        const iconSize = Math.max(18, Math.min(28, size * 0.3));
        this.container.add(this.scene.add.text(x + size / 2, y + size * 0.28, area.icon, {
            fontSize: iconSize + 'px'
        }).setOrigin(0.5).setAlpha(isUnlocked ? 1 : 0.4));

        // Nama area (potong jika panjang)
        const shortName = area.name.replace(/^[^\s]+\s/, ''); // Hapus emoji
        const displayName = shortName.length > 12 ? shortName.substring(0, 11) + '…' : shortName;
        this.container.add(this.scene.add.text(x + size / 2, y + size * 0.58, displayName, {
            fontSize: Math.max(8, Math.min(10, size * 0.11)) + 'px',
            fontFamily: 'Arial',
            color: isUnlocked ? '#ffd700' : '#666666',
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5));

        // Level requirement
        this.container.add(this.scene.add.text(x + size / 2, y + size * 0.75, isUnlocked ? 'Terbuka' : `Lv.${area.levelRequired}`, {
            fontSize: Math.max(7, Math.min(9, size * 0.1)) + 'px',
            fontFamily: 'Arial',
            color: isUnlocked ? '#44cc44' : '#cc4444',
            fontStyle: 'bold'
        }).setOrigin(0.5));

        // Lock icon jika terkunci
        if (!isUnlocked) {
            this.container.add(this.scene.add.text(x + size / 2, y + size * 0.42, '🔒', {
                fontSize: Math.max(12, Math.min(16, size * 0.18)) + 'px'
            }).setOrigin(0.5));
        }

        // Hit area
        const hit = this.scene.add.rectangle(x + size / 2, y + size / 2, size, size, 0x000000, 0)
            .setInteractive({ useHandCursor: isUnlocked });

        hit.on('pointerdown', () => {
            if (isUnlocked) {
                this.selectedAreaId = area.id;
                this.onAreaSelected(area);
                this.renderAreaGrid(); // Re-render untuk update selected state
            }
        });

        hit.on('pointerover', () => {
            if (isUnlocked) {
                bg.clear();
                bg.fillStyle(isSelected ? 0xc9a84c : 0x4a3a20, 0.9);
                bg.fillRoundedRect(x, y, size, size, 8);
                bg.lineStyle(2, 0xffd700, 0.9);
                bg.strokeRoundedRect(x, y, size, size, 8);
            }
        });

        hit.on('pointerout', () => {
            bg.clear();
            if (isUnlocked) {
                bg.fillStyle(isSelected ? 0xc9a84c : 0x3a2a15, isSelected ? 0.9 : 0.8);
            } else {
                bg.fillStyle(0x2a2a2a, 0.6);
            }
            bg.fillRoundedRect(x, y, size, size, 8);
            bg.lineStyle(2, isUnlocked ? (isSelected ? 0xffd700 : 0x8b6914) : 0x555555, isUnlocked ? 0.8 : 0.4);
            bg.strokeRoundedRect(x, y, size, size, 8);
        });

        this.container.add(hit);
    }

    /** Tampilkan detail area */
    showDetail(area) {
        this.clearDetail();
        this.onAreaSelected(area);
    }

    /** Hapus detail panel */
    clearDetail() {
        if (this.detailPanel) {
            this.detailPanel.destroy();
            this.detailPanel = null;
        }
    }

    /** Bersihkan semua */
    destroy() {
        this.clearDetail();
        if (this.container) {
            this.container.destroy();
            this.container = null;
        }
    }
}
