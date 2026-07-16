## VillageData - Data tata letak Main Village dan NPC
class_name VillageData

## Posisi bangunan di grid (x, y tile)
const BUILDINGS: Array[Dictionary] = [
	{"id": "home", "name": "Rumah", "tile_x": 12, "tile_y": 12},
	{"id": "warehouse", "name": "Gudang", "tile_x": 6, "tile_y": 12},
	{"id": "blacksmith", "name": "Blacksmith", "tile_x": 4, "tile_y": 6},
	{"id": "kitchen", "name": "Dapur", "tile_x": 12, "tile_y": 6},
	{"id": "lab", "name": "Laboratorium", "tile_x": 18, "tile_y": 6},
	{"id": "market", "name": "Marketplace", "tile_x": 18, "tile_y": 12},
	
	{"id": "farming", "name": "Pertanian", "tile_x": 3, "tile_y": 18},
	{"id": "fruit_trees", "name": "Pohon Buah", "tile_x": 10, "tile_y": 18},
	{"id": "permanent_forest", "name": "Hutan Permanen", "tile_x": 17, "tile_y": 18},
	{"id": "permanent_stone", "name": "Area Batu", "tile_x": 24, "tile_y": 18},
	
	{"id": "portal_monster_npc", "name": "Portal Monster", "tile_x": 12, "tile_y": 2},
	{"id": "portal_quest_npc", "name": "Portal Quest", "tile_x": 12, "tile_y": 24},
]

## Data NPC untuk setiap bangunan
const Npcs: Array[Dictionary] = [
	{"id": "npc_home", "name": "Penjaga Rumah", "building_id": "home"},
	{"id": "npc_warehouse", "name": "Penjaga Gudang", "building_id": "warehouse"},
	{"id": "npc_blacksmith", "name": "Pandai Besi", "building_id": "blacksmith"},
	{"id": "npc_kitchen", "name": "Koki", "building_id": "kitchen"},
	{"id": "npc_lab", "name": "Alkemis", "building_id": "lab"},
	{"id": "npc_market", "name": "Pedagang", "building_id": "market"},
	{"id": "npc_farming", "name": "Petani", "building_id": "farming"},
	{"id": "npc_fruit", "name": "Pekebun", "building_id": "fruit_trees"},
	{"id": "npc_forest", "name": "Penebang Kayu", "building_id": "permanent_forest"},
	{"id": "npc_stone", "name": "Penambang Batu", "building_id": "permanent_stone"},
	{"id": "npc_portal_monster", "name": "Ksatria Portal", "building_id": "portal_monster_npc"},
	{"id": "npc_portal_quest", "name": "Penjaga Quest", "building_id": "portal_quest_npc"},
]

## Ukuran map dalam tile
const MAP_WIDTH: int = 28
const MAP_HEIGHT: int = 27
const TILE_SIZE: int = 32
