/**
 * StorageManager - Router pusat untuk semua item.
 * Menentukan apakah item masuk ke Inventory atau Gudang.
 *
 * ATURAN:
 * - Resource, Seed, Material, Treasure → Gudang
 * - Food, Potion, Weapon, Armor, Accessory, Tool, Quest → Inventory
 * - Auto Storage: hasil aktivitas langsung ke Gudang
 */
class StorageManager {
    constructor(inventoryManager, warehouseManager) {
        this.inventory = inventoryManager;
        this.warehouse = warehouseManager;
    }

    /** Kategori yang masuk ke Inventory (Adventure Mode) */
    static INVENTORY_CATEGORIES = ['Food', 'Potion', 'Weapon', 'Armor', 'Accessory', 'Tool', 'Quest'];

    /** Kategori yang masuk ke Gudang (selalu) */
    static WAREHOUSE_CATEGORIES = ['Resource', 'Seed', 'Material', 'Treasure'];

    /** Cek apakah kategori termasuk kategori Inventory */
    isInventoryCategory(category) {
        return StorageManager.INVENTORY_CATEGORIES.includes(category);
    }

    /** Cek apakah kategori termasuk kategori Gudang */
    isWarehouseCategory(category) {
        return StorageManager.WAREHOUSE_CATEGORIES.includes(category);
    }

    /**
     * Tambah item - otomatis route ke tempat yang benar.
     * @returns {{inventory: number, warehouse: number}} Sisa yang tidak muat
     */
    addItem(itemId, quantity) {
        const db = ItemDatabase.get(itemId);
        if (!db) {
            console.warn('[StorageManager] Item tidak ditemukan:', itemId);
            return { inventory: quantity, warehouse: quantity };
        }

        const category = db.category;

        // Resource, Seed, Material, Treasure → langsung ke Gudang
        if (this.isWarehouseCategory(category)) {
            const leftover = this.warehouse.addItem(db, quantity);
            return { inventory: 0, warehouse: leftover };
        }

        // Food, Potion, Weapon, Armor, Accessory, Tool, Quest → Inventory
        if (this.isInventoryCategory(category)) {
            const leftover = this.inventory.addItem(itemId, quantity);
            // Jika inventory penuh, fallback ke Gudang
            if (leftover > 0) {
                const whLeftover = this.warehouse.addItem(db, leftover);
                return { inventory: leftover, warehouse: whLeftover };
            }
            return { inventory: 0, warehouse: 0 };
        }

        // Kategori tidak dikenal → Gudang (fallback)
        const leftover = this.warehouse.addItem(db, quantity);
        return { inventory: 0, warehouse: leftover };
    }

    /**
     * Tambah batch item (untuk hasil pertarungan/aktivitas).
     * @param {Array<{itemId: string, quantity: number}>} items
     */
    addBatch(items) {
        const results = [];
        for (const item of items) {
            const result = this.addItem(item.itemId, item.quantity);
            const db = ItemDatabase.get(item.itemId);
            const dest = db && this.isWarehouseCategory(db.category) ? 'warehouse' : 'inventory';
            results.push({ itemId: item.itemId, destination: dest, leftover: result.inventory + result.warehouse });
        }
        return results;
    }

    /** Hapus item dari Inventory */
    removeFromInventory(itemId, quantity) {
        return this.inventory.removeItem(itemId, quantity);
    }

    /** Hapus item dari Gudang */
    removeFromWarehouse(itemId, quantity) {
        return this.warehouse.removeItem(itemId, quantity);
    }

    /** Hitung jumlah item di kedua tempat */
    countItem(itemId) {
        const invCount = this.inventory.countItem(itemId);
        const whCount = this.warehouse.countItem(itemId);
        return { inventory: invCount, warehouse: whCount, total: invCount + whCount };
    }

    /** Pindahkan item dari Gudang ke Inventory */
    transferToInventory(itemId, quantity) {
        const db = ItemDatabase.get(itemId);
        if (!db) return quantity;
        const available = this.warehouse.countItem(itemId);
        const toTransfer = Math.min(quantity, available);
        if (toTransfer <= 0) return 0;
        this.warehouse.removeItem(itemId, toTransfer);
        const leftover = this.inventory.addItem(itemId, toTransfer);
        if (leftover > 0) this.warehouse.addItem(db, leftover);
        return leftover;
    }

    /** Pindahkan item dari Inventory ke Gudang */
    transferToWarehouse(itemId, quantity) {
        const db = ItemDatabase.get(itemId);
        if (!db) return quantity;
        const available = this.inventory.countItem(itemId);
        const toTransfer = Math.min(quantity, available);
        if (toTransfer <= 0) return 0;
        this.inventory.removeItem(itemId, toTransfer);
        return this.warehouse.addItem(db, toTransfer);
    }

    /** Ambil item dari Gudang untuk keperluan sistem (crafting, quest, dll) */
    consumeFromWarehouse(itemId, quantity) {
        const available = this.warehouse.countItem(itemId);
        if (available < quantity) return false;
        this.warehouse.removeItem(itemId, quantity);
        return true;
    }

    /** Ambil item dari Inventory untuk keperluan sistem */
    consumeFromInventory(itemId, quantity) {
        const available = this.inventory.countItem(itemId);
        if (available < quantity) return false;
        this.inventory.removeItem(itemId, quantity);
        return true;
    }
}
