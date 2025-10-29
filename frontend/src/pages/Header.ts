import { SelfInfo } from "../Api";
import Router, { Page } from "../Router";
import { HOW_TO_CENTER_A_DIV } from "./elements/CssUtils";
import { AElement, Div, Image, Paragraph } from "./elements/Elements";

const makeButton = (text: string, id: string, link: string): { elem: AElement, link: string } => {
  return {
    elem: new Paragraph(text).withId(id)
      .class("self-center p-2 -m-2"),
    link
  };
};

export default class PageHeader extends Page {
  title = new Paragraph("libft_transcendence")
    .class("self-center text-2xl")
    .withOnclick(() => this.router.navigate(""))
    .withId("header-title");
  buttons: { elem: AElement, link: string }[];
  userInfo: SelfInfo | null;
  navButtons: AElement[];

  constructor(router: Router, userInfo: SelfInfo | null) {
    super(router);
    this.userInfo = userInfo;
    this.buttons = [
      makeButton("Register", "header-nav-register", "register"),
      makeButton("Log in", "header-nav-login", "login"),
      makeButton("Play", "header-nav-play", "play"),
      makeButton("Friends", "header-nav-friends", "friends"),
      makeButton(userInfo?.username ?? "", "header-nav-self", "dashboard"),
      {
        elem: new Div(
          this.userInfo?.avatarUrl
            ? [new Image(this.userInfo.avatarUrl)]
            : []
        ).class("aspect-square bg-zinc-700/25 h-10 rounded-full self-center overflow-hidden flex")
          .class(HOW_TO_CENTER_A_DIV)
          .withId("header-nav-self-img"),
        link: "dashboard"
      },
    ];

    if (userInfo?.avatarUrl) {
      (this.buttons[this.buttons.length - 1].elem as Div)
        .contents = [new Image(userInfo.avatarUrl)];
    }

    if (this.userInfo) {
      this.navButtons = this.buttons.slice(2).map((e) => e.elem);
    } else {
      this.navButtons = this.buttons.slice(0, 2).map((e) => e.elem);
    }
  }

  content(): AElement[] {
    return [
      new Div([
        this.title,
        new Div([...this.navButtons])
          .class("hidden md:flex flex-rot gap-4"),
      ]).class("flex flex-rot jjustify-center md:justify-between ")
        .class("h-full w-screen p-4 pl-12 pr-12 select-none font-bold"),
    ];
  }

  bindEvents() {
    this.title.bindEvents();
    this.buttons.forEach((e) => {
      e.elem.byId()?.addEventListener('click', () => {
        this.router.navigate(e.link);
      })
    });
  }
};
