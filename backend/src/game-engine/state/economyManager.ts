// ============================================================
// Economy Manager — buildings, production, tech point income
// ============================================================

import type { GameState, BuildingType, PlayerState } from '../../types';
import { getStabilityMultiplier } from './stabilityManager';
import { getTemporaryModifierValue } from '../events/eventCardManager';

// ── Building definitions ──────────────────────────────────────────────────────

/** Gold / production units required to build each type. */
export const BUILDING_COSTS: Record<BuildingType, number> = {
  production_1: 3,
  production_2: 6,
  production_3: 10,
  defense_1: 3,
  defense_2: 6,
  defense_3: 10,
  tech_gen_1: 4,
  tech_gen_2: 8,
  special_a: 5,
  special_b: 8,
  port: 5,
  naval_base: 10,
};

/** The building a tier must upgrade from (null = no prerequisite). */
export const BUILDING_PREREQUISITES: Partial<Record<BuildingType, BuildingType>> = {
  production_2: 'production_1',
  production_3: 'production_2',
  defense_2: 'defense_1',
  defense_3: 'defense_2',
  tech_gen_2: 'tech_gen_1',
  naval_base: 'port',
};

/** Extra reinforcement units produced per territory per turn from production buildings. */
export const BUILDING_PRODUCTION_INCOME: Partial<Record<BuildingType, number>> = {
  production_1: 1,
  production_2: 2,
  production_3: 4,
};

/** Tech points generated per turn from tech-gen buildings. */
export const BUILDING_TECH_INCOME: Partial<Record<BuildingType, number>> = {
  tech_gen_1: 2,
  tech_gen_2: 4,
};

/** Defender dice bonus when a defense building is present. */
export const BUILDING_DEFENSE_BONUS: Partial<Record<BuildingType, number>> = {
  defense_1: 1,
  defense_2: 2,
  defense_3: 3,
};

/**
 * Maximum one building of each category per territory:
 * production (any tier), defense (any tier), tech_gen (any tier), special_a, special_b.
 */
function buildingCategory(b: BuildingType): string {
  if (b.startsWith('production')) return 'production';
  if (b.startsWith('defense')) return 'defense';
  if (b.startsWith('tech_gen')) return 'tech_gen';
  if (b === 'port' || b === 'naval_base') return 'naval';
  return b; // special_a, special_b — unique each
}

// ── Validation ────────────────────────────────────────────────────────────────

export interface BuildValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Check whether a player may construct `buildingType` on `territoryId`.
 *
 * Rules enforced:
 * - Economy feature must be enabled on the game.
 * - Territory must be owned by the requesting player.
 * - Player must have enough accumulated production points (PlayerState.special_resource).
 * - Only one building per category allowed per territory.
 * - Prerequisite tier must be present.
 * - If tech trees are enabled, the player must have unlocked the corresponding
 *   tech node (verified externally — caller may pass `techUnlocked` flag).
 */
export function validateBuild(
  state: GameState,
  playerId: string,
  territoryId: string,
  buildingType: BuildingType,
  techUnlocked = true
): BuildValidationResult {
  if (!state.settings.economy_enabled) {
    return { valid: false, error: 'Economy feature is not enabled for this game' };
  }

  const territory = state.territories[territoryId];
  if (!territory || territory.owner_id !== playerId) {
    return { valid: false, error: 'Territory not owned by you' };
  }

  if (!techUnlocked) {
    return { valid: false, error: 'You must research the required technology first' };
  }

  const player = state.players.find((p) => p.player_id === playerId);
  if (!player) return { valid: false, error: 'Player not found' };

  const cost = BUILDING_COSTS[buildingType];
  const playerProduction = player.special_resource ?? 0;
  if (playerProduction < cost) {
    return { valid: false, error: `Not enough production points (need ${cost}, have ${playerProduction})` };
  }

  const existingBuildings = territory.buildings ?? [];
  const category = buildingCategory(buildingType);

  // Check no duplicate category
  const hasCategory = existingBuildings.some((b) => buildingCategory(b) === category);
  if (hasCategory) {
    return { valid: false, error: `Territory already has a ${category} building` };
  }

  // Check prerequisite tier
  const prereq = BUILDING_PREREQUISITES[buildingType];
  if (prereq && !existingBuildings.includes(prereq)) {
    return { valid: false, error: `Must build ${prereq} before ${buildingType}` };
  }

  // Naval buildings require a coastal territory (naval_units is set on coastal territories)
  if ((buildingType === 'port' || buildingType === 'naval_base') && territory.naval_units == null) {
    return { valid: false, error: 'Can only build naval structures on coastal territories' };
  }

  // Upgrade check: if upgrading, the previous tier must exist and be removed
  // (handled in applyBuild — here we just validate)
  const prevTierMap: Partial<Record<BuildingType, BuildingType>> = {
    production_2: 'production_1',
    production_3: 'production_2',
    defense_2: 'defense_1',
    defense_3: 'defense_2',
    tech_gen_2: 'tech_gen_1',
    naval_base: 'port',
  };
  const prevTier = prevTierMap[buildingType];
  if (prevTier && !existingBuildings.includes(prevTier)) {
    return { valid: false, error: `Must first build ${prevTier}` };
  }

  return { valid: true };
}

