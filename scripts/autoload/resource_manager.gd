## ResourceManager - Manajer resource game
## Mengelola preloading aset dan resource pooling.
extends Node


func _ready() -> void:


## Preload resource dengan path
func preload_resource(path: String) -> Resource:
	var resource := load(path)
	if resource == null:
		push_warning("[ResourceManager] Failed to preload: %s" % path)
	return resource


## Ambil scene dengan path
func get_scene(path: String) -> PackedScene:
	var scene := load(path) as PackedScene
	if scene == null:
		push_warning("[ResourceManager] Failed to load scene: %s" % path)
	return scene
