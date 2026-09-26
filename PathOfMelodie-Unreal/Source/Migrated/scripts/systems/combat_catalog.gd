class_name CombatCatalog

const SKILLS_PATH := "res://data/combat/skills.json"
const BUILDS_PATH := "res://data/builds/archetypes.json"
const LOOT_PATH := "res://data/loot/affixes.json"

static func load_json(path: String) -> Dictionary:
	var file := FileAccess.open(path, FileAccess.READ)
	if file == null:
		push_error("Combat catalog missing: %s" % path)
		return {}
	var parsed = JSON.parse_string(file.get_as_text())
	return parsed if parsed is Dictionary else {}

static func skills() -> Array:
	return load_json(SKILLS_PATH).get("skills", [])

static func skill(id: String) -> Dictionary:
	for item in skills():
		if item.get("id", "") == id:
			return item
	return {}

static func runes() -> Array:
	return load_json(SKILLS_PATH).get("runes", [])

static func reaction(first: String, second: String) -> String:
	for item in load_json(SKILLS_PATH).get("elemental_reactions", []):
		if (item.first == first and item.second == second) or (item.first == second and item.second == first):
			return item.result
	return ""

static func status_effects() -> Array:
	return load_json(SKILLS_PATH).get("status_effects", [])

static func archetypes() -> Array:
	return load_json(BUILDS_PATH).get("archetypes", [])

static func loot_affixes() -> Array:
	return load_json(LOOT_PATH).get("affixes", [])

static func rarities() -> Array:
	return load_json(LOOT_PATH).get("rarities", [])

static func legendary_examples() -> Array:
	return load_json(LOOT_PATH).get("legendary_examples", [])
