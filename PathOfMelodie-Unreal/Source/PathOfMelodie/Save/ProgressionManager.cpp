#include "ProgressionManager.h"

void UProgressionManager::AddExperience(float Amount) {
    UE_LOG(LogTemp, Log, TEXT("Experience gained: %f"), Amount);
    // Logic for LevelUp threshold
}
void UProgressionManager::SpendPowerPoint(FString AbilityID) {
    if (PowerPoints > 0) {
        PowerPoints--;
        UE_LOG(LogTemp, Warning, TEXT("Ability %s Upgraded!"), *AbilityID);
    }
}
void UProgressionManager::OnLevelUp() {
    PlayerLevel++;
    PowerPoints += 5;
    KarmaPoints += 1;
}
