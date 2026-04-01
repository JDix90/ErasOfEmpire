/**
 * American Civil War (era_acw) — contiguous US split by Natural Earth admin-1 state polygons.
 * Each postal appears exactly once (48 states + DC); AK/HI excluded from globe.
 */

export const ACW_TERRITORY_STATES: Record<string, string[]> = {
  acw_new_england: ['ME', 'NH', 'VT', 'MA', 'RI', 'CT'],
  acw_mid_atlantic: ['NY', 'NJ', 'PA', 'DE', 'MD', 'DC'],
  acw_great_lakes: ['MI', 'WI', 'IL', 'MN'],
  acw_ohio_indiana: ['OH', 'IN'],
  acw_appalachia: ['WV'],
  acw_upper_south: ['VA'],
  acw_carolinas: ['NC', 'SC'],
  acw_kentucky: ['KY'],
  acw_tennessee: ['TN'],
  acw_georgia_fl: ['GA', 'FL'],
  acw_alabama: ['AL'],
  acw_mississippi: ['MS'],
  acw_plains: ['ND', 'SD', 'NE', 'KS', 'OK', 'IA'],
  acw_missouri: ['MO'],
  acw_arkansas: ['AR'],
  acw_louisiana: ['LA'],
  acw_texas: ['TX'],
  acw_far_west: ['CA', 'OR', 'WA', 'NV', 'AZ', 'NM', 'CO', 'UT', 'MT', 'WY', 'ID'],
};
