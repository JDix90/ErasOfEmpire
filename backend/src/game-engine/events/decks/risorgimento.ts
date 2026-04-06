import type { EventCard } from '../../../types';

export const risorgimentoEvents: EventCard[] = [
  {
    card_id: 'risorgimento_revolution',
    title: 'Popular Revolution',
    description: 'Revolutionary fervor spreads! Gain 3 reinforcements.',
    category: 'player_targeted',
    era_id: 'risorgimento',
    effect: { type: 'units_added', target: 'player', value: 3 },
  },
  {
    card_id: 'risorgimento_foreign_intervention',
    title: 'Foreign Intervention',
    description: 'A great power intervenes. Lose 2 units to their forces.',
    category: 'player_targeted',
    era_id: 'risorgimento',
    effect: { type: 'units_removed', target: 'player', value: 2 },
  },
  {
    card_id: 'risorgimento_garibaldi',
    title: 'Garibaldi\'s Expedition',
    description: 'Volunteer fighters rally to your cause. Gain 4 reinforcements.',
    category: 'player_targeted',
    era_id: 'risorgimento',
    effect: { type: 'units_added', target: 'player', value: 4 },
  },
  {
    card_id: 'risorgimento_cholera',
    title: 'Cholera Outbreak',
    description: 'Disease weakens armies across the peninsula.',
    category: 'global',
    era_id: 'risorgimento',
    effect: { type: 'region_disaster', target: 'region', value: 1 },
    affects_all_players: true,
  },
  {
    card_id: 'risorgimento_congress',
    title: 'Congress of Nations',
    description: 'Diplomatic pressure forces a temporary ceasefire.',
    category: 'player_targeted',
    era_id: 'risorgimento',
    effect: { type: 'truce', target: 'player', value: 2 },
  },
  {
    card_id: 'risorgimento_secret_society',
    title: 'Secret Society',
    description: 'Choose: undermine enemy defenses or strengthen your networks.',
    category: 'player_targeted',
    era_id: 'risorgimento',
    choices: [
      { choice_id: 'attack', label: 'Undermine (+1 attack die for 2 turns)', effect: { type: 'attack_modifier', target: 'player', value: 1, duration_turns: 2 } },
      { choice_id: 'production', label: 'Networks (production bonus for 3 turns)', effect: { type: 'production_bonus', target: 'player', value: 2, duration_turns: 3 } },
    ],
  },
];
