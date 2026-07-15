/**
 * InventorySave - Handles saving/loading inventory to LocalStorage.
 */
const InventorySave = {
    SAVE_KEY: 'isekai_world_inventory',

    /** Save inventory to LocalStorage */
    save(inventory) {
        try {
            const data = inventory.toJSON();
            localStorage.setItem(this.SAVE_KEY, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('[InventorySave] Save failed:', e);
            return false;
        }
    },

    /** Load inventory from LocalStorage */
    load(maxSlots = 20) {
        try {
            const raw = localStorage.getItem(this.SAVE_KEY);
            if (!raw) return new InventoryManager(maxSlots);
            const data = JSON.parse(raw);
            // Handle both old format (array of slots) and new format (object with slots array)
            if (Array.isArray(data)) {
                return InventoryManager.fromJSON({ slots: data, cols: 5, rows: 4 }, maxSlots);
            }
            return InventoryManager.fromJSON(data, maxSlots);
        } catch (e) {
            console.error('[InventorySave] Load failed:', e);
            return new InventoryManager(maxSlots);
        }
    },

    /** Clear saved inventory */
    clear() {
        try { localStorage.removeItem(this.SAVE_KEY); } catch (e) {}
    }
};
