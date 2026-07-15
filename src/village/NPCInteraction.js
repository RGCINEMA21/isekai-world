/**
 * NPCInteraction - Handles what happens when an NPC is clicked/tapped.
 * Routes to the appropriate scene/action based on building ID.
 */
class NPCInteraction {
    constructor(scene) {
        this.scene = scene;
    }

    handleInteraction(buildingId, npcData) {
        const saveData = this._loadSave();

        switch (buildingId) {
            case 'rumah':
                this._transitionTo('HomeScene', saveData);
                break;
            case 'gudang':
                this._transitionTo('WarehouseScene', saveData);
                break;
            case 'portal':
                this._transitionTo('MonsterAreaScene', saveData, {
                    areaId: 'beginner_grassland',
                    areaName: 'Beginner Grassland',
                    mapWidth: 80, mapHeight: 80,
                    spawnX: 40, spawnY: 70
                });
                break;
            case 'blacksmith':
                this._showNotification('⚒ Blacksmith akan dibuka pada update berikutnya.');
                break;
            case 'laboratorium':
                this._showNotification('🧪 Laboratorium akan dibuka pada update berikutnya.');
                break;
            case 'pertanian':
                this._showNotification('🌾 Pertanian akan dibuka pada update berikutnya.');
                break;
            case 'dapur':
                this._showNotification('🍳 Dapur akan dibuka pada update berikutnya.');
                break;
            case 'marketplace':
                this._showNotification('🛒 Marketplace akan dibuka pada update berikutnya.');
                break;
            case 'portal_quest':
                this._showNotification('📜 Portal Quest akan dibuka pada update berikutnya.');
                break;
            default:
                this._showNotification('Fitur belum tersedia.');
        }
    }

    _transitionTo(sceneKey, saveData, data) {
        if (saveData) {
            try { localStorage.setItem('isekai_world_save', JSON.stringify(saveData)); } catch(e) {}
        }
        this.scene.cameras.main.fadeOut(400, 0, 0, 0);
        this.scene.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.scene.start(sceneKey, data || {});
        });
    }

    _showNotification(msg) {
        const w = this.scene.cameras.main.width;
        const h = this.scene.cameras.main.height;
        const isPortrait = h > w;

        const notif = this.scene.add.container(w / 2, h * 0.85).setDepth(500).setScrollFactor(0).setAlpha(0);

        const fs = Math.max(11, Math.min(14, w * 0.014)) + 'px';
        const tw = this.scene.add.text(0, 0, msg, {
            fontSize: fs, fontFamily: 'Arial, sans-serif',
            color: '#ffffff', fontStyle: 'bold',
            stroke: '#000000', strokeThickness: 3,
            backgroundColor: '#2c1810ee',
            padding: { x: 16, y: 10 }
        }).setOrigin(0.5);
        notif.add(tw);

        this.scene.tweens.add({
            targets: notif, alpha: 1, y: h * 0.8, duration: 300,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.scene.tweens.add({
                    targets: notif, alpha: 0, y: h * 0.75, duration: 400, delay: 2000,
                    onComplete: () => notif.destroy()
                });
            }
        });
    }

    _loadSave() {
        try {
            const r = localStorage.getItem('isekai_world_save');
            return r ? JSON.parse(r) : null;
        } catch (e) { return null; }
    }
}
