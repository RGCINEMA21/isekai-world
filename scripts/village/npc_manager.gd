## NPCManager - Menempatkan NPC di depan setiap bangunan
extends Node2D

var ts: int
var _village_npc_script = null

func _ready() -> void:
	ts = VillageData.TILE_SIZE
	_village_npc_script = preload("res://scripts/npc/village_npc.gd")
	
	var lookup: Dictionary = {}
	for b: Dictionary in VillageData.BUILDINGS:
		lookup[b["id"]] = b
	for n: Dictionary in VillageData.NPCs:
		var bid: String = n["building_id"]
		if not lookup.has(bid):
			continue
		var bdata: Dictionary = lookup[bid]
		var npc_x: float = bdata["tile_x"] * ts + ts * 0.5
		var npc_y: float = (bdata["tile_y"] + 2) * ts + ts * 0.5
		var npc = Area2D.new()
		if _village_npc_script:
			npc.set_script(_village_npc_script)
		npc.position = Vector2(npc_x, npc_y)
		npc.set("npc_id", n["npc_id"])
		npc.set("npc_name", n["npc_name"])
		npc.collision_layer = 2
		npc.collision_mask = 0
		add_child(npc)
