import { API } from "../Api";
import { APP } from "../App";
import Router, { NavError, Page } from "../Router";
import { AElement, Div, Inline, Paragraph } from "./elements/Elements";

type GameData = {
  date: Date,
  result: "W" | "L" | "D",
  players: string[],
  scores: number[],
  id: string,
};

type UserInfo = {
  avatar?: string,
  username: string,
  isOnline: boolean,
};

const TILE_ANIM_KEY1 = ["opacity-0"];
const TILE_ANIM_KEY2 = ["opacity-100"];

const TILE_STYLES: string
  = "outline-0 rounded-xl outline-neutral-700 p-4";

const MUTED_TEXT: string = "text-neutral-500";

const CARD_STYLES: string
  = "flex flex-row p-6 transition duration-200 select-none rounded-xl";

const cardTextFromResult = (r: "W" | "L" | "D"): string => {
  switch (r) {
    case "W":
      return "Victory";
    case "L":
      return "Defeat";
    case "D":
      return "Draw";
  }
};

const cardBgFromResult = (r: "W" | "L" | "D" | undefined): string => {
  let res = "outline-2 ";
  switch (r) {
    case "W":
      res += "hover:bg-emerald-600/50 outline-emerald-700 bg-emerald-800/50";
      break;
    case "L":
      res += "hover:bg-red-700/50 outline-red-800 bg-red-900/50";
      break;
    case "D":
      res += "hover:bg-gray-500/50 outline-gray-500 bg-gray-600/50";
      break;
    case undefined:
      res += "outline-zinc-600 bg-zinc-700/50";
      break;
  }
  return res;
};

class GameCardBase extends Div {
  data?: GameData;

  constructor(data: GameData | undefined) {
    super();
    this.data = data;

    this.class(CARD_STYLES);
    this.class(cardBgFromResult(this.data?.result));
  }
}

class GameCardLarge extends GameCardBase {
  constructor(data: GameData | undefined) {
    super(data);
    this.class("divide-solid divide-x-2");

    if (!this.data) {
      this.contents = [
        new Paragraph("No recent matches")
          .class("font-bold text-xl self-center ml-4")
      ];
      return;
    }
    this.contents = [
      new Div([
        new Paragraph(this.data.date.toLocaleString())
          .class("font-bold text-xs pr-2"),
        new Paragraph(cardTextFromResult(this.data.result))
          .class("font-bold text-xl"),
      ]).class("m-2 ml-4 self-center w-40"),
      this.scoreDiv().class("grow"),
    ];
  }

  private scoreDiv(): Div {
    if (!this.data) {
      throw Error("unreachable");
    }
    const rows: AElement[] = [];
    for (let i = 1; i < this.data.scores.length; i++) {
      rows.push(
        new Div([
          new Paragraph(`${this.data.scores[i]}`),
          new Paragraph(`${this.data.players[i]}`),
        ]).class("flex flex-row justify-between gap-2")
      );
    }
    return new Div([
      new Div([
        new Paragraph(this.data.players[0]),
        new Paragraph(`${this.data.scores[0]}`),
      ]).class("flex flex-row self-center justify-between grow ml-4 gap-2"),
      new Paragraph(" – ").class("self-center m-3"),
      new Div(rows).class("self-center grow"),
    ]).class("font-bold flex flex-row ml-2 mr-4 grow justify-between") as Div;
  }
}

export default class DashboardPage extends Page {
  lastGames: GameData[] = [];

  gameStats = { wins: 0, draws: 0, losses: 0 };

  friends: UserInfo[] = [];
  friendCards?: AElement[];

  historyTitle?: Paragraph;
  cards: GameCardBase[] = [];
  seeAll: AElement;
  friendsTitle?: AElement;

  // TODO(Vaiva): user info schema
  username: string;
  userInfo?: UserInfo & { nFriends: number };

  tiles?: AElement[];

