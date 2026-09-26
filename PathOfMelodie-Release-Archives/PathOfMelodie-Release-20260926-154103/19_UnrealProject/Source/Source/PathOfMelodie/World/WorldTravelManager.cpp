#include "WorldTravelManager.h"
#include "Kismet/GameplayStatics.h"

void UWorldTravelManager::TransitionToAct(int32 ActNumber) {
    FString LevelName = FString::Printf(TEXT("Act%02d_Main"), ActNumber);
    UGameplayStatics::OpenLevel(GetWorld(), FName(*LevelName));
}
