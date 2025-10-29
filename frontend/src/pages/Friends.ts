import { API, UserInfo } from "../Api";
import { APP } from "../App";
import { AElement, Div, Inline, Paragraph, Image } from "./elements/Elements";
import Router, { NavError, Page } from "../Router";
import { ICON_CROSSED_SWORDS, ICON_X } from "./elements/SvgIcons";
import {
  DEFAULT_BUTTON, HOW_TO_CENTER_A_DIV, EVIL_RED_BUTTON,
  OFFLINE_GRAY, ONLINE_GREEN, MUTED_TEXT,
  AVATAR_DIV
} from "./elements/CssUtils";
import { paths as ApiPaths } from "../PublicAPI";

const makeFriendCard = (router: Router) => (f: UserInfo, i: number): AElement => {
  let statusText;
  if (f.lastSeen !== undefined && (Date.parse(f.lastSeen) + 4 * 60_000 > Date.now())) {
    statusText = new Paragraph("online").class(ONLINE_GREEN);
  } else {
    statusText = new Paragraph("offline").class(OFFLINE_GRAY);
  }
  statusText.class("-mt-1");

  const navDashboard = () => router.navigate(`/dashboard?user=${f.username}`);

  return new Div([
    new Div(
      f.avatarUrl
        ? [new Image(f.avatarUrl)]
        : []
    ).class("bg-zinc-800 m-1")
      .class(AVATAR_DIV)
      .withOnclick(navDashboard)
      .withId(`friends-page-pfp-${i}`),
    new Div([
      new Paragraph(f.username).class("font-bold text-xl"),
      statusText,
    ]).class("flex flex-col self-center select-none mr-auto")
      .withOnclick(navDashboard)
      .withId(`friends-page-name-${i}`),
    new Div([
      new Div([
        new Inline(ICON_CROSSED_SWORDS).class("self-center"),
        new Paragraph("Invite to play").class("self-center"),
      ]).class("pl-4 pr-4 flex gap-2 h-8")
        .class(DEFAULT_BUTTON)
        .class(HOW_TO_CENTER_A_DIV)
        .withOnclick(() => { /* TODO: Invite friend to play */ })
        .withId(`friends-page-invite-${i}`),
      new Div([
        new Inline(ICON_X).class("self-center"),
      ]).class("flex p-2 aspect-square h-8")
        .class(EVIL_RED_BUTTON)
        .class(HOW_TO_CENTER_A_DIV)
        .withOnclick(() => { /* TODO: Remove friend confirmation popup */ })
        .withId(`friends-page-delete-${i}`),
    ]).class("flex flex-row gap-4 self-center")
  ]).class("p-4 h-24 w-160 flex flex-row gap-4");
};

export default class FriendsPage extends Page {
  title: Paragraph;
  listDiv: Div;

  username: string;

  constructor(router: Router) {
    super(router);

    let isCurrent = false;
    let username = new URLSearchParams(location.search).get("user");
    if (!username) {
      isCurrent = true;
      username = APP.userInfo?.username ?? null;
    }
    if (!username) {
      throw new NavError(401);
    }
    this.username = username;

    this.listDiv = new Div([
      new Paragraph("Loading...")
        .class(MUTED_TEXT)
        .class("pt-8 text-xl")
    ])
      .class("flex flex-col")
      .withId("friends-page-cards") as Div;

    this.title = new Paragraph(`${this.username}'s friends`);
    this.title
      .class("text-4xl font-bold text-left mr-auto mb-6")
      .withId("friends-page-title");
    if (isCurrent) {
      this.title.text = "Friends";
    } else {
      this.title
        .withOnclick(_ => this.router.navigate(`/dashboard${location.search}`))
        .class("select-none");
    }
  }

  content(): AElement[] {
    return [
      new Div([
        this.title,
        this.listDiv
      ]).class("flex flex-col p-16 min-w-140 max-w-200 ml-auto mr-auto")
        .class(HOW_TO_CENTER_A_DIV)
    ];
  }

  bindEvents(): void {
    let path = "/user";
    if (this.username !== APP.userInfo?.username) {
      path = `/users/${this.username}`;
    }

    API.fetch(`${path}/friends`).then(async r => {
      if (!r.ok && r.status !== 304) {
        this.router.navigate(404);
        return;
      }
      const friends: UserInfo[] = await r.json() as
        ApiPaths["/user/friends"]["get"]["responses"]["200"]["content"]["application/json"];
      if (friends.length) {
        this.listDiv.contents = friends.map(makeFriendCard(this.router));
      } else {
        this.listDiv.contents = [
          new Paragraph("No frens here :(")
            .class(MUTED_TEXT)
            .class("text-xl pt-8")
        ];
      }
      this.listDiv.redrawInner();
    }).catch(console.error);

    this.title.bindEvents();
    this.listDiv.bindEvents();
  }
};
