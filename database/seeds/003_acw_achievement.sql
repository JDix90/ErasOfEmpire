-- Seed 003: American Civil War era win achievement

INSERT INTO achievements (achievement_id, name, description, xp_reward) VALUES
  ('iron_brigade', 'Iron Brigade', 'Win a game on the American Civil War map.', 400)
ON CONFLICT (achievement_id) DO NOTHING;
