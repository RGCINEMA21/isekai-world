## EnvironmentManager - Ground, paths, river, bridge, trees, decorations
extends Node2D

var ts: int

func _ready() -> void:
	ts = MonsterAreaData.TILE_SIZE
	_create_ground()
	_create_river()
	_create_bridges()
	_create_paths()
	_create_area_labels()
	_create_trees()
	_create_bushes()
	_create_rocks()
	_create_flowers()
	_create_stumps()
	_create_resource_spawns()
	_create_chests()
	_create_boss_gate()

func _create_ground() -> void:
	var bg := ColorRect.new()
	bg.size = Vector2(MonsterAreaData.MAP_WIDTH * ts, MonsterAreaData.MAP_HEIGHT * ts)
	bg.color = Color(0.30, 0.55, 0.25)
	bg.z_index = -10
	add_child(bg)

	## Grass variation
	var patches: Array[Vector2] = [
		Vector2(5, 5), Vector2(15, 8), Vector2(25, 3), Vector2(35, 6), Vector2(50, 4),
		Vector2(8, 22), Vector2(20, 25), Vector2(40, 22), Vector2(50, 28),
		Vector2(12, 35), Vector2(30, 35), Vector2(48, 35),
	]
	for v: Vector2 in patches:
		var p := ColorRect.new()
		p.size = Vector2(4 * ts, 3 * ts)
		p.position = Vector2(v.x * ts, v.y * ts)
		p.color = Color(0.33, 0.58, 0.27)
		p.z_index = -9
		add_child(p)

	## Darker patches (shadow under trees)
	for v: Vector2 in [Vector2(3, 3), Vector2(55, 3), Vector2(3, 15), Vector2(55, 15)]:
		var p := ColorRect.new()
		p.size = Vector2(3 * ts, 2 * ts)
		p.position = Vector2(v.x * ts, v.y * ts)
		p.color = Color(0.25, 0.48, 0.20)
		p.z_index = -9
		add_child(p)

func _create_river() -> void:
	var river_color := Color(0.3, 0.5, 0.8, 0.6)
	for seg: Dictionary in MonsterAreaData.RIVER_SEGMENTS:
		for x in range(seg["x1"], seg["x2"]):
			var t := ColorRect.new()
			t.size = Vector2(ts, ts)
			t.position = Vector2(x * ts, seg["y"] * ts)
			t.color = river_color
			t.z_index = -6
			add_child(t)

func _create_bridges() -> void:
	var wood := Color(0.55, 0.4, 0.2)
	for p: Vector2i in MonsterAreaData.BRIDGE_POSITIONS:
		var t := ColorRect.new()
		t.size = Vector2(ts, ts)
		t.position = Vector2(p.x * ts, p.y * ts)
		t.color = wood
		t.z_index = -5
		add_child(t)

func _create_paths() -> void:
	var c1 := Color(0.55, 0.48, 0.35)
	var c2 := Color(0.50, 0.43, 0.30)
	for path: Dictionary in MonsterAreaData.PATHS:
		_draw_road(path["from"].x, path["from"].y, path["to"].x, path["to"].y, c1, c2)

func _draw_road(x1:int, y1:int, x2:int, y2:int, c1:Color, c2:Color) -> void:
	if x1 == x2:
		for y in range(mini(y1,y2), maxi(y1,y2)+1):
			_add_tile(x1, y, c1, c2)
	elif y1 == y2:
		for x in range(mini(x1,x2), maxi(x1,x2)+1):
			_add_tile(x, y1, c1, c2)

func _add_tile(x:int, y:int, c1:Color, c2:Color) -> void:
	var t := ColorRect.new()
	t.size = Vector2(ts, ts)
	t.position = Vector2(x * ts, y * ts)
	t.color = c1 if (x+y)%2==0 else c2
	t.z_index = -7
	add_child(t)

func _create_area_labels() -> void:
	var areas: Array[Dictionary] = MonsterAreaData.MONSTER_AREAS
	for a: Dictionary in areas:
		var lbl := Label.new()
		lbl.text = a["name"]
		lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		lbl.position = Vector2(a["x1"] * ts + 16, a["y1"] * ts + 8)
		lbl.size = Vector2((a["x2"] - a["x1"]) * ts, 20)
		lbl.add_theme_font_size_override("font_size", 14)
		lbl.add_theme_color_override("font_color", Color(0.9, 0.9, 0.9, 0.5))
		lbl.add_theme_color_override("font_shadow_color", Color.BLACK)
		lbl.add_theme_constant_override("shadow_offset_x", 1)
		lbl.add_theme_constant_override("shadow_offset_y", 1)
		lbl.z_index = 2
		add_child(lbl)

func _create_trees() -> void:
	for p: Vector2i in MonsterAreaData.TREE_POSITIONS:
		var x: float = p.x * ts + ts * 0.5
		var y: float = p.y * ts + ts * 0.5
		var trunk := ColorRect.new()
		trunk.size = Vector2(8, 18)
		trunk.position = Vector2(x-4, y)
		trunk.color = Color(0.42, 0.28, 0.12)
		trunk.z_index = -3
		add_child(trunk)
		var leaves := ColorRect.new()
		leaves.size = Vector2(28, 24)
		leaves.position = Vector2(x-14, y-20)
		leaves.color = Color(0.18, 0.45, 0.15)
		leaves.z_index = -2
		add_child(leaves)
		var hl := ColorRect.new()
		hl.size = Vector2(16, 10)
		hl.position = Vector2(x-8, y-18)
		hl.color = Color(0.25, 0.52, 0.20)
		hl.z_index = -2
		add_child(hl)

