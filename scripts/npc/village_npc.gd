## VillageNPC - NPC di Main Village dengan sistem interaksi modular
extends Area2D

## ID NPC (harus cocok dengan NPCDatabase)
@export var npc_id: String = ""

## Nama NPC (fallback jika tidak ada di database)
@export var npc_name: String = "NPC"

## ID bangunan terkait
@export var building_id: String = ""

## Status highlight
var is_highlighted: bool = false

## Referensi visual
var sprite: ColorRect
var head: ColorRect
var name_label: Label
var highlight_border: ColorRect
var name_timer: Timer

## Warna dari database
var npc_color: Color = Color.MAGENTA
var head_color: Color = Color(0.85, 0.7, 0.55)


func _ready() -> void:
	# Ambil data dari database
	var data: Dictionary = NPCDatabase.get_npc(npc_id)
	if not data.is_empty():
		npc_name = data.get("name", npc_name)
		npc_color = data.get("color", npc_color)
		head_color = data.get("head_color", head_color)
		building_id = data.get("building_id", building_id)
	
	# Collision
	var col := CollisionShape2D.new()
	var shape := RectangleShape2D.new()
	shape.size = Vector2(28, 36)
	col.shape = shape
	add_child(col)
	
	# Highlight border (sembunyi default)
	highlight_border = ColorRect.new()
	highlight_border.size = Vector2(32, 42)
	highlight_border.position = Vector2(-16, -24)
	highlight_border.color = Color(1, 1, 0, 0.6)
	highlight_border.visible = false
	highlight_border.z_index = 8
	add_child(highlight_border)
	
	# Badan NPC
	sprite = ColorRect.new()
	sprite.size = Vector2(22, 30)
	sprite.position = Vector2(-11, -12)
	sprite.color = npc_color
	sprite.z_index = 9
	add_child(sprite)
	
	# Kepala
	head = ColorRect.new()
	head.size = Vector2(16, 16)
	head.position = Vector2(-8, -24)
	head.color = head_color
	head.z_index = 9
	add_child(head)
	
	# Mata
	var eye_l := ColorRect.new()
	eye_l.size = Vector2(3, 3)
	eye_l.position = Vector2(-5, -20)
	eye_l.color = Color.BLACK
	eye_l.z_index = 10
	add_child(eye_l)
	
	var eye_r := ColorRect.new()
	eye_r.size = Vector2(3, 3)
	eye_r.position = Vector2(2, -20)
	eye_r.color = Color.BLACK
	eye_r.z_index = 10
	add_child(eye_r)
	
	# Mulut
	var mouth := ColorRect.new()
	mouth.size = Vector2(6, 2)
	mouth.position = Vector2(-3, -16)
	mouth.color = Color(0.6, 0.3, 0.25)
	mouth.z_index = 10
	add_child(mouth)
	
	# Nama label
	name_label = Label.new()
	name_label.text = npc_name
	name_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	name_label.position = Vector2(-40, -44)
	name_label.size = Vector2(80, 16)
	name_label.add_theme_font_size_override("font_size", 11)
	name_label.add_theme_color_override("font_color", Color.WHITE)
	name_label.add_theme_color_override("font_shadow_color", Color.BLACK)
	name_label.add_theme_constant_override("shadow_offset_x", 1)
	name_label.add_theme_constant_override("shadow_offset_y", 1)
	name_label.visible = false
	name_label.z_index = 11
	add_child(name_label)
	
	# Timer sembunyi nama
	name_timer = Timer.new()
	name_timer.wait_time = 2.0
	name_timer.one_shot = true
	name_timer.timeout.connect(func(): name_label.visible = false)
	add_child(name_timer)
	
	# Input handling
	input_event.connect(_on_input_event)
	
	z_index = 10


func _on_input_event(_viewport: Node, event: InputEvent, _shape_idx: int) -> void:
	if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		_handle_click()
	elif event is InputEventScreenTouch and event.pressed:
		_handle_click()


func _handle_click() -> void:
	# Kirim ke InteractionManager
	if has_node("/root/NPCInteractionManager"):
		get_node("/root/NPCInteractionManager").select_npc(self)
	
	# Tampilkan nama sementara
	name_label.visible = true
	name_timer.start()


## Set highlight on/off
func set_highlight(value: bool) -> void:
	is_highlighted = value
	highlight_border.visible = value
	# Efek sedikit lebih besar saat highlight
	if value:
		scale = Vector2(1.1, 1.1)
	else:
		scale = Vector2(1.0, 1.0)
