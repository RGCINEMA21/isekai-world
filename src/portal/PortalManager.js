/**
 * PortalManager - Mengelola logika Portal Monster.
 * Menangani seleksi area, status unlock, dan transisi ke Adventure.
 */
class PortalManager {
    constructor(scene) {
        this.scene = scene;
        this.selectedArea = null;
        this.areas = AreaDatabase.getAllAreas();
    }

    /** Refresh status unlock berdasarkan level pemain */
    refreshUnlocks(playerLevel) {
        AreaDatabase.checkUnlocks(playerLevel);
        this.areas = AreaDatabase.getAllAreas();
    }

    /** Pilih area */
    selectArea(areaId) {
        const area = AreaDatabase.getArea(areaId);
        if (area) {
            this.selectedArea = area;
        }
        return this.selectedArea;
    }

    /** Dapatkan area yang dipilih */
    getSelectedArea() {
        return this.selectedArea;
    }

    /** Cek apakah area bisa dimasuki */
    canEnter(areaId, playerLevel) {
        return AreaDatabase.isAreaUnlocked(areaId, playerLevel);
    }

    /** Dapatkan data untuk masuk ke Adventure */
    getAdventureData(areaId) {
        const area = AreaDatabase.getArea(areaId);
        if (!area) return null;

        return {
            areaId: area.id,
            areaName: area.name,
            startX: 30,
            startY: 30,
            mapWidth: 60,
            mapHeight: 60
        };
    }

    /** Dapatkan deskripsi area */
    getAreaInfo(areaId) {
        const area = AreaDatabase.getArea(areaId);
        if (!area) return null;

        return {
            name: area.name,
            description: area.description,
            levelRequired: area.levelRequired,
            recommendedLevel: area.recommendedLevel,
            status: area.status,
            monsterCount: area.monsterCount,
            monsterTypes: area.monsterTypes,
            dropTypes: area.dropTypes,
            difficulty: area.difficulty,
            icon: area.icon
        };
    }
}
