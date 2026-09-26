class_name InventoryRuntime

var items: Array = []
var capacity := 60

func add_item(item) -> bool:
	if items.size() >= capacity:
		return false
	items.append(item)
	return true

func count() -> int:
	return items.size()

func snapshot() -> Array:
	return items.map(func(item): return item.to_dict())
