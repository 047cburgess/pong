import { usernameValidator } from "../FieldValidators";
import Router, { Page } from "../Router";
import { HOW_TO_CENTER_A_DIV, INPUT_BOX_OUTLINE } from "./elements/CssUtils";
import { AElement, Button, Div, Paragraph, Textbox } from "./elements/Elements";

export default class SettingsPage extends Page {
  usernameText: Textbox = new Textbox("username");

  constructor(router: Router) {
    super(router);
  }

  content(): AElement[] {
    return [
      new Div(
        new Div(
          new Paragraph("New username:").class("text-xl").withId("password-label"),
          this.usernameText
            .withValidator(usernameValidator)
            .postValidation(() => this.errorsDiv(this.usernameText).redrawInner())
            .class("rounded-xs text-2xl text-center outline-1 p-1 mt-2")
            .class(INPUT_BOX_OUTLINE)
            .class("transition duration-200 ease-in-out"),
          this.errorsDiv(this.usernameText),
        ).withId("username-area").withOnclick(() => this.usernameText.byId()?.focus()),
        new Button(
          new Paragraph("Save username").class("text-xl p-2 select-none self-center text-center")
        ).class(HOW_TO_CENTER_A_DIV)
          .class("flex")
          .withOnclick(this.updateUsername.bind(this))
          .withId("sign-in-btn"),
      ).class(HOW_TO_CENTER_A_DIV)
        .class("absolute top-1/2 left-1/2")
        .class("transform -translate-y-1/2 -translate-x-1/2")
        .class("flex flex-col select-none font-bold")
    ];
  }

  errorsDiv(elem: Textbox) {
    const res = new Div();
    res.withId(elem.id + "-errdiv");
    new Set(elem.validationErrors ?? [])
      .forEach(e => res.contents.push(new Paragraph("• " + e).class("text-red-500")));
    return res;
  }

  bindEvents(): void {
    this.content().forEach(x => x.bindEvents());
  }

  async updateUsername() {

  }
};
