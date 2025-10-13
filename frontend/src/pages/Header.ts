import { UserInfo } from "../app";
import Router, { Page } from "../Router";
import { AElement, Div, Inline, Paragraph } from "./elements/Elements";

const makeButton = (text: string, id: string, link: string): { elem: AElement, link: string } => {
  return {
    elem: new Paragraph(text).withId(id)
      .class("self-center p-2 -m-2"),
    link
  };
};


export default class PageHeader extends Page {
  title = new Paragraph("libft_transcendence")
    .class("self-center text-2xl").withId("header-title");
  userInfo?: UserInfo;
  navButtons: AElement[];

  buttons: { elem: AElement, link: string }[] = [
    makeButton("Register", "header-nav-register", "register"),
    makeButton("Log in", "header-nav-login", "login"),
    makeButton("Play", "header-nav-play", "play"),
    makeButton("Friends", "header-nav-friends", "friends"),
    // makeButton("Dashboard", "header-nav-dashboard", "dashboard"),
    // makeButton("History", "header-nav-history", "game-history"),
    // makeButton("Settings", "header-nav-settings", "settings"),
    makeButton("Vaiva", "header-nav-self", "dashboard"),
    {
      elem: new Div().class("aspect-square bg-pink-200 h-full rounded-full")
        .withId("header-nav-self-img"), link: "dashboard"
    },
    // makeButton("Logout", "header-nav-logout", "logout"),
  ];

  constructor(router: Router, userInfo?: UserInfo) {
    super(router);
    this.userInfo = userInfo;

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
        new Div([...this.navButtons]) // , new Paragraph("⏻").class("self-center p-2 -m-2 pr-6")])
          .class("hidden md:flex flex-rot gap-4"),
      ]).class("flex flex-rot jjustify-center md:justify-between ")
        .class("h-full w-screen p-4 pl-12 pr-12 select-none font-bold"),
    ];
  }

  bindEvents() {
    this.title.byId()?.addEventListener('click', () => {
      this.router.navigate("");
    });
    this.buttons.forEach((e) => {
      e.elem.byId()?.addEventListener('click', () => {
        this.router.navigate(e.link);
      })
    });
  }
};
