/**
 * North America theater — snapped rectangles only (no border displacement).
 * Wavy polylines caused geometric overlap on the globe; territories must not overlap.
 * Run: node database/maps/buildCommunity14Nations.js
 */
const fs = require('fs');
const path = require('path');

const MAP_ID = 'community_14_nations';
const CW = 1200;
const CH = 700;
/** Theater: North America + Central America only (no Atlantic/Europe padding on the east). */
const B = { minLng: -127, maxLng: -78, minLat: 14, maxLat: 47 };

const EPS = 1e-4;

function toCanvas(lng, lat) {
  const x = ((lng - B.minLng) / (B.maxLng - B.minLng)) * CW;
  const y = ((B.maxLat - lat) / (B.maxLat - B.minLat)) * CH;
  return [x, y];
}

/**
 * Snap adjacent rects so they share full edges (same s,n on vertical; same w,e on horizontal).
 * Run several passes — order stabilizes neighbor bounds for gameplay.
 */
function snapAdjacent(rects, connections) {
  const byId = new Map(rects.map((r) => [r.id, { ...r }]));

  const TOL = 0.35;

  for (let pass = 0; pass < 6; pass++) {
    for (const c of connections) {
      if (c.type === 'sea') continue;
      const A = byId.get(c.from);
      const B = byId.get(c.to);
      if (!A || !B) continue;

      const latOverlap = Math.min(A.n, B.n) > Math.max(A.s, B.s) + EPS;
      const lngOverlap = Math.min(A.e, B.e) > Math.max(A.w, B.w) + EPS;

      // Shared vertical line: A east meets B west (A is west of B)
      if (latOverlap && Math.abs(A.e - B.w) < TOL) {
        const L = (A.e + B.w) / 2;
        A.e = L;
        B.w = L;
        const lo = Math.max(A.s, B.s);
        const hi = Math.min(A.n, B.n);
        if (hi > lo + EPS) {
          A.s = B.s = lo;
          A.n = B.n = hi;
        }
      }
      // B east meets A west (B is west of A)
      if (latOverlap && Math.abs(B.e - A.w) < TOL) {
        const L = (B.e + A.w) / 2;
        B.e = L;
        A.w = L;
        const lo = Math.max(A.s, B.s);
        const hi = Math.min(A.n, B.n);
        if (hi > lo + EPS) {
          A.s = B.s = lo;
          A.n = B.n = hi;
        }
      }
      // Shared horizontal: A.n meets B.s (B is north of A)
      if (lngOverlap && Math.abs(A.n - B.s) < TOL) {
        const L = (A.n + B.s) / 2;
        A.n = L;
        B.s = L;
        const lo = Math.max(A.w, B.w);
        const hi = Math.min(A.e, B.e);
        if (hi > lo + EPS) {
          A.w = B.w = lo;
          A.e = B.e = hi;
        }
      }
      // A.s meets B.n (A is north of B)
      if (lngOverlap && Math.abs(A.s - B.n) < TOL) {
        const L = (A.s + B.n) / 2;
        A.s = L;
        B.n = L;
        const lo = Math.max(A.w, B.w);
        const hi = Math.min(A.e, B.e);
        if (hi > lo + EPS) {
          A.w = B.w = lo;
          A.e = B.e = hi;
        }
      }
    }
  }
  return Array.from(byId.values());
}

/** CCW closed ring: SW → SE → NE → NW → SW. Guarantees no self-intersection or wave bleed. */
function rectGeoRing(r) {
  const { w, s, e, n } = r;
  return [
    [w, s],
    [e, s],
    [e, n],
    [w, n],
    [w, s],
  ];
}

function ringToTerritory(id, name, regionId, ringLngLat) {
  const ring = [...ringLngLat];
  const first = ring[0];
  const last = ring[ring.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) ring.push([...first]);

  const poly = ring.map(([lng, lat]) => toCanvas(lng, lat));
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < poly.length - 1; i++) {
    cx += poly[i][0];
    cy += poly[i][1];
  }
  const nv = poly.length - 1;
  cx /= nv;
  cy /= nv;

  return {
    territory_id: id,
    name,
    geo_polygon: ring.map(([lng, lat]) => [lng, lat]),
    polygon: poly.map(([x, y]) => [Math.round(x * 1000) / 1000, Math.round(y * 1000) / 1000]),
    center_point: [Math.round(cx * 100) / 100, Math.round(cy * 100) / 100],
    region_id: regionId,
  };
}

