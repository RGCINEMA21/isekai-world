## CharacterCreation - Sistem pembuatan karakter lengkap
## Membangun seluruh UI secara programmatic untuk menghindari masalah .tscn manual.
extends Control

## State kustomisasi karakter saat ini
var char_state: Dictionary = {
	"name": "",
	"gender": "male",
	"skin_color": 0,
	"hair_style": 0,
	"hair_color": 0,
	"eyes": 0,
	"clothes": 0,
}

## Referensi UI yang perlu diupdate
var name_input: LineEdit
var preview_container: Control
var gender_male_btn: Button
var gender_female_btn: Button
var skin_label: Label
var hair_style_label: Label
var hair_color_label: Label
var eyes_label: Label
var clothes_label: Label
var summary_label: Label
var error_label: Label

## Jumlah opsi per kategori
var skin_count: int = CharacterData.SKIN_COLORS.size()
var hair_style_count: int = CharacterData.HAIR_STYLES.size()
var hair_color_count: int = CharacterData.HAIR_COLORS.size()
var eyes_count: int = CharacterData.EYE_STYLES.size()
var clothes_count: int = CharacterData.CLOTHES_STYLES.size()


func _ready() -> void:
	print("[CharacterCreation] Opened")
	_build_ui()
	_update_all_labels()
	_update_preview()


## ==================== UI BUILDING ====================


func _build_ui() -> void:
	# Background
	var bg := ColorRect.new()
	bg.name = "Background"
	bg.color = Color(0.08, 0.10, 0.18)
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(bg)
	
	# Main scroll container
	var scroll := ScrollContainer.new()
	scroll.name = "ScrollContainer"
	scroll.set_anchors_preset(Control.PRESET_FULL_RECT)
	scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	scroll.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	add_child(scroll)
	
	# Main HBox - split preview and options
	var main_hbox := HBoxContainer.new()
	main_hbox.name = "MainHBox"
	main_hbox.set_anchors_preset(Control.PRESET_FULL_RECT)
	main_hbox.add_theme_constant_override("separation", 20)
	scroll.add_child(main_hbox)
	
	# Left side - Options panel
	_build_options_panel(main_hbox)
	
	# Right side - Preview panel
	_build_preview_panel(main_hbox)


## Membangun panel opsi kustomisasi (kiri)
func _build_options_panel(parent: Control) -> void:
	var panel := VBoxContainer.new()
	panel.name = "OptionsPanel"
	panel.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	panel.size_flags_vertical = Control.SIZE_EXPAND_FILL
	panel.add_theme_constant_override("separation", 8)
	parent.add_child(panel)
	
	# Title
	var title := Label.new()
	title.text = "CREATE YOUR CHARACTER"
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.add_theme_font_size_override("font_size", 28)
	panel.add_child(title)
	
	panel.add_child(_make_separator())
	
	# Name section
	_build_name_section(panel)
	
	# Gender section
	_build_gender_section(panel)
	
	# Skin Color section
	_build_option_section(panel, "Warna Kulit", "skin_color", skin_count, func(i): return CharacterData.SKIN_COLORS[i]["name"])
	
	# Hair Style section
	_build_option_section(panel, "Gaya Rambut", "hair_style", hair_style_count, func(i): return CharacterData.HAIR_STYLES[i]["name"])
	
	# Hair Color section
	_build_option_section(panel, "Warna Rambut", "hair_color", hair_color_count, func(i): return CharacterData.HAIR_COLORS[i]["name"])
	
	# Eyes section
	_build_option_section(panel, "Mata", "eyes", eyes_count, func(i): return CharacterData.EYE_STYLES[i]["name"])
	
	# Clothes section
	_build_option_section(panel, "Pakaian Awal", "clothes", clothes_count, func(i): return CharacterData.CLOTHES_STYLES[i]["name"])
	
	panel.add_child(_make_separator())
	
	# Error label
	error_label = Label.new()
	error_label.name = "ErrorLabel"
	error_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	error_label.add_theme_font_size_override("font_size", 16)
	error_label.add_theme_color_override("font_color", Color(1.0, 0.35, 0.35))
	error_label.visible = false
	panel.add_child(error_label)
	
	# Buttons
	_build_buttons(panel)


