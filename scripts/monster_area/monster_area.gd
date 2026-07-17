## MonsterArea - Scene utama Monster Area Level 1
extends Node2D

func _ready() -> void:
	if not PlayerManager.is_initialized:
		PlayerManager.initialize()

	## 1. Environment (ground, paths, trees, decorations)
	var env := load("res://scripts/monster_area/environment_manager.gd").new()
	env.name = "EnvironmentManager"
	add_child(env)

	## 2. Spawn Manager (monster spawn points)
	var spawner := load("res://scripts/monster_area/spawn_manager.gd").new()
	spawner.name = "SpawnManager"
	add_child(spawner)

	## 3. Return Portal
	var portal_script = load("res://scripts/monster_area/portal.gd")
	var portal := Area2D.new()
	portal.set_script(portal_script)
	portal.position = MonsterAreaData.RETURN_PORTAL
	portal.collision_layer = 4
	portal.collision_mask = 0
	add_child(portal)

	## 4. Player
	var player := load("res://scripts/monster_area/player_controller.gd").new()
	player.name = "Player"
	player.position = MonsterAreaData.PLAYER_SPAWN
	player.collision_layer = 1
	player.collision_mask = 2  # Collide dengan NPC/objects
	add_child(player)

	## 5. HUD
	var hud := CanvasLayer.new()
	hud.set_script(load("res://scripts/monster_area/monster_area_hud.gd"))
	hud.name = "MonsterAreaHUD"
	add_child(hud)

	## 6. MiniMap
	var minimap := load("res://scripts/monster_area/monster_area_minimap.gd").new()
	minimap.name = "MonsterAreaMiniMap"
	add_child(minimap)

	## 7. Lighting overlay (subtle)
	var lighting := CanvasLayer.new()
	lighting.layer = 5
	var overlay := ColorRect.new()
	overlay.set_anchors_preset(Control.PRESET_FULL_RECT)
	overlay.color = Color(0.1, 0.15, 0.05, 0.08)
	overlay.mouse_filter = Control.MOUSE_FILTER_IGNORE
	lighting.add_child(overlay)
	add_child(lighting)

	print("[MonsterArea] Loaded - %s" % MonsterAreaData.AREA_NAME)
