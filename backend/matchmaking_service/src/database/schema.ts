export const createTablesSQL = `
CREATE TABLE IF NOT EXISTS games (
  game_id TEXT PRIMARY KEY,
  mode TEXT NOT NULL CHECK(mode IN ('classic', 'tournament')),
  tournament_id TEXT,
  winner_id INTEGER,
  date DATETIME NOT NULL,
  duration TEXT
);

CREATE TABLE IF NOT EXISTS game_participation (
  game_id TEXT NOT NULL,
  user_id INTEGER NOT NULL,
  score INTEGER NOT NULL,
  result TEXT NOT NULL CHECK(result IN ('win', 'loss', 'draw')),
  PRIMARY KEY (game_id, user_id),
  FOREIGN KEY (game_id) REFERENCES games(game_id)
);

CREATE TABLE IF NOT EXISTS tournaments (
  tournament_id TEXT PRIMARY KEY,
  semi1_id TEXT NOT NULL,
  semi2_id TEXT NOT NULL,
  final_id TEXT NOT NULL,
  winner_id INTEGER NOT NULL,
  date DATETIME NOT NULL,
  FOREIGN KEY (semi1_id) REFERENCES games(game_id),
  FOREIGN KEY (semi2_id) REFERENCES games(game_id),
  FOREIGN KEY (final_id) REFERENCES games(game_id)
);

CREATE TABLE IF NOT EXISTS tournament_participation (
  tournament_id TEXT NOT NULL,
  user_id INTEGER NOT NULL,
  PRIMARY KEY (tournament_id, user_id),
  FOREIGN KEY (tournament_id) REFERENCES tournaments(tournament_id)
);
`;
