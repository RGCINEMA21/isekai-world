/**
 * Item - Instance of an item in inventory.
 * Holds runtime data (quantity, etc.) linked to ItemDatabase definition.
 */
class Item {
    /**
     * @param {string} itemId - ID dari ItemDatabase
     * @param {number} quantity - Jumlah item
     */
    constructor(itemId, quantity = 1) {
        this.itemId = itemId;
        this.quantity = quantity;
        this.data = ItemDatabase.get(itemId);
        if (!this.data) {
            console.warn('[Item] Unknown item:', itemId);
            this.data = { id: itemId, name: itemId, category: 'Resource', icon: '?', maxStack: 99, desc: 'Unknown', buyPrice: 0, sellPrice: 0, rarity: 'common' };
        }
    }

    get name()     { return this.data.name; }
    get icon()     { return this.data.icon; }
    get category() { return this.data.category; }
    get maxStack() { return this.data.maxStack; }
    get desc()     { return this.data.desc; }
    get rarity()   { return this.data.rarity; }

    /** Can this item stack more? */
    canStack() { return this.quantity < this.maxStack; }

    /** How many more can be added? */
    spaceLeft() { return this.maxStack - this.quantity; }

    /** Add quantity, returns amount that overflowed */
    add(qty) {
        const canAdd = Math.min(qty, this.spaceLeft());
        this.quantity += canAdd;
        return qty - canAdd; // overflow
    }

    /** Remove quantity, returns actual removed */
    remove(qty) {
        const removed = Math.min(qty, this.quantity);
        this.quantity -= removed;
        return removed;
    }

    /** Serialize for save */
    toJSON() {
        return { itemId: this.itemId, quantity: this.quantity };
    }

    /** Deserialize from save */
    static fromJSON(data) {
        return new Item(data.itemId, data.quantity);
    }
}
