/**
 * AreaSelector - Grid pemilihan area di Portal UI.
 * Responsive: Mobile Portrait & Desktop Landscape.
 * Cards besar untuk touch-friendly.
 * Adapts to screen size.
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
    }

    create(parentContainer, x, y, width, height) {
        this.container = this.scene.add.container(x, y);
        parentContainer.add(this.container);
        this.width = width;
        this.height = height;
        this.renderAreaGrid();
    }

    renderAreaGrid() {
        this.container.removeAll(true);
        const areas = this.portalManager.areas;
        const gap = this.isPortrait ? 8 : 10;
        const padding = 6;

        // Mobile: 1 column with big cards. Desktop: 2 columns
        const cols = this.isPortrait ? 1 : 2;
        const rows = Math.ceil(areas.length / cols);

        const slotW = (this.width - padding * 2 - gap * Math.max(0, cols - 1)) / cols;
        // Calculate ideal card height based on available space
        const idealSlotH = (this.height - padding * 2 - gap * Math.max(0, rows - 1)) / rows;
        // Clamp to reasonable range - bigger for mobile touch targets
        const slotH = Math.max(55, Math.min(this.isPortrait ? 80 : 65, idealSlotH));

        const totalH = rows * slotH + Math.max(0, rows - 1) * gap;
        const startY = (this.height - totalH) / 2;

        areas.forEach((area, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const sx = padding + col * (slotW + gap);
            const sy = startY + row * (slotH + gap);
            this.createAreaSlot(area, sx, sy, slotW, slotH);
        });
    }

    createAreaSlot(area, x, y, w, h) {
        const isUnlocked = area.status === 'unlocked';
        const isSelected = this.selectedAreaId === area.id;
        const smaller = Math.min(this.width, this.height);

        // Background
        const bg = this.scene.add.graphics();
        if (isUnlocked) {
            bg.fillStyle(isSelected ? 0xc9a84c : 0x3a2a15, isSelected ? 0.95 : 0.85);
        } else {
            bg.fillStyle(0x2a2a2a, 0.6);
        }
        bg.fillRoundedRect(x, y, w, h, 10);
        bg.lineStyle(2, isUnlocked ? (isSelected ? 0xffd700 : 0x8b6914) : 0x555555, isUnlocked ? 0.8 : 0.4);
        bg.strokeRoundedRect(x, y, w, h, 10);
        this.container.add(bg);

        // Icon - bigger
        const iconSize = Math.max(22, Math.min(30, smaller * 0.04));
        this.container.add(this.scene.add.text(x + iconSize + 6, y + h / 2, area.icon, {
            fontSize: iconSize + 'px'
        }).setOrigin(0.5).setAlpha(isUnlocked ? 1 : 0.4));

        // Name - bigger
        const nameX = x + iconSize * 2 + 10;
        const nameFs = Math.max(13, Math.min(17, smaller * 0.022));
        this.container.add(this.scene.add.text(nameX, y + h * 0.25, area.name, {
            fontSize: nameFs + 'px',
            fontFamily: 'Arial',
            color: isUnlocked ? '#ffd700' : '#666666',
            fontStyle: 'bold'
        }));

        // Level / status
        const statusFs = Math.max(11, Math.min(13, smaller * 0.017));
        const statusText = isUnlocked ? '✅ Terbuka' : '🔒 Level ' + area.levelRequired;
        this.container.add(this.scene.add.text(nameX, y + h * 0.6, statusText, {
            fontSize: statusFs + 'px',
            fontFamily: 'Arial',
            color: isUnlocked ? '#44cc44' : '#cc4444',
            fontStyle: 'bold'
        }));

        // Lock overlay
        if (!isUnlocked) {
            this.container.add(this.scene.add.text(x + w - 22, y + h / 2, '🔒', {
                fontSize: '20px'
            }).setOrigin(0.5));
        }

        // Hit area
        const hit = this.scene.add.rectangle(x + w / 2, y + h / 2, w, h, 0x000000, 0)
            .setInteractive({ useHandCursor: isUnlocked });

        hit.on('pointerdown', () => {
            if (isUnlocked) {
                this.selectedAreaId = area.id;
                this.onAreaSelected(area);
                this.renderAreaGrid();
            }
        });

        hit.on('pointerover', () => {
            if (isUnlocked) {
                bg.clear();
                bg.fillStyle(isSelected ? 0xc9a84c : 0x4a3a20, 0.95);
                bg.fillRoundedRect(x, y, w, h, 10);
                bg.lineStyle(2, 0xffd700, 0.9);
                bg.strokeRoundedRect(x, y, w, h, 10);
            }
        });

        hit.on('pointerout', () => {
            bg.clear();
            if (isUnlocked) {
                bg.fillStyle(isSelected ? 0xc9a84c : 0x3a2a15, isSelected ? 0.95 : 0.85);
            } else {
                bg.fillStyle(0x2a2a2a, 0.6);
            }
            bg.fillRoundedRect(x, y, w, h, 10);
            bg.lineStyle(2, isUnlocked ? (isSelected ? 0xffd700 : 0x8b6914) : 0x555555, isUnlocked ? 0.8 : 0.4);
            bg.strokeRoundedRect(x, y, w, h, 10);
        });

        this.container.add(hit);
    }

    destroy() {
        if (this.container) { this.container.destroy(); this.container = null; }
    }
}