## Membangun panel preview (kanan)
func _build_preview_panel(parent: Control) -> void:
	var panel := VBoxContainer.new()
	panel.name = "PreviewPanel"
	panel.custom_minimum_size = Vector2(280, 0)
	panel.size_flags_vertical = Control.SIZE_EXPAND_FILL
	panel.add_theme_constant_override("separation", 10)
	parent.add_child(panel)
	
	var preview_title := Label.new()
	preview_title.text = "Preview"
	preview_title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	preview_title.add_theme_font_size_override("font_size", 22)
	panel.add_child(preview_title)
	
	preview_container = Control.new()
	preview_container.name = "PreviewContainer"
	preview_container.custom_minimum_size = Vector2(240, 320)
	preview_container.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
	panel.add_child(preview_container)
	
	summary_label = Label.new()
	summary_label.name = "SummaryLabel"
	summary_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	summary_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	summary_label.add_theme_font_size_override("font_size", 14)
	summary_label.add_theme_color_override("font_color", Color(0.8, 0.8, 0.8))
	panel.add_child(summary_label)


## Membangun section nama
func _build_name_section(parent: Control) -> void:
	var label := Label.new()
	label.text = "Nama Karakter:"
	label.add_theme_font_size_override("font_size", 18)
	parent.add_child(label)
	
	name_input = LineEdit.new()
	name_input.name = "NameInput"
	name_input.placeholder_text = "Masukkan nama (3-16 karakter)..."
	name_input.max_length = 16
	name_input.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	name_input.text_changed.connect(_on_name_changed)
	parent.add_child(name_input)


## Membangun section gender
func _build_gender_section(parent: Control) -> void:
	var label := Label.new()
	label.text = "Gender:"
	label.add_theme_font_size_override("font_size", 18)
	parent.add_child(label)
	
	var hbox := HBoxContainer.new()
	hbox.add_theme_constant_override("separation", 10)
	parent.add_child(hbox)
	
	gender_male_btn = Button.new()
	gender_male_btn.text = "Male"
	gender_male_btn.custom_minimum_size = Vector2(120, 40)
	gender_male_btn.toggle_mode = true
	gender_male_btn.button_pressed = true
	gender_male_btn.pressed.connect(func(): _set_gender("male"))
	hbox.add_child(gender_male_btn)
	
	gender_female_btn = Button.new()
	gender_female_btn.text = "Female"
	gender_female_btn.custom_minimum_size = Vector2(120, 40)
	gender_female_btn.toggle_mode = true
	gender_female_btn.pressed.connect(func(): _set_gender("female"))
	hbox.add_child(gender_female_btn)


## Membangun section opsi dengan navigasi < >
func _build_option_section(parent: Control, section_title: String, key: String, count: int, label_func: Callable) -> void:
	var label := Label.new()
	label.text = section_title + ":"
	label.add_theme_font_size_override("font_size", 18)
	parent.add_child(label)
	
	var hbox := HBoxContainer.new()
	hbox.add_theme_constant_override("separation", 8)
	parent.add_child(hbox)
	
	var prev_btn := Button.new()
	prev_btn.text = "<"
	prev_btn.custom_minimum_size = Vector2(40, 36)
	prev_btn.pressed.connect(func(): _navigate_option(key, -1, count))
	hbox.add_child(prev_btn)
	
	var value_label := Label.new()
	value_label.name = key + "_label"
	value_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	value_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	value_label.add_theme_font_size_override("font_size", 16)
	hbox.add_child(value_label)
	
	var next_btn := Button.new()
	next_btn.text = ">"
	next_btn.custom_minimum_size = Vector2(40, 36)
	next_btn.pressed.connect(func(): _navigate_option(key, 1, count))
	hbox.add_child(next_btn)
	
	match key:
		"skin_color": skin_label = value_label
		"hair_style": hair_style_label = value_label
		"hair_color": hair_color_label = value_label
		"eyes": eyes_label = value_label
		"clothes": clothes_label = value_label


