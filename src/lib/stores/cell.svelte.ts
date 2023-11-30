import { v4 as uuid } from 'uuid';
import { room } from "./room.svelte";
import type * as Y from "yjs";
import type { CellData, CellType } from '$lib/types/cell';

type CellOptions = Partial<Exclude<CellData, 'content'>>;

class Cell {
  private _id: string;
  private _type: CellType = "python";
  private _syncedContent: Y.Text;
  private _content = $state("");

  constructor({ id, type }: CellOptions = { type: "python" }) {
    this._id = id ?? uuid();
    this._type = type ?? "python";
    this._syncedContent = room.document.getText(`cell-${this._id}`);
    this._content = this._syncedContent.toString();
    this._syncedContent.observe(() => {
      this._content = this._syncedContent.toString();
    });
  }

  get id() { return this._id; }
  get type() { return this._type; }
  get syncedContent() { return this._syncedContent; }
  get content() { return this._content; }

}

export { Cell }