/**
 * AdventureUI - HUD and UI elements for Adventure Mode.
 * Displays player stats, inventory button, and exit button.
 * Responsive: Mobile Portrait & Desktop Landscape.
 */
class AdventureUI {
    /**
     * Create a new AdventureUI.
     * @param {Phaser.Scene} scene - The scene this UI belongs to
     * @param {AdventureManager} manager - The adventure manager
     */
    constructor(scene, manager) {
        this.scene = scene;
        this.manager = manager;
        this.container = null;
        this.confirmPopup = null;
        this.isPortrait = false;
    }
    
    /**
     * Initialize the UI.
     */
    init() {
        const w = this.scene.cameras.main.width;
        const h = this.scene.cameras.main.height;
        this.isPortrait = h > w;
        
        this.createHUD();
    }
    
    /**
     * Create the main HUD.
     */
    createHUD() {
        const w = this.scene.cameras.main.width;
        const h = this.scene.cameras.main.height;
        
        // Destroy existing container
        if (this.container) this.container.destroy();
        
        this.container = this.scene.add.container(0, 0).setDepth(100).setScrollFactor(0);
        
        const playerData = this.scene.saveData?.player || {};
        const stats = this.scene.saveData?.stats || {};
        const currency = this.scene.saveData?.currency || {};
        
        // Background panel
        const bg = this.scene.add.graphics();
        if (this.isPortrait) {
            bg.fillStyle(0x2c1810, 0.88);
            bg.fillRoundedRect(4, 4, w - 8, 100, 8);
            bg.lineStyle(2, 0xc9a84c, 0.6);
            bg.strokeRoundedRect(4, 4, w - 8, 100, 8);
        } else {
            bg.fillStyle(0x2c1810, 0.85);
            bg.fillRoundedRect(6, 6, 220, 130, 8);
            bg.lineStyle(2, 0xc9a84c, 0.5);
            bg.strokeRoundedRect(6, 6, 220, 130, 8);
        }
        this.container.add(bg);
        
        // Stats text
        const fs = Math.max(10, Math.min(13, w * 0.012)) + 'px';
        const lh = 16;
        let y = 14;
        const x = 16;
        
        const addStat = (label, value, color) => {
            this.container.add(this.scene.add.text(x, y, label, {
                fontSize: fs, fontFamily: 'Arial', color: '#aa8844'
            }));
            this.container.add(this.scene.add.text(x + 100, y, String(value), {
                fontSize: fs, fontFamily: 'Arial', color: color || '#f0e0c0', fontStyle: 'bold'
            }));
            y += lh;
        };
        
        addStat('Nama:', playerData.name || '???', '#ffdd88');
        addStat('Level:', stats.level || 1, '#44ccff');
        addStat('HP:', `${stats.hp || 100}/${stats.maxHp || 100}`, '#44cc44');
        addStat('Energy:', `${stats.energy || 100}/${stats.maxEnergy || 100}`, '#ffcc44');
        addStat('Gold:', String(currency.gold || 0).replace(/\B(?=(\d{3})+(?!\d))/g, ','), '#ffaa44');
        addStat('Diamond:', String(currency.diamond || 0), '#44ddff');
        
        // Inventory button
        this.createInventoryButton(w, h);
        
        // Exit button
        this.createExitButton(w, h);
    }
    
    /**
     * Create the inventory button.
     * @param {number} w - Screen width
     * @param {number} h - Screen height
     */
    createInventoryButton(w, h) {
        const ibX = w - 36;
        const ibY = this.isPortrait ? h - 50 : 36;
        
        const ibBg = this.scene.add.graphics();
        ibBg.fillStyle(0x6b3a0a, 0.7);
        ibBg.fillCircle(ibX, ibY, 22);
        ibBg.lineStyle(2, 0xc9a84c, 0.7);
        ibBg.strokeCircle(ibX, ibY, 22);
        this.container.add(ibBg);
        
        const ibIcon = this.scene.add.text(ibX, ibY, '🎒', { fontSize: '18px' }).setOrigin(0.5);
        this.container.add(ibIcon);
        
        const ibHit = this.scene.add.rectangle(ibX, ibY, 48, 48, 0x000000, 0)
            .setInteractive({ useHandCursor: true }).setDepth(101).setScrollFactor(0);
        ibHit.on('pointerdown', () => this.scene.toggleInventory());
        this.container.add(ibHit);
    }
    
