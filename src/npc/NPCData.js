/**
 * NPCData - Definisi semua NPC ikonik di Main Village.
 * Setiap NPC berdiri di dekat pintu bangunannya.
 * Bangunan = 4 tile lebar, 3 tile tinggi, pintu di (tx+1, ty+2).
 * NPC berdiri 1-2 tile di bawah atau samping pintu.
 */
const NPCData = {
    list: [
        // Posisi NPC = tepat di tile pintu bangunan (door di tx+1, ty+2)
        // VillageNPC menggunakan world = tile * 16 + 8 (center of tile)
        // Kaki NPC berada di worldY + 12 = tepat di bawah pintu
        { id: 'ibu_asrama',    name: 'Ibu Asrama',     building: 'rumah',       tileX: 33, tileY: 34, shirtColor: 0xcc6688, hairColor: 0x663322, role: 'Ibu' },
        { id: 'penjaga_gudang', name: 'Penjaga Gudang', building: 'gudang',      tileX: 43, tileY: 32, shirtColor: 0x668844, hairColor: 0x333322, role: 'Penjaga' },
        { id: 'ksatria_portal', name: 'Ksatria Portal',  building: 'portal',      tileX: 26, tileY: 24, shirtColor: 0x4466aa, hairColor: 0x886633, role: 'Ksatria' },
        { id: 'petani',        name: 'Petani',          building: 'pertanian',   tileX: 21, tileY: 42, shirtColor: 0x88aa44, hairColor: 0x554422, role: 'Petani' },
        { id: 'koki',          name: 'Koki',            building: 'dapur',       tileX: 49, tileY: 42, shirtColor: 0xffffff, hairColor: 0x222222, role: 'Koki' },
        { id: 'peternak',      name: 'Peternak',        building: 'peternakan',  tileX: 51, tileY: 27, shirtColor: 0xaa8844, hairColor: 0x554433, role: 'Peternak' },
        { id: 'pandai_besi',   name: 'Pandai Besi',     building: 'blacksmith',  tileX: 61, tileY: 37, shirtColor: 0x884422, hairColor: 0x222222, role: 'Pandai Besi' },
        { id: 'alkemis',       name: 'Alkemis',         building: 'lab',         tileX: 56, tileY: 22, shirtColor: 0x6644aa, hairColor: 0xaaaaaa, role: 'Alkemis' },
        { id: 'pedagang',      name: 'Pedagang',        building: 'marketplace', tileX: 61, tileY: 52, shirtColor: 0xccaa22, hairColor: 0x443322, role: 'Pedagang' },
        { id: 'ketua_guild',   name: 'Ketua Guild',     building: 'guild',       tileX: 46, tileY: 17, shirtColor: 0x2244aa, hairColor: 0x222222, role: 'Ketua Guild' },
        { id: 'penambang',     name: 'Penambang',       building: 'tambang',     tileX: 26, tileY: 60, shirtColor: 0x666666, hairColor: 0x333333, role: 'Penambang' },
        { id: 'nelayan',       name: 'Nelayan',         building: 'memancing',   tileX: 56, tileY: 60, shirtColor: 0x4488aa, hairColor: 0x665544, role: 'Nelayan' },
        { id: 'penebang',      name: 'Penebang Kayu',   building: 'hutan',       tileX: 20, tileY: 14, shirtColor: 0x885533, hairColor: 0x443322, role: 'Penebang' }
    ],

    get(npcId) { return this.list.find(n => n.id === npcId); },
    getByBuilding(buildingId) { return this.list.find(n => n.building === buildingId); },
    getAll() { return this.list; }
};
