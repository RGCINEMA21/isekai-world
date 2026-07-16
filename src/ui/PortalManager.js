/**
 * PortalManager - Mengelola logika Portal Monster.
 * Menggunakan MonsterAreaDatabase (10 area sesuai roadmap).
 */
class PortalManager {
    constructor(scene) {
        this.scene = scene;
        this.selectedArea = null;
        this.areas = [];
    }

    /** Refresh area list berdasarkan level pemain */
    refreshUnlocks(playerLevel) {
        this.areas = MonsterAreaDatabase.getAllAreas().map(area => ({
            ...area,
            unlocked: playerLevel >= area.levelRequired,
            status: playerLevel >= area.levelRequired ? 'unlocked' : 'locked'
        }));
    }

    /** Pilih area */
    selectArea(areaId) {
        const area = this.areas.find(a => a.id === areaId);
        if (area) this.selectedArea = area;
        return this.selectedArea;
    }

    getSelectedArea() { return this.selectedArea; }

    canEnter(areaId, playerLevel) {
        const area = MonsterAreaDatabase.getArea(areaId);
        return area ? playerLevel >= area.levelRequired : false;
    }

    /** Data untuk masuk ke MonsterAreaScene */
    getAdventureData(areaId) {
        return MonsterAreaDatabase.getAreaConfig(areaId);
    }

    /** Info area untuk UI */
    getAreaInfo(areaId) {
        const area = MonsterAreaDatabase.getArea(areaId);
        if (!area) return null;
        return {
            name: area.name,
            description: area.description,
            levelRequired: area.levelRequired,
            recommendedLevel: area.recommendedLevel,
            monsterCount: area.monsters.length,
            monsterTypes: area.monsters.map(m => m.name),
            difficulty: area.levelRequired <= 5 ? 'Mudah' : area.levelRequired <= 15 ? 'Sedang' : 'Sulit',
            icon: area.icon
        };
    }
}
