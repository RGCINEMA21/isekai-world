/**
 * BattleUI - UI pertarungan: HP bar player, HP bar monster, info battle.
 * Menggunakan container Phaser dengan scrollFactor 0 agar mengikuti layar.
 */
class BattleUI {
    /**
     * @param {Phaser.Scene} scene
     */
    constructor(scene) {
        this.scene = scene;
        this.container = null;
        this.playerHpBar = null;
        this.playerHpFill = null;
        this.monsterContainer = null;
        this.monsterNameText = null;
        this.monsterLevelText = null;
        this.monsterHpBar = null;
        this.monsterHpFill = null;
        this.comboText = null;
    }

    /** Buat UI container utama */
    create() {
        this.container = this.scene.add.container(0, 0).setDepth(100).setScrollFactor(0);
        this._createPlayerHpBar();
    }

    /** Buat HP bar player di pojok kiri atas */
    _createPlayerHpBar() {
        const w = this.scene.cameras.main.width;
        const isPortrait = this.scene.cameras.main.height > w;
        const barW = isPortrait ? w * 0.5 : 200;
        const barH = 14;
        const barX = 12;
        const barY = isPortrait ? 110 : 145;

        // Label
        this.container.add(this.scene.add.text(barX, barY - 14, '❤️ HP', {
            fontSize: '10px', fontFamily: 'Arial', color: '#ff6666'
        }));

        // Background bar
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x333333, 0.8);
        bg.fillRoundedRect(barX, barY, barW, barH, 4);
        this.container.add(bg);

        // Fill bar
        this.playerHpBar = this.scene.add.graphics();
        this.container.add(this.playerHpBar);

        // HP text
        this.playerHpText = this.scene.add.text(barX + barW / 2, barY + barH / 2, '', {
            fontSize: '9px', fontFamily: 'monospace', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.container.add(this.playerHpText);

        this._playerBarConfig = { x: barX, y: barY, w: barW, h: barH };
    }

    /** Update HP bar player */
    updatePlayerHp(current, max) {
        if (!this.playerHpBar) return;
        const c = this._playerBarConfig;
        const pct = max > 0 ? current / max : 0;
        this.playerHpBar.clear();
        // Warna hijau > 50%, kuning > 25%, merah <= 25%
        let color = 0x44cc44;
        if (pct <= 0.25) color = 0xcc4444;
        else if (pct <= 0.5) color = 0xcccc44;
        this.playerHpBar.fillStyle(color, 1);
        this.playerHpBar.fillRoundedRect(c.x, c.y, Math.max(0, c.w * pct), c.h, 4);
        this.playerHpText.setText(Math.ceil(current) + ' / ' + max);
    }

    /** Tampilkan info monster saat mulai bertarung */
    showMonsterInfo(name, level, currentHp, maxHp) {
        if (!this.container) return;
        this.hideMonsterInfo();

        const w = this.scene.cameras.main.width;
        const isPortrait = this.scene.cameras.main.height > w;
        const barW = isPortrait ? w * 0.5 : 200;
        const barH = 14;
        const barX = w - barW - 12;
        const barY = isPortrait ? 110 : 145;

        this.monsterContainer = this.scene.add.container(0, 0).setDepth(100).setScrollFactor(0);

        // Name + Level
        this.monsterNameText = this.scene.add.text(barX + barW / 2, barY - 26, name, {
            fontSize: '11px', fontFamily: 'Arial', color: '#ff8844', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.monsterContainer.add(this.monsterNameText);

        this.monsterLevelText = this.scene.add.text(barX + barW / 2, barY - 14, 'Lv.' + level, {
            fontSize: '9px', fontFamily: 'monospace', color: '#aaaaaa'
        }).setOrigin(0.5);
        this.monsterContainer.add(this.monsterLevelText);

        // HP bar background
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x333333, 0.8);
        bg.fillRoundedRect(barX, barY, barW, barH, 4);
        this.monsterContainer.add(bg);

        // HP bar fill
        this.monsterHpBar = this.scene.add.graphics();
        this.monsterContainer.add(this.monsterHpBar);

        // HP text
        this.monsterHpText = this.scene.add.text(barX + barW / 2, barY + barH / 2, '', {
            fontSize: '9px', fontFamily: 'monospace', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.monsterContainer.add(this.monsterHpText);

        this._monsterBarConfig = { x: barX, y: barY, w: barW, h: barH };
        this.updateMonsterHp(currentHp, maxHp);
    }

    /** Update HP bar monster */
    updateMonsterHp(current, max) {
        if (!this.monsterHpBar) return;
        const c = this._monsterBarConfig;
        const pct = max > 0 ? current / max : 0;
        this.monsterHpBar.clear();
        let color = 0xcc4444;
        if (pct > 0.5) color = 0xcc4444;
        else if (pct > 0.25) color = 0xcc8844;
        this.monsterHpBar.fillStyle(color, 1);
        this.monsterHpBar.fillRoundedRect(c.x, c.y, Math.max(0, c.w * pct), c.h, 4);
        this.monsterHpText.setText(Math.ceil(current) + ' / ' + max);
    }

    /** Sembunyikan info monster */
    hideMonsterInfo() {
        if (this.monsterContainer) {
            this.monsterContainer.destroy();
            this.monsterContainer = null;
            this.monsterNameText = null;
            this.monsterLevelText = null;
            this.monsterHpBar = null;
            this.monsterHpText = null;
        }
    }

    /** Tampilkan teks "Auto Battle" di tengah layar */
    showAutoBattleText() {
        const w = this.scene.cameras.main.width;
        const h = this.scene.cameras.main.height;
        this.autoText = this.scene.add.text(w / 2, h * 0.35, '⚔️ AUTO BATTLE ⚔️', {
            fontSize: '16px', fontFamily: 'Arial', color: '#ffd700',
            fontStyle: 'bold', stroke: '#000000', strokeThickness: 3
        }).setOrigin(0.5).setDepth(110).setScrollFactor(0).setAlpha(0);

        this.scene.tweens.add({
            targets: this.autoText,
            alpha: 1,
            y: h * 0.33,
            duration: 300,
            yoyo: true,
            hold: 600,
            ease: 'Power2'
        });
    }

    destroy() {
        this.hideMonsterInfo();
        if (this.container) {
            this.container.destroy();
            this.container = null;
        }
        if (this.autoText) {
            this.autoText.destroy();
            this.autoText = null;
        }
    }
}
