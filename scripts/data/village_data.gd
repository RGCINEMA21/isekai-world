## VillageData - Data tata letak Main Village
class_name VillageData

const BUILDINGS: Array[Dictionary] = [
	{"id": "home", "name": "Rumah", "tile_x": 14, "tile_y": 13},
	{"id": "warehouse", "name": "Gudang", "tile_x": 10, "tile_y": 13},
	{"id": "kitchen", "name": "Dapur", "tile_x": 18, "tile_y": 13},
	{"id": "blacksmith", "name": "Blacksmith", "tile_x": 10, "tile_y": 9},
	{"id": "market", "name": "Marketplace", "tile_x": 18, "tile_y": 9},
	{"id": "farming", "name": "Pertanian", "tile_x": 20, "tile_y": 20},
	{"id": "fruit_trees", "name": "Pohon Buah", "tile_x": 23, "tile_y": 20},
	{"id": "permanent_forest", "name": "Hutan Permanen", "tile_x": 4, "tile_y": 16},
	{"id": "permanent_stone", "name": "Area Batu", "tile_x": 4, "tile_y": 20},
	{"id": "lab", "name": "Laboratorium", "tile_x": 14, "tile_y": 6},
	{"id": "portal_monster_npc", "name": "Portal Monster", "tile_x": 14, "tile_y": 2},
	{"id": "portal_quest_npc", "name": "Portal Quest", "tile_x": 24, "tile_y": 13},
]

## NPC - npc_id harus cocok dengan NPCDatabase
const NPCs: Array[Dictionary] = [
	{"npc_id": "blacksmith", "building_id": "blacksmith"},
	{"npc_id": "warehouse", "building_id": "warehouse"},
	{"npc_id": "kitchen", "building_id": "kitchen"},
	{"npc_id": "laboratory", "building_id": "lab"},
	{"npc_id": "marketplace", "building_id": "market"},
	{"npc_id": "portal_monster", "building_id": "portal_monster_npc"},
	{"npc_id": "portal_quest", "building_id": "portal_quest_npc"},
	{"npc_id": "guide", "building_id": "home"},
]

const MAP_WIDTH: int = 30
const MAP_HEIGHT: int = 24
const TILE_SIZE: int = 32

const FENCES: Array[Dictionary] = [
	{"x1": 19, "y1": 19, "x2": 25, "y2": 19},
	{"x1": 19, "y1": 22, "x2": 25, "y2": 22},
	{"x1": 19, "y1": 19, "x2": 19, "y2": 22},
	{"x1": 25, "y1": 19, "x2": 25, "y2": 22},
]

const LAMP_POSITIONS: Array[Vector2i] = [
	Vector2i(12, 13), Vector2i(16, 13),
	Vector2i(12, 9), Vector2i(16, 9),
	Vector2i(14, 5), Vector2i(14, 17),
	Vector2i(8, 13), Vector2i(20, 13),
]

const BUSH_POSITIONS: Array[Vector2i] = [
	Vector2i(7, 7), Vector2i(21, 7), Vector2i(7, 17),
	Vector2i(25, 7), Vector2i(3, 10), Vector2i(27, 16),
	Vector2i(6, 4), Vector2i(22, 4),
]