  constructor(router: Router) {
    super(router);

    let username = new URLSearchParams(location.search).get("user");
    if (!username) {
      username = APP.userInfo?.username ?? null;
    }
    if (!username) {
      throw new NavError(403);
    }

    this.username = username;

    API.fetch(`/users?user=${this.username}`).then(async (r) => {
      if (r.status !== 200) {
        this.router.navError(r.status);
        return;
      }
      await new Promise(r => setTimeout(r, 734));
      this.userInfo = {
        username: this.username,
        isOnline: true,
        nFriends: 31,
      }; // await r.json();
      (this.userInfoTile() as Div).redrawInner();
      (this.friendsTile() as Div).redrawInner();
    }).catch(_ => { });

    API.fetch(`/friends?user=${this.username}`).then(async (r) => {
      if (r.status !== 200) {
        this.router.navError(r.status);
        return;
      }
      await new Promise(r => setTimeout(r, 1654));
      this.friends = [
        {
          username: "Bot1",
          isOnline: false,
        },
        {
          username: "Bot2",
          isOnline: true,
        },
        {
          username: "Bot3",
          isOnline: false,
        },
        {
          username: "Bot4",
          isOnline: true,
        },
        {
          username: "Bot5",
          isOnline: true,
        },
        {
          username: "Bot6",
          isOnline: false,
        },
        {
          username: "Bot7",
          isOnline: false,
        },
      ];
      const tile = this.friendsTile() as Div;
      tile.redrawInner();
      tile.bindEvents();
    }).catch(_ => { });

    API.fetch(`/games?user=${this.username}`).then(async (r) => {
      if (r.status !== 200) {
        this.router.navError(r.status);
        return;
      }
      await new Promise(r => setTimeout(r, 1421));
      this.lastGames = [
        {
          date: new Date(),
          result: "W",
          players: [this.username, "Bot1"],
          scores: [7, 2],
          id: "mock_game_1",
        },
        {
          date: new Date(),
          result: "L",
          players: [this.username, "Bot1", "Bot2"],
          scores: [2, 5, 3],
          id: "mock_game_2",
        },
        {
          date: new Date(),
          result: "D",
          players: [this.username, "Bot1", "Bot2", "VeryLongUsername"],
          scores: [5, 4, 3, 5],
          id: "mock_game_3",
        },
        {
          date: new Date(),
          result: "W",
          players: [this.username, "Bot1", "Bot2", "Bot3"],
          scores: [7, 4, 3, 5],
          id: "mock_game_4",
        },
        {
          date: new Date(),
          result: "W",
          players: [this.username, "Bot1"],
          scores: [5, 4],
          id: "mock_game_5",
        },
        {
          date: new Date(),
          result: "W",
          players: [this.username, "Bot1"],
          scores: [5, 1],
          id: "mock_game_6",
        },
      ];
      // await r.json();
      const tile = this.matchHistoryTile() as Div;
      tile.redrawInner();
      tile.bindEvents();
    }).catch(_ => { });

    API.fetch(`/stats?user=${this.username}`).then(async (r) => {
      if (r.status !== 200) {
        this.router.navError(r.status);
        return;
      }
      await new Promise(r => setTimeout(r, 532));
      this.gameStats = {
        wins: 4,
        draws: 1,
        losses: 2,
      };
      // await r.json(); // TODO(Vaiva): wrong schema
      (this.userInfoTile() as Div).redrawInner();
      (this.matchHistoryTile() as Div).redrawInner();
    }).catch(_ => { });

    this.seeAll = new GameCardBase(undefined)
      .class("justify-center hover:bg-zinc-600/50 h-10")
      .withId("see-all-btn");
    (this.seeAll as Div).contents
      = [new Paragraph("See all").class("self-center font-bold")];
  }

  content(): AElement[] {
    const sideLeft = [
      this.userInfoTile().class(TILE_STYLES),
      this.friendsTile().class(TILE_STYLES),
    ];
    const sideRight = [
      this.matchHistoryTile().class(TILE_STYLES),
    ];

    delete this.tiles;
    this.tiles = sideLeft.concat(sideRight);

    for (let i = 0; i < this.tiles.length; i++) {
      if (!this.tiles[i].id) {
        this.tiles[i].id = `tile-anim-${i}`;
      }
    }

    return [new Div([
      new Div(sideLeft)
        .class("flex flex-col grow lg:max-w-100 gap-2 md:gap-4"),
      new Div(sideRight)
        .class("col-span-2 flex flex-col grow lg:max-w-200 gap-2 md:gap-4"),
    ]).class("gap-2 flex flex-col p-12 min-w-120 max-w-300")
      .class("md:grid md:grid-cols-3 ml-auto mr-auto md:gap-4"),
    ];
  }

