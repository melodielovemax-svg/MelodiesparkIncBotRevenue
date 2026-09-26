// {{PLUGIN_NAME}} runtime module, public interface.

#pragma once

#include "CoreMinimal.h"
#include "Modules/ModuleManager.h"

/**
 * Primary runtime module for {{PLUGIN_NAME}}.
 *
 * The module is intentionally near-empty. It exists so that the plugin has a
 * loadable module, a compiled translation unit, and a place to add code, not
 * because it provides a feature.
 */
class {{PLUGIN_NAME}} : public IModuleInterface
{
public:
	/** Name reported to the engine's module manager. */
	static const FName ModuleName;

	/** Lifecycle hooks. All three default to the IModuleInterface behaviour. */
	virtual void StartupModule() override;
	virtual void ShutdownModule() override;

	/** True once StartupModule has run and before ShutdownModule. */
	static bool IsAvailable();
};
