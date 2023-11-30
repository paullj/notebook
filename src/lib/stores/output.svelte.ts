import type { OutputValue, ExecutionState } from "$lib/types/output";

class Output {
  private _id: string;
  private _values: OutputValue<unknown>[] = $state([]);
  private _executionState: ExecutionState = $state('ready');
  private _executionIndex: number | null = $state(null);
  private _excutionStartTime = $state(0);
  private _excutionEndTime = $state(0);

  public excecutionDuration = $derived(this._excutionEndTime - this._excutionStartTime > 0 ? this._excutionEndTime - this._excutionStartTime : null);

  constructor(id: string) {
    this._id = id
  }

  get id() { return this._id; }
  get values() { return this._values; }
  get executionState() { return this._executionState; }
  get executionIndex() { return this._executionIndex; }

  public queued(index: number) {
    this._executionState = 'queued';
    this._executionIndex = index;
  }

  public start() {
    if (this._executionIndex === null) {
      console.error(`Execution index is not set`);
      return;
    }
    if (this._executionState === 'running') {
      console.error(`Execution is already running`);
      return;
    }
    this._executionState = 'running';
    this._excutionStartTime = Date.now();
  }

  public complete() {
    if (this._executionState === 'completed') {
      console.error(`Execution is already completed`);
      return;
    }
    if (this._executionState !== 'running') {
      console.error(`Execution is not running`);
      return;
    }
    this._executionState = 'completed';
    this._excutionEndTime = Date.now();
  }
  public reset() {
    this.clear();
    this._executionState = 'ready';
  }
  public clear() {
    this._values = []
  }
  public addValue(value: OutputValue<unknown>) {
    this._values = [...this._values, value];
  }
}

export { Output }