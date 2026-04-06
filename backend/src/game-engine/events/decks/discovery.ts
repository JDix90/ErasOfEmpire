import type { EventCard } from '../../../types';

export const discoveryEvents: EventCard[] = [
  {
    card_id: 'discovery_new_world',
    title: 'New World Riches',
    description: 'Treasure fleets bring wealth. Production bonus for 2 turns.',
    category: 'player_targeted',
    era_id: 'discovery',
    effect: { type: 'production_bonus', target: 'player', value: 3, duration_turns: 2 },
  },
  {
    card_id: 'discovery_piracy',
    title: 'Golden Age of Piracy',
    description: 'Pirates raid your coasts, costing 2 units.',
    category: 'player_targeted',
    era_id: 'discovery',
    effect: { type: 'units_removed', target: 'player', value: 2 },
  },
  {
    card_id: 'discovery_colonial_troops',
    title: 'Colonial Reinforcements',
    description: 'Troops arrive from the colonies. Gain 3 reinforcements.',
    category: 'player_targeted',
    era_id: 'discovery',
    effect: { type: 'units_added', target: 'player', value: 3 },
  },
  {
    card_id: 'discovery_smallpox',
    title: 'Smallpox Outbreak',
    description: 'Disease ravages populations worldwide.',
    category: 'global',
    era_id: 'discovery',
    effect: { type: 'region_disaster', target: 'region', value: 1 },
    affects_all_players: true,
  },
  {
    card_id: 'discovery_trade_winds',
    title: 'Favorable Trade Winds',
    description: 'Choose: boost naval power or strengthen land armies.',
    category: 'player_targeted',
    era_id: 'discovery',
    choices: [
      { choice_id: 'attack', label: 'Naval superiority (+1 attack die for 2 turns)', effect: { type: 'attack_modifier', target: 'player', value: 1, duration_turns: 2 } },
      { choice_id: 'units', label: 'Land reinforcements (+4 units)', effect: { type: 'units_added', target: 'player', value: 4 } },
    ],
  },
];
