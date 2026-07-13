/**
 * NPCData - Definisi semua NPC ikonik di Main Village.
 * Setiap NPC berdiri di dekat bangunannya.
 */
const NPCData = {
    npcs: [
        { id: 'ibu_asrama',    name: 'Ibu Asrama',     building: 'rumah',       tileX: 30, tileY: 37, shirtColor: 0xcc6688, hairColor: 0x663322, role: 'Ibu' },
        { id: 'penjaga_gudang', name: 'Penjaga Gudang', building: 'gudang',      tileX: 48, tileY: 37, shirtColor: 0x668844, hairColor: 0x333322, role: 'Penjaga' },
        { id: 'petani',        name: 'Petani',          building: 'pertanian',   tileX: 48, tileY: 47, shirtColor: 0x88aa44, hairColor: 0x554422, role: 'Petani' },
        { id: 'koki',          name: 'Koki',            building: 'dapur',       tileX: 30, tileY: 47, shirtColor: 0xffffff, hairColor: 0x222222, role: 'Koki' },
        { id: 'ksatria_portal', name: 'Ksatria Portal',  building: 'portal',      tileX: 23, tileY: 24, shirtColor: 0x4466aa, hairColor: 0x886633, role: 'Ksatria' },
        { id: 'penebang',      name: 'Penebang Kayu',   building: 'hutan',       tileX: 20, tileY: 14, shirtColor: 0x885533, hairColor: 0x443322, role: 'Penebang' },
        { id: 'penambang',     name: 'Penambang',       building: 'tambang',     tileX: 23, tileY: 60, shirtColor: 0x666666, hairColor: 0x333333, role: 'Penambang' },
        { id: 'nelayan',       name: 'Nelayan',         building: 'memancing',   tileX: 53, tileY: 60, shirtColor: 0x4488aa, hairColor: 0x665544, role: 'Nelayan' },
        { id: 'peternak',      name: 'Peternak',        building: 'peternakan',  tileX: 53, tileY: 24, shirtColor: 0xaa8844, hairColor: 0x554433, role: 'Peternak' },
        { id: 'pandai_besi',   name: 'Pandai Besi',     building: 'blacksmith',  tileX: 38, tileY: 33, shirtColor: 0x884422, hairColor: 0x222222, role: 'Pandai Besi' },
        { id: 'alkemis',       name: 'Alkemis',         building: 'lab',         tileX: 44, tileY: 33, shirtColor: 0x6644aa, hairColor: 0xaaaaaa, role: 'Alkemis' },
        { id: 'pedagang',      name: 'Pedagang',        building: 'marketplace', tileX: 38, tileY: 50, shirtColor: 0xccaa22, hairColor: 0x443322, role: 'Pedagang' },
        { id: 'ketua_guild',   name: 'Ketua Guild',     building: 'guild',       tileX: 44, tileY: 50, shirtColor: 0x2244aa, hairColor: 0x222222, role: 'Ketua Guild' }
    ],

    get(npcId) { return this.npcs.find(n => n.id === npcId); },
    getByBuilding(buildingId) { return this.npcs.find(n => n.building === buildingId); },
    getAll() { return this.npcs; }
};
