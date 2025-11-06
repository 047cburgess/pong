import "@typespec/http";
import "@typespec/rest";

using Http;
using PublicAPI;

@service(#{ title: "Webhooks" })
namespace Webhooks;

model GameResultWebhookBody {
  @minItems(2)
  @maxItems(4)
  players: {
    id: User.Id;
    score: int32;
  }[];

  @doc("Winner ID. Optional for classic games (draws allowed), but tournament games must have a winner.")
  winnerId?: User.Id;
  date: utcDateTime;
  duration: duration;
}

model WebhookResponse {
  message: string;
}

@tag("Matchmaking Service")
@server("http://matchmaking-service:3000", "Matchmaking")
namespace MatchmakingService {
  @route("webhooks/games/{gameId}/result")
  @doc("Game service sends result when game completes. Matchmaking routes to appropriate manager (custom/queue/tournament) via GameRegistry.")
  @post
  op gameComplete(
    @path gameId: string,
    @body body: GameResultWebhookBody,
  ): WebhookResponse;
}
