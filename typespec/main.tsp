import "@typespec/http";
import "@typespec/rest";

using Http;
@service(#{ title: "ft_transcendence" })
namespace FtTranscendence;

@error
model NotFound {
  @statusCode statusCode: 404;
}

@error
model NotAuthorized {
  @statusCode statusCode: 401;
}

@error
model Error {
  code: int32;
}

model User {
  @key username: string;
  realname?: string;
  avatarUrl?: url;
  lastSeen?: utcDateTime;
  registered: boolean;
}

alias Username = User.username;

interface Me {
  @route("/me")
  get(): User | NotAuthorized;
}

@tag("Users")
@route("/users")
interface Users {
  user(@path username: Username): User | NotFound;
}

@tag("Friends")
@route("/friends")
interface Friends {
  @doc("Lists friends for a user")
  @get
  list(
    @query
    user: Username,

    @minValue(1)
    @query
    page: uint32 = 1,

    @minValue(1)
    @maxValue(100)
    @query
    per_page: uint32 = 20,
  ): User[] | NotFound;

  @doc("Lists incoming friend requests for the current user")
  @useAuth(BearerAuth)
  @route("pending")
  @get
  pending(
    @minValue(1)
    @query
    page: uint32 = 1,

    @minValue(1)
    @maxValue(100)
    @query
    per_page: uint32 = 20,
  ): User[] | NotAuthorized;

  @doc("Sends or accepts a friend request")
  @useAuth(BearerAuth)
  @route("add/{username}")
  @post
  add(@path username: Username): void | NotFound | NotAuthorized;

  @doc("Deletes a friend or rejects a friend request")
  @useAuth(BearerAuth)
  @route("delete/{username}")
  @delete
  delete(@path username: Username): void | NotFound | NotAuthorized;
}

model Game {
  @key id: string;
  participants: {
    user: User;
    score: uint32;
  };

  @doc("Winner's username, or 'undefined' if the game ended in a draw")
  winner?: Username;

  date: utcDateTime;
  duration: duration;
}

@tag("History")
@route("/history/games")
interface GameHistory {
  @get list(
    @query
    user: Username,

    @minValue(1)
    @query
    page: uint32 = 1,

    @minValue(1)
    @maxValue(25)
    @query
    per_page: uint32 = 15,
  ): Game[] | NotFound;

  @get game(@path id: Game.id): Game | NotFound;
}

model Tournament {
  @key id: string;
  games: {
    semifinal1: Game;
    semifinal2: Game;
    final: Game;
  };
}

@tag("History")
@route("/history/tournaments")
interface TournamentHistory {
  @get list(
    @query
    user: Username,

    @minValue(1)
    @query
    page: uint32 = 1,

    @minValue(1)
    @maxValue(25)
    @query
    per_page: uint32 = 15,
  ): Tournament[] | NotFound;

  @get tournament(@path id: Tournament.id): Tournament | NotFound;
}

model GameRoom {
  id: string;
}

@error
model MatchmakeError {
  @statusCode statusCode: 409;
  error: string;
}

@tag("Games")
@route("/games")
@useAuth(BearerAuth)
interface Games {
  @route("/matchmake")
  matchmake(): void | MatchmakeError | NotAuthorized;

  @route("/custom-game")
  customGame(): GameRoom | MatchmakeError | NotAuthorized;

  @route("/join")
  joinRoom(@path id: GameRoom.id):
    | void
    | NotFound
    | MatchmakeError
    | NotAuthorized;

  @route("/invite")
  inviteUser(@query username: Username):
    | void
    | NotFound
    | MatchmakeError
    | NotAuthorized;

  @route("/leave")
  leaveRoom(): void | MatchmakeError | NotAuthorized;

  @route("/ready")
  ready(@query unready?: boolean): void | MatchmakeError | NotAuthorized;

  @route("/reconnect")
  reconnect(): GameRoom | MatchmakeError | NotAuthorized;
}

