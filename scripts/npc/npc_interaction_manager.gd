## NPCInteractionManager - Mengelola interaksi NPC secara global
## Satu manager untuk seluruh NPC di seluruh game.
extends Node

## NPC yang sedang dipilih
var selected_npc: Node = null

## Panel interaksi (dibuat sekali, ditampilkan/sembunyikan)
var panel: CanvasLayer

## Signal saat NPC dipilih
signal npc_selected(npc_id: String, npc_name: String)

## Signal saat NPC dibatalkan
signal npc_deselected()


func _ready() -> void:
	print("[NPCInteractionManager] Initialized")


## Pilih NPC
func select_npc(npc_node: Node) -> void:
	# Jika NPC yang sama dipilih lagi, batalkan
	if selected_npc == npc_node:
		deselect_npc()
		return
	
	# Batalkan NPC sebelumnya
	if selected_npc and selected_npc.has_method("set_highlight"):
		selected_npc.set_highlight(false)
	
	selected_npc = npc_node
	
	if selected_npc and selected_npc.has_method("set_highlight"):
		selected_npc.set_highlight(true)
	
	# Ambil data NPC
	var npc_id: String = ""
	var npc_name: String = ""
	if selected_npc:
		npc_id = selected_npc.get("npc_id") if selected_npc.has_method("get") else ""
		npc_name = selected_npc.get("npc_name") if selected_npc.has_method("get") else ""
	
	# Tampilkan panel
	_show_panel(npc_id, npc_name)
	
	# Emit signal
	if npc_id:
		npc_selected.emit(npc_id, npc_name)


## Batalkan pilihan NPC
func deselect_npc() -> void:
	if selected_npc and selected_npc.has_method("set_highlight"):
		selected_npc.set_highlight(false)
	
	selected_npc = null
	_hide_panel()
	npc_deselected.emit()


## Jalankan aksi NPC
func interact() -> void:
	if not selected_npc:
		return
	
	var npc_id: String = selected_npc.get("npc_id") if selected_npc.has_method("get") else ""
	var npc_name: String = selected_npc.get("npc_name") if selected_npc.has_method("get") else ""
	var action: String = ""
	
	# Ambil data dari NPCDatabase
	var npc_data: Dictionary = NPCDatabase.get_npc(npc_id)
	if not npc_data.is_empty():
		action = npc_data.get("action", "")
	
	# Jalankan aksi
	_execute_action(action, npc_name)
	
	# Batalkan seleksi
	deselect_npc()


## Eksekusi aksi berdasarkan tipe NPC
func _execute_action(action: String, npc_name: String) -> void:
	match action:
		"blacksmith":
			print("[NPC] Blacksmith dipilih - fitur akan segera tersedia.")
			UIManager.show_notification("Blacksmith - Fitur akan segera tersedia.")
		"warehouse":
			print("[NPC] Warehouse dipilih - fitur akan segera tersedia.")
			UIManager.show_notification("Warehouse - Fitur akan segera tersedia.")
		"kitchen":
			print("[NPC] Kitchen dipilih - fitur akan segera tersedia.")
			UIManager.show_notification("Dapur - Fitur akan segera tersedia.")
		"laboratory":
			print("[NPC] Laboratory dipilih - fitur akan segera tersedia.")
			UIManager.show_notification("Laboratorium - Fitur akan segera tersedia.")
		"marketplace":
			print("[NPC] Marketplace dipilih - fitur akan segera tersedia.")
			UIManager.show_notification("Marketplace - Fitur akan segera tersedia.")
		"portal_monster":
			print("[NPC] Portal Monster dipilih - fitur akan segera tersedia.")
			UIManager.show_notification("Portal Monster - Fitur akan segera tersedia.")
		"portal_quest":
			print("[NPC] Portal Quest dipilih - fitur akan segera tersedia.")
			UIManager.show_notification("Portal Quest - Fitur akan segera tersedia.")
		"guide":
			print("[NPC] Guide dipilih - fitur akan segera tersedia.")
			UIManager.show_notification("Pemandu Desa - Fitur akan segera tersedia.")
		_:
			print("[NPC] %s dipilih - fitur akan segera tersedia." % npc_name)
			UIManager.show_notification("%s - Fitur akan segera tersedia." % npc_name)


