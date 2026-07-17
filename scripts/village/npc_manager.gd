## NPCManager - Menempatkan NPC di depan setiap bangunan
extends Node2D

var ts: int

func _ready() -> void:
	ts = VillageData.TILE_SIZE
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
		var npc := Area2D.new()
		npc.set_script(load("res://scripts/npc/village_npc.gd"))
		npc.position = Vector2(npc_x, npc_y)
		npc.set("npc_id", n["npc_id"])
		npc.set("npc_name", n["npc_name"])
		npc.collision_layer = 2
		npc.collision_mask = 0
		add_child(npc)
