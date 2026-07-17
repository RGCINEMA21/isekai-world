## MonsterAreaData - Data layout Monster Area Level 1 (Beginner Grassland)
class_name MonsterAreaData

const MAP_WIDTH: int = 60
const MAP_HEIGHT: int = 40
const TILE_SIZE: int = 32
const AREA_NAME: String = "Beginner Grassland"

## Player spawn
const PLAYER_SPAWN: Vector2 = Vector2(30 * 32 + 16, 36 * 32 + 16)

## Return portal ke Main Village
const RETURN_PORTAL: Vector2 = Vector2(30 * 32 + 16, 34 * 32 + 16)

## Safe zone boundary (x_min, y_min, x_max, y_max) dalam tile
const SAFE_ZONE: Dictionary = {"x1": 24, "y1": 32, "x2": 36, "y2": 38}

## Monster areas
const MONSTER_AREAS: Array[Dictionary] = [
	{"id": "slime",  "name": "Slime Meadow",   "x1": 4,  "y1": 20, "x2": 20, "y2": 30, "color": Color(0.3, 0.7, 0.3, 0.15)},
	{"id": "wolf",   "name": "Wolf Den",        "x1": 38, "y1": 20, "x2": 56, "y2": 30, "color": Color(0.6, 0.4, 0.3, 0.15)},
	{"id": "goblin", "name": "Goblin Camp",     "x1": 18, "y1": 8,  "x2": 42, "y2": 18, "color": Color(0.5, 0.3, 0.5, 0.15)},
]

## Boss area (locked)
const BOSS_AREA: Dictionary = {"x1": 22, "y1": 1, "x2": 38, "y2": 7, "color": Color(0.8, 0.2, 0.2, 0.15)}

## Spawn points untuk monster (placeholder)
const SPAWN_POINTS: Array[Dictionary] = [
	# Slime area
	{"id": "sp_slime_1", "area": "slime", "x": 8,  "y": 24, "max": 3, "respawn": 10.0},
	{"id": "sp_slime_2", "area": "slime", "x": 14, "y": 22, "max": 3, "respawn": 10.0},
	{"id": "sp_slime_3", "area": "slime", "x": 12, "y": 28, "max": 2, "respawn": 12.0},
	# Wolf area
	{"id": "sp_wolf_1",  "area": "wolf",  "x": 42, "y": 24, "max": 2, "respawn": 15.0},
	{"id": "sp_wolf_2",  "area": "wolf",  "x": 50, "y": 22, "max": 2, "respawn": 15.0},
	{"id": "sp_wolf_3",  "area": "wolf",  "x": 48, "y": 28, "max": 2, "respawn": 18.0},
	# Goblin area
	{"id": "sp_gob_1",   "area": "goblin", "x": 24, "y": 12, "max": 2, "respawn": 20.0},
	{"id": "sp_gob_2",   "area": "goblin", "x": 34, "y": 14, "max": 2, "respawn": 20.0},
	{"id": "sp_gob_3",   "area": "goblin", "x": 30, "y": 10, "max": 1, "respawn": 25.0},
]

## Resource spawn (placeholder)
const RESOURCE_SPAWNS: Array[Dictionary] = [
	{"type": "wood",  "x": 6,  "y": 16},
	{"type": "wood",  "x": 10, "y": 14},
	{"type": "wood",  "x": 52, "y": 16},
	{"type": "stone", "x": 8,  "y": 18},
	{"type": "stone", "x": 48, "y": 18},
	{"type": "stone", "x": 20, "y": 10},
	{"type": "wood",  "x": 40, "y": 10},
	{"type": "wood",  "x": 16, "y": 12},
]

## Chest positions (placeholder)
const CHEST_POSITIONS: Array[Vector2] = [
	Vector2(10, 26), Vector2(50, 26), Vector2(28, 16),
	Vector2(6, 22), Vector2(54, 22),
]

