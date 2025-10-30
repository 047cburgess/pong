export const joinQueueSchema = {
	response: {
		200: {
			type: 'object',
			properties: {
				key: { type: 'string' },
				gameId: { type: 'string' },
				expires: { type: 'string', format: 'date-time' }
			},
			required: ['key', 'gameId', 'expires']
		}
	}
};