  userInfoTile(): AElement {
    return new Div([
      new Div([])
        .class("rounded-full bg-pink-200 aspect-square mb-4 col-span-2 overflow-hidden"),
      new Div([
        new Paragraph(this.username).class("font-bold"),
      ]).class("flex flex-row gap-2 text-3xl mb-4 col-span-2"),
      new Div([
        new Div([
          new Inline(
            /* Friend added logo */
            // `<svg aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM11.53 11A9.53 9.53 0 0 0 2 20.53c0 .81.66 1.47 1.47 1.47h.22c.24 0 .44-.17.5-.4.29-1.12.84-2.17 1.32-2.91.14-.21.43-.1.4.15l-.26 2.61c-.02.3.2.55.5.55h6.4a.5.5 0 0 0 .35-.85l-.02-.03a3 3 0 1 1 4.24-4.24l.53.52c.2.2.5.2.7 0l1.8-1.8c.17-.17.2-.43.06-.62A9.52 9.52 0 0 0 12.47 11h-.94Z" class=""></path><path fill="currentColor" d="M23.7 17.7a1 1 0 1 0-1.4-1.4L18 20.58l-2.3-2.3a1 1 0 0 0-1.4 1.42l3 3a1 1 0 0 0 1.4 0l5-5Z" class=""></path></svg>`
            /* Add freind logo */
            `<svg aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M19 14a1 1 0 0 1 1 1v3h3a1 1 0 0 1 0 2h-3v3a1 1 0 0 1-2 0v-3h-3a1 1 0 1 1 0-2h3v-3a1 1 0 0 1 1-1Z" class=""></path><path fill="currentColor" d="M16.83 12.93c.26-.27.26-.75-.08-.92A9.5 9.5 0 0 0 12.47 11h-.94A9.53 9.53 0 0 0 2 20.53c0 .81.66 1.47 1.47 1.47h.22c.24 0 .44-.17.5-.4.29-1.12.84-2.17 1.32-2.91.14-.21.43-.1.4.15l-.26 2.61c-.02.3.2.55.5.55h7.64c.12 0 .17-.31.06-.36C12.82 21.14 12 20.22 12 19a3 3 0 0 1 3-3h.5a.5.5 0 0 0 .5-.5V15c0-.8.31-1.53.83-2.07ZM12 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" class=""></path></svg>`
          )
            .class("self-center"),
          new Paragraph("Add friend").class("self-center"),
        ])
          .class("flex gap-2 font-bold outline-2 p-1 pl-4 pr-4 -mt-1 mb-3 justify-center items-center")
          .class("rounded-xl transition duration-200 select-none")
          .class("outline-zinc-600 bg-zinc-700/50 hover:bg-zinc-600/50 grow"),
        new Div([
          new Inline(
            `<svg aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M5.26 12.45c.1.03.18.08.25.14l.52.44 5.26 5.26a1 1 0 0 1 0 1.42l-.58.58a1 1 0 0 1-1.42 0l-1.61-1.61a.25.25 0 0 0-.36 0L6.3 19.7a1 1 0 0 0-.29.7V21a1 1 0 0 1-1 1H3.41a1 1 0 0 1-.7-.3l-.42-.4a1 1 0 0 1-.29-.71V19a1 1 0 0 1 1-1h.59a1 1 0 0 0 .7-.3l1.03-1.02c.1-.1.1-.26 0-.36l-1.61-1.61a1 1 0 0 1 0-1.42l.58-.58a1 1 0 0 1 .97-.26ZM18.01 10.37a1 1 0 0 1-1.4-.11L13.86 7a1 1 0 0 1 0-1.3l2.7-3.18c.28-.34.7-.53 1.14-.53H21a1 1 0 0 1 1 1v3.3c0 .45-.2.86-.53 1.15L18 10.37Z" class=""></path><path fill="currentColor" d="M7.45 2.53A1.5 1.5 0 0 0 6.3 2H3a1 1 0 0 0-1 1v3.3c0 .45.2.86.53 1.15l11.72 9.92c.11.1.12.26.02.36L13.2 18.8a1 1 0 0 0 0 1.42l.58.58a1 1 0 0 0 1.42 0l1.61-1.61c.1-.1.26-.1.36 0l.53.53a1 1 0 0 1 .29.7V21a1 1 0 0 0 1 1h1.59a1 1 0 0 0 .7-.3l.42-.4a1 1 0 0 0 .29-.71V19a1 1 0 0 0-1-1h-.59a1 1 0 0 1-.7-.3l-.53-.52a.25.25 0 0 1 0-.36l1.61-1.61a1 1 0 0 0 0-1.42l-.58-.58a1 1 0 0 0-1.42 0l-1.06 1.06c-.1.1-.27.1-.36-.02L7.45 2.53Z" class=""></path></svg>`
          )
        ])
          .class("flex gap-2 font-bold outline-2 p-1 pl-4 pr-4 -mt-1 mb-3 text-center justify-center items-center")
          .class("rounded-xl transition duration-200 select-none")
          .class("outline-zinc-600 bg-zinc-700/50 hover:bg-zinc-600/50"),
      ]).class("col-span-2 flex gap-4"),
      new Paragraph("Online").class("text-green-400 col-span-2"),
      // new Paragraph("Offline").class("text-zinc-500 col-span-2"),
      new Paragraph("Member since:"),
      new Paragraph(`${new Date().toLocaleDateString()}`)
        .class("text-right font-bold self-end"),
      new Paragraph("Games played:"),
      new Paragraph(`${this.gameStats.wins + this.gameStats.losses + this.gameStats.draws}`)
        .class("text-right font-bold self-end"),
      new Paragraph("Rank:"),
      new Paragraph("Player").class("text-right font-bold self-end"),
      // new Div(),
    ])
      .class("grid grid-cols-2")
      .withId("tile-user-info");
  }

