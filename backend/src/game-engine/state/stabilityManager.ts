// ============================================================
// Stability Manager — territory stability mechanics
// ============================================================

import type { GameState } from '../../types';

/**
 * Initialize stability values on all territories.
 * Owned territories start at 80; unowned territories have no stability.
 */
export function initializeStability(state: GameState): void {
  for (const t of Object.values(state.territories)) {
    if (t.owner_id) {
      t.stability = 80;
    }
  }
}

/**
 * Each turn, owned territories recover +5 stability (cap 100).
 * Called once per turn for the active player in advanceToNextPlayer.
 */
export function applyStabilityTick(state: GameState, playerId: string): void {
  for (const t of Object.values(state.territories)) {
    if (t.owner_id !== playerId || t.stability == null) continue;
    t.stability = Math.min(100, t.stability + 5);
  }
}

/**
 * When a territory is captured via combat, set stability to 30.
 */
export function onCaptureStabilityPenalty(state: GameState, territoryId: string): void {
  const t = state.territories[territoryId];
  if (t) t.stability = 30;
}

/**
 * When a territory is flipped via Cold War influence, subtract 20 stability (floor 0).
 */
export function onInfluenceStabilityPenalty(state: GameState, territoryId: string): void {
  const t = state.territories[territoryId];
  if (t && t.stability != null) {
    t.stability = Math.max(0, t.stability - 20);
  }
}

/**
 * Returns a multiplier 0.0–1.0 based on the territory stability.
 * Used by economy to scale production.
 */
export function getStabilityMultiplier(stability: number | undefined): number {
  if (stability == null) return 1;
  return stability / 100;
}
