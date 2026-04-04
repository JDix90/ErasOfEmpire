/**
 * Organic polygon builder for community_14_nations.
 * - Bbox edges follow simplified coast / gulf / arctic polylines (not straight meridians).
 * - Interior shared edges use deterministic perpendicular wiggles so neighbors match.
 *
 * Used only by buildCommunity14Nations.js (Node, no extra npm deps).
 */

const EPS = 1e-9;

/** Piecewise-linear Pacific shoreline (lat → lng), mainland + Alaska panhandle feel */
const PACIFIC_LAT_LNG = [
  [65, -141.2],
  [62, -141.5],
  [58, -136.0],
  [55, -131.0],
  [52, -128.5],
  [49, -125.2],
  [47, -124.4],
  [44, -124.2],
  [41, -124.0],
  [38, -122.0],
  [35, -120.5],
  [32, -117.2],
  [29, -114.5],
  [26, -112.0],
  [23, -110.0],
  [20, -105.5],
  [18, -102.0],
  [15, -97.5],
];

/** Atlantic / Gulf seaboard (lat → lng), east side of map */
const ATLANTIC_LAT_LNG = [
  [65, -60.0],
  [62, -61.0],
  [58, -62.5],
  [55, -64.0],
  [52, -66.5],
  [49, -67.0],
  [46, -69.0],
  [43, -71.5],
  [40, -73.8],
  [37, -75.5],
  [34, -77.5],
  [31, -80.5],
  [28, -82.5],
  [25, -84.0],
  [22, -84.5],
  [18, -87.0],
  [15, -87.2],
];

/** Southern boundary lat=15: lng along south edge west → east (Yucatán → Atlantic) */
const SOUTH_LNG_LAT = [
  [-145, 15],
  [-130, 15],
  [-115, 15],
  [-105, 15],
  [-96, 15],
  [-87, 15],
  [-78, 15],
  [-68, 15],
  [-55, 15],
];

function clamp(x, a, b) {
  return Math.max(a, Math.min(b, x));
}

function interpY(xs, ys, xq) {
  if (xq <= xs[0]) return ys[0];
  if (xq >= xs[xs.length - 1]) return ys[ys.length - 1];
  for (let i = 0; i < xs.length - 1; i++) {
    if (xq >= xs[i] && xq <= xs[i + 1]) {
      const t = (xq - xs[i]) / (xs[i + 1] - xs[i]);
      return ys[i] + t * (ys[i + 1] - ys[i]);
    }
  }
  return ys[ys.length - 1];
}

/** lng on Pacific coast at latitude `lat` */
function pacificLngAtLat(lat) {
  const pairs = [...PACIFIC_LAT_LNG].sort((a, b) => a[0] - b[0]);
  const lats = pairs.map((p) => p[0]);
  const lngs = pairs.map((p) => p[1]);
  return interpY(lats, lngs, clamp(lat, lats[0], lats[lats.length - 1]));
}

function atlanticLngAtLat(lat) {
  const pairs = [...ATLANTIC_LAT_LNG].sort((a, b) => a[0] - b[0]);
  const lats = pairs.map((p) => p[0]);
  const lngs = pairs.map((p) => p[1]);
  return interpY(lats, lngs, clamp(lat, lats[0], lats[lats.length - 1]));
}

function southLatAtLng(lng, B) {
  const xs = SOUTH_LNG_LAT.map((p) => p[0]);
  const ys = SOUTH_LNG_LAT.map((p) => p[1]);
  return interpY(xs, ys, clamp(lng, B.minLng, B.maxLng));
}

/**
 * Horizontal span [lo, hi] with lo < hi (increasing east).
 * When the rect touches the Pacific bbox, the visible land edge lies between the
 * simplified coast and the inland meridian `e` (either order).
 */
function horizontalLngRange(lat, w, e, B) {
  if (Math.abs(lat - B.minLat) < 1e-6 || Math.abs(lat - B.maxLat) < 1e-6) {
    return [Math.min(w, e), Math.max(w, e)];
  }
  if (Math.abs(w - B.minLng) < 1e-6) {
    const p = pacificLngAtLat(lat);
    return [Math.min(p, e), Math.max(p, e)];
  }
  return [Math.min(w, e), Math.max(w, e)];
}

