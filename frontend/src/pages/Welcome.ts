import Router, { Page } from "../Router";
import { AElement, Div, Paragraph } from "./elements/Elements";

const KEY1 = ["-translate-y-1/3", "opacity-0"];
const KEY2 = ["-translate-y-1/2", "opacity-100"];

export default class WelcomePage extends Page {
  playButton = new Paragraph("Play →")
    .class("font-bold text-2xl mt-10 transition duration-1300")
    .class("delay-1500")
    .class(KEY1.join(" "))
    .withOnclick(() => this.router.navigate("/play"))
    .withId("play-btn");

  titleCard: Div;
  constructor(router: Router) {
    super(router);

    this.titleCard = new Div([
      new Paragraph("Welcome to"),
      new Paragraph("LIBFT_TRANSCENDENCE")
        .class("font-bold text-5xl"),
      // TODO(Vaiva): Add more memes
      new Paragraph("Pong. Delivered to your doorstep."),
      this.playButton,
    ]).class("absolute top-1/2 left-1/2 transform -translate-x-1/2")
      .class("transition duration-1300 ease-in-out flex flex-col items-center select-none")
      .class("delay-200")
      .class(KEY1.join(" "))
      .withOnclick(() => this.router.navigate("/play"))
      .withId("title-card") as Div;
  }

  content(): AElement[] {
    return [this.titleCard];
  }

  transitionIn(): null | void {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      this.titleCard.byId()?.classList.remove(...KEY1);
      this.playButton.byId()?.classList.remove(...KEY1);
      this.titleCard.byId()?.classList.add(...KEY2);
      this.playButton.byId()?.classList.add(...KEY2);
    }));
  }

  bindEvents() {
    this.titleCard.bindEvents();
    this.playButton.bindEvents();
  }
}
