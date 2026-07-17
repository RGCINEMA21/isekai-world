## NPCInteractionManager - Mengelola interaksi NPC secara global
extends Node

var selected_npc: Node = null
var panel: CanvasLayer
signal npc_selected(npc_id: String, npc_name: String)
signal npc_deselected()

func _ready() -> void:
	print("[NPCInteractionManager] Initialized")

func select_npc(npc_node: Node) -> void:
	if selected_npc == npc_node:
		deselect_npc()
		return
	if selected_npc and selected_npc.has_method("set_highlight"):
		selected_npc.set_highlight(false)
	selected_npc = npc_node
	if selected_npc and selected_npc.has_method("set_highlight"):
		selected_npc.set_highlight(true)
	var npc_id: String = ""
	var npc_name: String = ""
	if selected_npc:
		npc_id = selected_npc.get("npc_id") if selected_npc.has_method("get") else ""
		npc_name = selected_npc.get("npc_name") if selected_npc.has_method("get") else ""
	_show_panel(npc_id, npc_name)
	if npc_id:
		npc_selected.emit(npc_id, npc_name)

func deselect_npc() -> void:
	if selected_npc and selected_npc.has_method("set_highlight"):
		selected_npc.set_highlight(false)
	selected_npc = null
	_hide_panel()
	npc_deselected.emit()

func interact() -> void:
	if not selected_npc:
		return
	var npc_id: String = selected_npc.get("npc_id") if selected_npc.has_method("get") else ""
	var npc_name: String = selected_npc.get("npc_name") if selected_npc.has_method("get") else ""
	var npc_data: Dictionary = NPCDatabase.get_npc(npc_id)
	var action: String = npc_data.get("action", "")
	_execute_action(action, npc_name)
	deselect_npc()

func _execute_action(action: String, npc_name: String) -> void:
	match action:
		"portal_monster":
			print("[NPC] Portal Monster dipilih - masuk Monster Area")
			SceneManager.change_scene("monster_area")
		_:
			var desc: String = NPCDatabase.ACTION_DESCRIPTIONS.get(action, "")
			var msg: String = "%s - %s" % [npc_name, desc if desc else "Fitur akan segera tersedia."]
			print("[NPC] %s" % msg)
			UIManager.show_notification(msg)

func _show_panel(npc_id: String, npc_name: String) -> void:
	_remove_panel()
	var npc_data: Dictionary = NPCDatabase.get_npc(npc_id)
	var profession: String = npc_data.get("profession", "NPC")
	var action: String = npc_data.get("action", "")
	var desc: String = NPCDatabase.ACTION_DESCRIPTIONS.get(action, "")
	panel = CanvasLayer.new()
	panel.layer = 80
	var dim := ColorRect.new()
	dim.color = Color(0, 0, 0, 0.5)
	dim.set_anchors_preset(Control.PRESET_FULL_RECT)
	dim.gui_input.connect(func(event: InputEvent):
		if (event is InputEventMouseButton or event is InputEventScreenTouch) and event.pressed:
			deselect_npc()
	)
	panel.add_child(dim)
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
	var icon := ColorRect.new()
	icon.custom_minimum_size = Vector2(48, 48)
	icon.size = Vector2(48, 48)
	icon.color = npc_data.get("color", Color.MAGENTA)
	vbox.add_child(icon)
	var name_lbl := Label.new()
	name_lbl.text = npc_name
	name_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	name_lbl.add_theme_font_size_override("font_size", 22)
	vbox.add_child(name_lbl)
	var prof_lbl := Label.new()
	prof_lbl.text = profession
	prof_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	prof_lbl.add_theme_font_size_override("font_size", 14)
	prof_lbl.add_theme_color_override("font_color", Color(0.7, 0.7, 0.7))
	vbox.add_child(prof_lbl)
	if desc != "":
		var desc_lbl := Label.new()
		desc_lbl.text = desc
		desc_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		desc_lbl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		desc_lbl.add_theme_font_size_override("font_size", 13)
		desc_lbl.add_theme_color_override("font_color", Color(0.6, 0.6, 0.6))
		vbox.add_child(desc_lbl)
	vbox.add_child(HSeparator.new())
	var btn_hbox := HBoxContainer.new()
	btn_hbox.alignment = BoxContainer.ALIGNMENT_CENTER
	btn_hbox.add_theme_constant_override("separation", 20)
	vbox.add_child(btn_hbox)
	var interact_btn := Button.new()
	interact_btn.text = "Interact"
	interact_btn.custom_minimum_size = Vector2(120, 40)
	interact_btn.pressed.connect(func(): interact())
	btn_hbox.add_child(interact_btn)
	var cancel_btn := Button.new()
	cancel_btn.text = "Cancel"
	cancel_btn.custom_minimum_size = Vector2(120, 40)
	cancel_btn.pressed.connect(func(): deselect_npc())
	btn_hbox.add_child(cancel_btn)
	var root := get_tree().current_scene
	if root:
		root.add_child(panel)

func _hide_panel() -> void:
	_remove_panel()

func _remove_panel() -> void:
	if panel and is_instance_valid(panel):
		panel.queue_free()
	panel = null
