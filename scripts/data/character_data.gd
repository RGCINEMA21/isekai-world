## CharacterData - Database opsi kustomisasi karakter
## Semua opsi character creation didefinisikan di sini.
class_name CharacterData


## Opsi warna kulit: [nama, hex_color]
const SKIN_COLORS: Array[Dictionary] = [
	{"name": "Cerah", "color": Color(1.0, 0.87, 0.77)},
	{"name": "Kuning", "color": Color(0.96, 0.87, 0.70)},
	{"name": "Sawo Matang", "color": Color(0.82, 0.62, 0.44)},
	{"name": "Cokelat", "color": Color(0.62, 0.42, 0.30)},
	{"name": "Gelap", "color": Color(0.40, 0.26, 0.18)},
]


## Opsi gaya rambut: [nama, deskripsi bentuk]
const HAIR_STYLES: Array[Dictionary] = [
	{"name": "Pendek", "desc": "Rambut pendek rapi"},
	{"name": "Panjang", "desc": "Rambut panjang lurus"},
	{"name": "Kriting", "desc": "Rambut keriting"},
	{"name": "Ponytail", "desc": "Ikat ekor kuda"},
	{"name": "Mohawk", "desc": "Mohawk tegak"},
	{"name": "Bob", "desc": "Potongan bob pendek"},
	{"name": "Pigtails", "desc": "Dua ikatan samping"},
	{"name": "Spiky", "desc": "Rambut berdiri tajam"},
	{"name": "Flowing", "desc": "Rambut mengalir bebas"},
	{"name": "Braided", "desc": "Rambut dikepang"},
]


## Opsi warna rambut: [nama, hex_color]
const HAIR_COLORS: Array[Dictionary] = [
	{"name": "Hitam", "color": Color(0.15, 0.12, 0.12)},
	{"name": "Cokelat Tua", "color": Color(0.35, 0.20, 0.10)},
	{"name": "Cokelat Muda", "color": Color(0.55, 0.35, 0.18)},
	{"name": "Pirang", "color": Color(0.85, 0.75, 0.40)},
	{"name": "Merah", "color": Color(0.70, 0.25, 0.15)},
	{"name": "Pirang Terang", "color": Color(0.95, 0.90, 0.60)},
	{"name": "Abu-abu", "color": Color(0.55, 0.55, 0.55)},
	{"name": "Biru", "color": Color(0.20, 0.40, 0.80)},
	{"name": "Ungu", "color": Color(0.55, 0.20, 0.70)},
	{"name": "Pink", "color": Color(0.90, 0.45, 0.60)},
]


## Opsi gaya mata: [nama, warna mata]
const EYE_STYLES: Array[Dictionary] = [
	{"name": "Cokelat", "color": Color(0.45, 0.30, 0.15)},
	{"name": "Biru", "color": Color(0.20, 0.45, 0.85)},
	{"name": "Hijau", "color": Color(0.20, 0.65, 0.35)},
	{"name": "Abu-abu", "color": Color(0.55, 0.55, 0.60)},
	{"name": "Emas", "color": Color(0.85, 0.75, 0.25)},
	{"name": "Ungu", "color": Color(0.60, 0.25, 0.75)},
	{"name": "Merah", "color": Color(0.80, 0.20, 0.20)},
	{"name": "Hitam", "color": Color(0.10, 0.10, 0.12)},
]


## Opsi pakaian awal: [nama, warna_atas, warna_bawah]
const CLOTHES_STYLES: Array[Dictionary] = [
	{"name": "Petualang", "top": Color(0.30, 0.50, 0.70), "bottom": Color(0.35, 0.28, 0.20)},
	{"name": "Petani", "top": Color(0.55, 0.70, 0.35), "bottom": Color(0.40, 0.30, 0.18)},
	{"name": "Prajurit", "top": Color(0.65, 0.25, 0.20), "bottom": Color(0.30, 0.25, 0.22)},
	{"name": "Penyihir", "top": Color(0.35, 0.20, 0.55), "bottom": Color(0.25, 0.18, 0.40)},
	{"name": "Pedagang", "top": Color(0.75, 0.60, 0.30), "bottom": Color(0.45, 0.35, 0.22)},
	{"name": "Tabib", "top": Color(0.90, 0.90, 0.90), "bottom": Color(0.30, 0.45, 0.60)},
]


## Struktur data player default
const DEFAULT_PLAYER_DATA: Dictionary = {
	"character": {
		"name": "",
		"gender": "male",
		"skin_color": 0,
		"hair_style": 0,
		"hair_color": 0,
		"eyes": 0,
		"clothes": 0,
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
		"weapon": "wooden_sword",
		"armor": "beginner_armor",
		"accessory": "",
	},
	"inventory": [],
	"warehouse": [],
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
	},
}
