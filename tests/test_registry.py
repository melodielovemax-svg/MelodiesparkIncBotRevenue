from melodie_platforms.registry import load_registry


def test_registry_contains_core_tools():
    registry = load_registry()
    required = ["platforms", "botrevenue", "npm", "npx", "pnpm", "python", "pip", "pipx"]
    for item in required:
        assert item in registry
