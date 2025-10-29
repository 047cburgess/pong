import { API, GameResultExt, UserInfo } from "../Api";
import { APP } from "../App";
import Router, { NavError, Page } from "../Router";
import { AElement, Div } from "./elements/Elements";
import { paths as ApiPaths } from "../PublicAPI";
import { userFromMaybeId } from "../Util";

export default class MatchHistoryPage extends Page {
  username: string;

  games?: GameResultExt[];

  constructor(router: Router) {
    super(router);

    let username = new URLSearchParams(location.search).get("user");
    if (!username) {
      username = APP.userInfo?.username ?? null;
    }
    if (!username) {
      throw new NavError(401);
    }
    this.username = username;
  }

  content(): AElement[] {
    return [
      this.gameList()
    ];
  }

  gameList(): Div {
    // TODO(Vaiva)
    return new Div()
      .withId("game-list") as Div;
  }

  bindEvents() {
    let path = "/user";

    if (this.username !== APP.userInfo?.username) {
      path = `/users/${this.username}`;
    }

    API.fetch(`${path}/games`).then(async resp => {
      if (resp.status === 401) {
        APP.onLogout();
        this.router.navigate("/login");
        return;
      }
      if (!resp.ok && resp.status !== 304) {
        this.router.navigate(resp.status, false);
        return;
      }

      const games = await resp.json() as
        ApiPaths["/user/games"]["get"]["responses"]["200"]["content"]["application/json"];

      const ids = new Set(games.flatMap(g => g.players).map(p => p.id));
      const userInfos: Map<string | number, UserInfo> = new Map();
      const proms = [];
      for (const id of ids) {
        proms.push(userFromMaybeId(id).then(info => userInfos.set(id, info)));
      }
      await Promise.all(proms);

      // bad algo but who cares lol
      // we're javascripting this shit
      let currId: null | number = null;
      for (const [id, info] of userInfos) {
        if (typeof id === 'number' && info.username === this.username) {
          currId = id;
          return;
        }
      }

      this.games = games.map(_g => {
        const g = _g as GameResultExt;
        g.playerInfos = g.players.map(p => userInfos.get(p.id) as UserInfo);
        if (currId) {
          g.thisUser = currId;
        }
        return g;
      });

      this.gameList().redrawInner();
    }).catch(console.error);
  }
};
