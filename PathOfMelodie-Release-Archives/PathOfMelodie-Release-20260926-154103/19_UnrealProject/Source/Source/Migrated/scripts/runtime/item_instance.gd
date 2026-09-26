class_name ItemInstance

var id := ""
var definition_id := ""
var name := ""
var rarity := "common"
var affixes: Array = []
var legendary_effect := ""

static func create_from_roll(rolled_rarity: String, rolled_affixes: Array, definition: Dictionary = {}):
	var item = new()
	item.id = "%s-%s" % [rolled_rarity, Time.get_ticks_usec()]
	item.definition_id = definition.get("id", "generated_item")
	item.name = definition.get("name", "Soulbound Relic")
	item.rarity = rolled_rarity
	item.affixes = rolled_affixes.duplicate(true)
	item.legendary_effect = definition.get("rule", "")
	return item

func to_dict() -> Dictionary:
	return {"id": id, "definition_id": definition_id, "name": name, "rarity": rarity, "affixes": affixes, "legendary_effect": legendary_effect}
