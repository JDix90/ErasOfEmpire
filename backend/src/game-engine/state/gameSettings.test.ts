import { describe, it, expect } from 'vitest';
import { normalizeGameSettings, getAllowedVictoryConditions } from './gameSettings';
import type { GameSettings } from '../../types';

describe('normalizeGameSettings', () => {
  it('maps legacy victory_type to allowed_victory_conditions', () => {
    const s = normalizeGameSettings({ fog_of_war: false, victory_type: 'threshold', victory_threshold: 55 });
    expect(s.allowed_victory_conditions).toEqual(['threshold']);
    expect(s.victory_threshold).toBe(55);
  });

  it('prefers allowed_victory_conditions when present', () => {
    const s = normalizeGameSettings({
      fog_of_war: false,
      victory_type: 'domination',
      allowed_victory_conditions: ['capital', 'secret_mission'],
    } as Partial<GameSettings>);
    expect(s.allowed_victory_conditions).toEqual(['capital', 'secret_mission']);
  });
});

describe('getAllowedVictoryConditions', () => {
  it('falls back to victory_type', () => {
    const s = normalizeGameSettings({ fog_of_war: false, victory_type: 'threshold', victory_threshold: 40 });
    expect(getAllowedVictoryConditions(s)).toEqual(['threshold']);
  });
});
