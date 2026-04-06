import type { EventCard } from '../../../types';

export const coldwarEvents: EventCard[] = [
  {
    card_id: 'coldwar_proxy_war',
    title: 'Proxy War',
    description: 'A regional proxy conflict erupts. Gain 3 reinforcements.',
    category: 'player_targeted',
    era_id: 'coldwar',
    effect: { type: 'units_added', target: 'player', value: 3 },
  },
  {
    card_id: 'coldwar_arms_race',
    title: 'Arms Race',
    description: 'Massive military buildup grants +1 attack die for 2 turns.',
    category: 'player_targeted',
    era_id: 'coldwar',
    effect: { type: 'attack_modifier', target: 'player', value: 1, duration_turns: 2 },
  },
  {
    card_id: 'coldwar_detente',
    title: 'Détente',
    description: 'A thaw in relations forces a truce with a rival for 2 turns.',
    category: 'player_targeted',
    era_id: 'coldwar',
    effect: { type: 'truce', target: 'player', value: 2 },
  },
  {
    card_id: 'coldwar_space_race',
    title: 'Space Race Victory',
    description: 'Your space program inspires the nation. Production bonus for 2 turns.',
    category: 'player_targeted',
    era_id: 'coldwar',
    effect: { type: 'production_bonus', target: 'player', value: 2, duration_turns: 2 },
  },
  {
    card_id: 'coldwar_nuclear_scare',
    title: 'Nuclear Scare',
    description: 'Fear of nuclear war weakens all armies globally.',
    category: 'global',
    era_id: 'coldwar',
    effect: { type: 'region_disaster', target: 'region', value: 1 },
    affects_all_players: true,
  },
  {
    card_id: 'coldwar_espionage',
    title: 'Espionage Operation',
    description: 'Choose: sabotage enemy forces or steal military secrets.',
    category: 'player_targeted',
    era_id: 'coldwar',
    choices: [
      { choice_id: 'sabotage', label: 'Sabotage (enemy loses 2 units)', effect: { type: 'units_removed', target: 'player', value: 2 } },
      { choice_id: 'secrets', label: 'Military secrets (+1 defense die for 3 turns)', effect: { type: 'defense_modifier', target: 'player', value: 1, duration_turns: 3 } },
    ],
  },
];
