import "@typespec/http";
import "@typespec/rest";

using Http;
using PublicAPI;

@service(#{ title: "Internal-Only REST APIs" })
namespace InternalApi;

model NewGameRequest {
  @minValue(2)
  @maxValue(4)
  nPlayers: uint32;
}

model NewGameResponse {
  @minItems(2)
  @maxItems(4)
  gameKeys: GameKey[];
}

model NewTournamentGameResponse {
  @minItems(2)
  @maxItems(2)
  gameKeys: GameKey[];
  viewingKey: string;
}

model GameStatusReponse {
  gameId: string;
  status: "waiting" | "in_progress";
}

@tag("Game Service")
@server("http://game-service:3001", "Game Service")
namespace GameService {
  @doc("Matchingmaking requests new classic game.")
  @route("/internal/games/classic/create")
  @post
  op newGame(
    @body body: NewGameRequest,
  ): NewGameResponse | BadRequestResponse | UnauthorizedResponse;

  @doc("Matchingmaking requests new tournament game.")
  @route("/internal/games/tournament/create")
  @post
  op newTournamentGame(
    @body body: NewGameRequest,
  ): NewTournamentGameResponse | BadRequestResponse | UnauthorizedResponse;

  @doc("Matchmaking requesting state of a game -> sanity check.")
  @route("/internal/games/{gameId}/status")
  @get
  op getGameStatus(@path gameId: string): GameStatusReponse | NotFoundResponse;
}