## Membangun tombol aksi
func _build_buttons(parent: Control) -> void:
	var hbox := HBoxContainer.new()
	hbox.alignment = BoxContainer.ALIGNMENT_CENTER
	hbox.add_theme_constant_override("separation", 12)
	parent.add_child(hbox)
	
	var random_btn := Button.new()
	random_btn.text = "Random"
	random_btn.custom_minimum_size = Vector2(100, 44)
	random_btn.pressed.connect(_random_character)
	hbox.add_child(random_btn)
	
	var reset_btn := Button.new()
	reset_btn.text = "Reset"
	reset_btn.custom_minimum_size = Vector2(100, 44)
	reset_btn.pressed.connect(_reset_character)
	hbox.add_child(reset_btn)
	
	var confirm_btn := Button.new()
	confirm_btn.text = "Confirm"
	confirm_btn.custom_minimum_size = Vector2(120, 44)
	confirm_btn.pressed.connect(_confirm_character)
	hbox.add_child(confirm_btn)
	
	var back_btn := Button.new()
	back_btn.text = "Back"
	back_btn.custom_minimum_size = Vector2(100, 44)
	back_btn.pressed.connect(_on_back)
	hbox.add_child(back_btn)


func _make_separator() -> HSeparator:
	var sep := HSeparator.new()
	sep.custom_minimum_size.y = 4
	return sep


## ==================== LOGIC ====================


func _set_gender(gender: String) -> void:
	char_state["gender"] = gender
	gender_male_btn.button_pressed = (gender == "male")
	gender_female_btn.button_pressed = (gender == "female")
	_update_preview()
	_update_summary()


func _navigate_option(key: String, direction: int, count: int) -> void:
	var current: int = char_state[key]
	current += direction
	if current < 0:
		current = count - 1
	elif current >= count:
		current = 0
	char_state[key] = current
	_update_all_labels()
	_update_preview()
	_update_summary()


func _update_all_labels() -> void:
	if skin_label:
		skin_label.text = CharacterData.SKIN_COLORS[char_state["skin_color"]]["name"]
	if hair_style_label:
		hair_style_label.text = CharacterData.HAIR_STYLES[char_state["hair_style"]]["name"]
	if hair_color_label:
		hair_color_label.text = CharacterData.HAIR_COLORS[char_state["hair_color"]]["name"]
	if eyes_label:
		eyes_label.text = CharacterData.EYE_STYLES[char_state["eyes"]]["name"]
	if clothes_label:
		clothes_label.text = CharacterData.CLOTHES_STYLES[char_state["clothes"]]["name"]


func _update_summary() -> void:
	if not summary_label:
		return
	var gender_text: String = "Laki-laki" if char_state["gender"] == "male" else "Perempuan"
	summary_label.text = (
		"Nama: %s\nGender: %s\nKulit: %s\nRambut: %s (%s)\nMata: %s\nPakaian: %s"
		% [
			char_state["name"] if char_state["name"] != "" else "???",
			gender_text,
			CharacterData.SKIN_COLORS[char_state["skin_color"]]["name"],
			CharacterData.HAIR_STYLES[char_state["hair_style"]]["name"],
			CharacterData.HAIR_COLORS[char_state["hair_color"]]["name"],
			CharacterData.EYE_STYLES[char_state["eyes"]]["name"],
			CharacterData.CLOTHES_STYLES[char_state["clothes"]]["name"],
		]
	)


func _on_name_changed(new_text: String) -> void:
	var clean := ""
	for c in new_text:
		if c.is_valid_identifier() or c == " ":
			clean += c
	char_state["name"] = clean
	_update_summary()


