## AudioManager - Manajer audio game
## Mengelola BGM dan SFX dengan volume terpisah.
extends Node

## Volume default
var volume_music: float = 0.7
var volume_sfx: float = 0.8
var is_muted: bool = false

## Audio player untuk BGM
var bgm_player: AudioStreamPlayer


func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	_setup_bgm_player()
	_load_settings()


## Setup audio player BGM
func _setup_bgm_player() -> void:
	bgm_player = AudioStreamPlayer.new()
	bgm_player.bus = "Master"
	add_child(bgm_player)


## Load settingan audio dari save
func _load_settings() -> void:
	var settings: Dictionary = SaveManager.get_data("settings", {})
	volume_music = float(settings.get("volume_music", 0.7))
	volume_sfx = float(settings.get("volume_sfx", 0.8))
	_apply_volumes()


## Terapkan volume ke bus
func _apply_volumes() -> void:
	if is_muted:
		AudioServer.set_bus_volume_db(0, linear_to_db(0.0))
	else:
		AudioServer.set_bus_volume_db(0, linear_to_db(volume_music))


## Set volume musik (0.0 - 1.0)
func set_volume_music(vol: float) -> void:
	volume_music = clampf(vol, 0.0, 1.0)
	_apply_volumes()
	_save_settings()


## Set volume SFX (0.0 - 1.0)
func set_volume_sfx(vol: float) -> void:
	volume_sfx = clampf(vol, 0.0, 1.0)
	_save_settings()


## Toggle mute
func toggle_mute() -> void:
	is_muted = not is_muted
	_apply_volumes()
	_save_settings()


## Play BGM
func play_bgm(stream: AudioStream) -> void:
	if bgm_player.playing:
		bgm_player.stop()
	bgm_player.stream = stream
	bgm_player.play()


## Stop BGM
func stop_bgm() -> void:
	bgm_player.stop()


## Simpan settingan audio
func _save_settings() -> void:
	var settings: Dictionary = SaveManager.get_data("settings", {})
	settings["volume_music"] = volume_music
	settings["volume_sfx"] = volume_sfx
	SaveManager.save_data("settings", settings)
