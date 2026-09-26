#include "EnemyAIController.h"

void AEnemyAIController::UpdateState(AActor* Player) {
    float Dist = FVector::Dist(GetPawn()->GetActorLocation(), Player->GetActorLocation());
    if (IsDead()) CurrentState = EAIState::Dead;
    else if (Dist <= AttackRange) CurrentState = EAIState::Attacking;
    else if (Dist <= DetectionRadius) CurrentState = EAIState::Aggro;
    else CurrentState = EAIState::Idle;
}
void AEnemyAIController::ExecuteBehavior() {
    switch(CurrentState) {
        case EAIState::Aggro: MoveToActor(PlayerPawn); break;
        case EAIState::Attacking: PerformAttack(); break;
        default: break;
    }
}
