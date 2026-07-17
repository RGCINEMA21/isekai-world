## MonsterAreaMiniMap - Peta kecil untuk Monster Area
extends CanvasLayer

var map_panel: PanelContainer
var map_size: Vector2 = Vector2(160, 100)
var ts_x: float
var ts_y: float

func _ready() -> void:
	layer = 70
	ts_x = map_size.x / MonsterAreaData.MAP_WIDTH
	ts_y = map_size.y / MonsterAreaData.MAP_HEIGHT
	_create_panel()

func _create_panel() -> void:
	map_panel = PanelContainer.new()
	map_panel.position = Vector2(10, 10)
	map_panel.custom_minimum_size = map_size
	map_panel.size = map_size
	add_child(map_panel)

	var bg := ColorRect.new()
	bg.size = map_size
	bg.color = Color(0.1, 0.12, 0.18, 0.85)
	map_panel.add_child(bg)

	## Safe zone
	var sz: Dictionary = MonsterAreaData.SAFE_ZONE
	var safe := ColorRect.new()
	safe.size = Vector2((sz.x2 - sz.x1) * ts_x, (sz.y2 - sz.y1) * ts_y)
	safe.position = Vector2(sz.x1 * ts_x, sz.y1 * ts_y)
	safe.color = Color(0.3, 0.6, 0.3, 0.4)
	bg.add_child(safe)

	## Monster areas
	for a: Dictionary in MonsterAreaData.MONSTER_AREAS:
		var area := ColorRect.new()
		area.size = Vector2((a["x2"] - a["x1"]) * ts_x, (a["y2"] - a["y1"]) * ts_y)
		area.position = Vector2(a["x1"] * ts_x, a["y1"] * ts_y)
		area.color = a["color"]
		bg.add_child(area)

	## Boss area (red, locked)
	var ba: Dictionary = MonsterAreaData.BOSS_AREA
	var boss := ColorRect.new()
	boss.size = Vector2((ba["x2"] - ba["x1"]) * ts_x, (ba["y2"] - ba["y1"]) * ts_y)
	boss.position = Vector2(ba["x1"] * ts_x, ba["y1"] * ts_y)
	boss.color = Color(0.7, 0.2, 0.2, 0.3)
	bg.add_child(boss)

	## Return portal
	var rp: Vector2 = MonsterAreaData.RETURN_PORTAL
	var portal_dot := ColorRect.new()
	portal_dot.size = Vector2(4, 4)
	portal_dot.position = Vector2(rp.x / MonsterAreaData.TILE_SIZE * ts_x - 2, rp.y / MonsterAreaData.TILE_SIZE * ts_y - 2)
	portal_dot.color = Color(0.3, 0.5, 0.9)
	bg.add_child(portal_dot)

	## Player spawn
	var ps: Vector2 = MonsterAreaData.PLAYER_SPAWN
	var spawn_dot := ColorRect.new()
	spawn_dot.size = Vector2(4, 4)
	spawn_dot.position = Vector2(ps.x / MonsterAreaData.TILE_SIZE * ts_x - 2, ps.y / MonsterAreaData.TILE_SIZE * ts_y - 2)
	spawn_dot.color = Color(0.2, 0.5, 0.8)
	bg.add_child(spawn_dot)

	## Title
	var title := Label.new()
	title.text = MonsterAreaData.AREA_NAME
	title.position = Vector2(4, map_size.y - 14)
	title.size = Vector2(map_size.x - 8, 12)
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.add_theme_font_size_override("font_size", 8)
	title.add_theme_color_override("font_color", Color(0.7, 0.7, 0.7))
	bg.add_child(title)