function interpLatAtLng(pts, lng) {
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    const lo = Math.min(a[0], b[0]);
    const hi = Math.max(a[0], b[0]);
    if (lng + EPS < lo || lng - EPS > hi) continue;
    if (Math.abs(a[0] - b[0]) < EPS) return a[1];
    const t = (lng - a[0]) / (b[0] - a[0]);
    return a[1] + t * (b[1] - a[1]);
  }
  return pts[pts.length - 1][1];
}

/** Clip a west→east horizontal polyline (lng non-decreasing) to [lo, hi] */
function clipHorizontalToLngRange(pts, lo, hi) {
  if (pts.length < 2 || hi <= lo + EPS) return [];
  const dense = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    const steps = Math.max(4, Math.ceil(Math.abs(b[0] - a[0]) * 14));
    for (let j = 0; j <= steps; j++) {
      const t = j / steps;
      dense.push([a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])]);
    }
  }
  const inside = dense.filter((p) => p[0] >= lo - 1e-7 && p[0] <= hi + 1e-7);
  if (inside.length === 0) {
    return [
      [lo, interpLatAtLng(dense, lo)],
      [hi, interpLatAtLng(dense, hi)],
    ];
  }
  const out = [
    [lo, interpLatAtLng(dense, lo)],
    ...inside,
    [hi, interpLatAtLng(dense, hi)],
  ];
  return dedupeConsecutive(out);
}

function strKey(parts) {
  return parts.map((x) => (typeof x === 'number' ? x.toFixed(6) : x)).join('|');
}

/** Deterministic [-1,1] hash from string */
function hash11(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h % 2001) / 1000) - 1;
}

function wiggleAmp(key, scale) {
  return scale * (0.35 + 0.65 * Math.abs(hash11(key)));
}

/** Points along horizontal line at lat, west→east, endpoints fixed, perpendicular wiggle in lat */
function wiggleHorizontal(w, e, lat, key, B, segments = 10) {
  const amp = wiggleAmp(key, 0.22 + 0.08 * Math.min(12, Math.abs(e - w)));
  const out = [[w, lat]];
  for (let i = 1; i < segments; i++) {
    const t = i / segments;
    const lng = w + t * (e - w);
    const k = strKey(['H', key, i]);
    const dy = amp * hash11(k) * Math.sin(t * Math.PI);
    out.push([lng, lat + dy]);
  }
  out.push([e, lat]);
  return dedupeConsecutive(out);
}

/** Points along vertical line at lng, south→north, perpendicular wiggle in lng */
function wiggleVertical(lng, s, n, key, segments = 10) {
  const amp = wiggleAmp(key, 0.18 + 0.07 * Math.min(10, Math.abs(n - s)));
  const out = [[lng, s]];
  for (let i = 1; i < segments; i++) {
    const t = i / segments;
    const lat = s + t * (n - s);
    const k = strKey(['V', key, i]);
    const dx = amp * hash11(k) * Math.sin(t * Math.PI);
    out.push([lng + dx, lat]);
  }
  out.push([lng, n]);
  return dedupeConsecutive(out);
}

function dedupeConsecutive(pts) {
  const r = [];
  for (const p of pts) {
    const prev = r[r.length - 1];
    if (!prev || Math.abs(prev[0] - p[0]) > EPS || Math.abs(prev[1] - p[1]) > EPS) r.push(p);
  }
  return r;
}

/** Pacific coast polyline from lat `s` to `n` (s < n), south→north order */
function pacificCoastPolyline(s, n, steps = 14) {
  const lo = Math.min(s, n);
  const hi = Math.max(s, n);
  const out = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const lat = lo + t * (hi - lo);
    out.push([pacificLngAtLat(lat), lat]);
  }
  return dedupeConsecutive(out);
}

function atlanticCoastPolyline(s, n, steps = 14) {
  const lo = Math.min(s, n);
  const hi = Math.max(s, n);
  const out = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const lat = lo + t * (hi - lo);
    out.push([atlanticLngAtLat(lat), lat]);
  }
  return dedupeConsecutive(out);
}

/** South edge west→east with slight lat wiggle (river/delta feel) */
function southEdgePolyline(w, e, key, B, segments = 12) {
  const amp = wiggleAmp(key + '|south', 0.35);
  const out = [[w, B.minLat]];
  for (let i = 1; i < segments; i++) {
    const t = i / segments;
    const lng = w + t * (e - w);
    const baseLat = southLatAtLng(lng, B);
    const dy = amp * hash11(strKey(['S', key, i])) * Math.sin(t * Math.PI);
    out.push([lng, baseLat + dy]);
  }
  out.push([e, B.minLat]);
  return dedupeConsecutive(out);
}

