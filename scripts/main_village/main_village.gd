## MainVillage - Scene utama desa. Mengkoordinasi seluruh modul.
extends Node2D

func _ready() -> void:
	if not PlayerManager.is_initialized:
		PlayerManager.initialize()
	## 1. Ground + paths + plaza
	var tilemap := load("res://scripts/village/village_tilemap.gd").new()
	tilemap.name = "VillageTileMap"
	add_child(tilemap)
	## 2. Bangunan
	var buildings := load("res://scripts/village/building_manager.gd").new()
	buildings.name = "BuildingManager"
	add_child(buildings)
	## 3. NPC
	var npcs := load("res://scripts/village/npc_manager.gd").new()
	npcs.name = "NPCManager"
	add_child(npcs)
	## 4. Dekorasi
	var deco := load("res://scripts/village/decoration_manager.gd").new()
	deco.name = "DecorationManager"
	add_child(deco)
	## 5. Kamera
	var cam := load("res://scripts/village/village_camera.gd").new()
	cam.name = "VillageCamera"
	add_child(cam)
	cam.make_current()
	## 6. HUD
	var hud := CanvasLayer.new()
	hud.set_script(load("res://scripts/ui/village_hud.gd"))
	hud.name = "VillageHUD"
	add_child(hud)
	## 7. MiniMap
	var minimap := load("res://scripts/village/mini_map.gd").new()
	minimap.name = "MiniMap"
	add_child(minimap)
	## 8. Debug panel
	var debug := load("res://scripts/ui/debug_panel.gd").new()
	debug.name = "DebugPanel"
	add_child(debug)
	## 9. NPC interaction signals
	PlayerManager.hp_changed.connect(func(_c, _m): _refresh_hud())
	PlayerManager.gold_changed.connect(func(_g): _refresh_hud())
	PlayerManager.level_changed.connect(func(_l): _refresh_hud())
	PlayerManager.energy_changed.connect(func(_e, _m): _refresh_hud())
	print("[MainVillage] Loaded - %dx%d tiles" % [VillageData.MAP_WIDTH, VillageData.MAP_HEIGHT])

func _refresh_hud() -> void:
	var hud := get_node_or_null("VillageHUD")
	if hud and hud.has_method("refresh"):
		hud.refresh()
