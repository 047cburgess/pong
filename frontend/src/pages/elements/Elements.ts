export abstract class AElement {
  id?: string;
  classes: string[] = [];

  abstract render(): string;

  withId(c: string): AElement {
    this.id = c;
    return this;
  }

  class(c: string = ""): AElement {
    this.classes.push(c);
    return this;
  }

  genTags(): string {
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
