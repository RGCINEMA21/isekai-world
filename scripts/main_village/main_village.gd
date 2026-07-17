## MainVillage - Scene utama desa. Mengkoordinasi seluruh modul.
extends Node2D

func _ready() -> void:
	if not PlayerManager.is_initialized:
		PlayerManager.initialize()
	
	## 1. Ground + paths + plaza
	var tilemap_script = preload("res://scripts/village/village_tilemap.gd")
	if tilemap_script:
		var tilemap = tilemap_script.new()
		tilemap.name = "VillageTileMap"
		add_child(tilemap)
	else:
		push_error("[MainVillage] Failed to load VillageTileMap script")
	
	## 2. Bangunan
	var buildings_script = preload("res://scripts/village/building_manager.gd")
	if buildings_script:
		var buildings = buildings_script.new()
		buildings.name = "BuildingManager"
		add_child(buildings)
	else:
		push_error("[MainVillage] Failed to load BuildingManager script")
	
	## 3. NPC
	var npcs_script = preload("res://scripts/village/npc_manager.gd")
	if npcs_script:
		var npcs = npcs_script.new()
		npcs.name = "NPCManager"
		add_child(npcs)
	else:
		push_error("[MainVillage] Failed to load NPCManager script")
	
	## 4. Dekorasi
	var deco_script = preload("res://scripts/village/decoration_manager.gd")
	if deco_script:
		var deco = deco_script.new()
		deco.name = "DecorationManager"
		add_child(deco)
	else:
		push_error("[MainVillage] Failed to load DecorationManager script")
	
	## 5. Kamera
	var cam_script = preload("res://scripts/village/village_camera.gd")
	if cam_script:
		var cam = cam_script.new()
		cam.name = "VillageCamera"
		add_child(cam)
		cam.make_current()
	else:
		push_error("[MainVillage] Failed to load VillageCamera script")
	
	## 6. HUD
	var hud_script = preload("res://scripts/ui/village_hud.gd")
	if hud_script:
		var hud = CanvasLayer.new()
		hud.set_script(hud_script)
		hud.name = "VillageHUD"
		add_child(hud)
	else:
		push_error("[MainVillage] Failed to load VillageHUD script")
	
	## 7. MiniMap
	var minimap_script = preload("res://scripts/village/mini_map.gd")
	if minimap_script:
		var minimap = minimap_script.new()
		minimap.name = "MiniMap"
		add_child(minimap)
	else:
		push_error("[MainVillage] Failed to load MiniMap script")
	
	## 8. Debug panel
	var debug_script = preload("res://scripts/ui/debug_panel.gd")
	if debug_script:
		var debug = debug_script.new()
		debug.name = "DebugPanel"
		add_child(debug)
	else:
		push_error("[MainVillage] Failed to load DebugPanel script")
	
	## 9. NPC interaction signals
	if PlayerManager.hp_changed and not PlayerManager.hp_changed.is_connected(_on_hp_changed):
		PlayerManager.hp_changed.connect(_on_hp_changed)
	if PlayerManager.gold_changed and not PlayerManager.gold_changed.is_connected(_on_gold_changed):
		PlayerManager.gold_changed.connect(_on_gold_changed)
	if PlayerManager.level_changed and not PlayerManager.level_changed.is_connected(_on_level_changed):
		PlayerManager.level_changed.connect(_on_level_changed)
	if PlayerManager.energy_changed and not PlayerManager.energy_changed.is_connected(_on_energy_changed):
		PlayerManager.energy_changed.connect(_on_energy_changed)
	


func _on_hp_changed(_current: int, _maximum: int) -> void:
	_refresh_hud()


func _on_gold_changed(_gold: int) -> void:
	_refresh_hud()


func _on_level_changed(_level: int) -> void:
	_refresh_hud()


func _on_energy_changed(_current: int, _maximum: int) -> void:
	_refresh_hud()


func _refresh_hud() -> void:
	var hud := get_node_or_null("VillageHUD")
	if hud and hud.has_method("refresh"):
		hud.refresh()
