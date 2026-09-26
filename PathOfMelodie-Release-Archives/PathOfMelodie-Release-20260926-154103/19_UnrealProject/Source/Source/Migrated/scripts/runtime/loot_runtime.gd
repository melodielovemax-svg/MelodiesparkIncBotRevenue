class_name LootRuntime

const Item = preload("res://scripts/runtime/item_instance.gd")

static func roll(rarities: Array, affix_pool: Array, legendary_pool: Array = []):
	var rarity := String(rarities[randi_range(0, rarities.size() - 1)]) if not rarities.is_empty() else "common"
	var count := 2 if rarity in ["rare", "epic", "legendary", "ancient", "mythic", "soul", "phoenix", "maakaras"] else 1
	var affixes: Array = []
	for _index in count:
		if not affix_pool.is_empty():
			affixes.append(affix_pool[randi_range(0, affix_pool.size() - 1)])
	var definition := {}
	if rarity == "legendary" and not legendary_pool.is_empty():
		definition = legendary_pool[randi_range(0, legendary_pool.size() - 1)]
	return Item.create_from_roll(rarity, affixes, definition)
