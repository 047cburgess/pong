import Router, { Page } from "../Router";
import { Div, AElement, Label, Textbox } from "./elements/Elements";

export default class LoginPage extends Page {
  readonly userText = new Textbox("username");
  readonly passText = new Textbox("password").password();
  readonly loginButton = new Div();

  private loggedOn: boolean = false;

  constructor(router: Router) {
    super(router);
    this.loggedOn = false; // TODO(Vaiva): Check if logged on
  }

  content(): AElement[] {
    if (this.loggedOn) {
      return [];
    }
    return [
      new Div([
        new Label("Username: "),
        this.userText,
      ]),
      new Div([
        new Label("Password: "),
        this.passText,
      ]),
      this.loginButton,
    ];
  }

  bindEvents(): void {
    if (this.loggedOn) {
      // TODO(Vaiva): Reroute if logged on
      this.router.navigate("");
      return;
    }

    this.loginButton.byId()?.addEventListener("click", () => {
      const user = this.userText.byId() as HTMLInputElement;
      const pass = this.passText.byId() as HTMLInputElement;

      // TODO(Vaiva): Handle empty fields
      if (!user?.value || !pass?.value) {
        return;
      }

      // TODO(Vaiva): auth, JWT, etc
      if (user.value === "vaiva" && pass.value === "123") {
        this.router.navigate("dashboard");
        this.loggedOn = true;
        return;
      }

      // TODO(Vaiva): bad password
    });
  }
}
