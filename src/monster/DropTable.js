/**
 * DropTable - Sistem drop table untuk monster.
 * Mengelola item yang bisa didrop monster beserta rate dan jumlah.
 * Struktur siap mendukung drop event, drop boss, dan drop langka.
 */
class DropTable {
    /**
     * @param {Array<Object>} entries - Daftar drop entries
     */
    constructor(entries = []) {
        this.entries = entries.map(e => ({
            itemId: e.itemId,
            minQty: e.minQty || 1,
            maxQty: e.maxQty || 1,
            dropRate: e.dropRate || MonsterConfig.dropDefaults.baseDropRate,
            rarity: e.rarity || 'common',
            condition: e.condition || null // e.g. { minLevel: 5 }
        }));
    }

    /** Tambah entry drop */
    addEntry(itemId, minQty, maxQty, dropRate, rarity, condition) {
        this.entries.push({
            itemId,
            minQty: minQty || 1,
            maxQty: maxQty || 1,
            dropRate: dropRate || MonsterConfig.dropDefaults.baseDropRate,
            rarity: rarity || 'common',
            condition: condition || null
        });
    }

    /** Roll drop berdasarkan level pemain */
    rollDrops(playerLevel = 1) {
        const drops = [];

        for (const entry of this.entries) {
            // Cek kondisi
            if (entry.condition && entry.condition.minLevel && playerLevel < entry.condition.minLevel) {
                continue;
            }

            // Roll drop rate
            if (Math.random() <= entry.dropRate) {
                const qty = Phaser.Math.Between(entry.minQty, entry.maxQty);
                drops.push({
                    itemId: entry.itemId,
                    quantity: qty,
                    rarity: entry.rarity
                });
            }
        }

        return drops;
    }

    /** Dapatkan semua entry */
    getEntries() {
        return [...this.entries];
    }

    /** Dapatkan entry berdasarkan itemId */
    getEntryByItem(itemId) {
        return this.entries.find(e => e.itemId === itemId);
    }

    /** Hapus entry */
    removeEntry(itemId) {
        this.entries = this.entries.filter(e => e.itemId !== itemId);
    }

    /** Serialize untuk save */
    toJSON() {
        return this.entries.map(e => ({
            itemId: e.itemId,
            minQty: e.minQty,
            maxQty: e.maxQty,
            dropRate: e.dropRate,
            rarity: e.rarity,
            condition: e.condition
        }));
    }

    /** Deserialize dari save */
    static fromJSON(data) {
        return new DropTable(data || []);
    }
}
