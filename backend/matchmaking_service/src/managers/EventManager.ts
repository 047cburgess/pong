import type { FastifyReply } from 'fastify';
import type { FastifyBaseLogger } from 'fastify';
import { UserId, GameId, TournamentId, GameInviteEvent, TournamentInviteEvent } from '../types';

export interface InviteResponseEvent {
  event: 'InviteAccepted' | 'InviteDeclined';
  gameId: GameId;
  playerId: UserId;
}

export interface TournamentInviteResponseEvent {
  event: 'TournamentInviteAccepted' | 'TournamentInviteDeclined';
  tournamentId: TournamentId;
  from: UserId;
}

type SSEEvent =
  | GameInviteEvent
  | InviteResponseEvent
  | TournamentInviteEvent
  | TournamentInviteResponseEvent

export class EventManager {

  private log: FastifyBaseLogger;
  private connections: Map<UserId, FastifyReply>;

  constructor(log: FastifyBaseLogger) {
	  this.log = log;
	  this.connections = new Map<UserId, FastifyReply>();
  }

  /**
   * Register a new SSE connection for a user
   * @param userId - The user ID connecting
   * @param reply - The Fastify reply object for SSE streaming
   */
  addConnection(userId: UserId, reply: FastifyReply) {
    this.connections.set(userId, reply);
    this.log.debug(`Event Manager: User ${userId} connected.`);
  }

  /**
   * Remove SSE connection when user disconnects
   * @param userId - The user ID disconnecting
   */
  removeConnection(userId: UserId) {
    this.connections.delete(userId);
    this.log.debug(`Event Manager: User ${userId} disconnected.`);
  }

  /**
   * Send an SSE event to a specific user
   * @param toUserId - The user ID to send the event to
   * @param event - The event data to send
   * @returns true if delivered, false if user is offline
   */
  sendEvent(toUserId: UserId, event: SSEEvent): boolean {
	const message = `data: ${JSON.stringify(event)}\n\n`;
	this.log.debug(`SENDEVENT Function: Sending SSE to ${toUserId}: ${message}`);

    const connection = this.connections.get(toUserId);

    if (!connection) {
	this.log.debug(`SENDEVENT Function: User ${toUserId} is not online, cannot send SSE`);
      return false; // User offline
    }

    // SSE format: data: {json}\n\n
    connection.raw.write(message);
    return true; // Delivered
  }

  /**
   * Broadcast an SSE event to multiple users
   * @param userIds - Array of user IDs to send the event to
   * @param event - The event data to send
   * @returns Array of user IDs who successfully received the event (were online)
   */
  broadcastEvent(userIds: UserId[], event: SSEEvent): UserId[] {
    const deliveredTo: UserId[] = [];
    this.log.debug(`Event Manager: Preparing to Broadcast to ${deliveredTo}.`);
    userIds.forEach(userId => {
      if (this.sendEvent(userId, event)) {
        deliveredTo.push(userId);
      }
    });

    return deliveredTo;
  }
}
