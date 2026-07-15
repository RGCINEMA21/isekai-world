/**
 * NPCManager - Creates and manages all village NPCs.
 * Each NPC stands in front of its building's door (1 tile below).
 * NPCs have idle animations (blink, head turn, hand wave).
 */
class NPCManager {
    constructor(scene, villageMap) {
        this.scene = scene;
        this.map = villageMap;
        this.npcs = [];
        this.npcDefs = this._getNPCDefinitions();
    }

    createNPCs() {
        for (const def of this.npcDefs) {
            const building = this.map.getBuilding(def.buildingId);
            if (!building) continue;

            // Place NPC 1 tile below the door so they stand in front
            const npcTileX = building.doorTileX;
            const npcTileY = building.doorTileY + 1;

            const npc = new VillageNPC(this.scene, {
                id: def.id,
                name: def.name,
                building: def.buildingId,
                shirtColor: def.shirtColor,
                hairColor: def.hairColor,
                role: def.role,
                tileX: npcTileX,
                tileY: npcTileY
            }, this.map.TILE);

            npc.onTap = def.onInteract;
            this.npcs.push(npc);
        }
    }

    update(delta) {
        for (const npc of this.npcs) {
            npc.update(delta);
        }
    }

    destroy() {
        for (const npc of this.npcs) {
            npc.destroy();
        }
        this.npcs = [];
    }

    _getNPCDefinitions() {
        return [
            {
                id: 'penjaga_rumah', name: 'Penjaga Rumah', buildingId: 'rumah',
                shirtColor: 0xcc6688, hairColor: 0x663322, role: 'Penjaga',
                onInteract: (npc) => { if (this._onInteract) this._onInteract('rumah', npc); }
            },
            {
                id: 'penjaga_gudang', name: 'Penjaga Gudang', buildingId: 'gudang',
                shirtColor: 0x668844, hairColor: 0x333322, role: 'Penjaga',
                onInteract: (npc) => { if (this._onInteract) this._onInteract('gudang', npc); }
            },
            {
                id: 'petani', name: 'Petani', buildingId: 'pertanian',
                shirtColor: 0x88aa44, hairColor: 0x554422, role: 'Petani',
                onInteract: (npc) => { if (this._onInteract) this._onInteract('pertanian', npc); }
            },
            {
                id: 'koki', name: 'Koki', buildingId: 'dapur',
                shirtColor: 0xffffff, hairColor: 0x222222, role: 'Koki',
                onInteract: (npc) => { if (this._onInteract) this._onInteract('dapur', npc); }
            },
            {
                id: 'pandai_besi', name: 'Pandai Besi', buildingId: 'blacksmith',
                shirtColor: 0x884422, hairColor: 0x222222, role: 'Pandai Besi',
                onInteract: (npc) => { if (this._onInteract) this._onInteract('blacksmith', npc); }
            },
            {
                id: 'alkemis', name: 'Alkemis', buildingId: 'laboratorium',
                shirtColor: 0x6644aa, hairColor: 0xaaaaaa, role: 'Alkemis',
                onInteract: (npc) => { if (this._onInteract) this._onInteract('laboratorium', npc); }
            },
            {
                id: 'pedagang', name: 'Pedagang', buildingId: 'marketplace',
                shirtColor: 0xccaa22, hairColor: 0x443322, role: 'Pedagang',
                onInteract: (npc) => { if (this._onInteract) this._onInteract('marketplace', npc); }
            },
            {
                id: 'ksatria_portal', name: 'Ksatria Portal', buildingId: 'portal',
                shirtColor: 0x4466aa, hairColor: 0x886633, role: 'Ksatria',
                onInteract: (npc) => { if (this._onInteract) this._onInteract('portal', npc); }
            },
            {
                id: 'penjaga_quest', name: 'Penjaga Portal Quest', buildingId: 'portal_quest',
                shirtColor: 0x44aa66, hairColor: 0x334422, role: 'Penjaga Quest',
                onInteract: (npc) => { if (this._onInteract) this._onInteract('portal_quest', npc); }
            }
        ];
    }

    setInteractCallback(cb) {
        this._onInteract = cb;
    }
}
