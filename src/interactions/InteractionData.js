/**
 * InteractionData - Registry semua objek interaksi.
 * Posisi di tile coords → InteractionObject kalikan TILE untuk pixel.
 * Posisi = depan pintu/benda, bukan tengah bangunan.
 */
const InteractionData = {
    getObjects(mapKey) {
        if (mapKey === 'main_village') return this.mainVillage;
        return [];
    },

    mainVillage: [
        { id: 'rumah',       name: '🏠 Rumah',          type: 'building',  tileX: 32, tileY: 37, radius: 70, status: 'available', action: 'Masuk',     description: 'Rumahmu di desa.' },
        { id: 'gudang',      name: '📦 Gudang',          type: 'building',  tileX: 50, tileY: 37, radius: 70, status: 'available', action: 'Buka',      description: 'Gudang penyimpanan.' },
        { id: 'dapur',       name: '🍳 Dapur',           type: 'building',  tileX: 32, tileY: 47, radius: 70, status: 'available', action: 'Masuk',     description: 'Masak berbagai makanan.' },
        { id: 'pertanian',   name: '🌾 Area Pertanian',  type: 'farm',      tileX: 50, tileY: 47, radius: 70, status: 'available', action: 'Tanam',     description: 'Area menanam tanaman.' },
        { id: 'portal',      name: '⚔ Portal Monster',   type: 'portal',    tileX: 25, tileY: 24, radius: 70, status: 'available', action: 'Masuk',     description: 'Portal dungeon monster.' },
        { id: 'peternakan',  name: '🐄 Peternakan',      type: 'building',  tileX: 55, tileY: 24, radius: 70, status: 'available', action: 'Masuk',     description: 'Beternak hewan.' },
        { id: 'tambang',     name: '⛏ Tambang',          type: 'mine',      tileX: 25, tileY: 60, radius: 70, status: 'available', action: 'Tambang',   description: 'Tambang batu & mineral.' },
        { id: 'memancing',   name: '🎣 Area Memancing',   type: 'fishing',   tileX: 55, tileY: 60, radius: 70, status: 'available', action: 'Pancing',   description: 'Area memancing.' },
        { id: 'hutan',       name: '🌲 Hutan',           type: 'forest',    tileX: 22, tileY: 13, radius: 70, status: 'available', action: 'Masuk',     description: 'Hutan pepohonan.' }
    ]
};