func _random_character() -> void:
	char_state["gender"] = ["male", "female"].pick_random()
	char_state["skin_color"] = randi() % skin_count
	char_state["hair_style"] = randi() % hair_style_count
	char_state["hair_color"] = randi() % hair_color_count
	char_state["eyes"] = randi() % eyes_count
	char_state["clothes"] = randi() % clothes_count
	
	var names := ["Arlen", "Kael", "Rin", "Lyra", "Eren", "Aira", "Leon",
		"Nova", "Zara", "Finn", "Mira", "Orin", "Sera", "Dex"]
	char_state["name"] = names.pick_random()
	name_input.text = char_state["name"]
	
	gender_male_btn.button_pressed = (char_state["gender"] == "male")
	gender_female_btn.button_pressed = (char_state["gender"] == "female")
	
	_update_all_labels()
	_update_preview()
	_update_summary()
	error_label.visible = false


func _reset_character() -> void:
	char_state = {
		"name": "",
		"gender": "male",
		"skin_color": 0,
		"hair_style": 0,
		"hair_color": 0,
		"eyes": 0,
		"clothes": 0,
	}
	name_input.text = ""
	gender_male_btn.button_pressed = true
	gender_female_btn.button_pressed = false
	_update_all_labels()
	_update_preview()
	_update_summary()
	error_label.visible = false


## Konfirmasi - simpan semua data via PlayerManager
func _confirm_character() -> void:
	var player_name: String = char_state["name"].strip_edges()
	
	# Validasi
	if player_name.is_empty():
		_show_error("Nama tidak boleh kosong!")
		return
	if player_name.length() < 3:
		_show_error("Nama minimal 3 karakter!")
		return
	if player_name.length() > 16:
		_show_error("Nama maksimal 16 karakter!")
		return
	
	# Buat data lengkap
	var save_data: Dictionary = PlayerData.DEFAULT_DATA.duplicate(true)
	save_data["identity"]["id"] = PlayerData.generate_id()
	save_data["identity"]["name"] = player_name
	save_data["identity"]["gender"] = char_state["gender"]
	save_data["identity"]["skin_color"] = char_state["skin_color"]
	save_data["identity"]["hair_style"] = char_state["hair_style"]
	save_data["identity"]["hair_color"] = char_state["hair_color"]
	save_data["identity"]["eyes"] = char_state["eyes"]
	save_data["identity"]["clothes"] = char_state["clothes"]
	save_data["equipment"]["weapon"] = PlayerData.WOODEN_SWORD
	save_data["equipment"]["armor"] = PlayerData.BEGINNER_ARMOR
	save_data["progress"]["created_at"] = Time.get_datetime_string_from_system()
	
	# Simpan via SaveManager
	SaveManager.current_data = save_data
	SaveManager.save_game()
	
	# Inisialisasi PlayerManager
	PlayerManager.initialize()
	
	print("[CharacterCreation] Character created: %s (ID: %s)" % [player_name, save_data["identity"]["id"]])
	SceneManager.change_scene("main_village")


func _on_back() -> void:
	SceneManager.change_scene("main_menu")


func _show_error(message: String) -> void:
	error_label.text = message
	error_label.visible = true


## ==================== PREVIEW ====================


