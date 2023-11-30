import type { MessageToWorker, MessageFromWorker } from '$lib/types/message';
import type { DrawCanvasValue, OutputValue, ReturnValue } from '$lib/types/output';

interface ExecutionChunk {
  index: number;
  code: string;
}

class PydodideService {
  private _worker?: Worker;
  private _isLoaded = $state(false);
  private _executionCount = 0;
  private _processingQueue = false;
  private _executionQueue: ExecutionChunk[] = []
  private _interruptBuffer = new Uint8Array(new SharedArrayBuffer(1));
  private _outputCount = 0;
  public onOutput?: (output: OutputValue<unknown>) => void;
  public onExecutionStart?: (index: number) => boolean;
  public onExecutionCompleted?: (index: number, outputCount: number) => void;

  private onLoadPackagesFromImportsCompleted?: () => void;
  private onPythonAsyncCompleted?: () => void;

  get isLoaded() { return this._isLoaded; }

  private handleWorkerMessage({ data }: MessageEvent<MessageFromWorker<unknown>>) {
    const { type, payload } = data;

    switch (type) {
      case 'pyodideLoaded':
        this._isLoaded = true
        this.setInterruptBuffer();
        break;
      case 'loadPackagesFromImportsCompleted':
        this.onLoadPackagesFromImportsCompleted?.();
        break;
      case 'runPythonAsyncCompleted':
        this.onPythonAsyncCompleted?.();
        break;
      case 'stdout':
      case 'stderr':
      case 'pythonError':
      case 'returnValue':
      case 'drawDOMCanvas':
        this.handleOutputMessage({ type, payload });
        break;
    }
  }

  public addWorker(pyodideWorker: Worker) {
    this._worker = pyodideWorker;
    this._worker.onmessage = this.handleWorkerMessage.bind(this);
  }

  public addToExecutionQueue(code: string): number {
    this._executionCount += 1;
    this._executionQueue.push({ index: this._executionCount, code });
    setTimeout(this.processExecutionQueue.bind(this));
    return this._executionCount;
  }

  private async processExecutionQueue() {
    if (this._processingQueue) return;
    this._processingQueue = true;
    while (this._executionQueue.length > 0) {
      const chunk = this._executionQueue.shift();
      if (chunk === undefined) continue;
      const { index, code } = chunk;
      if (this.onExecutionStart !== undefined) {
        if (!this.onExecutionStart(index)) {
          // skip this code chunk
          continue;
        }
        this._outputCount = 0;
      }
      await this.loadPackagesFromImports(code);
      await this.runPythonAsync(code);
      this.onExecutionCompleted?.(index, this._outputCount);
      this._outputCount = 0;
    }
    this._processingQueue = false;
  }

  private async runPythonAsync(code: string) {
    if (this._worker !== undefined) {
      this._worker.postMessage({
        type: 'runPythonAsync',
        payload: code
      } satisfies MessageToWorker<string>);
    } else {
      console.error("Pyodide worker not found");
    }
    await new Promise<void>(resolve => {
      this.onPythonAsyncCompleted = resolve;
    });
  }

  private async loadPackagesFromImports(code: string) {
    const message: MessageToWorker<string> = {
      type: 'loadPackagesFromImports',
      payload: code
    }
    this._worker?.postMessage(message);
    await new Promise<void>(resolve => {
      this.onLoadPackagesFromImportsCompleted = resolve;
    });
  }

  private handleOutputMessage({ type, payload }: MessageFromWorker<unknown>) {
    console.log({ type, payload })
    switch (type) {
      case 'stdout':
      case 'stderr':
      case 'pythonError':
        this.onOutput?.({
          type,
          format: 'string',
          value: payload as string
        });
        break;
      case 'returnValue':
        this.onOutput?.({ type, ...payload as ReturnValue });
        break;
      case 'drawDOMCanvas':
        this.onOutput?.({
          type,
          format: 'canvas',
          value: payload as DrawCanvasValue
        });
        break;
    }
    this._outputCount += 1;
  }

  private async setInterruptBuffer() {
    if (!crossOriginIsolated) {
      console.warn("The page is not cross-origin isolated, which means the Pyodide worker will not be able to load packages from CDN. Please consider deploying your app on a cross-origin isolated page.")
    }
    const message: MessageToWorker<Uint8Array> = {
      type: 'setInterruptBuffer',
      payload: this._interruptBuffer
    }
    this._worker?.postMessage(message);
  }
}

const pydodideService = new PydodideService();

export default pydodideService;