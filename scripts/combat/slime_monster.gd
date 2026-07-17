## SlimeMonster - Green Slime dengan AI sederhana
extends CharacterBody2D

## ==================== DATA ====================
var monster_id: String = "green_slime"
var monster_name: String = "Green Slime"
var max_hp: int = 30
var current_hp: int = 30
var attack: int = 5
var defense: int = 1
var move_speed: float = 120.0
var exp_reward: int = 10
var detection_radius: float = 150.0
var attack_radius: float = 35.0
var attack_cooldown: float = 1.5
var respawn_time: float = 8.0

## ==================== STATE ====================
enum State { IDLE, CHASE, ATTACK, HURT, DEAD }
var current_state: State = State.IDLE
var spawn_position: Vector2 = Vector2.ZERO
var attack_timer: float = 0.0
var hurt_timer: float = 0.0
var death_timer: float = 0.0
var idle_timer: float = 0.0
var is_alive: bool = true

## ==================== VISUAL ====================
var body_rect: ColorRect
var eye_l: ColorRect
var eye_r: ColorRect
var highlight_rect: ColorRect
var bob_time: float = 0.0
var base_y: float = 0.0

## ==================== COMPONENTS ====================
var health_bar_node: Node2D
var hit_area: Area2D
var detection_area: Area2D

## ==================== SIGNALS ====================
signal died(monster_ref: Node2D)
signal took_damage(amount: int)


func _ready() -> void:
	spawn_position = position
	base_y = position.y
	current_hp = max_hp
	_build_visual()
	_build_health_bar()
	_build_areas()
	_change_state(State.IDLE)


func _build_visual() -> void:
	## Badan slime (kotak hijau)
	body_rect = ColorRect.new()
	body_rect.size = Vector2(24, 20)
	body_rect.position = Vector2(-12, -10)
	body_rect.color = Color(0.3, 0.75, 0.3)
	body_rect.z_index = 5
	add_child(body_rect)

	## Highlight atas
	highlight_rect = ColorRect.new()
	highlight_rect.size = Vector2(16, 6)
	highlight_rect.position = Vector2(-8, -8)
	highlight_rect.color = Color(0.45, 0.85, 0.4)
	highlight_rect.z_index = 6
	add_child(highlight_rect)

	## Mata kiri
	eye_l = ColorRect.new()
	eye_l.size = Vector2(5, 5)
	eye_l.position = Vector2(-8, -6)
	eye_l.color = Color.WHITE
	eye_l.z_index = 7
	add_child(eye_l)

	## Pupil kiri
	var pupil_l := ColorRect.new()
	pupil_l.size = Vector2(3, 3)
	pupil_l.position = Vector2(-7, -5)
	pupil_l.color = Color.BLACK
	pupil_l.z_index = 8
	add_child(pupil_l)

	## Mata kanan
	eye_r = ColorRect.new()
	eye_r.size = Vector2(5, 5)
	eye_r.position = Vector2(3, -6)
	eye_r.color = Color.WHITE
	eye_r.z_index = 7
	add_child(eye_r)

	## Pupil kanan
	var pupil_r := ColorRect.new()
	pupil_r.size = Vector2(3, 3)
	pupil_r.position = Vector2(4, -5)
	pupil_r.color = Color.BLACK
	pupil_r.z_index = 8
	add_child(pupil_r)


func _build_health_bar() -> void:
	var hb_script = preload("res://scripts/combat/health_bar.gd")
	health_bar_node = hb_script.new()
	health_bar_node.name = "HealthBar"
	add_child(health_bar_node)
	health_bar_node.set_offset_y(-18)
	health_bar_node.update_bar(current_hp, max_hp)


func _build_areas() -> void:
	## Detection area
	detection_area = Area2D.new()
	detection_area.collision_layer = 0
	detection_area.collision_mask = 1
	var det_col := CollisionShape2D.new()
	var det_shape := CircleShape2D.new()
	det_shape.radius = detection_radius
	det_col.shape = det_shape
	detection_area.add_child(det_col)
	add_child(detection_area)

	## Hit area (saat attack)
	hit_area = Area2D.new()
	hit_area.collision_layer = 0
	hit_area.collision_mask = 1
	hit_area.monitoring = false
	var hit_col := CollisionShape2D.new()
	var hit_shape := CircleShape2D.new()
	hit_shape.radius = attack_radius
	hit_col.shape = hit_shape
	hit_area.add_child(hit_col)
	add_child(hit_area)


## ==================== STATE MACHINE ====================


func _change_state(new_state: State) -> void:
	current_state = new_state
	match new_state:
		State.IDLE:
			idle_timer = randf_range(1.0, 3.0)
		State.CHASE:
			pass
		State.ATTACK:
			attack_timer = attack_cooldown
		State.HURT:
			hurt_timer = 0.3
			## Flash merah
			body_rect.color = Color(0.9, 0.2, 0.2)
		State.DEAD:
			death_timer = 1.0
			is_alive = false
			if health_bar_node:
				health_bar_node.visible = false


