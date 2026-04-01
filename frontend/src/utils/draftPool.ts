import type { GameState } from '../store/gameStore';

/**
 * Authoritative reinforcement pool for the current user's draft phase.
 * Prefer server `draft_units_remaining`; if missing (older saves / race), estimate from territory count.
 */
export function computeDraftPool(
  gameState: GameState | null,
  userId: string | undefined,
  storeFallback: number,
): number {
  if (!gameState || gameState.phase !== 'draft' || !userId) return 0;
  if (gameState.players[gameState.current_player_index]?.player_id !== userId) return 0;

  const raw = gameState.draft_units_remaining;
  if (typeof raw === 'number' && !Number.isNaN(raw)) {
    return raw;
  }

  const me = gameState.players.find((p) => p.player_id === userId);
  if (me) {
    return Math.max(3, Math.floor(me.territory_count / 3));
  }
  return storeFallback;
}
