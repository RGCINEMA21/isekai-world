/**
 * WarehouseSlot - Representasi satu slot di gudang.
 * Menyimpan item dan jumlahnya.
 * Mendukung max stack 999.
 */
class WarehouseSlot {
    constructor(index) {
        this.index = index;
        this.item = null;
        this.quantity = 0;
    }

    /** Cek apakah slot kosong */
    isEmpty() {
        return this.item === null || this.quantity <= 0;
    }

    /** Set item ke slot */
    setItem(item, quantity) {
        this.item = item;
        this.quantity = quantity;
    }

    /** Tambah jumlah item */
    addQuantity(amount) {
        if (this.isEmpty()) return 0;
        const maxStack = WarehouseData.maxStack;
        const canAdd = maxStack - this.quantity;
        const toAdd = Math.min(amount, canAdd);
        this.quantity += toAdd;
        return amount - toAdd; // sisa yang tidak muat
    }

    /** Kurangi jumlah item */
    removeQuantity(amount) {
        if (this.isEmpty()) return 0;
        const removed = Math.min(amount, this.quantity);
        this.quantity -= removed;
        if (this.quantity <= 0) {
            this.clear();
        }
        return removed;
    }

    /** Kosongkan slot */
    clear() {
        this.item = null;
        this.quantity = 0;
    }

    /** Konversi ke objek untuk save */
    toJSON() {
        if (this.isEmpty()) return null;
        return {
            itemId: this.item.id,
            quantity: this.quantity
        };
    }

    /** Load dari objek save */
    fromJSON(data, itemDatabase) {
        if (!data) { this.clear(); return; }
        const itemDef = itemDatabase[data.itemId];
        if (!itemDef) { this.clear(); return; }
        this.item = itemDef;
        this.quantity = data.quantity || 0;
    }
}
