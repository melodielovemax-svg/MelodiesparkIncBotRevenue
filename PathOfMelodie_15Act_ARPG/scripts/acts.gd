
extends RefCounted
class_name Acts

const DATA = [
    ["Ashes of Aurelion","Nethervale","The Cinder Warden","Awakening"],
    ["The Broken Guardian","Elysara","Guardian Thorne","Guardians"],
    ["Cathedral of Lost Souls","Nethervale","The Soul Bishop","Souls"],
    ["Pyra, Land of Fire","Pyra","Vulkarion","Fire"],
    ["The Frozen Oath","Nivalis","Queen Crysera","Ice"],
    ["The Corrupted Choir","Varkaan","The Choirmaster","Corruption"],
    ["The Seven Gates","Aurelion","Seraph Vael","Celestial"],
    ["War of the Arc-Angels","Aurelion","Archangel Maakar","War"],
    ["The Soul Sea","The Veil","Leviathan of Echoes","Void"],
    ["The Phoenix Prison","Pyra","The Imprisoned Phoenix","Phoenix"],
    ["Return of the First Soul","Nethervale","The First Soul","Revelation"],
    ["The Maakaras Protocols","The Veil","Protocol Zero","Reality"],
    ["Paradise Reborn","Aurelion","The False Paradise","Paradise"],
    ["The Last Ascension","All Realms","The Eternal Guardian","Ascension"],
    ["Phoenix Eternal","Maakaras Core","Maakaras, Heart of the World","Finale"]
]

static func get_act(n:int)->Dictionary:
    n = clamp(n,1,15)
    var d=DATA[n-1]
    return {"number":n,"title":d[0],"region":d[1],"boss":d[2],"theme":d[3]}
