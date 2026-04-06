import type { EventCard } from '../../../types';

export const modernEvents: EventCard[] = [
  {
    card_id: 'modern_cyber_attack',
    title: 'Cyber Attack',
    description: 'A cyberattack disrupts your military operations. Lose 2 units.',
    category: 'player_targeted',
    era_id: 'modern',
    effect: { type: 'units_removed', target: 'player', value: 2 },
  },
  {
    card_id: 'modern_drone_strike',
    title: 'Drone Strike Program',
    description: 'Precision strikes grant +1 attack die for 2 turns.',
    category: 'player_targeted',
    era_id: 'modern',
    effect: { type: 'attack_modifier', target: 'player', value: 1, duration_turns: 2 },
  },
  {
    card_id: 'modern_economic_boom',
    title: 'Economic Boom',
    description: 'A booming economy boosts production for 3 turns.',
    category: 'player_targeted',
    era_id: 'modern',
    effect: { type: 'production_bonus', target: 'player', value: 3, duration_turns: 3 },
  },
  {
    card_id: 'modern_un_resolution',
    title: 'UN Resolution',
    description: 'The United Nations imposes a ceasefire with a rival.',
    category: 'player_targeted',
    era_id: 'modern',
    effect: { type: 'truce', target: 'player', value: 2 },
  },
  {
    card_id: 'modern_pandemic',
    title: 'Global Pandemic',
    description: 'A pandemic weakens militaries worldwide.',
    category: 'global',
    era_id: 'modern',
    effect: { type: 'region_disaster', target: 'region', value: 1 },
    affects_all_players: true,
  },
  {
    card_id: 'modern_military_aid',
    title: 'International Military Aid',
    description: 'Choose: accept troops or advanced weapons.',
    category: 'player_targeted',
    era_id: 'modern',
    choices: [
      { choice_id: 'troops', label: 'Troop deployment (+5 units)', effect: { type: 'units_added', target: 'player', value: 5 } },
      { choice_id: 'weapons', label: 'Advanced weapons (+1 attack die for 3 turns)', effect: { type: 'attack_modifier', target: 'player', value: 1, duration_turns: 3 } },
    ],
  },
];