func _create_bushes() -> void:
	for p: Vector2i in MonsterAreaData.BUSH_POSITIONS:
		var x: float = p.x * ts + ts * 0.5
		var y: float = p.y * ts + ts * 0.5
		var bush := ColorRect.new()
		bush.size = Vector2(16, 10)
		bush.position = Vector2(x-8, y-5)
		bush.color = Color(0.22, 0.48, 0.18)
		bush.z_index = -3
		add_child(bush)

func _create_rocks() -> void:
	for p: Vector2i in MonsterAreaData.ROCK_POSITIONS:
		var x: float = p.x * ts + ts * 0.5
		var y: float = p.y * ts + ts * 0.5
		var rock := ColorRect.new()
		rock.size = Vector2(12, 8)
		rock.position = Vector2(x-6, y-4)
		rock.color = Color(0.52, 0.50, 0.48)
		rock.z_index = -3
		add_child(rock)

func _create_flowers() -> void:
	var colors: Array[Color] = [Color(0.9,0.3,0.4), Color(0.9,0.8,0.3), Color(0.6,0.3,0.8), Color(0.9,0.5,0.7)]
	for i: int in MonsterAreaData.FLOWER_POSITIONS.size():
		var p: Vector2i = MonsterAreaData.FLOWER_POSITIONS[i]
		var x: float = p.x * ts + ts * 0.5
		var y: float = p.y * ts + ts * 0.5
		var f := ColorRect.new()
		f.size = Vector2(4, 4)
		f.position = Vector2(x-2, y-2)
		f.color = colors[i % colors.size()]
		f.z_index = -2
		add_child(f)

func _create_stumps() -> void:
	for p: Vector2i in MonsterAreaData.STUMP_POSITIONS:
		var x: float = p.x * ts + ts * 0.5
		var y: float = p.y * ts + ts * 0.5
		var stump := ColorRect.new()
		stump.size = Vector2(10, 8)
		stump.position = Vector2(x-5, y-4)
		stump.color = Color(0.45, 0.32, 0.15)
		stump.z_index = -3
		add_child(stump)
		var ring := ColorRect.new()
		ring.size = Vector2(6, 4)
		ring.position = Vector2(x-3, y-2)
		ring.color = Color(0.55, 0.40, 0.20)
		ring.z_index = -2
		add_child(ring)

func _create_resource_spawns() -> void:
	for r: Dictionary in MonsterAreaData.RESOURCE_SPAWNS:
		var x: float = r["x"] * ts + ts * 0.5
		var y: float = r["y"] * ts + ts * 0.5
		var icon := ColorRect.new()
		icon.size = Vector2(8, 8)
		icon.position = Vector2(x-4, y-4)
		icon.z_index = 3
		match r["type"]:
			"wood":  icon.color = Color(0.6, 0.4, 0.2)
			"stone": icon.color = Color(0.6, 0.6, 0.6)
		add_child(icon)

func _create_chests() -> void:
	for p: Vector2 in MonsterAreaData.CHEST_POSITIONS:
		var x: float = p.x * ts + ts * 0.5
		var y: float = p.y * ts + ts * 0.5
		var chest := ColorRect.new()
		chest.size = Vector2(14, 10)
		chest.position = Vector2(x-7, y-5)
		chest.color = Color(0.6, 0.45, 0.2)
		chest.z_index = 3
		add_child(chest)
		var lock := ColorRect.new()
		lock.size = Vector2(4, 4)
		lock.position = Vector2(x-2, y-3)
		lock.color = Color(0.8, 0.7, 0.3)
		lock.z_index = 4
		add_child(lock)

func _create_boss_gate() -> void:
	var ba: Dictionary = MonsterAreaData.BOSS_AREA
	var gate_x: float = (ba["x1"] + ba["x2"]) * 0.5 * ts
	var gate_y: float = ba["y2"] * ts
	## Gate pillars
	var left := ColorRect.new()
	left.size = Vector2(8, 32)
	left.position = Vector2(gate_x - 20, gate_y - 16)
	left.color = Color(0.4, 0.4, 0.45)
	left.z_index = 3
	add_child(left)
	var right := ColorRect.new()
	right.size = Vector2(8, 32)
	right.position = Vector2(gate_x + 12, gate_y - 16)
	right.color = Color(0.4, 0.4, 0.45)
	right.z_index = 3
	add_child(right)
	## Bar (locked)
	var bar := ColorRect.new()
	bar.size = Vector2(40, 6)
	bar.position = Vector2(gate_x - 20, gate_y - 8)
	bar.color = Color(0.7, 0.2, 0.2)
	bar.z_index = 4
	add_child(bar)
	## Lock icon
	var lock := ColorRect.new()
	lock.size = Vector2(10, 10)
	lock.position = Vector2(gate_x - 5, gate_y - 12)
	lock.color = Color(0.9, 0.8, 0.3)
	lock.z_index = 5
	add_child(lock)
	## Label
	var lbl := Label.new()
	lbl.text = "BOSS AREA (Locked)"
	lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	lbl.position = Vector2(gate_x - 60, gate_y - 30)
	lbl.size = Vector2(120, 16)
	lbl.add_theme_font_size_override("font_size", 11)
	lbl.add_theme_color_override("font_color", Color(0.9, 0.4, 0.4))
	lbl.add_theme_color_override("font_shadow_color", Color.BLACK)
	lbl.add_theme_constant_override("shadow_offset_x", 1)
	lbl.add_theme_constant_override("shadow_offset_y", 1)
	lbl.z_index = 6
	add_child(lbl)
