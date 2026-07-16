## PlayerData - Database default seluruh data pemain
## Menjadi sumber utama struktur data yang digunakan oleh seluruh sistem.
class_name PlayerData


## Struktur data player default
const DEFAULT_DATA: Dictionary = {
	## Identitas pemain
	"identity": {
		"id": "",
		"name": "",
		"gender": "male",
		"skin_color": 0,
		"hair_style": 0,
		"hair_color": 0,
		"eyes": 0,
		"clothes": 0,
	},
	
	## Progress permainan
	"progress": {
		"level": 1,
		"exp": 0,
		"exp_to_next": 100,
		"map_level": 0,
		"location": "Main Village",
		"play_time": 0.0,
		"created_at": "",
	},
	
	## Status / Statistik
	"stats": {
		"hp": 100,
		"max_hp": 100,
		"energy": 100,
		"max_energy": 100,
		"attack": 10,
		"defense": 5,
		"critical_rate": 5.0,
		"critical_damage": 150.0,
		"attack_speed": 1.0,
		"movement_speed": 200.0,
	},
	
	## Mata uang
	"currency": {
		"gold": 1000,
		"diamond": 0,
	},
	
	## Peralatan yang dipakai
	"equipment": {
		"weapon": "wooden_sword",
		"armor": "beginner_armor",
		"helmet": "",
		"gloves": "",
		"boots": "",
		"ring": "",
		"necklace": "",
	},
	
	## Inventaris (item yang dibawa)
	"inventory": [],
	
	## Gudang (resource tersimpan)
	"warehouse": [],
	
	## Pengaturan
	"settings": {
		"volume_music": 0.7,
		"volume_sfx": 0.8,
		"language": "id",
	},
}


## Template item senjata awal
const WOODEN_SWORD: Dictionary = {
	"id": "wooden_sword",
	"name": "Pedang Kayu",
	"type": "weapon",
	"rarity": "common",
	"attack": 5,
	"description": "Pedang kayu sederhana untuk pemula.",
	"sell_price": 10,
}


## Template armor awal
const BEGINNER_ARMOR: Dictionary = {
	"id": "beginner_armor",
	"name": "Armor Pemula",
	"type": "armor",
	"rarity": "common",
	"defense": 3,
	"description": "Armor ringan untuk pemula.",
	"sell_price": 10,
}


## Hitung EXP yang dibutuhkan untuk level tertentu
## Formula: 100 + (level * 50)
static func exp_for_level(level: int) -> int:
	return 100 + (level * 50)


## Generate Player ID unik berdasarkan waktu
static func generate_id() -> String:
	return str(int(Time.get_unix_time_from_system() * 1000))
