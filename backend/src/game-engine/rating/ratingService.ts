const Q = Math.log(10) / 400;
const PI2 = Math.PI * Math.PI;

const INITIAL_MU = 1500;
const INITIAL_PHI = 350;
const PHI_FLOOR = 30;
const PHI_CEILING = 350;

interface Opponent {
  mu: number;
  phi: number;
  score: number; // 0–1
}

function g(phi: number): number {
  return 1 / Math.sqrt(1 + (3 * Q * Q * phi * phi) / PI2);
}

function expected(mu: number, opMu: number, gPhi: number): number {
  return 1 / (1 + Math.pow(10, (-gPhi * (mu - opMu)) / 400));
}

export function glickoUpdate(
  playerMu: number,
  playerPhi: number,
  opponents: Opponent[],
): { mu: number; phi: number } {
  if (opponents.length === 0) return { mu: playerMu, phi: playerPhi };

  let dInvSq = 0;
  let muDelta = 0;

  for (const op of opponents) {
    const gj = g(op.phi);
    const ej = expected(playerMu, op.mu, gj);
    dInvSq += Q * Q * gj * gj * ej * (1 - ej);
    muDelta += gj * (op.score - ej);
  }

  const phiSq = playerPhi * playerPhi;
  const newMu = playerMu + (Q / (1 / phiSq + dInvSq)) * muDelta;
  const newPhi = Math.sqrt(1 / (1 / phiSq + dInvSq));

  return {
    mu: Math.max(100, Math.round(newMu * 10) / 10),
    phi: Math.min(PHI_CEILING, Math.max(PHI_FLOOR, Math.round(newPhi * 10) / 10)),
  };
}

export function placementScore(rank: number, totalPlayers: number): number {
  if (totalPlayers <= 1) return 0.5;
  return (totalPlayers - rank) / (totalPlayers - 1);
}

export function displayRating(mu: number, phi: number): { display: number; provisional: boolean } {
  return { display: Math.round(mu), provisional: phi > 150 };
}

export function syntheticAiOpponent(difficulty: string): { mu: number; phi: number } {
  const offsets: Record<string, number> = {
    easy: -200,
    medium: 0,
    hard: 150,
    expert: 300,
    tutorial: -400,
  };
  return { mu: INITIAL_MU + (offsets[difficulty] ?? 0), phi: 50 };
}

export { INITIAL_MU, INITIAL_PHI };
