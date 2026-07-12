/**
 * InventorySlot - Represents one slot in the inventory grid.
 * Can hold an Item or be empty.
 * Ready for future: drag & drop, equipment, quick slot.
 */
class InventorySlot {
    constructor(index) {
        this.index = index;
        this.item = null; // Item instance or null
    }

    /** Is this slot empty? */
    isEmpty() { return this.item === null; }

    /** Get the item in this slot */
    getItem() { return this.item; }

    /** Set item in this slot */
    setItem(item) { this.item = item; }

    /** Clear this slot */
    clear() { this.item = null; }

    /** Try to add an item to this slot. Returns overflow. */
    tryAdd(item) {
        if (this.isEmpty()) {
            this.item = item;
            return 0;
        }
        if (this.item.itemId === item.itemId) {
            return this.item.add(item.quantity);
        }
        return item.quantity; // different item, full overflow
    }

    /** Remove quantity from this slot. Returns removed amount. */
    remove(qty) {
        if (this.isEmpty()) return 0;
        const removed = this.item.remove(qty);
        if (this.item.quantity <= 0) this.clear();
        return removed;
    }

    /** Serialize for save */
    toJSON() {
        return this.item ? this.item.toJSON() : null;
    }

    /** Deserialize from save */
    static fromJSON(data, index) {
        const slot = new InventorySlot(index);
        if (data) slot.item = Item.fromJSON(data);
        return slot;
    }
}
