#include "PoMGameMode.h"

#include "PoMRuntimeProbe.h"

void APoMGameMode::StartPlay()
{
	Super::StartPlay();

	if (!GetWorld()->SpawnActor<APoMRuntimeProbe>(FVector(0.0, 0.0, 100.0), FRotator::ZeroRotator))
	{
		UE_LOG(LogTemp, Error, TEXT("Path of Melodie runtime probe could not be spawned."));
	}
}
