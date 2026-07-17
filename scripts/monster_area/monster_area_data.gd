## MonsterAreaData - Data layout Monster Area Level 1 (Beginner Grassland)
class_name MonsterAreaData

const MAP_WIDTH: int = 50
const MAP_HEIGHT: int = 35
const TILE_SIZE: int = 32
const AREA_NAME: String = "Beginner Grassland"

## Player spawn
const PLAYER_SPAWN: Vector2 = Vector2(25 * 32 + 16, 31 * 32 + 16)

## Return portal ke Main Village
const RETURN_PORTAL: Vector2 = Vector2(25 * 32 + 16, 29 * 32 + 16)

## Safe zone boundary (x_min, y_min, x_max, y_max) dalam tile
const SAFE_ZONE: Dictionary = {"x1": 20, "y1": 28, "x2": 30, "y2": 33}

## Monster areas
const MONSTER_AREAS: Array[Dictionary] = [
	{"id": "slime",  "name": "Slime Meadow",   "x1": 4,  "y1": 16, "x2": 20, "y2": 26, "color": Color(0.3, 0.7, 0.3, 0.15)},
	{"id": "wolf",   "name": "Wolf Den",        "x1": 30, "y1": 16, "x2": 46, "y2": 26, "color": Color(0.6, 0.4, 0.3, 0.15)},
	{"id": "goblin", "name": "Goblin Camp",     "x1": 16, "y1": 4,  "x2": 34, "y2": 14, "color": Color(0.5, 0.3, 0.5, 0.15)},
]

## Boss area (locked)
const BOSS_AREA: Dictionary = {"x1": 18, "y1": 1, "x2": 32, "y2": 3, "color": Color(0.8, 0.2, 0.2, 0.15)}

## Spawn points untuk monster (hanya slime yang aktif)
const SPAWN_POINTS: Array[Dictionary] = [
	{"id": "sp_slime_1", "area": "slime", "x": 8,  "y": 20, "max": 3, "respawn": 8.0},
	{"id": "sp_slime_2", "area": "slime", "x": 14, "y": 18, "max": 3, "respawn": 8.0},
	{"id": "sp_slime_3", "area": "slime", "x": 10, "y": 24, "max": 2, "respawn": 10.0},
	{"id": "sp_wolf_1",  "area": "wolf",  "x": 36, "y": 20, "max": 0, "respawn": 15.0},
	{"id": "sp_wolf_2",  "area": "wolf",  "x": 42, "y": 18, "max": 0, "respawn": 15.0},
	{"id": "sp_gob_1",   "area": "goblin", "x": 22, "y": 8,  "max": 0, "respawn": 20.0},
	{"id": "sp_gob_2",   "area": "goblin", "x": 30, "y": 10, "max": 0, "respawn": 20.0},
]

## Monster stats database
const MONSTER_STATS: Dictionary = {
	"green_slime": {
		"id": "green_slime",
		"name": "Green Slime",
		"hp": 30,
		"attack": 5,
		"defense": 1,
		"move_speed": 120.0,
		"exp": 10,
		"gold_min": 10,
		"gold_max": 20,
		"respawn": 8.0,
	},
}

## Paths
const PATHS: Array[Dictionary] = [
	{"from": Vector2i(25, 32), "to": Vector2i(25, 28)},
	{"from": Vector2i(25, 28), "to": Vector2i(10, 28)},
	{"from": Vector2i(25, 28), "to": Vector2i(40, 28)},
	{"from": Vector2i(25, 28), "to": Vector2i(25, 14)},
	{"from": Vector2i(10, 28), "to": Vector2i(10, 16)},
	{"from": Vector2i(40, 28), "to": Vector2i(40, 16)},
]

## Tree positions
const TREE_POSITIONS: Array[Vector2i] = [
	Vector2i(1, 1), Vector2i(2, 1), Vector2i(3, 1),
	Vector2i(47, 1), Vector2i(48, 1), Vector2i(49, 1),
	Vector2i(1, 33), Vector2i(2, 33), Vector2i(47, 33), Vector2i(48, 33),
	Vector2i(1, 10), Vector2i(1, 20), Vector2i(49, 10), Vector2i(49, 20),
	Vector2i(3, 4), Vector2i(5, 3), Vector2i(46, 4), Vector2i(44, 3),
	Vector2i(20, 5), Vector2i(30, 5),
]

## Bush positions
const BUSH_POSITIONS: Array[Vector2i] = [
	Vector2i(7, 18), Vector2i(15, 22), Vector2i(35, 18), Vector2i(43, 22),
	Vector2i(22, 8), Vector2i(28, 8),
]

## Rock positions
const ROCK_POSITIONS: Array[Vector2i] = [
	Vector2i(9, 21), Vector2i(41, 21), Vector2i(26, 10),
]

## Flower positions
const FLOWER_POSITIONS: Array[Vector2i] = [
	Vector2i(12, 20), Vector2i(38, 20), Vector2i(24, 16),
]

## River segments
const RIVER_SEGMENTS: Array[Dictionary] = [
	{"y": 15, "x1": 0, "x2": 14},
	{"y": 15, "x1": 36, "x2": 50},
]

## Bridge positions
const BRIDGE_POSITIONS: Array[Vector2i] = [
	Vector2i(14, 15), Vector2i(15, 15), Vector2i(35, 15), Vector2i(36, 15),
]

## Resource spawns (placeholder)
const RESOURCE_SPAWNS: Array[Dictionary] = []
const CHEST_POSITIONS: Array[Vector2] = []
const STUMP_POSITIONS: Array[Vector2i] = []