## ==================== PANEL UI ====================

func _show_panel(npc_id: String, npc_name: String) -> void:
	if panel:
		_remove_panel()
	
	var npc_data: Dictionary = NPCDatabase.get_npc(npc_id)
	var profession: String = npc_data.get("profession", "NPC")
	var action: String = npc_data.get("action", "")
	var desc: String = NPCDatabase.ACTION_DESCRIPTIONS.get(action, "")
	
	panel = CanvasLayer.new()
	panel.layer = 80
	
	# Dim background
	var dim := ColorRect.new()
	dim.color = Color(0, 0, 0, 0.5)
	dim.set_anchors_preset(Control.PRESET_FULL_RECT)
	dim.gui_input.connect(func(event: InputEvent):
		if event is InputEventMouseButton and event.pressed:
			deselect_npc()
		elif event is InputEventScreenTouch and event.pressed:
			deselect_npc()
	)
	panel.add_child(dim)
	
	# Panel utama
	var box := PanelContainer.new()
	box.set_anchors_preset(Control.PRESET_CENTER)
	box.offset_left = -160
	box.offset_right = 160
	box.offset_top = -120
	box.offset_bottom = 120
	panel.add_child(box)
	
	var vbox := VBoxContainer.new()
	vbox.alignment = BoxContainer.ALIGNMENT_CENTER
	vbox.add_theme_constant_override("separation", 12)
	box.add_child(vbox)
	
	# Ikon placeholder (kotak warna)
	var icon := ColorRect.new()
	icon.custom_minimum_size = Vector2(48, 48)
	icon.size = Vector2(48, 48)
	icon.color = npc_data.get("color", Color.MAGENTA)
	vbox.add_child(icon)
	
	# Nama NPC
	var name_lbl := Label.new()
	name_lbl.text = npc_name
	name_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	name_lbl.add_theme_font_size_override("font_size", 22)
	vbox.add_child(name_lbl)
	
	# Profesi
	var prof_lbl := Label.new()
	prof_lbl.text = profession
	prof_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	prof_lbl.add_theme_font_size_override("font_size", 14)
	prof_lbl.add_theme_color_override("font_color", Color(0.7, 0.7, 0.7))
	vbox.add_child(prof_lbl)
	
	# Deskripsi
	if desc != "":
		var desc_lbl := Label.new()
		desc_lbl.text = desc
		desc_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		desc_lbl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		desc_lbl.add_theme_font_size_override("font_size", 13)
		desc_lbl.add_theme_color_override("font_color", Color(0.6, 0.6, 0.6))
		vbox.add_child(desc_lbl)
	
	# Separator
	vbox.add_child(HSeparator.new())
	
	# Tombol
	var btn_hbox := HBoxContainer.new()
	btn_hbox.alignment = BoxContainer.ALIGNMENT_CENTER
	btn_hbox.add_theme_constant_override("separation", 20)
	vbox.add_child(btn_hbox)
	
	# Interact button
	var interact_btn := Button.new()
	interact_btn.text = "Interact"
	interact_btn.custom_minimum_size = Vector2(120, 40)
	interact_btn.pressed.connect(func(): interact())
	btn_hbox.add_child(interact_btn)
	
	# Cancel button
	var cancel_btn := Button.new()
	cancel_btn.text = "Cancel"
	cancel_btn.custom_minimum_size = Vector2(120, 40)
	cancel_btn.pressed.connect(func(): deselect_npc())
	btn_hbox.add_child(cancel_btn)
	
	# Tambahkan ke scene tree
	var root := get_tree().current_scene
	if root:
		root.add_child(panel)


func _hide_panel() -> void:
	_remove_panel()


func _remove_panel() -> void:
	if panel and is_instance_valid(panel):
		panel.queue_free()
	panel = null