func _update_preview() -> void:
	for child in preview_container.get_children():
		child.queue_free()
	
	var skin_color: Color = CharacterData.SKIN_COLORS[char_state["skin_color"]]["color"]
	var hair_color: Color = CharacterData.HAIR_COLORS[char_state["hair_color"]]["color"]
	var eye_color: Color = CharacterData.EYE_STYLES[char_state["eyes"]]["color"]
	var cloth_top: Color = CharacterData.CLOTHES_STYLES[char_state["clothes"]]["top"]
	var cloth_bottom: Color = CharacterData.CLOTHES_STYLES[char_state["clothes"]]["bottom"]
	var is_male: bool = char_state["gender"] == "male"
	
	# Background
	var preview_bg := ColorRect.new()
	preview_bg.color = Color(0.12, 0.14, 0.22)
	preview_bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	preview_container.add_child(preview_bg)
	
	# Char body container
	var char_body := Control.new()
	char_body.name = "CharBody"
	char_body.custom_minimum_size = Vector2(120, 200)
	char_body.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
	char_body.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	char_body.set_anchors_preset(Control.PRESET_CENTER)
	preview_container.add_child(char_body)
	
	# Rambut
	var hair := ColorRect.new()
	hair.color = hair_color
	var hair_idx: int = char_state["hair_style"]
	if hair_idx in [1, 6, 9]:
		hair.position = Vector2(30, -5)
		hair.size = Vector2(60, 28)
	elif hair_idx in [3, 4]:
		hair.position = Vector2(38, -10)
		hair.size = Vector2(44, 22)
	elif hair_idx == 7:
		hair.position = Vector2(28, -12)
		hair.size = Vector2(64, 24)
	else:
		hair.position = Vector2(30, -2)
		hair.size = Vector2(60, 20)
	char_body.add_child(hair)
	
	# Kepala
	var head := ColorRect.new()
	head.color = skin_color
	head.position = Vector2(35, 10)
	head.size = Vector2(50, 50)
	char_body.add_child(head)
	
	# Mata
	var eye_l := ColorRect.new()
	eye_l.color = eye_color
	eye_l.position = Vector2(43, 28)
	eye_l.size = Vector2(8, 8)
	char_body.add_child(eye_l)
	
	var eye_r := ColorRect.new()
	eye_r.color = eye_color
	eye_r.position = Vector2(63, 28)
	eye_r.size = Vector2(8, 8)
	char_body.add_child(eye_r)
	
	var pupil_l := ColorRect.new()
	pupil_l.color = Color.BLACK
	pupil_l.position = Vector2(45, 30)
	pupil_l.size = Vector2(4, 4)
	char_body.add_child(pupil_l)
	
	var pupil_r := ColorRect.new()
	pupil_r.color = Color.BLACK
	pupil_r.position = Vector2(65, 30)
	pupil_r.size = Vector2(4, 4)
	char_body.add_child(pupil_r)
	
	# Mulut
	var mouth := ColorRect.new()
	mouth.color = Color(0.7, 0.35, 0.30)
	mouth.position = Vector2(53, 45)
	mouth.size = Vector2(14, 4)
	char_body.add_child(mouth)
	
	# Tubuh
	var body := ColorRect.new()
	body.color = cloth_top
	body.position = Vector2(30, 62)
	body.size = Vector2(60, 55)
	char_body.add_child(body)
	
	# Lengan
	var arm_l := ColorRect.new()
	arm_l.color = cloth_top
	arm_l.position = Vector2(15, 65)
	arm_l.size = Vector2(18, 45)
	char_body.add_child(arm_l)
	
	var arm_r := ColorRect.new()
	arm_r.color = cloth_top
	arm_r.position = Vector2(87, 65)
	arm_r.size = Vector2(18, 45)
	char_body.add_child(arm_r)
	
	# Tangan
	var hand_l := ColorRect.new()
	hand_l.color = skin_color
	hand_l.position = Vector2(17, 108)
	hand_l.size = Vector2(14, 14)
	char_body.add_child(hand_l)
	
	var hand_r := ColorRect.new()
	hand_r.color = skin_color
	hand_r.position = Vector2(89, 108)
	hand_r.size = Vector2(14, 14)
	char_body.add_child(hand_r)
	
	# Bawah
	var legs := ColorRect.new()
	legs.color = cloth_bottom
	legs.position = Vector2(30, 118)
	legs.size = Vector2(60, 40)
	char_body.add_child(legs)
	
	# Kaki
	var foot_l := ColorRect.new()
	foot_l.color = Color(0.30, 0.22, 0.15)
	foot_l.position = Vector2(30, 158)
	foot_l.size = Vector2(26, 16)
	char_body.add_child(foot_l)
	
	var foot_r := ColorRect.new()
	foot_r.color = Color(0.30, 0.22, 0.15)
	foot_r.position = Vector2(64, 158)
	foot_r.size = Vector2(26, 16)
	char_body.add_child(foot_r)
	
	# Female adjustments
	if not is_male:
		hair.size.y = 35
		hair.position.y = -5
		body.size = Vector2(56, 50)
		body.position = Vector2(32, 65)