  friendsTile(): AElement {
    const friendCard = (info: UserInfo, index: number): AElement => {
      const elems = [
        new Div().class("aspect-square w-8 bg-cyan-200 rounded-full"),
        new Div().class("h-3 w-3 rounded-full -ml-6.75 mt-4.5 outline-2 outline-neutral-900"),
        new Paragraph(info.username).class("self-center font-bold"),
      ]
      if (info.isOnline) {
        elems[1].class("bg-green-400");
      } else {
        elems[1].class("bg-neutral-400");
      }
      const res = new Div(elems)
        .class("transition duration-150 ease-in-out flex flex-row gap-4 hover:bg-zinc-800 rounded-xl")
        .withId(`friend-${index}`);
      (res as any).username = info.username;
      return res;
    };

    let flist: AElement[];
    if (this.friends.length) {
      this.friendCards = this.friends.slice(0, 5).map(friendCard);
      flist = this.friendCards.slice();
    } else {
      this.friendCards = undefined;
      flist = [new Paragraph("No frens found :(").class(MUTED_TEXT)];
    }

    this.friendsTitle = new Div([new Paragraph("Friends →"), new Paragraph(`${this.userInfo?.nFriends ?? "..."}`)])
      .class("flex justify-between font-bold text-xl mb-2")
      .withId("friends-list-title");

    return new Div([
      this.friendsTitle,
      ...flist,
    ]).class("flex flex-col gap-2 select-none")
      .withId("tile-friends");
  }

  matchHistoryTile(): AElement {
    const bigCard = new GameCardLarge(this.lastGames[0]);
    bigCard.class("h-30").withId('card-0-large');
    this.cards = [bigCard];
    for (let i = 1; i < Math.min(5, this.lastGames.length); i++) {
      const c = new GameCardLarge(this.lastGames[i]);
      c.class("h-30").withId(`card-${i}`)
        .withOnclick(() => this.router.navigate(`/game?id=${this.lastGames[i].id}`));
      this.cards.push(c);
    }
    this.historyTitle = new Paragraph("Match history&nbsp;→")
      .class("select-none")
      .withOnclick(() => this.router.navigate("/game-history"))
      .withId("match-history") as Paragraph;
    return new Div([
      new Div([
        this.historyTitle,
        new Div([
          new Paragraph(`Wins ${this.gameStats.wins}`),
          new Paragraph(`Draws ${this.gameStats.draws}`),
          new Paragraph(`Losses ${this.gameStats.losses}`),
        ]).class("hidden md:flex flex-row justify-end gap-4"),
      ]).class("flex flex-row gap-4 justify-between font-bold text-xl mb-2"),
      ...this.cards,
      this.seeAll
    ]).class("flex flex-col gap-2 md:gap-4")
      .withId("tile-match-history");
  }

  bindEvents() {
    const navGameHist = () => this.router.navigate('game-history');
    this.historyTitle?.byId()?.addEventListener('click', navGameHist);
    this.seeAll.byId()?.addEventListener('click', navGameHist);

    this.cards.forEach((c) => {
      if (c.data) {
        c.byId()?.addEventListener('click', () => {
          if (c.data) {
            this.router.navigate(`game-summary?id=${c.data.id}`);
          }
        });
      }
    });

    this.friendsTitle?.byId()?.addEventListener('click', () => {
      this.router.navigate(`friends?user=${this.username}`);
    });
    this.friendCards?.forEach((c) => {
      c.byId()?.addEventListener('click', () => {
        this.router.navigate(`dashboard?user=${(c as any).username}`);
      });
    });
  }

  transitionIn(): null | void {
    ["delay-25", "delay-50", "delay-75",
      "delay-100", "delay-200", "delay-300",
      "delay-125", "delay-225", "delay-325",
      "delay-150", "delay-250", "delay-350",
      "delay-175", "delay-275", "delay-375",];

    this.tiles?.forEach((t, i) => t.byId()?.classList.add(
      "transition", "ease-in-out", "duration-900",
      `delay-${i * 50 + 25}`,
      ...TILE_ANIM_KEY1
    ));

    requestAnimationFrame(() => requestAnimationFrame(() => {
      this.tiles?.forEach((t) => {
        t.byId()?.classList.remove(...TILE_ANIM_KEY1);
        t.byId()?.classList.add(...TILE_ANIM_KEY2);
      });
    }));
  }
};