    /**
     * Create the exit button.
     * @param {number} w - Screen width
     * @param {number} h - Screen height
     */
    createExitButton(w, h) {
        const ebX = w - 36;
        const ebY = this.isPortrait ? h - 100 : 80;
        
        const ebBg = this.scene.add.graphics();
        ebBg.fillStyle(0x8b2222, 0.7);
        ebBg.fillCircle(ebX, ebY, 22);
        ebBg.lineStyle(2, 0xcc6644, 0.7);
        ebBg.strokeCircle(ebX, ebY, 22);
        this.container.add(ebBg);
        
        const ebIcon = this.scene.add.text(ebX, ebY, '🚪', { fontSize: '18px' }).setOrigin(0.5);
        this.container.add(ebIcon);
        
        const ebHit = this.scene.add.rectangle(ebX, ebY, 48, 48, 0x000000, 0)
            .setInteractive({ useHandCursor: true }).setDepth(101).setScrollFactor(0);
        ebHit.on('pointerdown', () => this.showExitConfirm());
        this.container.add(ebHit);
    }
    
    /**
     * Show exit confirmation popup.
     */
    showExitConfirm() {
        if (this.confirmPopup) return;
        
        const w = this.scene.cameras.main.width;
        const h = this.scene.cameras.main.height;
        
        // Dim overlay
        const dim = this.scene.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.5).setDepth(200);
        
        // Popup container
        this.confirmPopup = this.scene.add.container(w / 2, h / 2).setDepth(201);
        
        // Popup background
        const popupBg = this.scene.add.graphics();
        popupBg.fillStyle(0x2c1810, 0.95);
        popupBg.fillRoundedRect(-150, -80, 300, 160, 12);
        popupBg.lineStyle(3, 0xc9a84c, 0.9);
        popupBg.strokeRoundedRect(-150, -80, 300, 160, 12);
        this.confirmPopup.add(popupBg);
        
        // Title
        const titleFs = Math.max(14, Math.min(18, w * 0.018)) + 'px';
        this.confirmPopup.add(this.scene.add.text(0, -55, '🚪 Kembali ke Desa?', {
            fontSize: titleFs, fontFamily: 'Georgia, serif', color: '#ffd700', fontStyle: 'bold'
        }).setOrigin(0.5));
        
        // Message
        const msgFs = Math.max(11, Math.min(14, w * 0.014)) + 'px';
        this.confirmPopup.add(this.scene.add.text(0, -25, 'Yakin ingin kembali ke Main Village?', {
            fontSize: msgFs, fontFamily: 'Arial', color: '#d4c4a0'
        }).setOrigin(0.5));
        
        // Yes button
        const yesBg = this.scene.add.graphics();
        yesBg.fillStyle(0x228844, 1);
        yesBg.fillRoundedRect(-120, 10, 100, 35, 8);
        this.confirmPopup.add(yesBg);
        
        const yesText = this.scene.add.text(-70, 27, '✓ Ya', {
            fontSize: '14px', fontFamily: 'Arial', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.confirmPopup.add(yesText);
        
        const yesHit = this.scene.add.rectangle(-70, 27, 100, 35, 0x000000, 0)
            .setInteractive({ useHandCursor: true });
        yesHit.on('pointerdown', () => {
            this.scene.exitAdventure();
        });
        this.confirmPopup.add(yesHit);
        
        // No button
        const noBg = this.scene.add.graphics();
        noBg.fillStyle(0x882222, 1);
        noBg.fillRoundedRect(20, 10, 100, 35, 8);
        this.confirmPopup.add(noBg);
        
        const noText = this.scene.add.text(70, 27, '✕ Tidak', {
            fontSize: '14px', fontFamily: 'Arial', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.confirmPopup.add(noText);
        
        const noHit = this.scene.add.rectangle(70, 27, 100, 35, 0x000000, 0)
            .setInteractive({ useHandCursor: true });
        noHit.on('pointerdown', () => {
            this.hideExitConfirm();
        });
        this.confirmPopup.add(noHit);
        
        // Fade in
        this.confirmPopup.setAlpha(0);
        this.scene.tweens.add({ targets: this.confirmPopup, alpha: 1, duration: 200 });
    }
    
    /**
     * Hide exit confirmation popup.
     */
    hideExitConfirm() {
        if (this.confirmPopup) {
            this.scene.tweens.add({
                targets: this.confirmPopup,
                alpha: 0,
                duration: 150,
                onComplete: () => {
                    this.confirmPopup.destroy();
                    this.confirmPopup = null;
                }
            });
        }
    }
    
    /**
     * Destroy the UI.
     */
    destroy() {
        if (this.container) {
            this.container.destroy();
            this.container = null;
        }
        this.hideExitConfirm();
    }
}
