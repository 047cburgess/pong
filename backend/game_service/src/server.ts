import type { components as PublicAPIComponents } from './@types/PublicAPI';
import type { components as InternalAPIComponents } from './@types/InternalAPI';
import type { components as WebHooksComponents } from './@types/Webhooks';

// Internal API types (game service communication)
export type NewGameRequest = InternalAPIComponents['schemas']['NewGameRequest'];
export type NewGameResponse = InternalAPIComponents['schemas']['NewGameResponse'];
export type NewTournamentGameResponse = InternalAPIComponents['schemas']['NewTournamentGameResponse'];
export type GameResultWebhookBody = WebhooksComponents['schemas']['GameResultWebhookBody'];

// Open API types
export type GameKey = PublicAPIComponents['schemas']['GameKey'];


import { randomUUID } from 'crypto';

import Fastify from 'fastify';
import websocketPlugin from '@fastify/websocket';
import { z } from 'zod';

import { Game, gamePropertiesSchema, } from './game.ts';
import type { GameId, PlayerId, PlayerSocket, PlayerInput, GameProperties } from './game.ts';

const games = new Map<GameId, Game>();

// Map of gameTokens: UUID to player, game & expires
const tokenMap = new Map<string, {
  playerId: PlayerId;
  gameId: GameId;
  expires: number;
}>();

function createToken(playerId: PlayerId, gameId: GameId, ttlMs = 5 * 60_000) {
  const t = randomUUID();
  tokenMap.set(t, {
    playerId,
    gameId,
    expires: Date.now() + ttlMs
  });
  return t;
}

function validateToken(t: string) {
  const s = tokenMap.get(t);
  if (!s) {
    return null;
  }
  if (s.expires < Date.now()) {
    tokenMap.delete(t);
    return null;
  }
  return s;
}
// function revokeToken(t: string) { tokenMap.delete(t); }

const fastify = Fastify();
fastify.register(websocketPlugin);

/* Matchmaking requests a new classic game - can be a draw */
fastify.post('/internal/games/classic/create', async (req, resp) => {
// Game properties probably wont be passed as parameters, should just be fixed in the code
  let gameParams: GameProperties;
  try {
    gameParams = gamePropertiesSchema.parse(req.body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return resp.status(400).send({
        errors: error.issues.map(err => ({
          path: err.path.join('.'),
          message: err.message
        })),
      });
    }
    return resp.status(500).send({ error: 'Server error' });
  }

  // Generate game ID and add to map of game id to game state
  const gameId = randomUUID();
  const game = new Game(
    gameId,
    gameParams,
    (req.body as any)?.hook
  );
  games.set(gameId, game);

  // array of KEYS of internalAPI type GameKey
  let keys: NewGameResponse = [];
  for (let i = 0; i < gameParams.nPlayers; i++) {
    const key: Gamekey = createToken(randomUUID(), gameId);
    keys.push({
      key,
      gameId,
      expires: new Date(Date.now() + 5 * 60_000)
    });
  }
  // returns internal api type NewGameResponse
  return { keys };
});

/* Matchmaking requests a new tournament game - cannot be a draw and has spectator mode */
fastify.post('/internal/games/tournament/create', async (req, resp) => {
 // Game properties probably wont be passed as parameters, should just be fixed in the code
  let gameParams: GameProperties;
  try {
    gameParams = gamePropertiesSchema.parse(req.body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return resp.status(400).send({
        errors: error.issues.map(err => ({
          path: err.path.join('.'),
          message: err.message
        })),
      });
    }
    return resp.status(500).send({ error: 'Server error' });
  }
  // Generate the game ID and add to map of game id to game state
  // Generate array of KEYS of internalAPI type GameKey
  // Set viewing key (1) for spectator mode
  // returns Internal API spec New Tournament game response ( Game keys and the viewing key)

})

/* Route to connect to game socket as a player */
fastify.register(async function(fastify) {
  fastify.get<{
    Querystring: { token: string },
  }>('/ws', { websocket: true, },
    (ws, req) => {
      const token = req.query.token;
      const meta = validateToken(token);
      let game = meta ? games.get(meta.gameId) : null;
      if (!meta || !game) {
        try { ws.close(4001, 'unauthorized'); } catch { }
        return;
      }
      const { playerId } = meta;

      const pSock: PlayerSocket = { id: playerId, ws };
      game.addPlayer(pSock);
      // revokeToken(token); // don't revoke so players can reconnect

      ws.on('message', (raw: any) => {
        let msg: any;
        try { msg = JSON.parse(String(raw)); } catch { return; }
        if (!msg || typeof msg.seq !== 'number') {
          return;
        }
        if (pSock.lastSeq && msg.seq <= (pSock.lastSeq)) return;
        pSock.lastSeq = msg.seq;
        msg.t ||= Date.now();
        game.playerInput(playerId, msg as PlayerInput);
      });

      ws.on('close', () => {
        game.removePlayer(playerId);
      });
    });
});

const PORT = Number(process.env['LISTEN_PORT']) || 3000;

fastify.listen({ host: "0.0.0.0", port: PORT })
  .then(() => console.log(`Listening on 0.0.0.0:${PORT}`));
