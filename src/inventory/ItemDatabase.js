/**
 * ItemDatabase - Registry semua item di ISEKAI WORLD.
 * Item dibagi sesuai sistem Inventory/Gudang.
 *
 * INVENTORY (dibawa saat eksplorasi):
 * - Food, Potion, Weapon, Armor, Accessory, Tool, Quest
 *
 * GUDANG (resource otomatis masuk):
 * - Resource, Seed, Material, Treasure
 */
const ItemDatabase = {
    categories: ['Resource', 'Food', 'Seed', 'Weapon', 'Armor', 'Accessory', 'Tool', 'Material', 'Potion', 'Quest', 'Treasure'],

    items: {
        // === RESOURCE (→ Gudang) ===
        kayu:       { id: 'kayu',       name: 'Kayu',          category: 'Resource',  icon: '🪵', maxStack: 999, desc: 'Kayu dari pohon.',         buyPrice: 0,   sellPrice: 5,   rarity: 'common' },
        batu:       { id: 'batu',       name: 'Batu',          category: 'Resource',  icon: '🪨', maxStack: 999, desc: 'Batu keras.',              buyPrice: 0,   sellPrice: 3,   rarity: 'common' },
        rumput:     { id: 'rumput',     name: 'Rumput',        category: 'Resource',  icon: '🌿', maxStack: 999, desc: 'Rumput liar.',             buyPrice: 0,   sellPrice: 1,   rarity: 'common' },
        kapas:      { id: 'kapas',      name: 'Kapas',         category: 'Resource',  icon: '☁️', maxStack: 999, desc: 'Serat kapas untuk kain.',  buyPrice: 0,   sellPrice: 4,   rarity: 'common' },
        mythril:    { id: 'mythril',    name: 'Mythril',       category: 'Resource',  icon: '🔮', maxStack: 999, desc: 'Mythril langka.',          buyPrice: 0,   sellPrice: 50,  rarity: 'rare' },
        crystal:    { id: 'crystal',    name: 'Crystal',       category: 'Resource',  icon: '💎', maxStack: 999, desc: 'Crystal berkilau.',       buyPrice: 0,   sellPrice: 30,  rarity: 'uncommon' },

        // === BIBIT (→ Gudang) ===
        bibit_wortel: { id: 'bibit_wortel', name: 'Bibit Wortel', category: 'Seed', icon: '🌱', maxStack: 99, desc: 'Bibit wortel.',      buyPrice: 10,  sellPrice: 5,   rarity: 'common' },
        bibit_padi:   { id: 'bibit_padi',   name: 'Bibit Padi',   category: 'Seed', icon: '🌾', maxStack: 99, desc: 'Bibit padi.',        buyPrice: 8,   sellPrice: 4,   rarity: 'common' },
        bibit_apel:   { id: 'bibit_apel',   name: 'Bibit Apel',   category: 'Seed', icon: '🌳', maxStack: 99, desc: 'Bibit pohon apel.',  buyPrice: 25,  sellPrice: 12,  rarity: 'uncommon' },

        // === MATERIAL (→ Gudang) ===
        iron:       { id: 'iron',       name: 'Besi',          category: 'Material',  icon: '⚙️', maxStack: 999, desc: 'Besi mentah.',             buyPrice: 0,   sellPrice: 10,  rarity: 'common' },
        gold_ore:   { id: 'gold_ore',   name: 'Emas Mentah',    category: 'Material', icon: '🪙', maxStack: 999, desc: 'Emas mentah.',             buyPrice: 0,   sellPrice: 40,  rarity: 'uncommon' },
        kain:       { id: 'kain',       name: 'Kain',          category: 'Material',  icon: '🧵', maxStack: 999, desc: 'Kain tenunan.',            buyPrice: 0,   sellPrice: 8,   rarity: 'common' },
        paku:       { id: 'paku',       name: 'Paku',          category: 'Material',  icon: '📌', maxStack: 999, desc: 'Paku besi.',               buyPrice: 0,   sellPrice: 6,   rarity: 'common' },

        // === FOOD (→ Inventory) ===
        wortel:     { id: 'wortel',     name: 'Wortel',        category: 'Food',      icon: '🥕', maxStack: 99,  desc: 'Wortel segar. +10 HP.',    buyPrice: 10,  sellPrice: 5,   rarity: 'common' },
        apel:       { id: 'apel',       name: 'Apel',          category: 'Food',      icon: '🍎', maxStack: 99,  desc: 'Apel manis. +15 HP.',      buyPrice: 15,  sellPrice: 8,   rarity: 'common' },
        roti:       { id: 'roti',       name: 'Roti',          category: 'Food',      icon: '🍞', maxStack: 99,  desc: 'Roti hangat. +20 HP.',     buyPrice: 20,  sellPrice: 10,  rarity: 'common' },
        ikan:       { id: 'ikan',       name: 'Ikan',          category: 'Food',      icon: '🐟', maxStack: 99,  desc: 'Ikan segar. +25 HP.',      buyPrice: 25,  sellPrice: 12,  rarity: 'common' },
        daging:     { id: 'daging',     name: 'Daging',        category: 'Food',      icon: '🍖', maxStack: 99,  desc: 'Daging panggang. +30 HP.', buyPrice: 30,  sellPrice: 15,  rarity: 'common' },

        // === POTION (→ Inventory) ===
        potion_h:     { id: 'potion_h',     name: 'Potion HP',      category: 'Potion', icon: '🧪', maxStack: 99, desc: 'Memulihkan 50 HP.',       buyPrice: 30,  sellPrice: 15,  rarity: 'common' },
        potion_m:     { id: 'potion_m',     name: 'Potion Mana',    category: 'Potion', icon: '🔵', maxStack: 99, desc: 'Memulihkan 50 Energy.',   buyPrice: 35,  sellPrice: 18,  rarity: 'common' },
        potion_besar: { id: 'potion_besar', name: 'Potion Besar',   category: 'Potion', icon: '🧴', maxStack: 20, desc: 'Memulihkan 100 HP.',      buyPrice: 60,  sellPrice: 30,  rarity: 'uncommon' },

        // === WEAPON (→ Inventory) ===
        pedang_kayu:  { id: 'pedang_kayu',  name: 'Pedang Kayu',    category: 'Weapon', icon: '🗡️', maxStack: 1,  desc: 'Pedang kayu sederhana.',    buyPrice: 50,  sellPrice: 25,  rarity: 'common' },
        pedang_besi:  { id: 'pedang_besi',  name: 'Pedang Besi',    category: 'Weapon', icon: '⚔️', maxStack: 1,  desc: 'Pedang besi kokoh.',        buyPrice: 200, sellPrice: 100, rarity: 'uncommon' },
        tongkat_sihir:{ id: 'tongkat_sihir',name: 'Tongkat Sihir',  category: 'Weapon', icon: '🪄', maxStack: 1,  desc: 'Tongkat sihir pemula.',     buyPrice: 150, sellPrice: 75,  rarity: 'uncommon' },

        // === ARMOR (→ Inventory) ===
        baju_kulit:   { id: 'baju_kulit',   name: 'Baju Kulit',     category: 'Armor',  icon: '🛡️', maxStack: 1,  desc: 'Pelindung tubuh dasar.',    buyPrice: 80,  sellPrice: 40,  rarity: 'common' },
        baju_besi:    { id: 'baju_besi',    name: 'Baju Besi',      category: 'Armor',  icon: '🦺', maxStack: 1,  desc: 'Armor besi kuat.',          buyPrice: 300, sellPrice: 150, rarity: 'uncommon' },
        jubah:        { id: 'jubah',        name: 'Jubah Sihir',    category: 'Armor',  icon: '🧙', maxStack: 1,  desc: 'Jubah sihir pelindung.',    buyPrice: 250, sellPrice: 125, rarity: 'uncommon' },

        // === ACCESSORY (→ Inventory) ===
        cincin:       { id: 'cincin',       name: 'Cincin Berlian', category: 'Accessory', icon: '💍', maxStack: 1, desc: 'Cincin batu permata.',      buyPrice: 500, sellPrice: 250, rarity: 'rare' },
        kalung:       { id: 'kalung',       name: 'Kalung Emas',    category: 'Accessory', icon: '📿', maxStack: 1, desc: 'Kalung emas berkilau.',     buyPrice: 400, sellPrice: 200, rarity: 'rare' },

        // === TOOL (→ Inventory) ===
        kapak:        { id: 'kapak',        name: 'Kapak',          category: 'Tool',   icon: '🪓', maxStack: 1,  desc: 'Kapak untuk menebang.',     buyPrice: 60,  sellPrice: 30,  rarity: 'common' },
        pickaxe:      { id: 'pickaxe',      name: 'Pickaxe',        category: 'Tool',   icon: '⛏️', maxStack: 1,  desc: 'Belincang untuk menambang.',buyPrice: 60,  sellPrice: 30,  rarity: 'common' },
        pancing:      { id: 'pancing',      name: 'Pancing',        category: 'Tool',   icon: '🎣', maxStack: 1,  desc: 'Pancing untuk memancing.',  buyPrice: 80,  sellPrice: 40,  rarity: 'common' },
        sabit:        { id: 'sabit',        name: 'Sabit',          category: 'Tool',   icon: '🔪', maxStack: 1,  desc: 'Sabit untuk memanen.',      buyPrice: 50,  sellPrice: 25,  rarity: 'common' },
        sekop:        { id: 'sekop',        name: 'Sekop',          category: 'Tool',   icon: '🪣', maxStack: 1,  desc: 'Sekop untuk berkebun.',     buyPrice: 40,  sellPrice: 20,  rarity: 'common' },

        // === QUEST ITEM (→ Inventory) ===
        surat:        { id: 'surat',        name: 'Surat Misterius', category: 'Quest',  icon: '📜', maxStack: 1,  desc: 'Surat dari seseorang.',      buyPrice: 0,   sellPrice: 0,   rarity: 'quest' },
        kunci:        { id: 'kunci',        name: 'Kunci Kuno',     category: 'Quest',  icon: '🔑', maxStack: 1,  desc: 'Kunci berkarat.',           buyPrice: 0,   sellPrice: 0,   rarity: 'quest' },
        batu_ajaib:   { id: 'batu_ajaib',   name: 'Batu Ajaib',     category: 'Quest',  icon: '🔶', maxStack: 5,  desc: 'Batu bercahaya misterius.',  buyPrice: 0,   sellPrice: 0,   rarity: 'quest' },

        // === TREASURE (→ Gudang) ===
        koin_emas:    { id: 'koin_emas',    name: 'Koin Emas',      category: 'Treasure', icon: '🪙', maxStack: 99, desc: 'Koin emas kuno.',           buyPrice: 0,   sellPrice: 100, rarity: 'rare' },
        berlian:      { id: 'berlian',      name: 'Berlian',        category: 'Treasure', icon: '💠', maxStack: 99, desc: 'Berlian berharga.',         buyPrice: 0,   sellPrice: 200, rarity: 'epic' },
    },

    get(itemId) { return this.items[itemId] || null; },

    getAll() { return Object.values(this.items); },

    getByCategory(cat) { return Object.values(this.items).filter(i => i.category === cat); },

    /** Dapatkan item yang masuk ke Inventory */
    getInventoryItems() {
        return Object.values(this.items).filter(i =>
            ['Food', 'Potion', 'Weapon', 'Armor', 'Accessory', 'Tool', 'Quest'].includes(i.category)
        );
    },

    /** Dapatkan item yang masuk ke Gudang */
    getWarehouseItems() {
        return Object.values(this.items).filter(i =>
            ['Resource', 'Seed', 'Material', 'Treasure'].includes(i.category)
        );
    }
};
