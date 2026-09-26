class_name BuildRuntime

var archetype_id := "phoenix_warrior"
var equipped: Array = []

func equip(item) -> void:
	if item not in equipped:
		equipped.append(item)

func stat_summary() -> Dictionary:
	var result := {"damage": 0, "fire_power": 0, "soul_power": 0, "phoenix_power": 0, "shatter_damage": 0}
	for item in equipped:
		for affix in item.affixes:
			var stat := String(affix.get("stat", ""))
			if result.has(stat):
				result[stat] += 1
	return result
