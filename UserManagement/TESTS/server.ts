import Fastify, { FastifyInstance } from "fastify"
import { CommandManager, CommandResult, ManagerBase } from "../Commands/CommandManager";
import { GetFriendsData } from "../Commands/GetFriendsData"
import { GetIncomingFriendRequestCommand } from "../Commands/GetIncomingFriendRequestCommand";
import { GetOutgoingFriendRequestCommand } from "../Commands/GetOutgoingFriendRequestCommand";
import { RequestFriendCommand } from "../Commands/RequestFriendCommand";
import { CancelFriendRequestCommand } from "../Commands/CancelFriendRequestCommand";
import { AcceptFriendRequestCommand } from "../Commands/AcceptFriendRequestCommand";
import { RemoveFriendCommand } from "../Commands/RemoveFriendCommand";
import { RefuseFriendRequestCommand } from "../Commands/RefuseFriendRequestCommand";
import { GetQueuedMessagesCommand } from "../Commands/GetQueuedMessagesCommand";
import { GetUserDataCommand } from "../Commands/GetUserDataCommand";
import { EditUsernameCommand } from "../Commands/EditUsernameCommand";
import { RemoveUserCommand } from "../Commands/RemoveUserCommand";
import { resolveUserId, onUserSeen, Params } from "../API/preHandler";
import { ManagerRegistry } from "../ManagerRegistry";


let isInitialized = false;

export function initializeApp() {
    if (isInitialized) return;
    
    const mr = new ManagerRegistry();
    new CommandManager(mr);
    
    isInitialized = true;
    console.log('✅ App initialized');
}

