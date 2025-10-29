import { GameResultExt } from "../../Api";
import { AElement, Div, Paragraph } from "./Elements";

const CARD_STYLES: string
  = "flex flex-row p-6 transition duration-200 select-none rounded-xl";

const cardTextFromResult = (r: "W" | "L" | "D"): string => {
  switch (r) {
    case "W":
      return "Victory";
    case "L":
      return "Defeat";
    case "D":
      return "Draw";
  }
};

const cardBgFromResult = (r: "W" | "L" | "D" | undefined): string => {
  let res = "outline-2 ";
  switch (r) {
    case "W":
      res += "hover:bg-emerald-600/50 outline-emerald-700 bg-emerald-800/50";
      break;
    case "L":
      res += "hover:bg-red-700/50 outline-red-800 bg-red-900/50";
      break;
    case "D":
      res += "hover:bg-gray-500/50 outline-gray-500 bg-gray-600/50";
      break;
    case undefined:
      res += "outline-zinc-600 bg-zinc-700/50";
      break;
  }
  return res;
};

export class GameCardBase extends Div {
  data?: GameResultExt | null;
  result?: "W" | "L" | "D";

  constructor(data: GameResultExt | undefined | null) {
    super();
    this.data = data;

    if (data && data.winnerId && data.thisUser) {
      if (data.winnerId === data.thisUser) {
        this.result = "W";
      } else {
        this.result = "L";
      }
    } else if (data) {
      this.result = "D";
    }

    this.class(CARD_STYLES);
    if (this.data === undefined) {
      this.class("outline-2 outline-zinc-800 bg-zinc-900/50");
    } else {
      this.class(cardBgFromResult(this.result));
    }
  }
}

export class GameCardLarge extends GameCardBase {
  constructor(data: GameResultExt | undefined | null) {
    super(data);
    this.class("divide-solid divide-x-2");

    if (this.data === undefined) {
      this.contents = [
        new Paragraph("Loading...")
          .class("font-bold text-xl self-center ml-4 text-zinc-700")
      ];
      return;
    }
    if (this.data === null) {
      this.contents = [
        new Paragraph("No recent matches")
          .class("font-bold text-xl self-center ml-4")
      ];
      return;
    }

    this.contents = [
      new Div([
        new Paragraph(this.data.date.toLocaleString())
          .class("font-bold text-xs pr-2"),
        new Paragraph(cardTextFromResult(this.result as any))
          .class("font-bold text-xl"),
      ]).class("m-2 ml-4 self-center w-40"),
      this.scoreDiv().class("grow"),
    ];
  }

  private scoreDiv(): Div {
    if (!this.data) {
      throw new Error("unreachable");
    }
    const rows: AElement[] = [];
    for (let i = 1; i < this.data.players.length; i++) {
      rows.push(
        new Div([
          new Paragraph(`${this.data.players[i].score}`),
          new Paragraph(`${this.data.players[i].id}`),
        ]).class("flex flex-row justify-between gap-2")
      );
    }
    return new Div([
      new Div([
        new Paragraph(this.data.players[0].id.toString()),
        new Paragraph(`${this.data.players[0].score}`),
      ]).class("flex flex-row self-center justify-between grow ml-4 gap-2"),
      new Paragraph(" – ").class("self-center m-3"),
      new Div(rows).class("self-center grow"),
    ]).class("font-bold flex flex-row ml-2 mr-4 grow justify-between") as Div;
  }
}