// ── Raw layout (approximate); snapAdjacent will align shared edges ───────────
const RAW = [
  { id: 'n14_klamath', name: 'Klamath River Confederacy', region_id: 'region_california', w: -124.55, s: 41.2, e: -123.48, n: 42.82 },
  { id: 'n14_pomo_miwok', name: 'Pomo-Miwok League', region_id: 'region_california', w: -123.48, s: 36.75, e: -122.15, n: 41.2 },
  { id: 'n14_chumash', name: 'Chumash League', region_id: 'region_california', w: -122.15, s: 33.85, e: -119.05, n: 36.75 },
  { id: 'n14_great_valley', name: 'Great Valley Confederacy', region_id: 'region_california', w: -121.92, s: 35.22, e: -118.02, n: 40.22 },
  { id: 'n14_great_basin', name: 'Great Basin', region_id: 'region_basin', w: -118.02, s: 35.25, e: -114.05, n: 40.18 },
  { id: 'n14_dine', name: 'Diné Bikéyah', region_id: 'region_aridoamerica', w: -114.05, s: 35.05, e: -109.55, n: 37.15 },
  { id: 'n14_apache_mesa', name: 'Apache Heartland', region_id: 'region_aridoamerica', w: -109.55, s: 32.05, e: -106.85, n: 35.55 },
  { id: 'n14_sonoran', name: 'Sonoran Desert', region_id: 'region_aridoamerica', w: -106.85, s: 23.42, e: -103.85, n: 33.12 },
  { id: 'n14_wixarika', name: 'Wixárika Confederacy', region_id: 'region_mexico', w: -105.35, s: 19.1, e: -103.85, n: 23.45 },
  { id: 'n14_collima', name: 'Kingdom of Collima', region_id: 'region_mexico', w: -104.55, s: 17.95, e: -103.28, n: 19.1 },
  { id: 'n14_yucu_dzaa', name: 'Kingdom of Yucu Dzaa', region_id: 'region_mexico', w: -98.35, s: 15.82, e: -97.0, n: 17.22 },
  { id: 'n14_zaachila', name: 'Kingdom of Zaachila', region_id: 'region_mexico', w: -97.05, s: 15.82, e: -95.28, n: 17.48 },
  { id: 'n14_northern_plains', name: 'Northern Plains', region_id: 'region_plains', w: -102.5, s: 40.15, e: -96.85, n: 44.05 },
  { id: 'n14_central_plains', name: 'Central Plains', region_id: 'region_plains', w: -99.35, s: 37.15, e: -95.85, n: 40.15 },
  { id: 'n14_southern_plains', name: 'Southern Plains', region_id: 'region_plains', w: -102.2, s: 33.45, e: -92.85, n: 37.15 },
  { id: 'n14_ozark', name: 'Ozark Gateway', region_id: 'region_plains', w: -92.85, s: 35.45, e: -88.85, n: 37.15 },
  { id: 'n14_chickasaw', name: 'Chickasaw Confederacy', region_id: 'region_chickasaw', w: -89.35, s: 33.05, e: -86.65, n: 35.45 },
  { id: 'n14_apalachee', name: 'Apalachee Chiefdom', region_id: 'region_florida', w: -85.35, s: 29.45, e: -83.65, n: 30.75 },
  { id: 'n14_timucua', name: 'Timucua Chiefdom', region_id: 'region_florida', w: -83.55, s: 28.35, e: -81.05, n: 30.2 },
  { id: 'n14_tocobaga', name: 'Tocobaga Chiefdom', region_id: 'region_florida', w: -82.95, s: 27.05, e: -81.88, n: 28.25 },
  { id: 'n14_calusa', name: 'Calusa Chiefdom', region_id: 'region_florida', w: -82.35, s: 25.55, e: -80.65, n: 26.95 },
  { id: 'n14_ais_tequesta', name: 'Ais-Tequesta Chiefdom', region_id: 'region_florida', w: -80.55, s: 25.0, e: -79.9, n: 26.25 },
];

