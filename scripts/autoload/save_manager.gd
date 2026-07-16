## SaveManager - Manajer penyimpanan data game
## Mengelola save/load menggunakan file JSON di direktori user Godot.
extends Node

## Path file save
const SAVE_PATH: String = "user://save_game.json"

## Data save aktif
var current_data: Dictionary = {}


func _ready() -> void:
	print("[SaveManager] Initialized")


## Cek apakah file save ada
func has_save() -> bool:
	return FileAccess.file_exists(SAVE_PATH)


## Load data dari file JSON
func load_save() -> Dictionary:
	if not has_save():
		current_data = CharacterData.DEFAULT_PLAYER_DATA.duplicate(true)
		return current_data
	
	var file := FileAccess.open(SAVE_PATH, FileAccess.READ)
	if file == null:
		push_warning("[SaveManager] Failed to open save file")
		current_data = CharacterData.DEFAULT_PLAYER_DATA.duplicate(true)
		return current_data
	
	var json_text := file.get_as_text()
	file.close()
	
	var json := JSON.new()
	var error := json.parse(json_text)
	if error != OK:
		push_warning("[SaveManager] Failed to parse save JSON")
		current_data = CharacterData.DEFAULT_PLAYER_DATA.duplicate(true)
		return current_data
	
	current_data = json.data as Dictionary
	if current_data.is_empty():
		current_data = CharacterData.DEFAULT_PLAYER_DATA.duplicate(true)
	
	print("[SaveManager] Save loaded")
	return current_data


## Simpan data ke file JSON
func save_game() -> void:
	var file := FileAccess.open(SAVE_PATH, FileAccess.WRITE)
	if file == null:
		push_warning("[SaveManager] Failed to open save file for writing")
		return
	
	file.store_string(JSON.stringify(current_data, "\t"))
	file.close()
	print("[SaveManager] Game saved")


## Simpan data spesifik berdasarkan key
func save_data(key: String, data: Variant) -> void:
	current_data[key] = data
	save_game()


## Ambil data spesifik berdasarkan key
func get_data(key: String, default_value: Variant = null) -> Variant:
	if current_data.has(key):
		return current_data[key]
	return default_value


## Reset save ke default
func reset_save() -> void:
	current_data = CharacterData.DEFAULT_PLAYER_DATA.duplicate(true)
	if has_save():
		DirAccess.remove_absolute(SAVE_PATH)
		print("[SaveManager] Save file deleted")
	print("[SaveManager] Save reset to default")
