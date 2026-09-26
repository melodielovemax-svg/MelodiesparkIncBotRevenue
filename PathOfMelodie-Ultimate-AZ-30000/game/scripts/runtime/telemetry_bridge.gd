class_name TelemetryBridge
extends Node

signal telemetry_sent(event_type: String, success: bool)

@export var api_url: String = "http://127.0.0.1:4173/api/game/telemetry"
@export var client_version: String = "1.0.0"
@export var enabled: bool = true

var http_client: HTTPRequest
var event_queue: Array = []
var is_transmitting: bool = false
var session_id: String = ""

func _ready() -> void:
	session_id = "pom_%d_%d" % [Time.get_unix_time_from_system(), randi() % 10000]
	http_client = HTTPRequest.new()
	http_client.name = "TelemetryHTTP"
	http_client.timeout = 5.0
	add_child(http_client)
	http_client.request_completed.connect(_on_request_completed)

func emit_event(event_type: String, payload: Dictionary = {}) -> void:
	if not enabled:
		return

	var event := {
		"clientVersion": client_version,
		"sessionId": session_id,
		"playerId": payload.get("player_id", "guardian_player_1"),
		"eventType": event_type,
		"actNumber": payload.get("act_number", null),
		"bossDefeated": payload.get("boss_defeated", null),
		"damageDealt": payload.get("damage_dealt", 0),
		"shattersTriggered": payload.get("shatters_triggered", 0),
		"reactionsTriggered": payload.get("reactions_triggered", 0),
		"phoenixAscensions": payload.get("phoenix_ascensions", 0),
		"karmaEarned": payload.get("karma_earned", 0),
		"payload": payload
	}

	event_queue.append(event)
	_process_queue()

func _process_queue() -> void:
	if is_transmitting or event_queue.is_empty() or not is_inside_tree():
		return

	var current = event_queue.pop_front()
	var json_str = JSON.stringify(current)
	var headers = ["Content-Type: application/json"]

	is_transmitting = true
	var error = http_client.request(api_url, headers, HTTPClient.METHOD_POST, json_str)
	if error != OK:
		is_transmitting = false
		telemetry_sent.emit(current.get("eventType", ""), false)

func _on_request_completed(result: int, response_code: int, _headers: PackedStringArray, _body: PackedByteArray) -> void:
	is_transmitting = false
	var success := (result == HTTPRequest.RESULT_SUCCESS and response_code >= 200 and response_code < 300)
	telemetry_sent.emit("telemetry", success)
	# Process next event in buffer
	_process_queue()
