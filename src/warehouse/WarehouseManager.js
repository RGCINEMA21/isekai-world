/**
 * WarehouseManager - Pengelolaan item di gudang.
 * Handle slot, kategori, sorting, transfer.
 */
class WarehouseManager {
    constructor(maxSlots) {
        this.maxSlots = maxSlots || WarehouseData.slotsByLevel[1];
        this.cols = WarehouseData.cols;
        this.rows = WarehouseData.rows;
        this.slots = [];
        this.initSlots();
    }

    /** Inisialisasi slot kosong */
    initSlots() {
        this.slots = [];
        for (let i = 0; i < this.maxSlots; i++) {
            this.slots.push(new WarehouseSlot(i));
        }
    }

    /** Dapatkan slot berdasarkan index */
    getSlot(index) {
        if (index < 0 || index >= this.slots.length) return null;
        return this.slots[index];
    }

    /** Hitung slot terpakai */
    usedSlots() {
        return this.slots.filter(s => !s.isEmpty()).length;
    }

    /** Tambah item ke gudang (auto stack) */
    addItem(item, quantity) {
        let remaining = quantity;

        // Coba stack ke slot yang sudah ada dengan item sama
        for (const slot of this.slots) {
            if (remaining <= 0) break;
            if (!slot.isEmpty() && slot.item.id === item.id) {
                const overflow = slot.addQuantity(remaining);
                remaining = overflow;
            }
        }

        // Sisa masuk slot kosong baru
        for (const slot of this.slots) {
            if (remaining <= 0) break;
            if (slot.isEmpty()) {
                const maxStack = WarehouseData.maxStack;
                const toAdd = Math.min(remaining, maxStack);
                slot.setItem(item, toAdd);
                remaining -= toAdd;
            }
        }

        return remaining; // 0 = berhasil semua
    }

    /** Hapus item dari gudang */
    removeItem(itemId, quantity) {
        let remaining = quantity;

        for (const slot of this.slots) {
            if (remaining <= 0) break;
            if (!slot.isEmpty() && slot.item.id === itemId) {
                const removed = slot.removeQuantity(remaining);
                remaining -= removed;
            }
        }

        return remaining; // 0 = berhasil semua
    }

    /** Hitung jumlah item tertentu */
    countItem(itemId) {
        let total = 0;
        for (const slot of this.slots) {
            if (!slot.isEmpty() && slot.item.id === itemId) {
                total += slot.quantity;
            }
        }
        return total;
    }

    /** Dapatkan item berdasarkan kategori */
    getItemsByCategory(categoryId) {
        if (categoryId === 'all') return this.slots.filter(s => !s.isEmpty());
        return this.slots.filter(s => !s.isEmpty() && s.item.category.toLowerCase() === categoryId);
    }

    /** Sort items */
    sortItems(items, sortBy) {
        const sorted = [...items];
        switch (sortBy) {
            case 'name':
                sorted.sort((a, b) => (a.item.name || '').localeCompare(b.item.name || ''));
                break;
            case 'quantity':
                sorted.sort((a, b) => b.quantity - a.quantity);
                break;
            case 'category':
                sorted.sort((a, b) => (a.item.category || '').localeCompare(b.item.category || ''));
                break;
            case 'rarity':
                const rarityOrder = { legendary: 0, epic: 1, rare: 2, uncommon: 3, common: 4 };
                sorted.sort((a, b) => (rarityOrder[a.item.rarity] ?? 5) - (rarityOrder[b.item.rarity] ?? 5));
                break;
        }
        return sorted;
    }

    /** Konversi ke JSON untuk save */
    toJSON() {
        return this.slots.map(s => s.toJSON());
    }

    /** Load dari JSON save */
    fromJSON(data) {
        if (!Array.isArray(data)) return;
        // Load item database
        let itemDb = null;
        if (typeof ItemDatabase !== 'undefined') {
            itemDb = ItemDatabase.items || ItemDatabase;
        }
        for (let i = 0; i < this.slots.length && i < data.length; i++) {
            if (data[i] && itemDb) {
                this.slots[i].fromJSON(data[i], itemDb);
            } else {
                this.slots[i].clear();
            }
        }
    }
}
