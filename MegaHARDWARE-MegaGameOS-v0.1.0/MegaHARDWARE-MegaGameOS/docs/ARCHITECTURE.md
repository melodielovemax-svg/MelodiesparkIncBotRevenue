# Architecture

Host OS
  |
  +-- MegaGameOS
  |    +-- Game Registry
  |    +-- DOS Runtime Adapter
  |    +-- Windows Runtime Adapter
  |    +-- Save/Config Manager
  |    +-- Input/Audio/Display
  |
  +-- MegaHARDWARE
       +-- Hardware Discovery
       +-- Benchmark Runner
       +-- Telemetry
       +-- Performance Ledger
       +-- Virtual Performance Profiles
       +-- Comparison Engine
       +-- Safety Limits
  |
  +-- Chatbot Hub
       +-- Provider Registry
       +-- Model Registry
       +-- Coding Agents
       +-- Local Ollama Adapter
       +-- OpenAI-compatible Adapter
       +-- Approval/Sandbox Gateway

The performance ledger stores measurements such as FPS, frame time, CPU/GPU utilization,
memory use, thermals, storage throughput and benchmark scores. It must not invent values.
