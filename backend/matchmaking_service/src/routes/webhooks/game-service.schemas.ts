
export const gameResultWebhookSchema = {
  params: {
    type: 'object',
    required: ['gameId'],
    properties: {
      gameId: {
        type: 'string'
      }
    }
  },
  body: {
    type: 'object',
    required: ['mode', 'players', 'date', 'duration'],
    properties: {
      mode: {
        type: 'string',
        enum: ['classic', 'tournament']
      },
      players: {
        type: 'array',
        minItems: 2,
        maxItems: 4,
        items: {
          type: 'object',
          required: ['id', 'score'],
          properties: {
            id: { type: 'string' },
            score: { type: 'number' }
          }
        }
      },
      winnerId: {
        type: 'string'
      },
      date: {
        type: 'string',
        format: 'date-time'
      },
      duration: {
        type: 'string'
      }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        message: { type: 'string' }
      },
      description: 'Game result processed'
    }
  }
};
