#!/usr/bin/env node
/**
 * Validates that public/geo/risorgimento_admin1.json matches
 * frontend/src/data/risorgimentoRegionMap.ts (partition covers each NE feature exactly once).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const geoPath = path.join(root, 'frontend/public/geo/risorgimento_admin1.json');
const tsPath = path.join(root, 'frontend/src/data/risorgimentoRegionMap.ts');

const geo = JSON.parse(fs.readFileSync(geoPath, 'utf8'));
const fromGeo = new Set(geo.features.map((f) => f.properties.iso_3166_2));

const ts = fs.readFileSync(tsPath, 'utf8');
const fromTs = new Set([...ts.matchAll(/'((?:IT|SM|VA)-[^']+)'/g)].map((m) => m[1]));

let ok = true;
for (const c of fromGeo) {
  if (!fromTs.has(c)) {
    console.error('In GeoJSON but not in partition:', c);
    ok = false;
  }
}
for (const c of fromTs) {
  if (!fromGeo.has(c)) {
    console.error('In partition but missing from GeoJSON:', c);
    ok = false;
  }
}

if (fromTs.size !== fromGeo.size) {
  console.error('Count mismatch:', 'partition', fromTs.size, 'geo', fromGeo.size);
  ok = false;
}

if (!ok) process.exit(1);
console.log('Risorgimento partition OK:', fromGeo.size, 'features');
