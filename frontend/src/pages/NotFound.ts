import Router, { Page } from "../Router";
import { AElement, Div, Header, Paragraph } from "./elements/Elements";

const KEY1 = ["-translate-y-1/2", "opacity-0"];
const KEY2 = ["-translate-y-1/2", "opacity-100"];

export default class NotFoundPage extends Page {
  private backToMain = new Paragraph("Return to main page →")
    .class("mt-8 text-2xl")
    .withId("return-btn");

  private root = new Div([
    new Header(1, "404").class("text-8xl"),
    new Header(2, "Not found :(").class("text-4xl"),
    this.backToMain,
  ]).class("absolute top-1/2 left-1/2 transform -translate-x-1/2")
    .class("flex flex-col items-center select-none font-bold")
    .class("transition duration-300 ease-in-out")
    .class(KEY1.join(" "))
    .withId("root-404");

  constructor(router: Router) {
    super(router);
  }

  content(): AElement[] {
    return [this.root];
  }

  bindEvents(): void {
    this.backToMain.byId()?.addEventListener('click', () => {
      this.router.navigate("");
    })
  }

  transitionIn(): null | void {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      this.root.byId()?.classList.remove(...KEY1);
      this.root.byId()?.classList.add(...KEY2);
    }));
  }
};
