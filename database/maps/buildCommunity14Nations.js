/**
 * "The 14 Nations" — North America from the Yucatán to the Yukon.
 * ~43 territories across 8 regions. Logical layout is a rect grid; exported
 * polygons use shared organic edges (wiggly interiors) and simplified Pacific /
 * Atlantic / Gulf / Arctic polylines on map bounds. See organic14nGeometry.js.
 *
 * Run:  node database/maps/buildCommunity14Nations.js
 */
const fs = require('fs');
const path = require('path');
const { buildEdgeLibrary, rectToOrganicRing } = require('./organic14nGeometry.js');

const MAP_ID = 'community_14_nations';
const CW = 1200;
const CH = 700;

const B = { minLng: -145, maxLng: -55, minLat: 15, maxLat: 65 };

function toCanvas(lng, lat) {
  const x = ((lng - B.minLng) / (B.maxLng - B.minLng)) * CW;
  const y = ((B.maxLat - lat) / (B.maxLat - B.minLat)) * CH;
  return [x, y];
}

function ringToTerritory(id, name, regionId, ringLngLat) {
  const ring = [...ringLngLat];
  const first = ring[0];
  const last = ring[ring.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) ring.push([...first]);

  const poly = ring.map(([lng, lat]) => toCanvas(lng, lat));
  let cx = 0, cy = 0;
  for (let i = 0; i < poly.length - 1; i++) { cx += poly[i][0]; cy += poly[i][1]; }
  const nv = poly.length - 1;
  cx /= nv; cy /= nv;

  return {
    territory_id: id,
    name,
    /** Globe uses Natural Earth admin-1 union (see frontend community14nAdmin1Map.ts); canvas keeps this ring. */
    polygon: poly.map(([x, y]) => [Math.round(x * 1000) / 1000, Math.round(y * 1000) / 1000]),
    center_point: [Math.round(cx * 100) / 100, Math.round(cy * 100) / 100],
    region_id: regionId,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Territory definitions — rectangles {w, s, e, n} in WGS84 degrees.
//
// Layout: 8 latitude bands from north to south.
// Within each band, territories tile west-to-east with shared edges.
// Between bands, matching longitude ranges produce shared horizontal edges.
//
// Row A  55–65  Subarctic (Dene, Cree, Innu)
// Row B  49–55  Northern  (Tlingit → Mi'kmaq)
// Row C  44–49  N. US     (Chinook → Wabanaki)
// Row D  39–44  Middle    (Kalapuya → Powhatan)
// Row E  33–39  Central   (Pomo → Tuscarora)   [Chumash extends to 31]
// Row F  27–33  Southern  (Yavapai → Florida)
// Row G  21–27  Mexico    (Tohono → Huastec)
// Row H  15–21  Mesomx    (Purépecha → Maya)
// ═══════════════════════════════════════════════════════════════════════════════

const RAW = [
  // ── ROW A: SUBARCTIC (55–65) ───────────────────────────────────────────────
  { id: 'na_dene',          name: 'Dene Nation',               region_id: 'region_subarctic',   w:-145, s:55, e:-112, n:65 },
  { id: 'na_cree',          name: 'Cree Territory',            region_id: 'region_subarctic',   w:-112, s:55, e:-80,  n:65 },
  { id: 'na_innu',          name: 'Innu-Naskapi',              region_id: 'region_subarctic',   w:-80,  s:55, e:-55,  n:65 },

  // ── ROW B: NORTHERN (49–55) ────────────────────────────────────────────────
  { id: 'na_tlingit',       name: 'Tlingit Confederacy',       region_id: 'region_pacific',     w:-145, s:49, e:-130, n:55 },
  { id: 'na_salish',        name: 'Salish Nations',            region_id: 'region_pacific',     w:-130, s:49, e:-122, n:55 },
  { id: 'na_blackfoot',     name: 'Blackfoot Confederacy',     region_id: 'region_plains',      w:-122, s:49, e:-110, n:55 },
  { id: 'na_assiniboine',   name: 'Assiniboine',               region_id: 'region_plains',      w:-110, s:49, e:-100, n:55 },
  { id: 'na_ojibwe',        name: 'Ojibwe Confederacy',        region_id: 'region_woodlands',   w:-100, s:49, e:-88,  n:55 },
  { id: 'na_algonquin',     name: 'Algonquin Alliance',        region_id: 'region_woodlands',   w:-88,  s:49, e:-72,  n:55 },
  { id: 'na_mikmaq',        name: "Mi'kmaq Confederacy",       region_id: 'region_woodlands',   w:-72,  s:49, e:-55,  n:55 },

  // ── ROW C: NORTHERN US (44–49) ────────────────────────────────────────────
  { id: 'na_chinook',       name: 'Chinook League',            region_id: 'region_pacific',     w:-130, s:44, e:-122, n:49 },
  { id: 'na_yakama',        name: 'Yakama–Nez Perce',          region_id: 'region_west',        w:-122, s:44, e:-115, n:49 },
  { id: 'na_crow',          name: 'Crow Nation',               region_id: 'region_plains',      w:-115, s:44, e:-105, n:49 },
  { id: 'na_lakota',        name: 'Lakota Confederacy',        region_id: 'region_plains',      w:-105, s:44, e:-96,  n:49 },
  { id: 'na_potawatomi',    name: 'Potawatomi League',         region_id: 'region_woodlands',   w:-96,  s:44, e:-86,  n:49 },
  { id: 'na_haudenosaunee', name: 'Haudenosaunee',             region_id: 'region_woodlands',   w:-86,  s:44, e:-76,  n:49 },
  { id: 'na_wabanaki',      name: 'Wabanaki Confederacy',      region_id: 'region_woodlands',   w:-76,  s:44, e:-66,  n:49 },

  // ── ROW D: MIDDLE (39–44) ─────────────────────────────────────────────────
  { id: 'na_kalapuya',      name: 'Kalapuya Alliance',         region_id: 'region_pacific',     w:-126, s:40, e:-121, n:44 },
  { id: 'na_great_basin',   name: 'Great Basin Peoples',       region_id: 'region_west',        w:-121, s:39, e:-112, n:44 },
  { id: 'na_pawnee',        name: 'Pawnee Confederacy',        region_id: 'region_plains',      w:-112, s:39, e:-103, n:44 },
  { id: 'na_osage',         name: 'Osage Nation',              region_id: 'region_plains',      w:-103, s:39, e:-96,  n:44 },
  { id: 'na_shawnee',       name: 'Shawnee Confederacy',       region_id: 'region_woodlands',   w:-96,  s:39, e:-86,  n:44 },
  { id: 'na_powhatan',      name: 'Powhatan Confederacy',      region_id: 'region_woodlands',   w:-86,  s:39, e:-76,  n:44 },

  // ── ROW E: CENTRAL (33–39) ────────────────────────────────────────────────
  { id: 'na_pomo',          name: 'Pomo-Miwok League',         region_id: 'region_pacific',     w:-125, s:36, e:-121, n:40 },
  { id: 'na_chumash',       name: 'Chumash-Tongva',            region_id: 'region_west',        w:-121, s:31, e:-115, n:39 },
  { id: 'na_dine',          name: 'Diné Bikéyah',              region_id: 'region_west',        w:-115, s:34, e:-108, n:39 },
  { id: 'na_pueblo',        name: 'Pueblo League',             region_id: 'region_heartland',   w:-108, s:33, e:-103, n:39 },
  { id: 'na_comanche',      name: 'Comanche Empire',           region_id: 'region_plains',      w:-103, s:33, e:-96,  n:39 },
  { id: 'na_caddo',         name: 'Caddo Confederacy',         region_id: 'region_heartland',   w:-96,  s:33, e:-91,  n:39 },
  { id: 'na_cherokee',      name: 'Cherokee Nation',           region_id: 'region_southeast',   w:-91,  s:33, e:-83,  n:39 },
  { id: 'na_tuscarora',     name: 'Tuscarora–Catawba',         region_id: 'region_southeast',   w:-83,  s:33, e:-76,  n:39 },

  // ── ROW F: SOUTHERN (27–33) ───────────────────────────────────────────────
  { id: 'na_yavapai',       name: 'Yavapai–Tohono O\'odham',   region_id: 'region_west',        w:-115, s:27, e:-108, n:34 },
  { id: 'na_apache',        name: 'Apache Confederacy',        region_id: 'region_heartland',   w:-108, s:27, e:-103, n:33 },
  { id: 'na_jumano',        name: 'Jumano Traders',            region_id: 'region_heartland',   w:-103, s:27, e:-96,  n:33 },
  { id: 'na_chickasaw',     name: 'Chickasaw–Natchez',         region_id: 'region_heartland',   w:-96,  s:27, e:-90,  n:33 },
  { id: 'na_muscogee',      name: 'Muscogee Confederacy',      region_id: 'region_southeast',   w:-90,  s:27, e:-84,  n:33 },
  { id: 'na_florida',       name: 'Florida Nations',           region_id: 'region_southeast',   w:-84,  s:24, e:-79,  n:33 },

  // ── ROW G: MEXICO (21–27) ─────────────────────────────────────────────────
  { id: 'na_tohono',        name: 'Tohono O\'odham',           region_id: 'region_mesoamerica', w:-115, s:21, e:-107, n:27 },
  { id: 'na_coahuiltecos',  name: 'Coahuiltecos',              region_id: 'region_mesoamerica', w:-107, s:21, e:-98,  n:27 },
  { id: 'na_huastec',       name: 'Huastec Kingdom',           region_id: 'region_mesoamerica', w:-98,  s:21, e:-90,  n:27 },

  // ── ROW H: MESOAMERICA (15–21) ────────────────────────────────────────────
  { id: 'na_purepecha',     name: 'Purépecha Empire',          region_id: 'region_mesoamerica', w:-107, s:15, e:-100, n:21 },
  { id: 'na_mexica',        name: 'Mexica Empire',             region_id: 'region_mesoamerica', w:-100, s:15, e:-94,  n:21 },
  { id: 'na_maya',          name: 'Maya Kingdoms',             region_id: 'region_mesoamerica', w:-94,  s:15, e:-86,  n:21 },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Connections — land links when rectangles share an edge; sea for Gulf/ocean crossings.
// ═══════════════════════════════════════════════════════════════════════════════

const connections = [
  // ── Row A ↔ Row B (lat 55) ──
  { from: 'na_dene',        to: 'na_tlingit',       type: 'land' },
  { from: 'na_dene',        to: 'na_salish',        type: 'land' },
  { from: 'na_dene',        to: 'na_blackfoot',     type: 'land' },
  { from: 'na_cree',        to: 'na_blackfoot',     type: 'land' },
  { from: 'na_cree',        to: 'na_assiniboine',   type: 'land' },
  { from: 'na_cree',        to: 'na_ojibwe',        type: 'land' },
  { from: 'na_cree',        to: 'na_algonquin',     type: 'land' },
  { from: 'na_innu',        to: 'na_algonquin',     type: 'land' },
  { from: 'na_innu',        to: 'na_mikmaq',        type: 'land' },

  // ── Row A internal ──
  { from: 'na_dene',        to: 'na_cree',          type: 'land' },
  { from: 'na_cree',        to: 'na_innu',          type: 'land' },

  // ── Row B internal ──
  { from: 'na_tlingit',     to: 'na_salish',        type: 'land' },
  { from: 'na_salish',      to: 'na_blackfoot',     type: 'land' },
  { from: 'na_blackfoot',   to: 'na_assiniboine',   type: 'land' },
  { from: 'na_assiniboine', to: 'na_ojibwe',        type: 'land' },
  { from: 'na_ojibwe',      to: 'na_algonquin',     type: 'land' },
  { from: 'na_algonquin',   to: 'na_mikmaq',        type: 'land' },

  // ── Row B ↔ Row C (lat 49) ──
  { from: 'na_salish',      to: 'na_chinook',       type: 'land' },
  { from: 'na_blackfoot',   to: 'na_yakama',        type: 'land' },
  { from: 'na_blackfoot',   to: 'na_crow',          type: 'land' },
  { from: 'na_assiniboine', to: 'na_crow',          type: 'land' },
  { from: 'na_assiniboine', to: 'na_lakota',        type: 'land' },
  { from: 'na_ojibwe',      to: 'na_lakota',        type: 'land' },
  { from: 'na_ojibwe',      to: 'na_potawatomi',    type: 'land' },
  { from: 'na_algonquin',   to: 'na_potawatomi',    type: 'land' },
  { from: 'na_algonquin',   to: 'na_haudenosaunee', type: 'land' },
  { from: 'na_algonquin',   to: 'na_wabanaki',      type: 'land' },
  { from: 'na_mikmaq',      to: 'na_wabanaki',      type: 'land' },

  // ── Row C internal ──
  { from: 'na_chinook',     to: 'na_yakama',        type: 'land' },
  { from: 'na_yakama',      to: 'na_crow',          type: 'land' },
  { from: 'na_crow',        to: 'na_lakota',        type: 'land' },
  { from: 'na_lakota',      to: 'na_potawatomi',    type: 'land' },
  { from: 'na_potawatomi',  to: 'na_haudenosaunee', type: 'land' },
  { from: 'na_haudenosaunee', to: 'na_wabanaki',    type: 'land' },

  // ── Row C ↔ Row D (lat 44) ──
  { from: 'na_chinook',     to: 'na_kalapuya',      type: 'land' },
  { from: 'na_yakama',      to: 'na_kalapuya',      type: 'land' },
  { from: 'na_yakama',      to: 'na_great_basin',   type: 'land' },
  { from: 'na_crow',        to: 'na_great_basin',   type: 'land' },
  { from: 'na_crow',        to: 'na_pawnee',        type: 'land' },
  { from: 'na_lakota',      to: 'na_pawnee',        type: 'land' },
  { from: 'na_lakota',      to: 'na_osage',         type: 'land' },
  { from: 'na_potawatomi',  to: 'na_osage',         type: 'land' },
  { from: 'na_potawatomi',  to: 'na_shawnee',       type: 'land' },
  { from: 'na_haudenosaunee', to: 'na_shawnee',     type: 'land' },
  { from: 'na_haudenosaunee', to: 'na_powhatan',    type: 'land' },

  // ── Row D internal ──
  { from: 'na_kalapuya',    to: 'na_great_basin',   type: 'land' },
  { from: 'na_great_basin', to: 'na_pawnee',        type: 'land' },
  { from: 'na_pawnee',      to: 'na_osage',         type: 'land' },
  { from: 'na_osage',       to: 'na_shawnee',       type: 'land' },
  { from: 'na_shawnee',     to: 'na_powhatan',      type: 'land' },

  // ── Row D ↔ Row E ──
  { from: 'na_kalapuya',    to: 'na_pomo',           type: 'land' },
  { from: 'na_great_basin', to: 'na_pomo',           type: 'land' },
  { from: 'na_great_basin', to: 'na_chumash',        type: 'land' },
  { from: 'na_great_basin', to: 'na_dine',           type: 'land' },
  { from: 'na_pawnee',      to: 'na_dine',           type: 'land' },
  { from: 'na_pawnee',      to: 'na_pueblo',         type: 'land' },
  { from: 'na_osage',       to: 'na_comanche',       type: 'land' },
  { from: 'na_shawnee',     to: 'na_comanche',       type: 'land' },
  { from: 'na_shawnee',     to: 'na_caddo',          type: 'land' },
  { from: 'na_shawnee',     to: 'na_cherokee',       type: 'land' },
  { from: 'na_powhatan',    to: 'na_cherokee',       type: 'land' },
  { from: 'na_powhatan',    to: 'na_tuscarora',      type: 'land' },

  // ── Row E internal ──
  { from: 'na_pomo',        to: 'na_chumash',        type: 'land' },
  { from: 'na_chumash',     to: 'na_dine',           type: 'land' },
  { from: 'na_dine',        to: 'na_pueblo',         type: 'land' },
  { from: 'na_pueblo',      to: 'na_comanche',       type: 'land' },
  { from: 'na_comanche',    to: 'na_caddo',          type: 'land' },
  { from: 'na_caddo',       to: 'na_cherokee',       type: 'land' },
  { from: 'na_cherokee',    to: 'na_tuscarora',      type: 'land' },

  // ── Row E ↔ Row F ──
  { from: 'na_chumash',     to: 'na_yavapai',        type: 'land' },
  { from: 'na_dine',        to: 'na_yavapai',        type: 'land' },
  { from: 'na_pueblo',      to: 'na_apache',         type: 'land' },
  { from: 'na_comanche',    to: 'na_jumano',         type: 'land' },
  { from: 'na_caddo',       to: 'na_chickasaw',      type: 'land' },
  { from: 'na_cherokee',    to: 'na_chickasaw',      type: 'land' },
  { from: 'na_cherokee',    to: 'na_muscogee',       type: 'land' },
  { from: 'na_tuscarora',   to: 'na_muscogee',       type: 'land' },
  { from: 'na_tuscarora',   to: 'na_florida',        type: 'land' },

  // ── Row F internal ──
  { from: 'na_yavapai',     to: 'na_apache',         type: 'land' },
  { from: 'na_apache',      to: 'na_jumano',         type: 'land' },
  { from: 'na_jumano',      to: 'na_chickasaw',      type: 'land' },
  { from: 'na_chickasaw',   to: 'na_muscogee',       type: 'land' },
  { from: 'na_muscogee',    to: 'na_florida',        type: 'land' },

  // ── Row F ↔ Row G ──
  { from: 'na_yavapai',     to: 'na_tohono',         type: 'land' },
  { from: 'na_apache',      to: 'na_coahuiltecos',   type: 'land' },
  { from: 'na_jumano',      to: 'na_coahuiltecos',   type: 'land' },
  { from: 'na_chickasaw',   to: 'na_huastec',        type: 'land' },

  // ── Row G internal ──
  { from: 'na_tohono',      to: 'na_coahuiltecos',   type: 'land' },
  { from: 'na_coahuiltecos', to: 'na_huastec',       type: 'land' },

  // ── Row G ↔ Row H ──
  { from: 'na_coahuiltecos', to: 'na_purepecha',     type: 'land' },
  { from: 'na_huastec',     to: 'na_purepecha',      type: 'land' },
  { from: 'na_huastec',     to: 'na_mexica',         type: 'land' },
  { from: 'na_huastec',     to: 'na_maya',           type: 'land' },

  // ── Row H internal ──
  { from: 'na_purepecha',   to: 'na_mexica',         type: 'land' },
  { from: 'na_mexica',      to: 'na_maya',           type: 'land' },

  // ── Sea connections (Gulf of Mexico & ocean crossings) ──
  { from: 'na_florida',     to: 'na_maya',           type: 'sea' },
  { from: 'na_muscogee',    to: 'na_huastec',        type: 'sea' },
  { from: 'na_tlingit',     to: 'na_chinook',        type: 'sea' },
  { from: 'na_wabanaki',     to: 'na_tuscarora',      type: 'sea' },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Regions
// ═══════════════════════════════════════════════════════════════════════════════

const regions = [
  { region_id: 'region_subarctic',   name: 'Subarctic',                      bonus: 3 },
  { region_id: 'region_pacific',     name: 'Pacific Northwest',              bonus: 5 },
  { region_id: 'region_west',        name: 'Great Basin & California',       bonus: 4 },
  { region_id: 'region_plains',      name: 'Great Plains',                   bonus: 6 },
  { region_id: 'region_heartland',   name: 'Heartland',                      bonus: 4 },
  { region_id: 'region_woodlands',   name: 'Woodlands & Northeast',          bonus: 7 },
  { region_id: 'region_southeast',   name: 'Southeast',                      bonus: 4 },
  { region_id: 'region_mesoamerica', name: 'Mesoamerica',                    bonus: 5 },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Build — organic rings from shared edge library
// ═══════════════════════════════════════════════════════════════════════════════

const edgeMap = buildEdgeLibrary(RAW, B);
const territories = RAW.map((r) => {
  const ring = rectToOrganicRing(r, edgeMap, B);
  if (!ring) throw new Error(`organic ring failed for ${r.id}`);
  return ringToTerritory(r.id, r.name, r.region_id, ring);
});

const out = {
  map_id: MAP_ID,
  name: 'The 14 Nations',
  description:
    'North America from the Yucatán to the Yukon — 43 territories across 8 regions inspired by pre-contact indigenous nations. Control the Subarctic tundra, Pacific coast, Great Basin, sweeping Great Plains, forested Woodlands, the Southeast, the desert Heartland, and the empires of Mesoamerica.',
  era_theme: 'custom',
  canvas_width: CW,
  canvas_height: CH,
  projection_bounds: B,
  globe_view: { lock_rotation: true, center_lat: 40, center_lng: -100, altitude: 1.95 },
  territories,
  connections,
  regions,
};

const outPath = path.join(__dirname, 'community_14_nations.json');
fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
console.log('Wrote', outPath, '—', territories.length, 'territories,', connections.length, 'connections,', regions.length, 'regions');
