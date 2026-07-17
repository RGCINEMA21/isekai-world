## Portal - Return portal ke Main Village
extends Area2D

var glow: ColorRect
var label: Label
var anim_time: float = 0.0

func _ready() -> void:
	## Portal visual
	glow = ColorRect.new()
	glow.size = Vector2(28, 28)
	glow.position = Vector2(-14, -14)
	glow.color = Color(0.3, 0.5, 0.9, 0.6)
	glow.z_index = 4
	add_child(glow)

	## Inner glow
	var inner := ColorRect.new()
	inner.size = Vector2(18, 18)
	inner.position = Vector2(-9, -9)
	inner.color = Color(0.5, 0.7, 1.0, 0.8)
	inner.z_index = 5
	add_child(inner)

	## Collision
	var col := CollisionShape2D.new()
	var shape := RectangleShape2D.new()
	shape.size = Vector2(28, 28)
	col.shape = shape
	add_child(col)

	## Label
	label = Label.new()
	label.text = "← Return Portal"
	label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	label.position = Vector2(-40, -30)
	label.size = Vector2(80, 14)
	label.add_theme_font_size_override("font_size", 10)
	label.add_theme_color_override("font_color", Color(0.6, 0.8, 1.0))
	label.add_theme_color_override("font_shadow_color", Color.BLACK)
	label.add_theme_constant_override("shadow_offset_x", 1)
	label.add_theme_constant_override("shadow_offset_y", 1)
	label.z_index = 6
	add_child(label)

	## Input
	input_event.connect(_on_input)

func _process(delta: float) -> void:
	anim_time += delta
	glow.color.a = 0.4 + sin(anim_time * 3.0) * 0.2

func _on_input(_viewport: Node, event: InputEvent, _shape_idx: int) -> void:
	if (event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT) or (event is InputEventScreenTouch and event.pressed):
		SceneManager.change_scene("main_village")
