## MiniMap - Peta kecil di pojok kanan atas
extends CanvasLayer

var map_panel: PanelContainer
var map_size: Vector2 = Vector2(140, 100)
var ts: float  ## Skala mini

func _ready() -> void:
	layer = 70
	ts = map_size.x / VillageData.MAP_WIDTH
	_create_panel()

func _create_panel() -> void:
	map_panel = PanelContainer.new()
	map_panel.position = Vector2(10, 10)
	map_panel.custom_minimum_size = map_size
	map_panel.size = map_size
	add_child(map_panel)

	## Background peta
	var bg := ColorRect.new()
	bg.size = map_size
	bg.color = Color(0.15, 0.12, 0.2, 0.85)
	map_panel.add_child(bg)

	## Jalan (garis kecil)
	for path: Dictionary in VillageData.PATHS:
		var from: Vector2i = path["from"]
		var to: Vector2i = path["to"]
		_draw_mini_line(from, to, Color(0.6, 0.55, 0.45))

	## Bangunan
	for b: Dictionary in VillageData.BUILDINGS:
		var px: float = b["tile_x"] * ts
		var py: float = b["tile_y"] * ts
		var dot := ColorRect.new()
		dot.size = Vector2(4, 4)
		dot.position = Vector2(px - 2, py - 2)
		## Warna berdasarkan tipe
		match b["area"]:
			"center": dot.color = Color(0.3, 0.7, 0.3)
			"north":  dot.color = Color(0.7, 0.3, 0.3)
			"west":   dot.color = Color(0.3, 0.3, 0.7)
			"east":   dot.color = Color(0.7, 0.7, 0.3)
			"south":  dot.color = Color(0.7, 0.5, 0.3)
			_:        dot.color = Color.WHITE
		bg.add_child(dot)

	## Label "MAP"
	var title := Label.new()
	title.text = "MAP"
	title.position = Vector2(map_size.x * 0.5 - 16, map_size.y - 14)
	title.size = Vector2(32, 12)
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.add_theme_font_size_override("font_size", 9)
	title.add_theme_color_override("font_color", Color(0.7, 0.7, 0.7))
	bg.add_child(title)

func _draw_mini_line(from: Vector2i, to: Vector2i, color: Color) -> void:
	var bg: ColorRect = map_panel.get_child(0) if map_panel.get_child_count() > 0 else null
	if not bg:
		return
	if from.x == to.x:
		var y_min: int = mini(from.y, to.y)
		var y_max: int = maxi(from.y, to.y)
		for y in range(y_min, y_max + 1):
			var dot := ColorRect.new()
			dot.size = Vector2(1, 1)
			dot.position = Vector2(from.x * ts, y * ts)
			dot.color = color
			bg.add_child(dot)
	elif from.y == to.y:
		var x_min: int = mini(from.x, to.x)
		var x_max: int = maxi(from.x, to.x)
		for x in range(x_min, x_max + 1):
			var dot := ColorRect.new()
			dot.size = Vector2(1, 1)
			dot.position = Vector2(x * ts, from.y * ts)
			dot.color = color
			bg.add_child(dot)
