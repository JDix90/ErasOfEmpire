import type { EventCard } from '../../../types';

export const medievalEvents: EventCard[] = [
  {
    card_id: 'medieval_crusade',
    title: 'Crusade Called',
    description: 'Religious fervor grants +1 attack die for 2 turns.',
    category: 'player_targeted',
    era_id: 'medieval',
    effect: { type: 'attack_modifier', target: 'player', value: 1, duration_turns: 2 },
  },
  {
    card_id: 'medieval_black_death',
    title: 'The Black Death',
    description: 'Plague devastates all lands, removing 1 unit from every territory.',
    category: 'global',
    era_id: 'medieval',
    effect: { type: 'region_disaster', target: 'region', value: 1 },
    affects_all_players: true,
  },
  {
    card_id: 'medieval_feudal_levy',
    title: 'Feudal Levy',
    description: 'Your vassals answer the call. Gain 4 reinforcements.',
    category: 'player_targeted',
    era_id: 'medieval',
    effect: { type: 'units_added', target: 'player', value: 4 },
  },
  {
    card_id: 'medieval_harvest_festival',
    title: 'Harvest Festival',
    description: 'A great harvest boosts production for 2 turns.',
    category: 'player_targeted',
    era_id: 'medieval',
    effect: { type: 'production_bonus', target: 'player', value: 2, duration_turns: 2 },
  },
  {
    card_id: 'medieval_peasant_revolt',
    title: 'Peasant Revolt',
    description: 'Unrest costs you 3 units from your empire.',
    category: 'player_targeted',
    era_id: 'medieval',
    effect: { type: 'units_removed', target: 'player', value: 3 },
  },
  {
    card_id: 'medieval_castle_upgrade',
    title: 'Castle Fortifications',
    description: 'Choose: reinforce your defenses or train siege engineers.',
    category: 'player_targeted',
    era_id: 'medieval',
    choices: [
      { choice_id: 'defense', label: 'Fortify (+1 defense die for 3 turns)', effect: { type: 'defense_modifier', target: 'player', value: 1, duration_turns: 3 } },
      { choice_id: 'attack', label: 'Siege engineers (+1 attack die for 2 turns)', effect: { type: 'attack_modifier', target: 'player', value: 1, duration_turns: 2 } },
    ],
  },
];
