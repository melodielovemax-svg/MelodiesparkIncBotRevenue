// {{PLUGIN_NAME}} runtime module, implementation.

#include "{{PLUGIN_NAME}}Module.h"

#include "Modules/ModuleManager.h"

DEFINE_LOG_CATEGORY_STATIC(Log{{PLUGIN_NAME}}, Log, All);

const FName {{PLUGIN_NAME}}::ModuleName = FName("{{PLUGIN_NAME}}");

namespace
{
	/** Guards against a double shutdown if the engine reloads the module. */
	bool GIsAvailable = false;
}

void {{PLUGIN_NAME}}::StartupModule()
{
	GIsAvailable = true;
	UE_LOG(Log{{PLUGIN_NAME}}, Log, TEXT("{{PLUGIN_NAME}} runtime module started."));
}

void {{PLUGIN_NAME}}::ShutdownModule()
{
	GIsAvailable = false;
	UE_LOG(Log{{PLUGIN_NAME}}, Log, TEXT("{{PLUGIN_NAME}} runtime module shut down."));
}

bool {{PLUGIN_NAME}}::IsAvailable()
{
	return GIsAvailable;
}

IMPLEMENT_MODULE({{PLUGIN_NAME}}, {{PLUGIN_NAME}});
