import Router, { Page } from "../Router";
import { AElement, Header } from "./elements/Elements";

export default class NotFoundPage extends Page {
  constructor(router: Router) {
    super(router);
  }

  content(): AElement[] {
    return [
      new Header(1, "404: Not found"),
    ];
  }
};
