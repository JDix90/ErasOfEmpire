import type { EventCard } from '../../../types';

export const acwEvents: EventCard[] = [
  {
    card_id: 'acw_draft_riots',
    title: 'Draft Riots',
    description: 'Civil unrest over conscription costs you 2 units.',
    category: 'player_targeted',
    era_id: 'acw',
    effect: { type: 'units_removed', target: 'player', value: 2 },
  },
  {
    card_id: 'acw_ironclad',
    title: 'Ironclad Launched',
    description: 'A new warship bolsters your forces. Gain 3 reinforcements.',
    category: 'player_targeted',
    era_id: 'acw',
    effect: { type: 'units_added', target: 'player', value: 3 },
  },
  {
    card_id: 'acw_blockade',
    title: 'Naval Blockade',
    description: 'An enemy blockade hurts your economy. Lose production for 2 turns.',
    category: 'player_targeted',
    era_id: 'acw',
    effect: { type: 'production_bonus', target: 'player', value: -2, duration_turns: 2 },
  },
  {
    card_id: 'acw_foreign_aid',
    title: 'Foreign Aid',
    description: 'European powers send supplies. Gain 4 reinforcements.',
    category: 'player_targeted',
    era_id: 'acw',
    effect: { type: 'units_added', target: 'player', value: 4 },
  },
  {
    card_id: 'acw_disease_camp',
    title: 'Camp Disease',
    description: 'Disease sweeps through military camps, weakening all sides.',
    category: 'global',
    era_id: 'acw',
    effect: { type: 'region_disaster', target: 'region', value: 1 },
    affects_all_players: true,
  },
  {
    card_id: 'acw_rally',
    title: 'Rally the Troops',
    description: 'Choose: inspire your soldiers or dig in for defense.',
    category: 'player_targeted',
    era_id: 'acw',
    choices: [
      { choice_id: 'attack', label: 'Charge! (+1 attack die for 2 turns)', effect: { type: 'attack_modifier', target: 'player', value: 1, duration_turns: 2 } },
      { choice_id: 'defense', label: 'Dig in (+1 defense die for 2 turns)', effect: { type: 'defense_modifier', target: 'player', value: 1, duration_turns: 2 } },
    ],
  },
];
