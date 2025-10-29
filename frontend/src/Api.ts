import { components as ApiComponents } from "./PublicAPI";

class ApiAccessor {
  baseRoute: string;

  constructor(baseRoute: string) {
    this.baseRoute = baseRoute;
  }

  async fetch(input: RequestInfo | URL) {
    return await fetch(this.baseRoute + input);
  }
}

export const API = new ApiAccessor("/api/v1");

export type ApiSchemas = ApiComponents["schemas"];

export type GameResult = ApiSchemas["GameResult"];
export type GameResultExt = GameResult & { playerInfos: UserInfo[], thisUser?: number };
export type GameStats = ApiSchemas["GameStats"];
export type UserInfo = ApiSchemas["User.PublicInfo"];
export type SelfInfo = ApiSchemas["User.PublicInfo"] & ApiSchemas["User.PrivateInfo"];
