import { describe, it, expect } from 'vitest';
import { validateMapConnections } from './mapConnections';

describe('validateMapConnections', () => {
  it('passes for minimal graph with one undirected edge row', () => {
    const map = {
      territories: [{ territory_id: 'a' }, { territory_id: 'b' }],
      connections: [{ from: 'a', to: 'b', type: 'land' as const }],
    };
    expect(validateMapConnections(map)).toEqual([]);
  });

  it('errors on duplicate undirected edge', () => {
    const map = {
      territories: [{ territory_id: 'a' }, { territory_id: 'b' }],
      connections: [
        { from: 'a', to: 'b', type: 'land' as const },
        { from: 'b', to: 'a', type: 'land' as const },
      ],
    };
    expect(validateMapConnections(map).some((e) => e.includes('Duplicate connection'))).toBe(true);
  });

  it('errors on unknown territory id', () => {
    const map = {
      territories: [{ territory_id: 'a' }],
      connections: [
        { from: 'a', to: 'x', type: 'land' as const },
        { from: 'x', to: 'a', type: 'land' as const },
      ],
    };
    expect(validateMapConnections(map).length).toBeGreaterThan(0);
  });
});
