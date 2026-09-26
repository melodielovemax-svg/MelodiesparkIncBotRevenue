
extends RefCounted
class_name SaveSystem

static func save_player(p:Node,path:="user://maakaras_save.json"):
    var d={"level":p.level,"xp":p.xp,"hp":p.hp,"max_hp":p.max_hp,"mana":p.mana,"max_mana":p.max_mana,"power":p.power,"armor":p.armor,"karma":p.karma,"ma":p.ma,"ascension":p.ascension,"act":p.act,"kills":p.kills,"gold":p.gold}
    var f=FileAccess.open(path,FileAccess.WRITE)
    f.store_string(JSON.stringify(d))

static func load_player(p:Node,path:="user://maakaras_save.json"):
    if not FileAccess.file_exists(path):return false
    var f=FileAccess.open(path,FileAccess.READ)
    var d=JSON.parse_string(f.get_as_text())
    if typeof(d)!=TYPE_DICTIONARY:return false
    for k in d:
        if k in p: p.set(k,d[k])
    return true
