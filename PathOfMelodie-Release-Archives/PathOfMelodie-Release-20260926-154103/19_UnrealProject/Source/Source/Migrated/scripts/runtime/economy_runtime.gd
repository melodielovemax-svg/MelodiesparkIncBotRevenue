class_name EconomyRuntime
extends RefCounted

signal balance_changed(currency: String, new_amount: int)

# The 7 Isolated Economic Buckets:
# 1. Gold: standard in-game vendor trading
# 2. Shards: item affix crafting & reforging
# 3. Soul Essence: upgrading the 5 Soul Core pillars
# 4. Karma Points: community reputation & faction nexus
# 5. Power Points: ascension rank advancement
# 6. Items: equipment inventory count
# 7. MA: optional digital gameplay points (strictly non-custodial, no guaranteed financial yield)

var wallets: Dictionary = {
	"gold": 500,
	"shards": 25,
	"soul_essence": 100,
	"karma_points": 0,
	"power_points": 0,
	"items": 0,
	"ma": 0
}

func get_balance(currency: String) -> int:
	var key := currency.to_lower()
	return wallets.get(key, 0)

func add_currency(currency: String, amount: int) -> int:
	var key := currency.to_lower()
	if not wallets.has(key) or amount <= 0:
		return get_balance(key)

	wallets[key] += amount
	balance_changed.emit(key, wallets[key])
	return wallets[key]

func spend_currency(currency: String, amount: int) -> bool:
	var key := currency.to_lower()
	if not wallets.has(key) or amount <= 0:
		return false
	if wallets[key] < amount:
		return false

	wallets[key] -= amount
	balance_changed.emit(key, wallets[key])
	return true

func serialize() -> Dictionary:
	return wallets.duplicate()

func deserialize(data: Dictionary) -> void:
	for k in wallets.keys():
		if data.has(k):
			wallets[k] = maxi(0, int(data[k]))
