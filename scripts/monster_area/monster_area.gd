## MonsterArea - Scene utama Monster Area Level 1
extends Node2D

func _ready() -> void:
	if not PlayerManager.is_initialized:
		PlayerManager.initialize()

	## 1. Environment (ground, paths, trees, decorations)
	var env_script = preload("res://scripts/monster_area/environment_manager.gd")
	if env_script:
		var env = env_script.new()
		env.name = "EnvironmentManager"
		add_child(env)
	else:
		push_error("[MonsterArea] Failed to load EnvironmentManager script")

	## 2. Spawn Manager (monster spawn points)
	var spawner_script = preload("res://scripts/monster_area/spawn_manager.gd")
	if spawner_script:
		var spawner = spawner_script.new()
		spawner.name = "SpawnManager"
		add_child(spawner)
	else:
		push_error("[MonsterArea] Failed to load SpawnManager script")

	## 3. Return Portal
	var portal_script = preload("res://scripts/monster_area/portal.gd")
	if portal_script:
		var portal = Area2D.new()
		portal.set_script(portal_script)
		portal.position = MonsterAreaData.RETURN_PORTAL
		portal.collision_layer = 4
		portal.collision_mask = 0
		add_child(portal)
	else:
		push_error("[MonsterArea] Failed to load Portal script")

	## 4. Player
	var player_script = preload("res://scripts/monster_area/player_controller.gd")
	if player_script:
		var player = player_script.new()
		player.name = "Player"
		player.position = MonsterAreaData.PLAYER_SPAWN
		player.collision_layer = 1
		player.collision_mask = 2
		add_child(player)
	else:
		push_error("[MonsterArea] Failed to load PlayerController script")

	## 5. HUD
	var hud_script = preload("res://scripts/monster_area/monster_area_hud.gd")
	if hud_script:
		var hud = CanvasLayer.new()
		hud.set_script(hud_script)
		hud.name = "MonsterAreaHUD"
		add_child(hud)
	else:
		push_error("[MonsterArea] Failed to load MonsterAreaHUD script")

	## 6. MiniMap
	var minimap_script = preload("res://scripts/monster_area/monster_area_minimap.gd")
	if minimap_script:
		var minimap = minimap_script.new()
		minimap.name = "MonsterAreaMiniMap"
		add_child(minimap)
	else:
		push_error("[MonsterArea] Failed to load MonsterAreaMiniMap script")

	## 7. Lighting overlay (subtle)
	var lighting = CanvasLayer.new()
	lighting.layer = 5
	var overlay = ColorRect.new()
	overlay.set_anchors_preset(Control.PRESET_FULL_RECT)
	overlay.color = Color(0.1, 0.15, 0.05, 0.08)
	overlay.mouse_filter = Control.MOUSE_FILTER_IGNORE
	lighting.add_child(overlay)
	add_child(lighting)

	print("[MonsterArea] Loaded - %s" % MonsterAreaData.AREA_NAME)
