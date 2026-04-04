import type { GameMap, GamePhase } from '../../types';

export interface TutorialStep {
  id: string;
  phase: GamePhase;
  title: string;
  message: string;
  hint?: string;
  requireAction?: 'draft' | 'attack' | 'end_phase' | 'fortify';
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    phase: 'draft',
    title: 'Welcome, Commander!',
    message: 'This quick tutorial teaches you the core mechanics of Eras of Empire. Each turn has three phases: Draft, Attack, and Fortify.',
    hint: 'Click "Next" to continue.',
  },
  {
    id: 'draft_explain',
    phase: 'draft',
    title: 'Reinforcement Phase',
    message: 'You receive units based on how many territories you hold plus continent bonuses. Place them on your territories to strengthen your positions.',
  },
  {
    id: 'draft_do',
    phase: 'draft',
    title: 'Place Your Units',
    message: 'Click one of your territories on the map to place your reinforcements there.',
    requireAction: 'draft',
  },
  {
    id: 'attack_explain',
    phase: 'attack',
    title: 'Attack Phase',
    message: 'Attack adjacent enemy territories by clicking your territory first, then the target. You need at least 2 units to attack. Dice determine the outcome.',
  },
  {
    id: 'attack_do',
    phase: 'attack',
    title: 'Launch an Attack!',
    message: 'Click your territory then an adjacent enemy territory to attack. When ready to move on, click "End Phase".',
    hint: 'You can attack as many times as you want, or skip by ending the phase.',
    requireAction: 'end_phase',
  },
  {
    id: 'fortify_explain',
    phase: 'fortify',
    title: 'Fortify Phase',
    message: 'Move units between your connected territories to shore up defenses. You can fortify once, or skip.',
    requireAction: 'end_phase',
  },
  {
    id: 'complete',
    phase: 'draft',
    title: "You're Ready!",
    message: 'Great job! Keep playing — conquer all enemy territories to win. Good luck, Commander!',
  },
];

export function getTutorialMap(): GameMap {
  return {
    map_id: 'tutorial',
    name: 'Tutorial Island',
    era: 'ancient',
    territories: [
      { territory_id: 'tut_a1', name: 'Western Plains',  polygon: [[-10, 5], [0, 10], [0, 0], [-10, 0]],  center_point: [-5, 5],   region_id: 'tut_west' },
      { territory_id: 'tut_a2', name: 'Northern Hills',  polygon: [[-10, 10], [0, 15], [0, 10], [-10, 5]], center_point: [-5, 10],  region_id: 'tut_west' },
      { territory_id: 'tut_a3', name: 'Southern Coast',  polygon: [[-10, 0], [0, 0], [0, -5], [-10, -5]],  center_point: [-5, -2],  region_id: 'tut_west' },
      { territory_id: 'tut_b1', name: 'Eastern Forest',  polygon: [[0, 5], [10, 10], [10, 0], [0, 0]],     center_point: [5, 5],    region_id: 'tut_east' },
      { territory_id: 'tut_b2', name: 'Mountain Pass',   polygon: [[0, 10], [10, 15], [10, 10], [0, 5]],   center_point: [5, 10],   region_id: 'tut_east' },
      { territory_id: 'tut_b3', name: 'Desert Outpost',  polygon: [[0, 0], [10, 0], [10, -5], [0, -5]],    center_point: [5, -2],   region_id: 'tut_east' },
    ],
    connections: [
      { from: 'tut_a1', to: 'tut_a2', type: 'land' },
      { from: 'tut_a1', to: 'tut_a3', type: 'land' },
      { from: 'tut_a1', to: 'tut_b1', type: 'land' },
      { from: 'tut_a2', to: 'tut_b2', type: 'land' },
      { from: 'tut_a3', to: 'tut_b3', type: 'land' },
      { from: 'tut_b1', to: 'tut_b2', type: 'land' },
      { from: 'tut_b1', to: 'tut_b3', type: 'land' },
    ],
    regions: [
      { region_id: 'tut_west', name: 'Western Realm', bonus: 2 },
      { region_id: 'tut_east', name: 'Eastern Realm',  bonus: 2 },
    ],
  };
}
