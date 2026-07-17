## VillageCamera - Kamera drag untuk desktop dan mobile
extends Camera2D

var drag_start: Vector2 = Vector2.ZERO
var is_dragging: bool = false
var map_limit_min: Vector2 = Vector2.ZERO
var map_limit_max: Vector2 = Vector2.ZERO

func _ready() -> void:
	var ts: int = VillageData.TILE_SIZE
	map_limit_min = Vector2(0, 0)
	map_limit_max = Vector2(VillageData.MAP_WIDTH * ts, VillageData.MAP_HEIGHT * ts)
	## Posis awal di tengah desa
	position = Vector2(VillageData.MAP_WIDTH * ts * 0.5, VillageData.MAP_HEIGHT * ts * 0.5)
	## Limit kamera
	limit_left = int(map_limit_min.x)
	limit_top = int(map_limit_min.y)
	limit_right = int(map_limit_max.x)
	limit_bottom = int(map_limit_max.y)
	## Smooth camera
	position_smoothing_enabled = true
	position_smoothing_speed = 8.0
	## Zoom default
	zoom = Vector2(2.0, 2.0)

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventMouseButton:
		if event.button_index == MOUSE_BUTTON_LEFT:
			if event.pressed:
				drag_start = get_viewport().get_mouse_position()
				is_dragging = true
			else:
				is_dragging = false
		## Zoom dengan scroll
		elif event.button_index == MOUSE_BUTTON_WHEEL_UP:
			zoom = (zoom + Vector2(0.1, 0.1)).clamp(Vector2(0.5, 0.5), Vector2(4.0, 4.0))
		elif event.button_index == MOUSE_BUTTON_WHEEL_DOWN:
			zoom = (zoom - Vector2(0.1, 0.1)).clamp(Vector2(0.5, 0.5), Vector2(4.0, 4.0))

	elif event is InputEventMouseMotion and is_dragging:
		var delta: Vector2 = (drag_start - get_viewport().get_mouse_position()) / zoom
		position += delta
		drag_start = get_viewport().get_mouse_position()
		_clamp_position()

	elif event is InputEventScreenDrag:
		position -= event.relative / zoom
		_clamp_position()

	elif event is InputEventScreenTouch:
		if event.pressed:
			drag_start = event.position
			is_dragging = true
		else:
			is_dragging = false

func _clamp_position() -> void:
	var half_view: Vector2 = get_viewport_rect().size / zoom * 0.5
	position.x = clampf(position.x, map_limit_min.x + half_view.x, map_limit_max.x - half_view.x)
	position.y = clampf(position.y, map_limit_min.y + half_view.y, map_limit_max.y - half_view.y)
