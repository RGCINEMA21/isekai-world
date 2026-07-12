/**
 * InteractionData - Central registry of all interactable objects in the game.
 * Each entry defines: id, name, type, position, radius, status, action text.
 * Add new interactables here as the game grows.
 */
const InteractionData = {

    /** Get all interactable objects for a given map */
    getObjects(mapKey) {
        if (mapKey === 'main_village') return this.mainVillage;
        return [];
    },

    /** Main Village interactables - positions in tile coords (multiply by TILE for pixels) */
    mainVillage: [
        {
            id: 'rumah',
            name: '🏠 Rumah',
            type: 'building',
            tileX: 32, tileY: 35,
            radius: 56,
            status: 'available',
            action: 'Masuk',
            description: 'Rumahmu di desa.'
        },
        {
            id: 'gudang',
            name: '📦 Gudang',
            type: 'building',
            tileX: 50, tileY: 35,
            radius: 56,
            status: 'available',
            action: 'Buka',
            description: 'Gudang penyimpanan barang.'
        },
        {
            id: 'dapur',
            name: '🍳 Dapur',
            type: 'building',
            tileX: 32, tileY: 45,
            radius: 56,
            status: 'available',
            action: 'Masuk',
            description: 'Masak berbagai makanan.'
        },
        {
            id: 'pertanian',
            name: '🌾 Area Pertanian',
            type: 'farm',
            tileX: 50, tileY: 45,
            radius: 56,
            status: 'available',
            action: 'Tanam',
            description: 'Area untuk menanam tanaman.'
        },
        {
            id: 'portal',
            name: '⚔ Portal Monster',
            type: 'portal',
            tileX: 25, tileY: 22,
            radius: 56,
            status: 'available',
            action: 'Masuk',
            description: 'Portal menuju dungeon monster.'
        },
        {
            id: 'peternakan',
            name: '🐄 Peternakan',
            type: 'building',
            tileX: 55, tileY: 22,
            radius: 56,
            status: 'available',
            action: 'Masuk',
            description: 'Beternak hewan peliharaan.'
        },
        {
            id: 'tambang',
            name: '⛏ Tambang',
            type: 'mine',
            tileX: 25, tileY: 58,
            radius: 56,
            status: 'available',
            action: 'Tambang',
            description: 'Tambang batu dan mineral.'
        },
        {
            id: 'memancing',
            name: '🎣 Area Memancing',
            type: 'fishing',
            tileX: 55, tileY: 58,
            radius: 56,
            status: 'available',
            action: 'Pancing',
            description: 'Area memancing di sungai.'
        },
        {
            id: 'hutan',
            name: '🌲 Hutan',
            type: 'forest',
            tileX: 21, tileY: 12,
            radius: 64,
            status: 'available',
            action: 'Masuk',
            description: 'Hutan penuh pepohonan.'
        }
    ]
};
