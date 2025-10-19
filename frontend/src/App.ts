import Router from "./Router";

import WelcomePage from "./pages/Welcome";
import LoginPage from "./pages/Login";
import DashboardPage from "./pages/Dashboard";
import NotFoundPage from "./pages/NotFound";

import './styles.css';
import PageHeader from "./pages/Header";
import { API } from "./Api";

export type UserInfo = {
  username: string,
  realname?: string,
  registered: string,
  avatar?: string,
};

class App {
  readonly router;

  header: PageHeader;
  headerRoot: HTMLElement;
  evtSource: EventSource;
  userInfo: UserInfo | null;

  constructor(userInfo: UserInfo | null) {
    this.evtSource = new EventSource("/api/events");
    this.evtSource.onmessage = (_e) => {
      // TODO(Vaiva): Notifications
    };

    this.userInfo = userInfo;

    this.router = new Router();

    this.headerRoot = document.getElementsByTagName("header")[0] as HTMLElement;
    this.header = new PageHeader(this.router, this.userInfo);
    this.headerRoot.innerHTML = this.header.content().map((e) => e.render()).join("");
    this.header.bindEvents();

    this.router.addError(404, NotFoundPage);

    this.router.addRoute("", WelcomePage);
    this.router.addRoute("login", LoginPage);
    this.router.addRoute("dashboard", DashboardPage);

    this.router.navigate(window.location.pathname, false);
  }

  private reloadHeader() {
    this.header = new PageHeader(this.router, this.userInfo);
    this.headerRoot.innerHTML = "";
    this.headerRoot.innerHTML = this.header.content().map((e) => e.render()).join("");
    this.header.bindEvents();
  }

  onLogin(userInfo: UserInfo) {
    this.userInfo = userInfo;
    this.reloadHeader();
  }

  onLogout() {
    this.userInfo = null;
    this.reloadHeader();
  }
}

// TODO(Vaiva): auth check
const resp = await API.fetch("/me");
// const info = resp.status === 200 ? resp.json() : null;
const info = {
  username: "Vaiva",
  registered: new Date().toLocaleDateString(),
};

export const APP = new App(info);
