import { TournamentResultExt } from "../../Api";
import { Div } from "./Elements";

export default class TournamentCard extends Div {
  data: TournamentResultExt;

  constructor(data: TournamentResultExt) {
    super();
    this.data = data;
  }
}
