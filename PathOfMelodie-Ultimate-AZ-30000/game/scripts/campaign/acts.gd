class_name MelodieActs

const DATA := [
	{"number": 1, "title": "Ashes of Aurelion", "region": "Nethervale", "boss": "The Cinder Warden", "theme": "awakening"},
	{"number": 2, "title": "The Broken Guardian", "region": "Elysara", "boss": "Guardian Thorne", "theme": "guardians"},
	{"number": 3, "title": "Cathedral of Lost Souls", "region": "Nethervale", "boss": "The Soul Bishop", "theme": "souls"},
	{"number": 4, "title": "Pyra, Land of Fire", "region": "Pyra", "boss": "Vulkarion", "theme": "fire"},
	{"number": 5, "title": "The Frozen Oath", "region": "Nivalis", "boss": "Queen Crysera", "theme": "ice"},
	{"number": 6, "title": "The Corrupted Choir", "region": "Varkaan", "boss": "The Choirmaster", "theme": "corruption"},
	{"number": 7, "title": "The Seven Gates", "region": "Aurelion", "boss": "Seraph Vael", "theme": "celestial"},
	{"number": 8, "title": "War of the Arc-Angels", "region": "Aurelion", "boss": "Archangel Maakar", "theme": "war"},
	{"number": 9, "title": "The Soul Sea", "region": "The Veil", "boss": "Leviathan of Echoes", "theme": "void"},
	{"number": 10, "title": "The Phoenix Prison", "region": "Pyra", "boss": "The Imprisoned Phoenix", "theme": "phoenix"},
	{"number": 11, "title": "Return of the First Soul", "region": "Nethervale", "boss": "The First Soul", "theme": "revelation"},
	{"number": 12, "title": "The Maakaras Protocols", "region": "The Veil", "boss": "Protocol Zero", "theme": "reality"},
	{"number": 13, "title": "Paradise Reborn", "region": "Aurelion", "boss": "The False Paradise", "theme": "paradise"},
	{"number": 14, "title": "The Last Ascension", "region": "All Realms", "boss": "The Eternal Guardian", "theme": "ascension"},
	{"number": 15, "title": "Phoenix Eternal", "region": "Maakaras Core", "boss": "Maakaras, Heart of the World", "theme": "finale"}
]

static func get_act(number: int) -> Dictionary:
	return DATA[clampi(number - 1, 0, DATA.size() - 1)]
