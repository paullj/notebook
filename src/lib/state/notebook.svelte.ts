import { insert } from "$lib/utils/rank";
import { Query as QueryStore, zero } from "$lib/zero";
import type { Notebook as NotebookSchema, Cell as CellSchema } from "$schema/zero";
import type { Row, Query } from "@rocicorp/zero";

type Placement = 'above' | 'below';

type CellType = 'code' | 'markdown';

type InsertCellParams = {
  type: CellType,
  prev?: string | null,
  next?: string | null
};

type UpdateCellParams = {
  id: string,
  content?: string,
  rank?: string,
};

type MoveCellParams = {
  id: string,
  target: number,
  placement: Placement
};

type NotebookQueryResult = {
  row: Row<NotebookSchema>;
  related: {
    cells: {
      row: Row<CellSchema>;
      related: never;
      singular: false;
    };
  };
  singular: true;
};

export class Notebook {
  #notebook: QueryStore<NotebookSchema, NotebookQueryResult>;
  id = $derived.by(() => this.#notebook.data?.id ?? null);
  length = $derived.by(() => this.#notebook.data?.cells.length ?? 0);
  cells = $derived.by(() => this.#notebook.data?.cells ?? []);

  constructor(query: Query<NotebookSchema, NotebookQueryResult>) {
    this.#notebook = new QueryStore(query);

    $effect(() => {
      if (this.#notebook.data != null) return;
      if (this.#notebook.status === 'unknown') return;

      zero.mutate.notebook.insert({
        id: crypto.randomUUID(),
        creator_id: zero.userID
      });
    });
  }

  insertCell({ type, prev = null, next = null }: InsertCellParams) {
    if (this.id == null) return;

    const [rank, success] = insert(prev, next);

    if (!success) return;

    zero.mutate.cell.insert({
      id: crypto.randomUUID(),
      notebook_id: this.id,
      rank,
      type,
      content: type === 'code' ? 'print("Hello, World!")' : '# Hello, World!',
    });
  }

  moveCell({ id, target, placement }: MoveCellParams) {
    if (this.id == null) return;
    if (target < 0 || target >= this.length) return;

    const indexPrev = placement === 'above' ? target - 1 : target;
    const indexAfter = placement === 'above' ? target : target + 1;

    const prev = indexPrev >= 0 ? this.cells[indexPrev].rank : null;
    const next = indexAfter < this.length ? this.cells[indexAfter].rank : null;

    const [rank, success] = insert(prev, next);

    if (!success) return;

    zero.mutate.cell.update({
      id,
      rank
    });
  }

  updateCell({ id, content = undefined, rank = undefined }: UpdateCellParams) {
    if (this.id == null) return;
    zero.mutate.cell.update({
      id,
      content,
      rank
    });
  }

  deleteCell(id: string) {
    if (this.id == null) return;
    zero.mutate.cell.delete({ id });
  }
}
