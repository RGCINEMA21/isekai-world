## PlayerController - Gerakan player + Combat system
extends CharacterBody2D

const SPEED: float = 200.0
const ACCELERATION: float = 800.0
const FRICTION: float = 600.0

## ==================== VISUAL ====================
var body_rect: ColorRect
var head_rect: ColorRect
var attack_effect: ColorRect
var is_attacking: bool = false
var attack_timer: float = 0.0
var attack_cooldown: float = 0.5
var attack_duration: float = 0.2
var facing_dir: Vector2 = Vector2(0, 1)  ## Arah menghadap

## ==================== COMBAT ====================
var invincible: bool = false
var invincible_timer: float = 0.0
var invincible_duration: float = 0.8
var blink_time: float = 0.0
var can_attack: bool = true

## ==================== VIRTUAL ANALOG ====================
var analog_active: bool = false
var analog_center: Vector2 = Vector2.ZERO
var analog_radius: float = 60.0
var analog_current: Vector2 = Vector2.ZERO
var analog_layer: CanvasLayer
var analog_bg: ColorRect
var analog_knob: ColorRect
var _touch_index: int = -1

## ==================== HEALTH BAR ====================
var health_bar_node: Node2D


func _ready() -> void:
	add_to_group("player")
	_build_visual()
	_build_collision()
	_build_camera()
	_build_health_bar()
	_setup_virtual_analog()


func _build_visual() -> void:
	## Badan
	body_rect = ColorRect.new()
	body_rect.size = Vector2(16, 24)
	body_rect.position = Vector2(-8, -8)
	body_rect.color = Color(0.2, 0.5, 0.8)
	body_rect.z_index = 10
	add_child(body_rect)

	## Kepala
	head_rect = ColorRect.new()
	head_rect.size = Vector2(12, 12)
	head_rect.position = Vector2(-6, -18)
	head_rect.color = Color(0.85, 0.7, 0.55)
	head_rect.z_index = 11
	add_child(head_rect)

	## Attack effect (sembunyi default)
	attack_effect = ColorRect.new()
	attack_effect.size = Vector2(20, 8)
	attack_effect.position = Vector2(8, -4)
	attack_effect.color = Color(1.0, 0.8, 0.2, 0.8)
	attack_effect.z_index = 12
	attack_effect.visible = false
	add_child(attack_effect)


func _build_collision() -> void:
	var col = CollisionShape2D.new()
	var shape = RectangleShape2D.new()
	shape.size = Vector2(14, 20)
	col.shape = shape
	add_child(col)


func _build_camera() -> void:
	var cam = Camera2D.new()
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


func _build_health_bar() -> void:
	var hb_script = preload("res://scripts/combat/health_bar.gd")
	health_bar_node = hb_script.new()
	health_bar_node.name = "PlayerHealthBar"
	health_bar_node.set_offset_y(-28)
	add_child(health_bar_node)
	_refresh_health_bar()


func _refresh_health_bar() -> void:
	if health_bar_node and PlayerManager.is_initialized:
		health_bar_node.update_bar(PlayerManager.get_hp(), PlayerManager.get_max_hp())


## ==================== PHYSICS ====================


func _physics_process(delta: float) -> void:
	## Invincibility timer
	if invincible:
		invincible_timer -= delta
		blink_time += delta * 15.0
		modulate.a = 0.5 + sin(blink_time) * 0.5
		if invincible_timer <= 0.0:
			invincible = false
			modulate.a = 1.0

	## Attack timer
	if is_attacking:
		attack_timer -= delta
		if attack_timer <= 0.0:
			is_attacking = false
			attack_effect.visible = false
	if not can_attack:
		attack_timer -= delta
		if attack_timer <= 0.0:
			can_attack = true

	## Movement
	var input_dir := Vector2.ZERO

	if Input.is_action_pressed("ui_left") or Input.is_key_pressed(KEY_A):
		input_dir.x -= 1
	if Input.is_action_pressed("ui_right") or Input.is_key_pressed(KEY_D):
		input_dir.x += 1
	if Input.is_action_pressed("ui_up") or Input.is_key_pressed(KEY_W):
		input_dir.y -= 1
	if Input.is_action_pressed("ui_down") or Input.is_key_pressed(KEY_S):
		input_dir.y += 1

	if analog_active and analog_current.length() > 10.0:
		input_dir = analog_current.normalized()

	if input_dir.length() > 0:
		input_dir = input_dir.normalized()
		velocity = velocity.move_toward(input_dir * SPEED, ACCELERATION * delta)
		facing_dir = input_dir
		_update_attack_effect_pos()
	else:
		velocity = velocity.move_toward(Vector2.ZERO, FRICTION * delta)

	move_and_slide()


