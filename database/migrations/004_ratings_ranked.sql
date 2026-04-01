-- Migration 004: Glicko ratings, ranked matchmaking, equipped cosmetics

CREATE TABLE IF NOT EXISTS user_ratings (
  user_id      UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  rating_type  VARCHAR(16) NOT NULL,
  mu           REAL NOT NULL DEFAULT 1500,
  phi          REAL NOT NULL DEFAULT 350,
  sigma        REAL NOT NULL DEFAULT 0.06,
  last_rated   TIMESTAMPTZ,
  PRIMARY KEY (user_id, rating_type)
);

INSERT INTO user_ratings (user_id, rating_type, mu, phi, sigma)
SELECT user_id, 'solo', GREATEST(mmr + 500, 100), 350, 0.06 FROM users
ON CONFLICT DO NOTHING;

INSERT INTO user_ratings (user_id, rating_type, mu, phi, sigma)
SELECT user_id, 'ranked', GREATEST(mmr + 500, 100), 350, 0.06 FROM users
ON CONFLICT DO NOTHING;

ALTER TABLE games ADD COLUMN IF NOT EXISTS is_ranked BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE games ADD COLUMN IF NOT EXISTS queue_bucket VARCHAR(16);

CREATE TABLE IF NOT EXISTS ranked_queue (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  era_id       VARCHAR(64) NOT NULL,
  bucket       VARCHAR(16) NOT NULL,
  mu           REAL NOT NULL,
  phi          REAL NOT NULL,
  socket_id    VARCHAR(128),
  enqueued_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS equipped_frame VARCHAR(64)
  REFERENCES cosmetics(cosmetic_id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS equipped_marker VARCHAR(64)
  REFERENCES cosmetics(cosmetic_id);
