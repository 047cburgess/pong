import Router from "./Router";

import WelcomePage from "./pages/Welcome";
import LoginPage from "./pages/Login";
import DashboardPage from "./pages/Dashboard";
import NotFoundPage from "./pages/NotFound";

import './styles.css';
import PageHeader from "./pages/Header";

export type UserInfo = {
  username: string,
  avatar: string,
};

class App {
  readonly router;

  header: PageHeader;

  constructor() {
    this.router = new Router();

    const header = document.getElementsByTagName("header")[0] as HTMLElement;
    this.header = new PageHeader(this.router, { username: "Vaiva", avatar: "" });
    header.innerHTML = this.header.content().map((e) => e.render()).join();
    this.header.bindEvents();

    // const footer = document.getElementById("footer") as HTMLElement;

    this.router.addError(404, NotFoundPage);

    this.router.addRoute("", WelcomePage);
    this.router.addRoute("login", LoginPage);
    this.router.addRoute("dashboard", DashboardPage);

    this.router.navigate(window.location.pathname, false);
  }
}

new App();
