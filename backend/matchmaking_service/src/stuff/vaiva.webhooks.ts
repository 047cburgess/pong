type Hook = {
  callback: (data: GameResult) => void;
  expiresAt: Date;
}

const hooks: Map<string, Hook> = new Map();

fastify.post('/webhooks/{gameId}/game-result', (req) => {
  const hook = hooks.get(req.gameId);
  if (!hook || new Date() > hook.expiresAt) {
    hooks.delete(req.gameId);
    return;
  }
  hooks.callback(req.json());
  hooks.delete(req.gameId);
});

fastify.post('/webhooks/game-result', (req) => {
  let data;
  try {
    data = req.json();
  } catch (...) {
    resp send 400
  }
  const gameId = new uuid();
  store it;
});

const createTournamentGame = () => {
  const tournId = "somethrtkjghtkrejh";
  ...
  const hook = {
    callback: () => {
      tournament game logic
      tournId;
    }
  };

  const gameId = new uuid();
  const hookRoute = `/webhooks/${gameId}/game-result`;
  await resp = post('game-server/new-game', JSON.stringify({webhook: hookRoute}));
  resp.json().playerKeys;
  hooks.set(gameId, hook);
  ...
};

const createGame = () => {
  ...
  const hook = {
    callback: () => {
      non tournament game logic
    }
  }
  ...
};
