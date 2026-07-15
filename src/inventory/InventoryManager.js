/**
 * InventoryManager - Core inventory logic.
 * Manages slots, add/remove items, stack, capacity.
 * Ready for: sort, filter, search, drag & drop, equipment.
 */
class InventoryManager {
    constructor(maxSlots = 20) {
        this.maxSlots = maxSlots;
        this.cols = 5;
        this.rows = 4;
        this.slots = [];
        for (let i = 0; i < maxSlots; i++) {
            this.slots.push(new InventorySlot(i));
        }
    }

    /** How many slots are used? */
    usedSlots() { return this.slots.filter(s => !s.isEmpty()).length; }

    /** How many slots are free? */
    freeSlots() { return this.maxSlots - this.usedSlots(); }

    /** Is inventory full? */
    isFull() { return this.freeSlots() === 0; }

    /**
     * Add item to inventory. Stacks with existing if same ID.
     * @param {string} itemId
     * @param {number} quantity
     * @returns {number} leftover quantity that didn't fit
     */
    addItem(itemId, quantity) {
        let remaining = quantity;

        // First pass: stack with existing slots
        for (const slot of this.slots) {
            if (remaining <= 0) break;
            if (!slot.isEmpty() && slot.item.itemId === itemId && slot.item.canStack()) {
                const overflow = slot.item.add(remaining);
                remaining = overflow;
            }
        }

        // Second pass: fill empty slots
        for (const slot of this.slots) {
            if (remaining <= 0) break;
            if (slot.isEmpty()) {
                const db = ItemDatabase.get(itemId);
                const maxStack = db ? db.maxStack : 99;
                const qty = Math.min(remaining, maxStack);
                slot.setItem(new Item(itemId, qty));
                remaining -= qty;
            }
        }

        return remaining;
    }

    /**
     * Remove item from inventory.
     * @param {string} itemId
     * @param {number} quantity
     * @returns {number} actual removed
     */
    removeItem(itemId, quantity) {
        let remaining = quantity;
        for (const slot of this.slots) {
            if (remaining <= 0) break;
            if (!slot.isEmpty() && slot.item.itemId === itemId) {
                const removed = slot.remove(remaining);
                remaining -= removed;
            }
        }
        return quantity - remaining;
    }

    /** Get total quantity of an item */
    countItem(itemId) {
        let total = 0;
        for (const slot of this.slots) {
            if (!slot.isEmpty() && slot.item.itemId === itemId) {
                total += slot.item.quantity;
            }
        }
        return total;
    }

    /** Check if inventory has enough of an item */
    hasItem(itemId, quantity = 1) {
        return this.countItem(itemId) >= quantity;
    }

    /** Get slot by index */
    getSlot(index) {
        return this.slots[index] || null;
    }

    /** Swap two slots (for future drag & drop) */
    swapSlots(a, b) {
        const temp = this.slots[a].item;
        this.slots[a].item = this.slots[b].item;
        this.slots[b].item = temp;
    }

    /** Sort items by category then name */
    sort() {
        const items = this.slots.filter(s => !s.isEmpty()).map(s => s.item);
        items.sort((a, b) => {
            if (a.category !== b.category) return a.category.localeCompare(b.category);
            return a.name.localeCompare(b.name);
        });
        this.slots.forEach(s => s.clear());
        items.forEach((item, i) => { this.slots[i].item = item; });
    }

    /** Clear all items */
    clearAll() {
        this.slots.forEach(s => s.clear());
    }

    /** Serialize for save */
    toJSON() {
        return {
            maxSlots: this.maxSlots,
            cols: this.cols,
            rows: this.rows,
            slots: this.slots.map(s => s.toJSON())
        };
    }

    /** Deserialize from save */
    static fromJSON(data, maxSlots = 20) {
        const inv = new InventoryManager(maxSlots);
        if (data) {
            // Support both old format (array) and new format (object with slots)
            const slotData = Array.isArray(data) ? data : (data.slots || []);
            if (data.cols) inv.cols = data.cols;
            if (data.rows) inv.rows = data.rows;
            slotData.forEach((d, i) => {
                if (i < inv.maxSlots) inv.slots[i] = InventorySlot.fromJSON(d, i);
            });
        }
        return inv;
    }
}
