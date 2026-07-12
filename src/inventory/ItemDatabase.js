/**
 * ItemDatabase - Registry semua item yang ada di game.
 * Belum perlu isi lengkap. Cukup struktur & beberapa contoh.
 */
const ItemDatabase = {
    categories: ['Resource', 'Food', 'Seed', 'Weapon', 'Armor', 'Material', 'Potion', 'Quest', 'Treasure'],

    items: {
        // === CONTOH ITEMS (bisa ditambah nanti) ===
        kayu:     { id: 'kayu',     name: 'Kayu',         category: 'Resource',  icon: '🪵', maxStack: 99, desc: 'Kayu dari pohon.',         buyPrice: 0,   sellPrice: 5,   rarity: 'common' },
        batu:     { id: 'batu',     name: 'Batu',         category: 'Resource',  icon: '🪨', maxStack: 99, desc: 'Batu keras.',              buyPrice: 0,   sellPrice: 3,   rarity: 'common' },
        iron:     { id: 'iron',     name: 'Besi',         category: 'Material',  icon: '⚙️', maxStack: 99, desc: 'Besi mentah.',             buyPrice: 0,   sellPrice: 10,  rarity: 'common' },
        wortel:   { id: 'wortel',   name: 'Wortel',       category: 'Food',      icon: '🥕', maxStack: 99, desc: 'Wortel segar.',            buyPrice: 10,  sellPrice: 5,   rarity: 'common' },
        apel:     { id: 'apel',     name: 'Apel',         category: 'Food',      icon: '🍎', maxStack: 99, desc: 'Apel manis.',              buyPrice: 15,  sellPrice: 8,   rarity: 'common' },
        pedang:   { id: 'pedang',   name: 'Pedang Kayu',  category: 'Weapon',    icon: '🗡️', maxStack: 1,  desc: 'Pedang kayu sederhana.',   buyPrice: 50,  sellPrice: 25,  rarity: 'common' },
        armor:    { id: 'armor',    name: 'Baju Kulit',    category: 'Armor',     icon: '🛡️', maxStack: 1,  desc: 'Pelindung tubuh dasar.',   buyPrice: 80,  sellPrice: 40,  rarity: 'common' },
        potion_h: { id: 'potion_h', name: 'Potion HP',    category: 'Potion',    icon: '🧪', maxStack: 20, desc: 'Memulihkan 50 HP.',        buyPrice: 30,  sellPrice: 15,  rarity: 'common' },
    },

    get(itemId) {
        return this.items[itemId] || null;
    },

    getAll() {
        return Object.values(this.items);
    },

    getByCategory(cat) {
        return Object.values(this.items).filter(i => i.category === cat);
    }
};
