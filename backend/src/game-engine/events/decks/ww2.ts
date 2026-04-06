import type { EventCard } from '../../../types';

export const ww2Events: EventCard[] = [
  {
    card_id: 'ww2_blitz',
    title: 'Blitzkrieg Offensive',
    description: 'A lightning strike grants +1 attack die for 2 turns.',
    category: 'player_targeted',
    era_id: 'ww2',
    effect: { type: 'attack_modifier', target: 'player', value: 1, duration_turns: 2 },
  },
  {
    card_id: 'ww2_bombing_raid',
    title: 'Strategic Bombing',
    description: 'Enemy bombing raids cost you 3 units.',
    category: 'player_targeted',
    era_id: 'ww2',
    effect: { type: 'units_removed', target: 'player', value: 3 },
  },
  {
    card_id: 'ww2_lend_lease',
    title: 'Lend-Lease Act',
    description: 'Allied supplies arrive. Gain 4 reinforcements.',
    category: 'player_targeted',
    era_id: 'ww2',
    effect: { type: 'units_added', target: 'player', value: 4 },
  },
  {
    card_id: 'ww2_war_bonds',
    title: 'War Bonds',
    description: 'Citizens invest in the war effort. Production bonus for 3 turns.',
    category: 'player_targeted',
    era_id: 'ww2',
    effect: { type: 'production_bonus', target: 'player', value: 2, duration_turns: 3 },
  },
  {
    card_id: 'ww2_winter',
    title: 'Harsh Winter',
    description: 'A brutal winter weakens all armies on the front.',
    category: 'global',
    era_id: 'ww2',
    effect: { type: 'region_disaster', target: 'region', value: 1 },
    affects_all_players: true,
  },
  {
    card_id: 'ww2_enigma',
    title: 'Intelligence Breakthrough',
    description: 'Choose: use decrypted intel offensively or defensively.',
    category: 'player_targeted',
    era_id: 'ww2',
    choices: [
      { choice_id: 'attack', label: 'Offensive intel (+1 attack die for 3 turns)', effect: { type: 'attack_modifier', target: 'player', value: 1, duration_turns: 3 } },
      { choice_id: 'defense', label: 'Defensive intel (+1 defense die for 3 turns)', effect: { type: 'defense_modifier', target: 'player', value: 1, duration_turns: 3 } },
    ],
  },
];
