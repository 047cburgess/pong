export abstract class AElement {
  id?: string;
  classes: string[] = [];
  onclick?: (this: GlobalEventHandlers, e: PointerEvent) => any;

  abstract render(): string;

  withId(c: string): AElement {
    this.id = c;
    return this;
  }

  class(c: string = ""): AElement {
    this.classes.push(c);
    return this;
  }

  withOnclick(
    onclick: (this: GlobalEventHandlers, e: PointerEvent) => any
  ): AElement {
    this.onclick = onclick;
    return this;
  }

  protected genTags(): string {
    let res = "";
    if (this.id) {
      res += `id="${this.id}" `;
    }
    if (this.classes) {
      res += `class="${this.classes.join(" ")}" `;
    }
    return res;
  }

  byId(): HTMLElement | null {
    if (this.id) {
      return document.getElementById(this.id);
    }
    return null;
  }

  redraw(): void {
    const self = this.byId();
    if (!self) {
      return;
    }
    self.outerHTML = this.render();
  }

  bindEvents(): void {
    const self = this.byId();
    if (!self || !this.onclick) {
      return;
    }
    self.onclick = this.onclick;
  }
}

export class Div extends AElement {
  contents: AElement[] = [];

  constructor(contents: AElement[] = []) {
    super();
    this.contents = contents;
  }

  render(): string {
    let res = `<div ${this.genTags()}>`;
    for (const e of this.contents) {
      res += e.render();
    }
    res += "</div>";
    return res;
  }

  bindEvents(): void {
    super.bindEvents();
    for (const e of this.contents) {
      e.bindEvents();
    }
  }

  redrawInner(): void {
    const self = this.byId();
    if (!self) {
      return;
    }
    self.innerHTML = this.contents.map(e => e.render()).join("");
  }
}

export class Paragraph extends AElement {
  text: string = "";

  constructor(text: string) {
    super();
    this.text = text;
  }

  render(): string {
    return `<p ${this.genTags()}>${this.text}</p>`;
  }
};

export class Label extends AElement {
  text: string;

  constructor(text: string) {
    super();
    this.text = text;
  }

  render(): string {
    return `<label ${this.genTags()}>${this.text}</label>`;
  }
};

export class Textbox extends AElement {
  _password: boolean = false;

  constructor(id: string) {
    super();
    this.id = id;
  }

  password(): Textbox {
    this._password = true;
    return this;
  }

  render(): string {
    const t = this._password ? "password" : "text";
    return `<input type="${t}" ${this.genTags()}/>`;
  }
};

export class Header extends AElement {
  level: number;
  text: string;

  constructor(level: number, text: string) {
    super();
    this.level = level;
    this.text = text;
  }

  render(): string {
    return `<h${this.level} ${this.genTags()}>${this.text}</h${this.level}>`;
  }
};

export class Inline extends AElement {
  value: string;

  constructor(value: string = "") {
    super();
    this.value = value;
  }

  render(): string {
    return this.value;
  }
};

export class Image extends AElement {
  src: string;

  constructor(src: string) {
    super();

    this.src = src;
  }

  render(): string {
    return `<img src="${this.src}" ${this.genTags()}/>`;
  }
};
