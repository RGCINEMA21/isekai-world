## DecorationManager - Pohon, semak, bunga, lampu, batu, bangku, tong, peti, rambu
extends Node2D

var ts: int

func _ready() -> void:
	ts = VillageData.TILE_SIZE
	_draw_trees()
	_draw_bushes()
	_draw_flowers()
	_draw_lamps()
	_draw_rocks()
	_draw_benches()
	_draw_barrels()
	_draw_chests()
	_draw_signs()
	_draw_future_areas()

func _draw_trees() -> void:
	for p: Vector2i in VillageData.TREE_POSITIONS:
		var x: float = p.x * ts + ts * 0.5
		var y: float = p.y * ts + ts * 0.5
		## Batang
		var trunk := ColorRect.new()
		trunk.size = Vector2(6, 14)
		trunk.position = Vector2(x-3, y)
		trunk.color = Color(0.45, 0.3, 0.15)
		trunk.z_index = -5
		add_child(trunk)
		## Daun
		var leaves := ColorRect.new()
		leaves.size = Vector2(22, 20)
		leaves.position = Vector2(x-11, y-18)
		leaves.color = Color(0.22, 0.50, 0.18)
		leaves.z_index = -4
		add_child(leaves)
		## Highlight
		var hl := ColorRect.new()
		hl.size = Vector2(12, 8)
		hl.position = Vector2(x-6, y-16)
		hl.color = Color(0.30, 0.58, 0.22)
		hl.z_index = -4
		add_child(hl)

func _draw_bushes() -> void:
	for p: Vector2i in VillageData.BUSH_POSITIONS:
		var x: float = p.x * ts + ts * 0.5
		var y: float = p.y * ts + ts * 0.5
		var bush := ColorRect.new()
		bush.size = Vector2(14, 10)
		bush.position = Vector2(x-7, y-5)
		bush.color = Color(0.25, 0.50, 0.20)
		bush.z_index = -4
		add_child(bush)
		var hl := ColorRect.new()
		hl.size = Vector2(8, 4)
		hl.position = Vector2(x-4, y-4)
		hl.color = Color(0.32, 0.55, 0.25)
		hl.z_index = -4
		add_child(hl)

func _draw_flowers() -> void:
	var colors: Array[Color] = [Color(0.9,0.3,0.4), Color(0.9,0.8,0.3), Color(0.5,0.3,0.8), Color(0.9,0.5,0.7)]
	for i: int in VillageData.FLOWER_POSITIONS.size():
		var p: Vector2i = VillageData.FLOWER_POSITIONS[i]
		var x: float = p.x * ts + ts * 0.5
		var y: float = p.y * ts + ts * 0.5
		var flower := ColorRect.new()
		flower.size = Vector2(4, 4)
		flower.position = Vector2(x-2, y-2)
		flower.color = colors[i % colors.size()]
		flower.z_index = -3
		add_child(flower)

func _draw_lamps() -> void:
	for p: Vector2i in VillageData.LAMP_POSITIONS:
		var x: float = p.x * ts + ts * 0.5
		var y: float = p.y * ts + ts * 0.5
		## Tiang
		var pole := ColorRect.new()
		pole.size = Vector2(3, 16)
		pole.position = Vector2(x-1, y-14)
		pole.color = Color(0.4, 0.35, 0.3)
		pole.z_index = 1
		add_child(pole)
		## Lampu
		var lamp := ColorRect.new()
		lamp.size = Vector2(8, 6)
		lamp.position = Vector2(x-4, y-18)
		lamp.color = Color(0.95, 0.85, 0.4)
		lamp.z_index = 2
		add_child(lamp)
		## Glow
		var glow := ColorRect.new()
		glow.size = Vector2(16, 12)
		glow.position = Vector2(x-8, y-16)
		glow.color = Color(0.95, 0.85, 0.4, 0.15)
		glow.z_index = 1
		add_child(glow)

func _draw_rocks() -> void:
	for p: Vector2i in VillageData.ROCK_POSITIONS:
		var x: float = p.x * ts + ts * 0.5
		var y: float = p.y * ts + ts * 0.5
		var rock := ColorRect.new()
		rock.size = Vector2(10, 7)
		rock.position = Vector2(x-5, y-3)
		rock.color = Color(0.55, 0.53, 0.50)
		rock.z_index = -3
		add_child(rock)

func _draw_benches() -> void:
	for p: Vector2i in VillageData.BENCH_POSITIONS:
		var x: float = p.x * ts + ts * 0.5
		var y: float = p.y * ts + ts * 0.5
		var bench := ColorRect.new()
		bench.size = Vector2(14, 6)
		bench.position = Vector2(x-7, y-3)
		bench.color = Color(0.55, 0.4, 0.2)
		bench.z_index = 1
		add_child(bench)

func _draw_barrels() -> void:
	for p: Vector2i in VillageData.BARREL_POSITIONS:
		var x: float = p.x * ts + ts * 0.5
		var y: float = p.y * ts + ts * 0.5
		var barrel := ColorRect.new()
		barrel.size = Vector2(8, 10)
		barrel.position = Vector2(x-4, y-5)
		barrel.color = Color(0.5, 0.35, 0.2)
		barrel.z_index = 1
		add_child(barrel)
		var band := ColorRect.new()
		band.size = Vector2(8, 2)
		band.position = Vector2(x-4, y-3)
		band.color = Color(0.35, 0.3, 0.25)
		band.z_index = 1
		add_child(band)

func _draw_chests() -> void:
	for p: Vector2i in VillageData.CHEST_POSITIONS:
		var x: float = p.x * ts + ts * 0.5
		var y: float = p.y * ts + ts * 0.5
		var chest := ColorRect.new()
		chest.size = Vector2(12, 8)
		chest.position = Vector2(x-6, y-4)
		chest.color = Color(0.6, 0.45, 0.2)
		chest.z_index = 1
		add_child(chest)
		var lock := ColorRect.new()
		lock.size = Vector2(4, 4)
		lock.position = Vector2(x-2, y-2)
		lock.color = Color(0.8, 0.7, 0.3)
		lock.z_index = 2
		add_child(lock)

func _draw_signs() -> void:
	for sd: Dictionary in VillageData.SIGN_POSITIONS:
		var p: Vector2i = sd["pos"]
		var x: float = p.x * ts + ts * 0.5
		var y: float = p.y * ts + ts * 0.5
		var pole := ColorRect.new()
		pole.size = Vector2(3, 12)
		pole.position = Vector2(x-1, y-10)
		pole.color = Color(0.45, 0.3, 0.15)
		pole.z_index = 1
		add_child(pole)
		var board := ColorRect.new()
		board.size = Vector2(24, 10)
		board.position = Vector2(x-12, y-14)
		board.color = Color(0.55, 0.4, 0.2)
		board.z_index = 2
		add_child(board)

func _draw_future_areas() -> void:
	for ad: Dictionary in VillageData.FUTURE_AREAS:
		var p: Vector2i = ad["pos"]
		var area := ColorRect.new()
		area.size = Vector2(4*ts, 3*ts)
		area.position = Vector2(p.x*ts, p.y*ts)
		area.color = ad["color"]
		area.z_index = -6
		add_child(area)
		var lbl := Label.new()
		lbl.text = ad["name"]
		lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		lbl.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
		lbl.position = Vector2(p.x*ts, p.y*ts + ts)
		lbl.size = Vector2(4*ts, 20)
		lbl.add_theme_font_size_override("font_size", 11)
		lbl.add_theme_color_override("font_color", Color(0.8, 0.8, 0.8, 0.6))
		lbl.z_index = -5
		add_child(lbl)
