import { AElement } from "./pages/elements/Elements";

export abstract class Page {
  readonly router: Router;

  constructor(router: Router) {
    this.router = router;
  }

  abstract content(): AElement[];
  bindEvents(): void { }
}

export default class Router {
  private routes: { [key: string]: new (r: Router) => Page } = {};
  private errors: (new (r: Router) => Page)[] = [];
  private rootElement: HTMLElement;

  private currentPath?: string;
  private currentPage?: Page;

  constructor() {
    this.rootElement = document.getElementById("app-root") as HTMLElement;

    window.addEventListener("popstate", () => {
      this.navigate(window.location.pathname, false);
    });
  }

  addRoute(path: string, pageCtor: new (r: Router) => Page): void {
    this.routes[path] = pageCtor;
  }

  addError(err: number, pageCtor: new (r: Router) => Page): void {
    this.errors[err] = pageCtor;
  }

  navigate(path: string, pushState: boolean = true): void {
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    if (this.currentPath === cleanPath) {
      return;
    }
    this.currentPath = cleanPath;
    const page = this.routes[cleanPath];
    if (pushState) {
      history.pushState({}, "", `/${cleanPath}`);
    }

    if (page) {
      this.currentPage = new page(this);
    } else {
      if (this.errors[404]) {
        this.currentPage = new this.errors[404](this);
      } else {
        this.currentPage = {
          router: this,
          content: () => { return []; },
          bindEvents: () => { },
        };
      }
    }
    this.redraw();
  }

  redraw(): void {
    this.rootElement.innerHTML = "";
    if (this.currentPage) {
      this.rootElement.innerHTML
        = this.currentPage.content().map((e) => e.render()).join(" ");
      this.currentPage.bindEvents();
    }
  }
}
