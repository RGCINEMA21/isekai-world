/**
 * WarehouseSave - Penyimpanan gudang ke LocalStorage.
 * Key: isekai_world_warehouse
 */
const WarehouseSave = {
    STORAGE_KEY: 'isekai_world_warehouse',

    /** Simpan data gudang */
    save(warehouseManager) {
        try {
            const data = {
                level: WarehouseData.level,
                slots: warehouseManager.toJSON()
            };
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('[WarehouseSave] Save error:', e);
            return false;
        }
    },

    /** Load data gudang */
    load() {
        try {
            const raw = localStorage.getItem(this.STORAGE_KEY);
            if (!raw) return null;
            return JSON.parse(raw);
        } catch (e) {
            console.error('[WarehouseSave] Load error:', e);
            return null;
        }
    },

    /** Buat warehouse manager baru dari save */
    loadOrCreate() {
        const saved = this.load();
        const level = saved?.level || WarehouseData.level;
        const maxSlots = WarehouseData.slotsByLevel[level] || WarehouseData.slotsByLevel[1];
        const manager = new WarehouseManager(maxSlots);

        if (saved && saved.slots) {
            manager.fromJSON(saved.slots);
        }

        return manager;
    },

    /** Hapus data gudang */
    clear() {
        localStorage.removeItem(this.STORAGE_KEY);
    }
};
