## CameraController - Menggeser kamera via drag (mouse/touch)
## Tidak ada karakter, hanya kamera yang bergerak.
extends Camera2D

## Apakah sedang drag
var is_dragging: bool = false

## Posisi awal drag
var drag_start: Vector2 = Vector2.ZERO

## Posisi kamera saat drag dimulai
var camera_start: Vector2 = Vector2.ZERO

## Sensitivitas drag
var drag_sensitivity: float = 1.0

## Batas kamera (min, max)
var limit_min: Vector2 = Vector2.ZERO
var limit_max: Vector2 = Vector2.ZERO


func _ready() -> void:
	# Set zoom default
	zoom = Vector2(1.5, 1.5)
	# Smooth
	position_smoothing_enabled = true
	position_smoothing_speed = 8.0
	# Limits
	_update_limits.call_deferred()


## Hitung limit kamera berdasarkan ukuran map
func _update_limits() -> void:
	var map_pixel_w: float = VillageData.MAP_WIDTH * VillageData.TILE_SIZE
	var map_pixel_h: float = VillageData.MAP_HEIGHT * VillageData.TILE_SIZE
	var view_half := get_viewport_rect().size / (2.0 * zoom)
	
	limit_left = int(view_half.x)
	limit_top = int(view_half.y)
	limit_right = int(map_pixel_w - view_half.x)
	limit_bottom = int(map_pixel_h - view_half.y)
	
	# Pastikan limit tidak negatif
	if limit_right < limit_left:
		limit_right = limit_left + 1
	if limit_bottom < limit_top:
		limit_bottom = limit_top + 1
	
	# Posisi awal di tengah map
	position = Vector2(map_pixel_w / 2.0, map_pixel_h / 2.0)


func _unhandled_input(event: InputEvent) -> void:
	# Mouse drag
	if event is InputEventMouseButton:
		if event.button_index == MOUSE_BUTTON_LEFT:
			if event.pressed:
				is_dragging = true
				drag_start = event.position
				camera_start = position
			else:
				is_dragging = false
	
	if event is InputEventMouseMotion and is_dragging:
		var delta: Vector2 = (event.position - drag_start) / zoom
		position = camera_start - delta
	
	# Touch drag
	if event is InputEventScreenTouch:
		if event.pressed:
			is_dragging = true
			drag_start = event.position
			camera_start = position
		else:
			is_dragging = false
	
	if event is InputEventScreenDrag and is_dragging:
		var delta: Vector2 = (event.position - drag_start) / zoom
		position = camera_start - delta
