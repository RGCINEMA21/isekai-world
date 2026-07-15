/**
 * DropManager - Mengelola perhitungan drop dari monster.
 * Menggunakan DropTable dari MonsterDatabase.
 * Semua drop dihitung berdasarkan probabilitas, bukan angka acak langsung.
 */
class DropManager {
    /**
     * @param {StorageManager} storageManager - Storage manager untuk routing item
     */
    constructor(storageManager) {
        this.storageManager = storageManager;
    }

    /**
     * Hitung dan distribusikan drop dari monster.
     * @param {Object} monsterData - Data monster dari MonsterDatabase
     * @param {number} playerLevel - Level player
     * @returns {Array<{itemId: string, quantity: number, name: string, icon: string, destination: string}>}
     */
    rollAndDistribute(monsterData, playerLevel) {
        if (!monsterData || !monsterData.dropTable) return [];

        // Roll drops menggunakan DropTable
        const drops = monsterData.dropTable.rollDrops(playerLevel);
        if (!drops || drops.length === 0) return [];

        const results = [];

        for (const drop of drops) {
            const itemDef = ItemDatabase.get(drop.itemId);
            if (!itemDef) continue;

            // Distribusikan via StorageManager (auto route ke Gudang/Inventory)
            const leftover = this.storageManager.addItem(drop.itemId, drop.quantity);

            results.push({
                itemId: drop.itemId,
                quantity: drop.quantity - leftover,
                name: itemDef.name,
                icon: itemDef.icon,
                category: itemDef.category,
                destination: this._getDestination(itemDef.category)
            });
        }

        return results;
    }

    /**
     * Tentukan tujuan item berdasarkan kategori.
     * @param {string} category
     * @returns {string}
     */
    _getDestination(category) {
        if (StorageManager.WAREHOUSE_CATEGORIES.includes(category)) return 'Gudang';
        return 'Inventory';
    }
}
