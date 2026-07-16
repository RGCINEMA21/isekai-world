/**
 * AreaSelector — grid of area cards in the portal.
 * All sizing via ResponsiveLayout.
 */
class AreaSelector {
    constructor(scene, portalManager, config) {
        this.scene = scene;
        this.rl = config.rl || new ResponsiveLayout(scene);
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
        const rl = this.rl;
        const gap = rl.pad();
        const padding = 6;
        const cols = this.isPortrait ? 1 : 2;
        const rows = Math.ceil(areas.length / cols);
        const slotW = (this.width - padding * 2 - gap * Math.max(0, cols - 1)) / cols;
        const idealSlotH = (this.height - padding * 2 - gap * Math.max(0, rows - 1)) / rows;
        const slotH = Math.max(50, Math.min(rl.cardHeight(), idealSlotH));
        const totalH = rows * slotH + Math.max(0, rows - 1) * gap;
        const startY = (this.height - totalH) / 2;

        areas.forEach((area, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            this.createAreaSlot(area, padding + col * (slotW + gap), startY + row * (slotH + gap), slotW, slotH);
        });
    }

    createAreaSlot(area, x, y, w, h) {
        const isUnlocked = area.status === 'unlocked';
        const isSelected = this.selectedAreaId === area.id;
        const rl = this.rl;
        const bg = this.scene.add.graphics();
        if (isUnlocked) bg.fillStyle(isSelected ? 0xc9a84c : 0x3a2a15, isSelected ? 0.95 : 0.85);
        else bg.fillStyle(0x2a2a2a, 0.6);
        bg.fillRoundedRect(x, y, w, h, 10);
        bg.lineStyle(2, isUnlocked ? (isSelected ? 0xffd700 : 0x8b6914) : 0x555555, isUnlocked ? 0.8 : 0.4);
        bg.strokeRoundedRect(x, y, w, h, 10);
        this.container.add(bg);

        const iconS = rl.iconSize();
        this.container.add(this.scene.add.text(x + iconS + 6, y + h / 2, area.icon, {
            fontSize: iconS + 'px'
        }).setOrigin(0.5).setAlpha(isUnlocked ? 1 : 0.4));

        const nameX = x + iconS * 2 + 10;
        this.container.add(this.scene.add.text(nameX, y + h * 0.25, area.name, {
            fontSize: rl.fontSize(14) + 'px', fontFamily: 'Arial', color: isUnlocked ? '#ffd700' : '#666', fontStyle: 'bold'
        }));
        this.container.add(this.scene.add.text(nameX, y + h * 0.6, isUnlocked ? '✅ Terbuka' : '🔒 Level ' + area.levelRequired, {
            fontSize: rl.labelSize(11) + 'px', fontFamily: 'Arial', color: isUnlocked ? '#44cc44' : '#cc4444', fontStyle: 'bold'
        }));
        if (!isUnlocked) {
            this.container.add(this.scene.add.text(x + w - 22, y + h / 2, '🔒', { fontSize: '20px' }).setOrigin(0.5));
        }

        const hit = this.scene.add.rectangle(x + w / 2, y + h / 2, w, h, 0, 0)
            .setInteractive({ useHandCursor: isUnlocked });
        hit.on('pointerdown', () => {
            if (isUnlocked) { this.selectedAreaId = area.id; this.onAreaSelected(area); this.renderAreaGrid(); }
        });
        hit.on('pointerover', () => {
            if (isUnlocked) { bg.clear(); bg.fillStyle(0x4a3a20, 0.95); bg.fillRoundedRect(x, y, w, h, 10); bg.lineStyle(2, 0xffd700, 0.9); bg.strokeRoundedRect(x, y, w, h, 10); }
        });
        hit.on('pointerout', () => {
            bg.clear();
            if (isUnlocked) bg.fillStyle(isSelected ? 0xc9a84c : 0x3a2a15, isSelected ? 0.95 : 0.85);
            else bg.fillStyle(0x2a2a2a, 0.6);
            bg.fillRoundedRect(x, y, w, h, 10);
            bg.lineStyle(2, isUnlocked ? (isSelected ? 0xffd700 : 0x8b6914) : 0x555555, isUnlocked ? 0.8 : 0.4);
            bg.strokeRoundedRect(x, y, w, h, 10);
        });
        this.container.add(hit);
    }

    destroy() { if (this.container) { this.container.destroy(); this.container = null; } }
}
