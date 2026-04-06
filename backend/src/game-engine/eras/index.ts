// ============================================================
// Era definitions barrel export
// ============================================================

export type { Faction, TechNode } from './types';

export { ANCIENT_FACTIONS, ANCIENT_TECH_TREE } from './ancient';
export { MEDIEVAL_FACTIONS, MEDIEVAL_TECH_TREE } from './medieval';
export { DISCOVERY_FACTIONS, DISCOVERY_TECH_TREE } from './discovery';
export { WW2_FACTIONS, WW2_TECH_TREE } from './ww2';
export { COLDWAR_FACTIONS, COLDWAR_TECH_TREE } from './coldwar';
export { MODERN_FACTIONS, MODERN_TECH_TREE } from './modern';
export { ACW_FACTIONS, ACW_TECH_TREE } from './acw';
export { RISORGIMENTO_FACTIONS, RISORGIMENTO_TECH_TREE } from './risorgimento';

import type { Faction, TechNode } from './types';
import type { EraId } from '../../types';
import { ANCIENT_FACTIONS, ANCIENT_TECH_TREE } from './ancient';
import { MEDIEVAL_FACTIONS, MEDIEVAL_TECH_TREE } from './medieval';
import { DISCOVERY_FACTIONS, DISCOVERY_TECH_TREE } from './discovery';
import { WW2_FACTIONS, WW2_TECH_TREE } from './ww2';
import { COLDWAR_FACTIONS, COLDWAR_TECH_TREE } from './coldwar';
import { MODERN_FACTIONS, MODERN_TECH_TREE } from './modern';
import { ACW_FACTIONS, ACW_TECH_TREE } from './acw';
import { RISORGIMENTO_FACTIONS, RISORGIMENTO_TECH_TREE } from './risorgimento';

const ERA_FACTIONS: Partial<Record<EraId, Faction[]>> = {
  ancient:      ANCIENT_FACTIONS,
  medieval:     MEDIEVAL_FACTIONS,
  discovery:    DISCOVERY_FACTIONS,
  ww2:          WW2_FACTIONS,
  coldwar:      COLDWAR_FACTIONS,
  modern:       MODERN_FACTIONS,
  acw:          ACW_FACTIONS,
  risorgimento: RISORGIMENTO_FACTIONS,
};

const ERA_TECH_TREES: Partial<Record<EraId, TechNode[]>> = {
  ancient:      ANCIENT_TECH_TREE,
  medieval:     MEDIEVAL_TECH_TREE,
  discovery:    DISCOVERY_TECH_TREE,
  ww2:          WW2_TECH_TREE,
  coldwar:      COLDWAR_TECH_TREE,
  modern:       MODERN_TECH_TREE,
  acw:          ACW_TECH_TREE,
  risorgimento: RISORGIMENTO_TECH_TREE,
};

export function getEraFactions(era: EraId): Faction[] {
  return ERA_FACTIONS[era] ?? [];
}

export function getEraTechTree(era: EraId): TechNode[] {
  return ERA_TECH_TREES[era] ?? [];
}

export function getFactionById(era: EraId, factionId: string): Faction | undefined {
  return (ERA_FACTIONS[era] ?? []).find((f) => f.faction_id === factionId);
}

export function getTechNodeById(era: EraId, techId: string): TechNode | undefined {
  return (ERA_TECH_TREES[era] ?? []).find((n) => n.tech_id === techId);
}