/**
 * Apply a successful build: deduct cost and add (or upgrade) building.
 * Upgrade replaces the previous tier; other buildings are added.
 */
export function applyBuild(
  state: GameState,
  playerId: string,
  territoryId: string,
  buildingType: BuildingType
): void {
  const territory = state.territories[territoryId];
  const player = state.players.find((p) => p.player_id === playerId);
  if (!territory || !player) return;

  const cost = BUILDING_COSTS[buildingType];
  player.special_resource = (player.special_resource ?? 0) - cost;

  if (!territory.buildings) territory.buildings = [];

  // Upgrade: remove previous tier in same category
  const prevTierMap: Partial<Record<BuildingType, BuildingType>> = {
    production_2: 'production_1',
    production_3: 'production_2',
    defense_2: 'defense_1',
    defense_3: 'defense_2',
    tech_gen_2: 'tech_gen_1',
    naval_base: 'port',
  };
  const prevTier = prevTierMap[buildingType];
  if (prevTier) {
    territory.buildings = territory.buildings.filter((b) => b !== prevTier);
  }

  territory.buildings.push(buildingType);
}

// ── Production tick ───────────────────────────────────────────────────────────

/**
 * Called at the start of a player's turn.
 * Accumulates production units (→ PlayerState.special_resource) and tech points
 * (→ PlayerState.tech_points) from all owned territories' buildings.
 *
 * Returns a summary for logging / client notification.
 */
export function collectProduction(
  state: GameState,
  playerId: string,
): { productionEarned: number; techPointsEarned: number } {
  if (!state.settings.economy_enabled) return { productionEarned: 0, techPointsEarned: 0 };

  let productionEarned = 0;
  let techPointsEarned = 0;
  let ownedCount = 0;

  for (const territory of Object.values(state.territories)) {
    if (territory.owner_id !== playerId) continue;
    ownedCount++;
    const stabilityScale = state.settings.stability_enabled
      ? getStabilityMultiplier(territory.stability)
      : 1;
    for (const building of territory.buildings ?? []) {
      productionEarned += Math.floor((BUILDING_PRODUCTION_INCOME[building] ?? 0) * stabilityScale);
      techPointsEarned += Math.floor((BUILDING_TECH_INCOME[building] ?? 0) * stabilityScale);
    }
  }

  // Base income: 1 resource per 3 territories (min 1), so players can bootstrap
  productionEarned += Math.max(1, Math.floor(ownedCount / 3));
  // Base tech income: 1 TP per 5 territories when tech trees are enabled
  if (state.settings.tech_trees_enabled) {
    techPointsEarned += Math.max(1, Math.floor(ownedCount / 5));
  }

  // Apply production_bonus temporary modifier from event cards (may be negative)
  const productionModifier = getTemporaryModifierValue(state, playerId, 'production_bonus');
  if (productionModifier !== 0) {
    productionEarned = Math.max(0, productionEarned + productionModifier);
  }

  const player = state.players.find((p) => p.player_id === playerId);
  if (player) {
    player.special_resource = (player.special_resource ?? 0) + productionEarned;
    if (state.settings.tech_trees_enabled) {
      player.tech_points = (player.tech_points ?? 0) + techPointsEarned;
    }
  }

  return { productionEarned, techPointsEarned };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Calculate the total defender dice bonus from buildings on a territory.
 */
export function getBuildingDefenseBonus(state: GameState, territoryId: string): number {
  const territory = state.territories[territoryId];
  if (!territory || !state.settings.economy_enabled) return 0;
  let bonus = 0;
  for (const building of territory.buildings ?? []) {
    bonus += BUILDING_DEFENSE_BONUS[building] ?? 0;
  }
  return bonus;
}

/**
 * When a territory is captured, destroy all its buildings (or optionally keep them).
 * Current rule: all buildings are razed on capture.
 */
export function onTerritoryCapture(state: GameState, territoryId: string): void {
  const territory = state.territories[territoryId];
  if (!territory) return;
  if (state.settings.economy_enabled) {
    territory.buildings = [];
    territory.production_bonus = 0;
  }
  // Raze fleet on capture regardless of economy toggle — port is destroyed
  if (territory.naval_units != null) {
    territory.naval_units = 0;
  }
}
