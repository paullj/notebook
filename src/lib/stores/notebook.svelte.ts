import { Cell } from "./cell.svelte";
import { room } from "./room.svelte";
import type { CellType } from "$lib/types/cell";
import { Output } from "./output.svelte";
import pydodideService from "./pyodide.svelte";

interface SyncedCell {
  index: number;
  type: CellType;
};

class Notebook {
  private _cells: Cell[] = $state([]);
  private _outputs: Record<string, Output> = $derived(this._cells.reduce(
    (acc, cell) => ({ ...acc, [cell.id]: new Output(cell.id) }), {})
  );
  private _cellMap = room.document.getMap<SyncedCell>("cell-map");

  get cells() { return this._cells; }
  get outputs() { return this._outputs; }

  constructor() {
    this._cellMap.observe(() => {
      this._cells = [...this._cellMap.entries()]
        .sort((a, b) => a[1].index - b[1].index)
        .map(([id, { type }]) => this.getCell(id) || new Cell({ id, type: <CellType>type }));
    });

    pydodideService.onExecutionStart = (index) => {
      const output = Object.values(this._outputs).find((output) => output.executionIndex === index);
      if (output === undefined) {
        console.error(`Cell output not found`);
        return false;
      }
      output.start()
      let firstOutput = true;
      pydodideService.onOutput = (value) => {
        if (firstOutput) {
          firstOutput = false;
          output.clear();
        }
        output.addValue(value);
      };
      return true;
    }

    pydodideService.onExecutionCompleted = (index, outputCount) => {
      const output = Object.values(this._outputs).find((output) => output.executionIndex === index);
      if (output === undefined) {
        console.error(`Cell output not found`);
      } else {
        if (outputCount === 0) {
          output.clear();
        }
        delete pydodideService.onOutput;
        output.complete();
      }
    }
  }


  public addCell(type: CellType = 'python') {
    const newCell = new Cell({
      type,
    });
    this._cells = [...this._cells, newCell];
    this._cellMap.set(newCell.id, { type, index: this._cells.indexOf(newCell) });
  }

  public removeCell(id: string) {
    this._cells = this._cells.filter((cell) => cell.id !== id);
    this._cellMap.delete(id);
  }

  public getCell(id: string) {
    return this._cells.find((cell) => cell.id === id);
  }

  public getOutput(id: string) {
    if (id in this._outputs)
      return this._outputs[id];
    else
      return null
  }

  public executeCell(id: string) {
    const cell = this.getCell(id);
    if (cell === undefined) {
      console.error(`Cell not found`);
      return;
    }
    const output = this.getOutput(id)
    if (output === null) {
      console.error(`Cell output not found`);
      return;
    }

    if (['ready', 'completed'].includes(output.executionState)) {
      if (cell.content.trim().length === 0) {
        output.clear();
      } else {
        const index = pydodideService.addToExecutionQueue(cell.content)
        output.queued(index);
      }
    }
  }
}

const notebook = new Notebook();

export { notebook, Notebook };