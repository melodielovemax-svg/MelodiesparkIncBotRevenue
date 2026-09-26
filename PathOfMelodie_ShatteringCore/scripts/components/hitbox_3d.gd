class_name Hitbox3D
extends Area3D

signal hit_confirmed(target: Hurtbox3D, packet: DamagePacket)

@export var owner_body: Node
@export var damage: float = 20.0
@export var damage_type: StringName = &"physical"
@export var skill_id: StringName = &"basic_attack"
@export var poise_damage: float = 10.0
@export var knockback: float = 0.0
@export var one_hit_per_target := true

var _already_hit: Dictionary = {}

func begin_window() -> void:
    _already_hit.clear()
    monitoring = true

func end_window() -> void:
    monitoring = false
    _already_hit.clear()

func sweep_now(hit_position: Vector3 = Vector3.ZERO, hit_normal: Vector3 = Vector3.UP) -> int:
    var count := 0
    for area in get_overlapping_areas():
        var hurtbox := area as Hurtbox3D
        if hurtbox == null:
            continue
        if owner_body != null and hurtbox.get_parent() == owner_body:
            continue
        if hurtbox.faction == _get_owner_faction():
            continue
        if one_hit_per_target and _already_hit.has(hurtbox.get_instance_id()):
            continue

        var packet := DamagePacket.new(owner_body, damage, damage_type, skill_id)
        packet.hit_point = hit_position
        packet.hit_normal = hit_normal
        packet.poise_damage = poise_damage
        packet.knockback = knockback

        var result := hurtbox.receive_hit(packet)
        if result.accepted:
            if result.critical:
                packet.tags.append(&"critical")
            if result.poise_broken:
                packet.tags.append(&"shatter")
            _already_hit[hurtbox.get_instance_id()] = true
            hit_confirmed.emit(hurtbox, packet)
            count += 1
    return count

func _get_owner_faction() -> StringName:
    if owner_body != null and owner_body.has_method("get_faction"):
        return owner_body.get_faction()
    return &"player"
