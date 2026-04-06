-- Migration 011: Faction and economy support
-- Adds faction_id column to game_players for asymmetric faction starting positions.
-- Economy / tech state is stored in JSONB (game_states.state_json) and requires no
-- column changes. This migration only makes faction_id queryable at the DB layer.

ALTER TABLE game_players ADD COLUMN IF NOT EXISTS faction_id VARCHAR(32);

CREATE INDEX IF NOT EXISTS idx_game_players_faction
  ON game_players(faction_id)
  WHERE faction_id IS NOT NULL;