const connections = [
  { from: 'n14_klamath', to: 'n14_pomo_miwok', type: 'land' },
  { from: 'n14_pomo_miwok', to: 'n14_chumash', type: 'land' },
  { from: 'n14_pomo_miwok', to: 'n14_great_valley', type: 'land' },
  { from: 'n14_chumash', to: 'n14_great_valley', type: 'land' },
  { from: 'n14_great_valley', to: 'n14_great_basin', type: 'land' },
  { from: 'n14_great_basin', to: 'n14_dine', type: 'land' },
  { from: 'n14_dine', to: 'n14_apache_mesa', type: 'land' },
  { from: 'n14_apache_mesa', to: 'n14_sonoran', type: 'land' },
  { from: 'n14_sonoran', to: 'n14_wixarika', type: 'land' },
  { from: 'n14_dine', to: 'n14_northern_plains', type: 'land' },
  { from: 'n14_wixarika', to: 'n14_collima', type: 'land' },
  { from: 'n14_collima', to: 'n14_yucu_dzaa', type: 'land' },
  { from: 'n14_yucu_dzaa', to: 'n14_zaachila', type: 'land' },
  { from: 'n14_zaachila', to: 'n14_southern_plains', type: 'sea' },
  { from: 'n14_northern_plains', to: 'n14_central_plains', type: 'land' },
  { from: 'n14_central_plains', to: 'n14_southern_plains', type: 'land' },
  { from: 'n14_southern_plains', to: 'n14_ozark', type: 'land' },
  { from: 'n14_ozark', to: 'n14_chickasaw', type: 'land' },
  { from: 'n14_central_plains', to: 'n14_ozark', type: 'land' },
  { from: 'n14_chickasaw', to: 'n14_apalachee', type: 'land' },
  { from: 'n14_apalachee', to: 'n14_timucua', type: 'land' },
  { from: 'n14_timucua', to: 'n14_tocobaga', type: 'land' },
  { from: 'n14_tocobaga', to: 'n14_calusa', type: 'land' },
  { from: 'n14_calusa', to: 'n14_ais_tequesta', type: 'land' },
  { from: 'n14_timucua', to: 'n14_calusa', type: 'land' },
  { from: 'n14_tocobaga', to: 'n14_ais_tequesta', type: 'land' },
];

const aligned = snapAdjacent(RAW, connections);

const territories = aligned.map((r) =>
  ringToTerritory(r.id, r.name, r.region_id, rectGeoRing(r)),
);

const regions = [
  { region_id: 'region_california', name: 'Pacific Coast & Central Valley', bonus: 4 },
  { region_id: 'region_basin', name: 'Great Basin', bonus: 2 },
  { region_id: 'region_aridoamerica', name: 'Aridoamerica', bonus: 3 },
  { region_id: 'region_mexico', name: 'Mesoamerica & Mexico', bonus: 3 },
  { region_id: 'region_plains', name: 'Great Plains & Gateway', bonus: 4 },
  { region_id: 'region_chickasaw', name: 'Chickasaw Heartland', bonus: 2 },
  { region_id: 'region_florida', name: 'Florida & Gulf Coast', bonus: 4 },
];

const out = {
  map_id: MAP_ID,
  name: 'The 14 Nations',
  description:
    'North America and Central America only: non-overlapping regions from the Pacific to the Gulf and Atlantic coasts — California through the Great Basin, Diné & Apache lands, Sonoran desert, Great Plains, Mesoamerica, and Florida. Territory shapes are axis-aligned rectangles with shared edges where adjacent.',
  era_theme: 'custom',
  canvas_width: CW,
  canvas_height: CH,
  projection_bounds: B,
  /** Globe: frame the full theater on the marble texture (altitude ↑ = wider view; was 0.95 = too tight / “blob”). */
  globe_view: { lock_rotation: true, center_lat: 28.5, center_lng: -102, altitude: 1.48 },
  territories,
  connections,
  regions,
};

const outPath = path.join(__dirname, 'community_14_nations.json');
fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
console.log('Wrote', outPath, '—', territories.length, 'territories,', connections.length, 'connections');