func _physics_process(delta: float) -> void:
	if not is_alive and current_state != State.DEAD:
		return

	match current_state:
		State.IDLE:
			_state_idle(delta)
		State.CHASE:
			_state_chase(delta)
		State.ATTACK:
			_state_attack(delta)
		State.HURT:
			_state_hurt(delta)
		State.DEAD:
			_state_dead(delta)

	## Bobbing animation
	if current_state != State.DEAD:
		bob_time += delta * 3.0
		body_rect.position.y = -10 + sin(bob_time) * 2.0
		highlight_rect.position.y = -8 + sin(bob_time) * 2.0
		eye_l.position.y = -6 + sin(bob_time) * 2.0
		eye_r.position.y = -6 + sin(bob_time) * 2.0


func _state_idle(delta: float) -> void:
	idle_timer -= delta
	## Cari player
	var player := _find_player()
	if player:
		var dist: float = position.distance_to(player.position)
		if dist <= detection_radius:
			_change_state(State.CHASE)
			return
	if idle_timer <= 0.0:
		idle_timer = randf_range(1.0, 3.0)


func _state_chase(_delta: float) -> void:
	var player := _find_player()
	if not player:
		_change_state(State.IDLE)
		return

	var dist: float = position.distance_to(player.position)

	## Kembali ke spawn jika player terlalu jauh
	if dist > detection_radius * 1.5:
		_change_state(State.IDLE)
		return

	## Attack jika cukup dekat
	if dist <= attack_radius:
		_change_state(State.ATTACK)
		return

	## Bergerak ke player
	var dir: Vector2 = (player.position - position).normalized()
	velocity = dir * move_speed
	move_and_slide()

	## Flip visual
	if dir.x < 0:
		body_rect.scale.x = -1
		eye_l.scale.x = -1
		eye_r.scale.x = -1
		highlight_rect.scale.x = -1
	elif dir.x > 0:
		body_rect.scale.x = 1
		eye_l.scale.x = 1
		eye_r.scale.x = 1
		highlight_rect.scale.x = 1


func _state_attack(delta: float) -> void:
	var player := _find_player()
	if not player:
		_change_state(State.IDLE)
		return

	var dist: float = position.distance_to(player.position)

	## Kembali chase jika player menjauh
	if dist > attack_radius * 1.5:
		_change_state(State.CHASE)
		return

	attack_timer -= delta
	if attack_timer <= 0.0:
		## Serang player
		hit_area.monitoring = true
		await get_tree().create_timer(0.15).timeout
		hit_area.monitoring = false
		attack_timer = attack_cooldown

	velocity = Vector2.ZERO


func _state_hurt(delta: float) -> void:
	hurt_timer -= delta
	if hurt_timer <= 0.0:
		body_rect.color = Color(0.3, 0.75, 0.3)
		## Cek player masih dekat
		var player := _find_player()
		if player and position.distance_to(player.position) <= detection_radius:
			_change_state(State.CHASE)
		else:
			_change_state(State.IDLE)


func _state_dead(delta: float) -> void:
	death_timer -= delta
	modulate.a = death_timer / 1.0
	if death_timer <= 0.0:
		_hide_monster()


## ==================== DAMAGE ====================


func take_damage(damage: int) -> void:
	if not is_alive:
		return
	var actual_damage: int = maxi(damage - defense, 1)
	current_hp -= actual_damage
	current_hp = maxi(current_hp, 0)

	if health_bar_node:
		health_bar_node.update_bar(current_hp, max_hp)

	## Popup damage
	_spawn_damage_popup(str(actual_damage), Color.WHITE)
	took_damage.emit(actual_damage)

	if current_hp <= 0:
		_change_state(State.DEAD)
		died.emit(self)
	else:
		_change_state(State.HURT)


func _spawn_damage_popup(text: String, color: Color) -> void:
	var popup_script = preload("res://scripts/combat/damage_popup.gd")
	var popup = popup_script.new()
	popup.position = Vector2(randf_range(-10, 10), -25)
	popup.setup(text, color)
	add_child(popup)


## ==================== HELPERS ====================


func _find_player() -> Node:
	var players := get_tree().get_nodes_in_group("player")
	if players.size() > 0:
		return players[0]
	return null


func _hide_monster() -> void:
	visible = false
	set_physics_process(false)
	if hit_area:
		hit_area.set_deferred("monitoring", false)
	if detection_area:
		detection_area.set_deferred("monitoring", false)


func respawn() -> void:
	current_hp = max_hp
	is_alive = true
	current_state = State.IDLE
	position = spawn_position
	velocity = Vector2.ZERO
	modulate.a = 1.0
	visible = true
	set_physics_process(true)
	body_rect.color = Color(0.3, 0.75, 0.3)
	if hit_area:
		hit_area.monitoring = false
	if detection_area:
		detection_area.monitoring = true
	if health_bar_node:
		health_bar_node.visible = true
		health_bar_node.update_bar(current_hp, max_hp)
