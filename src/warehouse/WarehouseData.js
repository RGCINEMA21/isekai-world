/**
 * WarehouseData - Konfigurasi Gudang.
 * Level 1 = 100 slot, Max Stack 999.
 * Struktur siap upgrade hingga Level 15.
 */
const WarehouseData = {
    // Level saat ini
    level: 1,
    maxLevel: 15,

    // Slot per level
    slotsByLevel: {
        1: 100,
        2: 150,
        3: 200,
        4: 250,
        5: 300,
        6: 350,
        7: 400,
        8: 450,
        9: 500,
        10: 600,
        11: 700,
        12: 800,
        13: 850,
        14: 900,
        15: 1000
    },

    // Max stack per item
    maxStack: 999,

    // Grid layout
    cols: 10,
    rows: 10,

    // Kategori item
    categories: [
        { id: 'all',      label: 'Semua',     icon: '📦' },
        { id: 'resource', label: 'Resource',   icon: '🪵' },
        { id: 'seed',     label: 'Bibit',      icon: '🌱' },
        { id: 'food',     label: 'Makanan',    icon: '🍎' },
        { id: 'material', label: 'Material',   icon: '⚙️' },
        { id: 'weapon',   label: 'Senjata',    icon: '⚔️' },
        { id: 'armor',    label: 'Armor',      icon: '🛡️' },
        { id: 'potion',   label: 'Potion',     icon: '🧪' },
        { id: 'quest',    label: 'Quest',      icon: '📜' },
        { id: 'treasure', label: 'Treasure',   icon: '💎' }
    ],

    // Sort options
    sortOptions: [
        { id: 'name',     label: 'Nama' },
        { id: 'quantity', label: 'Jumlah' },
        { id: 'category', label: 'Kategori' },
        { id: 'rarity',   label: 'Rarity' }
    ],

    // NPC info
    npc: {
        name: 'Penjaga Gudang',
        role: 'Penjaga Gudang'
    }
};
