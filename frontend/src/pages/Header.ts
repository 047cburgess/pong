import { UserInfo } from "../App";
import Router, { Page } from "../Router";
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
    .class("self-center text-2xl").withId("header-title");
  buttons: { elem: AElement, link: string }[] = [
    makeButton("Register", "header-nav-register", "register"),
    makeButton("Log in", "header-nav-login", "login"),
    makeButton("Play", "header-nav-play", "play"),
    makeButton("Friends", "header-nav-friends", "friends"),
    makeButton("Vaiva", "header-nav-self", "dashboard"),
    {
      elem: new Div().class("aspect-square bg-pink-200 h-10 rounded-full self-center overflow-hidden")
        .withId("header-nav-self-img"), link: "dashboard"
    },
  ];

  userInfo: UserInfo | null;
  navButtons: AElement[];

  constructor(router: Router, userInfo: UserInfo | null) {
    super(router);
    this.userInfo = userInfo;

    if (userInfo?.avatar) {
      (this.buttons[this.buttons.length - 1].elem as Div)
        .contents = [new Image(userInfo?.avatar)];
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
