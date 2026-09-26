#if WITH_DEV_AUTOMATION_TESTS

#include "Engine/World.h"
#include "Misc/AutomationTest.h"
#include "Modules/ModuleManager.h"
#include "PoMRuntimeProbe.h"
#include "UObject/Package.h"

IMPLEMENT_SIMPLE_AUTOMATION_TEST(
	FPathOfMelodieRuntimeSmokeTest,
	"PathOfMelodie.Runtime.Smoke",
	EAutomationTestFlags::EditorContext | EAutomationTestFlags::EngineFilter)

bool FPathOfMelodieRuntimeSmokeTest::RunTest(const FString& Parameters)
{
	TestTrue(
		TEXT("PathOfMelodie runtime module is loaded"),
		FModuleManager::Get().IsModuleLoaded(TEXT("PathOfMelodie")));

	UWorld* World = UWorld::CreateWorld(
		EWorldType::Game,
		false,
		FName(TEXT("PathOfMelodieRuntimeSmokeWorld")),
		GetTransientPackage(),
		true,
		GMaxRHIFeatureLevel);
	if (!TestNotNull(TEXT("Transient gameplay world is created"), World))
	{
		return false;
	}

	APoMRuntimeProbe* Probe = World->SpawnActor<APoMRuntimeProbe>();
	if (!TestNotNull(TEXT("Path of Melodie runtime probe is spawned"), Probe))
	{
		World->DestroyWorld(false);
		return false;
	}

	Probe->DispatchBeginPlay();
	TestTrue(TEXT("Path of Melodie actor executes its BeginPlay behavior"), Probe->HasGameplayInitialized());

	World->DestroyWorld(false);
	return true;
}

#endif