func _update_attack_effect_pos() -> void:
	if facing_dir.x > 0.1:
		attack_effect.position = Vector2(8, -4)
		attack_effect.size = Vector2(20, 8)
	elif facing_dir.x < -0.1:
		attack_effect.position = Vector2(-28, -4)
		attack_effect.size = Vector2(20, 8)
	elif facing_dir.y < -0.1:
		attack_effect.position = Vector2(-4, -26)
		attack_effect.size = Vector2(8, 20)
	else:
		attack_effect.position = Vector2(-4, 10)
		attack_effect.size = Vector2(8, 20)


## ==================== ATTACK ====================


func perform_attack() -> void:
	if is_attacking or not can_attack:
		return

	is_attacking = true
	can_attack = false
	attack_timer = attack_cooldown
	attack_effect.visible = true
	_update_attack_effect_pos()

	## Cek monster di sekitar player
	var monsters := get_tree().get_nodes_in_group("monsters")
	for monster: Node in monsters:
		if monster.has_method("take_damage"):
			var dist: float = position.distance_to(monster.position)
			if dist <= 40.0:
				var player_attack: int = PlayerManager.get_attack() if PlayerManager.is_initialized else 10
				var crit_rate: float = PlayerManager.get_critical_rate() if PlayerManager.is_initialized else 5.0
				var crit_dmg: float = PlayerManager.get_critical_damage() if PlayerManager.is_initialized else 150.0
				var dmg: int = DamageSystem.calculate_damage(player_attack, 0)
				if DamageSystem.is_critical(crit_rate):
					dmg = DamageSystem.apply_critical(dmg, crit_dmg)
					## Critical popup
					var popup_script = preload("res://scripts/combat/damage_popup.gd")
					var popup = popup_script.new()
					popup.position = Vector2(randf_range(-15, 15), -35)
					popup.setup("CRIT!", Color(1.0, 0.3, 0.3))
					monster.add_child(popup)
				monster.take_damage(dmg)

	## Efek selesai
	var timer := get_tree().create_timer(attack_duration)
	timer.timeout.connect(func():
		is_attacking = false
		attack_effect.visible = false
	)


## ==================== DAMAGE ====================


func receive_damage(amount: int) -> void:
	if invincible:
		return
	if PlayerManager.is_initialized:
		var defense: int = PlayerManager.get_defense()
		var actual_damage: int = maxi(amount - defense, 1)
		PlayerManager.damage(actual_damage)
		_refresh_health_bar()
		## Invincibility frames
		invincible = true
		invincible_timer = invincible_duration
		blink_time = 0.0
		## Popup
		var popup_script = preload("res://scripts/combat/damage_popup.gd")
		var popup = popup_script.new()
		popup.position = Vector2(randf_range(-10, 10), -30)
		popup.setup(str(actual_damage), Color(1.0, 0.3, 0.3))
		add_child(popup)
	else:
		var actual_damage: int = maxi(amount - 5, 1)
		invincible = true
		invincible_timer = invincible_duration
		blink_time = 0.0


## ==================== INPUT ====================


func _input(event: InputEvent) -> void:
	## Desktop attack
	if event.is_action_pressed("ui_accept"):
		perform_attack()

	## Mouse click attack
	if event is InputEventMouseButton and event.pressed:
		if event.button_index == MOUSE_BUTTON_LEFT:
			perform_attack()

	## Touch input
	if event is InputEventScreenTouch:
		if event.pressed:
			if event.position.x < get_viewport_rect().size.x * 0.5:
				analog_active = true
				analog_center = event.position
				analog_current = Vector2.ZERO
				_touch_index = event.index
				analog_layer.visible = true
				analog_bg.position = analog_center - Vector2(analog_radius, analog_radius)
				analog_knob.position = analog_center - Vector2(15, 15)
			## Touch di sisi kanan = attack
			else:
				perform_attack()
		else:
			if event.index == _touch_index:
				analog_active = false
				analog_current = Vector2.ZERO
				analog_layer.visible = false
				_touch_index = -1

	elif event is InputEventScreenDrag and analog_active and event.index == _touch_index:
		var diff: Vector2 = event.position - analog_center
		if diff.length() > analog_radius:
			diff = diff.normalized() * analog_radius
		analog_current = diff
		analog_knob.position = analog_center + diff - Vector2(15, 15)


## ==================== VIRTUAL ANALOG ====================


func _setup_virtual_analog() -> void:
	analog_layer = CanvasLayer.new()
	analog_layer.layer = 60
	analog_layer.visible = false
	add_child(analog_layer)

	analog_bg = ColorRect.new()
	analog_bg.size = Vector2(analog_radius * 2, analog_radius * 2)
	analog_bg.color = Color(1, 1, 1, 0.15)
	analog_bg.z_index = 50
	analog_layer.add_child(analog_bg)

	analog_knob = ColorRect.new()
	analog_knob.size = Vector2(30, 30)
	analog_knob.color = Color(1, 1, 1, 0.4)
	analog_knob.z_index = 51
	analog_layer.add_child(analog_knob)
