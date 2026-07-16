## SaveManager - Manajer penyimpanan data game
## Mengelola save/load menggunakan LocalStorage via file JSON di Godot.
extends Node

## Path file save
const SAVE_PATH := "user://save_game.json"

## Path default save (untuk reset)
const DEFAULT_SAVE := {
	"player": {
		"name": "",
		"gender": "male",
	},
	"stats": {
		"level": 1,
		"exp": 0,
		"exp_to_next": 100,
		"hp": 100,
		"max_hp": 100,
		"energy": 100,
		"max_energy": 100,
		"attack": 10,
		"defense": 5,
	},
	"currency": {
		"gold": 1000,
		"diamond": 0,
	},
	"equipment": {
		"weapon": "",
		"armor": "",
		"accessory": "",
	},
	"progress": {
		"map_level": 0,
		"location": "Main Village",
		"play_time": 0.0,
		"created_at": "",
	},
	"settings": {
		"volume_music": 0.7,
		"volume_sfx": 0.8,
		"language": "id",
	}
}

## Data save aktif
var current_data: Dictionary = {}


## Dipanggil saat node masuk tree
func _ready() -> void:
	print("[SaveManager] Initialized")


## Cek apakah save file ada
func has_save() -> bool:
	return FileAccess.file_exists(SAVE_PATH)


## Load data dari file
func load_save() -> Dictionary:
	if not has_save():
		current_data = DEFAULT_SAVE.duplicate(true)
		return current_data
	
	var file := FileAccess.open(SAVE_PATH, FileAccess.READ)
	if file == null:
		push_error("[SaveManager] Failed to open save file")
		current_data = DEFAULT_SAVE.duplicate(true)
		return current_data
	
	var json_string := file.get_as_text()
	file.close()
	
	var json := JSON.new()
	var error := json.parse(json_string)
	if error != OK:
		push_error("[SaveManager] Failed to parse save file")
		current_data = DEFAULT_SAVE.duplicate(true)
		return current_data
	
	current_data = json.data
	print("[SaveManager] Save loaded successfully")
	return current_data


## Simpan data ke file
func save_game() -> void:
	var file := FileAccess.open(SAVE_PATH, FileAccess.WRITE)
	if file == null:
		push_error("[SaveManager] Failed to open save file for writing")
		return
	
	file.store_string(JSON.stringify(current_data, "\t"))
	file.close()
	print("[SaveManager] Game saved")


## Simpan data spesifik
func save_data(key: String, value: Variant) -> void:
	current_data[key] = value
	save_game()


## Ambil data spesifik dengan default
func get_data(key: String, default: Variant = null) -> Variant:
	return current_data.get(key, default)


## Reset save ke default
func reset_save() -> void:
	current_data = DEFAULT_SAVE.duplicate(true)
	current_data["progress"]["created_at"] = Time.get_datetime_string_from_system()
	save_game()
	print("[SaveManager] Save reset to defaults")


## Hapus file save
func delete_save() -> void:
	if has_save():
		DirAccess.remove_absolute(SAVE_PATH)
		print("[SaveManager] Save file deleted")
	current_data = {}