export function createServer() {
	initializeApp();
    const server = Fastify({ logger: false });

    server.get("/user/friends", { preHandler: onUserSeen}, async (request, reply) => {
		console.log('[ROUTE] GET /user/friends - START');
		const user_id = request.sender_id!;
		console.log('[ROUTE] sender_id:', user_id);
		const result = CommandManager.get(GetFriendsData).execute(user_id);
		console.log('[ROUTE] Result:', result);
		if (result.success)
			reply.status(200).send(result.data!);
		else
			reply.status(404).send(result.errors);
		console.log('[ROUTE] GET /user/friends - END');
	});
	
	server.get("/user/friends/:username", { preHandler: resolveUserId }, async (request, reply) => {
		console.log('[ROUTE] GET /user/friends/:username - START');
		const user_id = request.user_id;
		console.log('[ROUTE] user_id:', user_id);
		const result = CommandManager.get(GetFriendsData).execute(user_id!);
		console.log('[ROUTE] Result:', result);
		if (result.success === true) {
			reply.status(200).send(result.data!);
		}
		else
			reply.status(404).send(result.errors);
		console.log('[ROUTE] GET /user/friends/:username - END');
	});
	
	server.get("/user/friends/requests", {preHandler: onUserSeen}, async (request, reply) => {
		console.log('[ROUTE] GET /user/friends/requests - START');
		const user_id = request.sender_id;
		console.log('[ROUTE] sender_id:', user_id);
		const result = CommandManager.get(GetIncomingFriendRequestCommand).execute(user_id!);
		console.log('[ROUTE] Result:', result);
		if (result.success)
			reply.status(200).send(result.data);
		else
			reply.status(404).send(result.errors);
		console.log('[ROUTE] GET /user/friends/requests - END');
	});
	
	server.get("/user/friends/requests/outgoing", { preHandler: onUserSeen }, async (request, reply) => {
		console.log('[ROUTE] GET /user/friends/requests/outgoing - START');
		const user_id = request.sender_id;
		console.log('[ROUTE] sender_id:', user_id);
		const result = CommandManager.get(GetOutgoingFriendRequestCommand).execute(user_id!);
		console.log('[ROUTE] Result:', result);
		if (result.success)
			reply.status(200).send(result.data);
		else
			reply.status(404).send(result.errors);
		console.log('[ROUTE] GET /user/friends/requests/outgoing - END');
	});
	
	server.post("/user/friends/request/outgoing/:username", { preHandler: [resolveUserId, onUserSeen] }, async (request, reply) => {
		console.log('[ROUTE] POST /user/friends/request/outgoing/:username - START');
		const sender_id = request.sender_id!;
		const receiver_id = request.user_id!;
		console.log('[ROUTE] sender_id:', sender_id, 'receiver_id:', receiver_id);
		const result = CommandManager.get(RequestFriendCommand).execute(sender_id, receiver_id);
		console.log('[ROUTE] Result:', result);
		if (result.success)
			reply.status(200).send(result.data);
		else
			reply.status(404).send(result.errors);
		console.log('[ROUTE] POST /user/friends/request/outgoing/:username - END');
	});
	
	server.delete("/user/friends/request/outgoing/:username", { preHandler: [resolveUserId, onUserSeen] }, async (request, reply) => {
		console.log('[ROUTE] DELETE /user/friends/request/outgoing/:username - START');
		const sender_id = request.sender_id!;
		const receiver_id = request.user_id!;
		console.log('[ROUTE] sender_id:', sender_id, 'receiver_id:', receiver_id);
		const result = CommandManager.get(CancelFriendRequestCommand).execute(sender_id, receiver_id);
		console.log('[ROUTE] Result:', result);
		if (result.success)
			reply.status(204).send();
		else
			reply.status(404).send(result.errors);
		console.log('[ROUTE] DELETE /user/friends/request/outgoing/:username - END');
	});
	
	server.put("/user/friends/request/:username", { preHandler: [resolveUserId, onUserSeen] }, async (request, reply) => {
		console.log('[ROUTE] PUT /user/friends/request/:username - START');
		const receiver_id = request.sender_id!;
		const sender_id = request.user_id!;
		console.log('[ROUTE] receiver_id:', receiver_id, 'sender_id:', sender_id);
		const action = request.body as string;
		let result: CommandResult = CommandManager.get(AcceptFriendRequestCommand).execute(receiver_id, sender_id);
		console.log('[ROUTE] Result:', result);
		if (result.success)
			reply.status(204).send();
		else
			reply.status(404).send(result.errors);
		console.log('[ROUTE] PUT /user/friends/request/:username - END');
	});
	
	server.delete("/user/friends/request/:username", { preHandler: [resolveUserId, onUserSeen] }, async (request, reply) => {
		console.log('[ROUTE] DELETE /user/friends/request/:username - START');
		const receiver_id = request.sender_id!;
		const sender_id = request.user_id!;
		console.log('[ROUTE] receiver_id:', receiver_id, 'sender_id:', sender_id);
		const action = request.body as string;
		let result: CommandResult = CommandManager.get(RefuseFriendRequestCommand).execute(receiver_id, sender_id);
		console.log('[ROUTE] Result:', result);
		if (result.success)
			reply.status(204).send();
		else
			reply.status(404).send(result.errors);
		console.log('[ROUTE] DELETE /user/friends/request/:username - END');
	});
	
	server.delete("/user/friends/:username", { preHandler: [resolveUserId, onUserSeen] }, async (request, reply) => {
		console.log('[ROUTE] DELETE /user/friends/:username - START');
		const user_id = request.sender_id!;
		const friend_id = request.user_id!;
		console.log('[ROUTE] user_id:', user_id, 'friend_id:', friend_id);
		const result = CommandManager.get(RemoveFriendCommand).execute(user_id, friend_id);
		console.log('[ROUTE] Result:', result);
		if (result.success)
			reply.status(204).send();
		else
			reply.status(404).send(result.errors);
		console.log('[ROUTE] DELETE /user/friends/:username - END');
	});
	
	server.get("/user/friends/notifications", { preHandler: [onUserSeen] }, async (request, reply) => {
		console.log('[ROUTE] GET /user/friends/notifications - START');
		const user_id = request.sender_id!;
		console.log('[ROUTE] user_id:', user_id);
		const result = CommandManager.get(GetQueuedMessagesCommand).execute(user_id);
		console.log('[ROUTE] Result:', result);
		if (result.success)
			return reply.status(200).send(result.data);
		else
			return reply.status(404).send(result.data);
		console.log('[ROUTE] GET /user/friends/notifications - END');
	});
	
	server.get("/user/:username/id", { preHandler: [resolveUserId] }, async (request, reply) => {
		console.log('[ROUTE] GET /user/:username/id - START');
		console.log('[ROUTE] user_id:', request.user_id);
		reply.status(200).send(request.user_id!);
		console.log('[ROUTE] GET /user/:username/id - END');
	});
	
	server.get("/user", { preHandler: [onUserSeen] }, async (request, reply) => {
		console.log('[ROUTE] GET /user/ - START');
		const user_id = request.sender_id!;
		console.log('[ROUTE] user_id:', user_id);
		const result = CommandManager.get(GetUserDataCommand).execute(user_id);
		console.log('[ROUTE] Result:', result);
		if (result.success)
			return reply.status(200).send(result.data!);
		else
			return reply.status(404).send();
		console.log('[ROUTE] GET /user/ - END');
	});
	
	server.get("/user/:username", { preHandler: [resolveUserId, onUserSeen] }, async (request, reply) => {
		console.log('[ROUTE] GET /user/:username - START');
		const user_id = request.user_id!;
		console.log('[ROUTE] user_id:', user_id);
		const result = CommandManager.get(GetUserDataCommand).execute(user_id);
		console.log('[ROUTE] Result:', result);
		if (result.success)
			return reply.status(200).send(result.data!);
		else
			return reply.status(404).send();
		console.log('[ROUTE] GET /user/:username - END');
	});
	
	server.put("/user/username", {preHandler : onUserSeen}, async (request, reply) => {
		console.log('[ROUTE] PUT /user/username - START');
		const user_id = request.sender_id!;
		const username = (request.body as Params).username;
		console.log('[ROUTE] user_id:', user_id, 'new username:', username);
		const result = CommandManager.get(EditUsernameCommand).execute(user_id, username);
		console.log('[ROUTE] Result:', result);
		if(result.success)
			return reply.status(204).send();
		else
			return reply.status(404).send();
		console.log('[ROUTE] PUT /user/username - END');
	});
	
	server.delete("/user", {preHandler : onUserSeen} ,async (request, reply) => {
		console.log('[ROUTE] DELETE /user/ - START');
		const user_id = request.sender_id!;
		console.log('[ROUTE] user_id:', user_id);
		const result = CommandManager.get(RemoveUserCommand).execute(user_id);
		console.log('[ROUTE] Result:', result);
		if(result.success)
			return reply.status(204).send();
		console.log('[ROUTE] DELETE /user/ - END');
	});


	server.ready(() => {
        console.log('[SERVER] Registered routes:');
        server.printRoutes();
    });

    return server;
}
