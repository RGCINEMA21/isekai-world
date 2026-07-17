## PlayerController - Gerakan player dengan WASD/Arrow + Virtual Analog (mobile)
extends CharacterBody2D

const SPEED: float = 200.0
const ACCELERATION: float = 800.0
const FRICTION: float = 600.0

## Visual
var body_rect: ColorRect
var head_rect: ColorRect

## Virtual analog (mobile)
var analog_active: bool = false
var analog_center: Vector2 = Vector2.ZERO
var analog_radius: float = 60.0
var analog_current: Vector2 = Vector2.ZERO
var analog_layer: CanvasLayer
var analog_bg: ColorRect
var analog_knob: ColorRect

func _ready() -> void:
	## Visual player
	body_rect = ColorRect.new()
	body_rect.size = Vector2(16, 24)
	body_rect.position = Vector2(-8, -8)
	body_rect.color = Color(0.2, 0.5, 0.8)
	body_rect.z_index = 10
	add_child(body_rect)

	head_rect = ColorRect.new()
	head_rect.size = Vector2(12, 12)
	head_rect.position = Vector2(-6, -18)
	head_rect.color = Color(0.85, 0.7, 0.55)
	head_rect.z_index = 11
	add_child(head_rect)

	## Collision
	var col := CollisionShape2D.new()
	var shape := RectangleShape2D.new()
	shape.size = Vector2(14, 20)
	col.shape = shape
	add_child(col)

	## Camera
	var cam := Camera2D.new()
	cam.name = "PlayerCamera"
	cam.position_smoothing_enabled = true
	cam.position_smoothing_speed = 10.0
	cam.zoom = Vector2(2.0, 2.0)
	cam.limit_left = 0
	cam.limit_top = 0
	cam.limit_right = MonsterAreaData.MAP_WIDTH * MonsterAreaData.TILE_SIZE
	cam.limit_bottom = MonsterAreaData.MAP_HEIGHT * MonsterAreaData.TILE_SIZE
	add_child(cam)
	cam.make_current()

	## Setup virtual analog untuk mobile
	_setup_virtual_analog()

func _physics_process(delta: float) -> void:
	var input_dir := Vector2.ZERO

	## Keyboard input
	if Input.is_action_pressed("ui_left") or Input.is_key_pressed(KEY_A):
		input_dir.x -= 1
	if Input.is_action_pressed("ui_right") or Input.is_key_pressed(KEY_D):
		input_dir.x += 1
	if Input.is_action_pressed("ui_up") or Input.is_key_pressed(KEY_W):
		input_dir.y -= 1
	if Input.is_action_pressed("ui_down") or Input.is_key_pressed(KEY_S):
		input_dir.y += 1

	## Virtual analog input
	if analog_active and analog_current.length() > 10.0:
		input_dir = analog_current.normalized()

	if input_dir.length() > 0:
		input_dir = input_dir.normalized()
		velocity = velocity.move_toward(input_dir * SPEED, ACCELERATION * delta)
	else:
		velocity = velocity.move_toward(Vector2.ZERO, FRICTION * delta)

	move_and_slide()

## ==================== VIRTUAL ANALOG ====================

func _setup_virtual_analog() -> void:
	analog_layer = CanvasLayer.new()
	analog_layer.layer = 60
	analog_layer.visible = false
	add_child(analog_layer)

	## Background circle
	analog_bg = ColorRect.new()
	analog_bg.size = Vector2(analog_radius * 2, analog_radius * 2)
	analog_bg.color = Color(1, 1, 1, 0.15)
	analog_bg.z_index = 50
	analog_layer.add_child(analog_bg)

	## Knob
	analog_knob = ColorRect.new()
	analog_knob.size = Vector2(30, 30)
	analog_knob.color = Color(1, 1, 1, 0.4)
	analog_knob.z_index = 51
	analog_layer.add_child(analog_knob)

func _input(event: InputEvent) -> void:
	if event is InputEventScreenTouch:
		if event.pressed:
			## Analog muncul di posisi sentuh kiri layar
			if event.position.x < get_viewport_rect().size.x * 0.5:
				analog_active = true
				analog_center = event.position
				analog_current = Vector2.ZERO
				analog_layer.visible = true
				analog_bg.position = analog_center - Vector2(analog_radius, analog_radius)
				analog_knob.position = analog_center - Vector2(15, 15)
		else:
			analog_active = false
			analog_current = Vector2.ZERO
			analog_layer.visible = false

	elif event is InputEventScreenDrag and analog_active:
		var diff: Vector2 = event.position - analog_center
		if diff.length() > analog_radius:
			diff = diff.normalized() * analog_radius
		analog_current = diff
		analog_knob.position = analog_center + diff - Vector2(15, 15)