/** Arctic / northern edge */
function northArcticPolyline(w, e, key, B, segments = 14) {
  return wiggleHorizontal(w, e, B.maxLat, 'arctic|' + key, B, segments);
}

/**
 * Build unique edge polylines. Keys:
 *  H|lat|w|e  — horizontal at lat, west→east
 *  V|lng|s|n  — vertical at lng, south→north
 *
 * Horizontal masters: one full-width polyline per latitude (south cap, arctic cap, or
 * interior Pacific→Atlantic), then clip to [effectiveWest, e] so neighbors on the same
 * row share identical geometry.
 */
function buildEdgeLibrary(rawRects, B) {
  const edgeMap = new Map();
  const masterHCache = new Map();

  function getMasterHorizontal(lat) {
    const k = strKey(['mH', lat]);
    if (!masterHCache.has(k)) {
      if (Math.abs(lat - B.minLat) < 1e-6) {
        masterHCache.set(k, southEdgePolyline(B.minLng, B.maxLng, 'southmaster', B, 28));
      } else if (Math.abs(lat - B.maxLat) < 1e-6) {
        masterHCache.set(k, northArcticPolyline(B.minLng, B.maxLng, 'northmaster', B, 28));
      } else {
        /** Full west→east span so clips can reach inland meridians west of the coast baseline */
        const segs = Math.max(32, Math.min(72, Math.ceil((B.maxLng - B.minLng) * 2)));
        masterHCache.set(k, wiggleHorizontal(B.minLng, B.maxLng, lat, 'mH|' + lat, B, segs));
      }
    }
    return masterHCache.get(k);
  }

  function ensureEdge(key, factory) {
    if (!edgeMap.has(key)) edgeMap.set(key, factory());
    return edgeMap.get(key);
  }

  for (const r of rawRects) {
    const { w, s, e, n, id } = r;

    ensureEdge(strKey(['H', s, w, e]), () => {
      const master = getMasterHorizontal(s);
      const [lo, hi] = horizontalLngRange(s, w, e, B);
      return clipHorizontalToLngRange(master, lo, hi);
    });
    ensureEdge(strKey(['H', n, w, e]), () => {
      const master = getMasterHorizontal(n);
      const [lo, hi] = horizontalLngRange(n, w, e, B);
      return clipHorizontalToLngRange(master, lo, hi);
    });
    ensureEdge(strKey(['V', w, s, n]), () => {
      if (Math.abs(w - B.minLng) < 1e-6) return pacificCoastPolyline(s, n);
      return wiggleVertical(w, s, n, strKey(['vw', id, w]));
    });
    ensureEdge(strKey(['V', e, s, n]), () => {
      if (Math.abs(e - B.maxLng) < 1e-6) return atlanticCoastPolyline(s, n);
      return wiggleVertical(e, s, n, strKey(['ve', id, e]));
    });
  }

  return edgeMap;
}

/**
 * CCW ring: SW → (along south) → SE → (along east) → NE → (along north) → NW → (along west) → SW
 * Horizontal edges stored west→east. Vertical south→north.
 * Walking CCW: south forward, east forward, north backward, west backward.
 */
function rectToOrganicRing(r, edgeMap, B) {
  const { w, s, e, n } = r;

  const south = edgeMap.get(strKey(['H', s, w, e]));
  const east = edgeMap.get(strKey(['V', e, s, n]));
  const north = edgeMap.get(strKey(['H', n, w, e]));
  const west = edgeMap.get(strKey(['V', w, s, n]));

  if (!south || !east || !north || !west) return null;

  const ring = [];
  for (const p of south) ring.push([p[0], p[1]]);
  for (let i = 1; i < east.length; i++) ring.push([east[i][0], east[i][1]]);
  for (let i = north.length - 2; i >= 0; i--) ring.push([north[i][0], north[i][1]]);
  for (let i = west.length - 2; i >= 1; i--) ring.push([west[i][0], west[i][1]]);

  const closed = dedupeConsecutive(ring);
  if (closed.length < 3) return null;

  const f = closed[0];
  const l = closed[closed.length - 1];
  if (Math.abs(f[0] - l[0]) > EPS || Math.abs(f[1] - l[1]) > EPS) closed.push([f[0], f[1]]);

  return closed;
}

module.exports = {
  buildEdgeLibrary,
  rectToOrganicRing,
};
