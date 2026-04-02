/**
 * Offline validation for map JSON (seed files / editor output).
 * Ensures connection graph integrity before maps hit MongoDB or gameplay.
 */

export interface MapConnection {
  from: string;
  to: string;
  type?: 'land' | 'sea';
}

export interface MapTerritoryRef {
  territory_id: string;
}

export interface MapDocumentLike {
  map_id?: string;
  name?: string;
  territories: MapTerritoryRef[];
  connections: MapConnection[];
}

/**
 * Returns human-readable errors; empty array means valid.
 * Map JSON stores each **undirected** edge once (`from`/`to`). Gameplay treats connections as
 * undirected (see server adjacency check in gameSocket). We validate endpoints exist,
 * no self-loops, and no duplicate territory pairs (including A→B plus B→A).
 */
export function validateMapConnections(map: MapDocumentLike): string[] {
  const errors: string[] = [];
  const idSet = new Set(map.territories.map((t) => t.territory_id));
  const pairSeen = new Set<string>();

  for (const c of map.connections) {
    if (!idSet.has(c.from)) {
      errors.push(`Connection references unknown territory "from": ${c.from}`);
    }
    if (!idSet.has(c.to)) {
      errors.push(`Connection references unknown territory "to": ${c.to}`);
    }
    if (c.from === c.to) {
      errors.push(`Self-loop connection: ${c.from}`);
      continue;
    }
    const a = c.from < c.to ? c.from : c.to;
    const b = c.from < c.to ? c.to : c.from;
    const pairKey = `${a}\0${b}`;
    if (pairSeen.has(pairKey)) {
      errors.push(`Duplicate connection between ${a} and ${b}`);
    }
    pairSeen.add(pairKey);
  }

  return errors;
}
