import Router, { Page } from "./Router";

import WelcomePage from "./pages/Welcome";
import LoginPage from "./pages/Login";
import DashboardPage from "./pages/Dashboard";
import NotFoundPage from "./pages/NotFound";

import './styles.css';
import PageHeader from "./pages/Header";
import { API, SelfInfo } from "./Api";
import FriendsPage from "./pages/Friends";
import MatchHistoryPage from "./pages/MatchHistory";
import { AElement } from "./pages/elements/Elements";

class RedirToLogin extends Page {
  constructor(router: Router) {
    super(router);
  }

  content(): AElement[] {
    return [];
  }

  bindEvents() {
    this.router.navigate("/login");
  }
}

class App {
  readonly router: Router;

  header: PageHeader;
  readonly headerRoot: HTMLElement;
  evtSource: EventSource;
  userInfo: SelfInfo | null;

  constructor(userInfo: SelfInfo | null) {
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
    this.router.addError(401, RedirToLogin);

    this.router.addRoute("", WelcomePage);
    this.router.addRoute("login", LoginPage);
    this.router.addRoute("dashboard", DashboardPage);
    this.router.addRoute("friends", FriendsPage);
    this.router.addRoute("game-history", MatchHistoryPage);

    this.router.navigate(location.pathname + location.search, false);
  }

  private reloadHeader() {
    this.header = new PageHeader(this.router, this.userInfo);
    this.headerRoot.innerHTML = "";
    this.headerRoot.innerHTML = this.header.content().map((e) => e.render()).join("");
    this.header.bindEvents();
  }

  onLogin(userInfo: SelfInfo) {
    this.userInfo = userInfo;
    this.reloadHeader();
  }

  onLogout() {
    this.userInfo = null;
    this.reloadHeader();
  }
}

const resp = await API.fetch("/user");
let info: SelfInfo | null = (resp.ok || resp.status === 304)
  ? null
  : null;
info = {
  id: 0,
  username: "Vaiva",
  email: "test@example.com",
};

export const APP = new App(info);