## Paths (from, to) dalam tile coordinates
const PATHS: Array[Dictionary] = [
	# Main path dari spawn ke areas
	{"from": Vector2i(30, 37), "to": Vector2i(30, 32)},  # Spawn -> Safe Zone
	{"from": Vector2i(30, 32), "to": Vector2i(12, 32)},  # Safe -> Slime path
	{"from": Vector2i(30, 32), "to": Vector2i(48, 32)},  # Safe -> Wolf path
	{"from": Vector2i(30, 32), "to": Vector2i(30, 18)},  # Safe -> Goblin path
	{"from": Vector2i(30, 18), "to": Vector2i(30, 8)},   # Goblin -> Boss path
	# Cross paths
	{"from": Vector2i(12, 32), "to": Vector2i(12, 20)},  # Slime vertical
	{"from": Vector2i(48, 32), "to": Vector2i(48, 20)},  # Wolf vertical
	{"from": Vector2i(20, 20), "to": Vector2i(40, 20)},  # Slime-Goblin connector
]

## Tree positions
const TREE_POSITIONS: Array[Vector2i] = [
	# Border trees
	Vector2i(1, 1), Vector2i(2, 1), Vector2i(3, 1), Vector2i(57, 1), Vector2i(58, 1), Vector2i(59, 1),
	Vector2i(1, 38), Vector2i(2, 38), Vector2i(3, 38), Vector2i(57, 38), Vector2i(58, 38), Vector2i(59, 38),
	Vector2i(1, 10), Vector2i(1, 20), Vector2i(1, 30),
	Vector2i(59, 10), Vector2i(59, 20), Vector2i(59, 30),
	# Forest clusters
	Vector2i(4, 4), Vector2i(5, 3), Vector2i(6, 5), Vector2i(3, 6),
	Vector2i(54, 4), Vector2i(55, 3), Vector2i(56, 5), Vector2i(53, 6),
	Vector2i(2, 14), Vector2i(3, 13), Vector2i(5, 15),
	Vector2i(57, 14), Vector2i(56, 13), Vector2i(54, 15),
	# Scattered
	Vector2i(15, 5), Vector2i(45, 5), Vector2i(25, 3), Vector2i(35, 3),
	Vector2i(10, 10), Vector2i(50, 10), Vector2i(8, 35), Vector2i(52, 35),
]

## Bush positions
const BUSH_POSITIONS: Array[Vector2i] = [
	Vector2i(7, 22), Vector2i(15, 26), Vector2i(53, 22), Vector2i(45, 26),
	Vector2i(22, 14), Vector2i(38, 14), Vector2i(26, 10), Vector2i(34, 10),
	Vector2i(18, 30), Vector2i(42, 30), Vector2i(14, 34), Vector2i(46, 34),
]

## Rock positions
const ROCK_POSITIONS: Array[Vector2i] = [
	Vector2i(9, 25), Vector2i(51, 25), Vector2i(27, 13), Vector2i(33, 13),
	Vector2i(20, 6), Vector2i(40, 6), Vector2i(12, 36), Vector2i(48, 36),
]

## Flower positions
const FLOWER_POSITIONS: Array[Vector2i] = [
	Vector2i(16, 24), Vector2i(44, 24), Vector2i(22, 22), Vector2i(38, 22),
	Vector2i(28, 28), Vector2i(32, 28), Vector2i(10, 34), Vector2i(50, 34),
]

## Stump positions
const STUMP_POSITIONS: Array[Vector2i] = [
	Vector2i(11, 20), Vector2i(49, 20), Vector2i(25, 8), Vector2i(35, 8),
]

## River (horizontal segments)
const RIVER_SEGMENTS: Array[Dictionary] = [
	{"y": 19, "x1": 0, "x2": 18},
	{"y": 19, "x1": 42, "x2": 60},
]

## Bridge positions
const BRIDGE_POSITIONS: Array[Vector2i] = [
	Vector2i(18, 19), Vector2i(19, 19), Vector2i(20, 19), Vector2i(21, 19),
	Vector2i(38, 19), Vector2i(39, 19), Vector2i(40, 19), Vector2i(41, 19),
]
