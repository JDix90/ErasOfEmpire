import { describe, it, expect } from 'vitest';
import { isMissionComplete } from './missions';
import type { GameMap, GameState, PlayerState } from '../../types';

const miniMap: GameMap = {
  map_id: 'm',
  name: 'M',
  territories: [
    { territory_id: 'a', name: 'A', polygon: [], center_point: [0, 0], region_id: 'north' },
    { territory_id: 'b', name: 'B', polygon: [], center_point: [0, 0], region_id: 'north' },
    { territory_id: 'c', name: 'C', polygon: [], center_point: [0, 0], region_id: 'south' },
  ],
  connections: [],
  regions: [
    { region_id: 'north', name: 'N', bonus: 1 },
    { region_id: 'south', name: 'S', bonus: 1 },
  ],
};

function baseState(players: PlayerState[]): GameState {
  return {
    game_id: 'g',
    era: 'ancient',
    map_id: 'm',
    phase: 'attack',
    current_player_index: 0,
    turn_number: 1,
    players,
    territories: {
      a: { territory_id: 'a', owner_id: 'p1', unit_count: 3, unit_type: 'infantry' },
      b: { territory_id: 'b', owner_id: 'p1', unit_count: 2, unit_type: 'infantry' },
      c: { territory_id: 'c', owner_id: 'p2', unit_count: 3, unit_type: 'infantry' },
    },
    card_deck: [],
    card_set_redemption_count: 0,
    diplomacy: [],
    settings: {
      fog_of_war: false,
      allowed_victory_conditions: ['secret_mission'],
      turn_timer_seconds: 0,
      initial_unit_count: 3,
      card_set_escalating: true,
      diplomacy_enabled: false,
    },
    draft_units_remaining: 0,
    turn_started_at: Date.now(),
  };
}

describe('isMissionComplete', () => {
  it('capture_territories when both owned', () => {
    const p: PlayerState = {
      player_id: 'p1',
      player_index: 0,
      username: 'a',
      color: '#fff',
      is_ai: false,
      is_eliminated: false,
      territory_count: 2,
      cards: [],
      mmr: 1000,
      capital_territory_id: null,
      secret_mission: { kind: 'capture_territories', territory_ids: ['a', 'b'] },
    };
    const state = baseState([p, { ...p, player_id: 'p2', player_index: 1, secret_mission: null }]);
    expect(isMissionComplete(state, miniMap, p)).toBe(true);
  });

  it('eliminate_player when target eliminated', () => {
    const p1: PlayerState = {
      player_id: 'p1',
      player_index: 0,
      username: 'a',
      color: '#fff',
      is_ai: false,
      is_eliminated: false,
      territory_count: 1,
      cards: [],
      mmr: 1000,
      capital_territory_id: null,
      secret_mission: { kind: 'eliminate_player', target_player_id: 'p2' },
    };
    const p2: PlayerState = {
      player_id: 'p2',
      player_index: 1,
      username: 'b',
      color: '#000',
      is_ai: false,
      is_eliminated: true,
      territory_count: 0,
      cards: [],
      mmr: 1000,
      capital_territory_id: null,
      secret_mission: null,
    };
    const state = baseState([p1, p2]);
    expect(isMissionComplete(state, miniMap, p1)).toBe(true);
  });
});
