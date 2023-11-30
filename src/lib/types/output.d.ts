type ExecutionState = 'ready' | 'queued' | 'running' | 'completed';

interface OutputValue<T> {
  type: 'stdout' | 'stderr' | 'pythonError' | 'returnValue' | 'drawDOMCanvas';
  format: 'string' | 'html' | 'latex' | 'canvas';
  value: T;
}

interface ReturnValue {
  format: 'string' | 'html' | 'latex';
  value: string;
}

interface DrawCanvasValue {
  pixels: Uint8Array;
  height: number;
  width: number;
}

export type { ExecutionState, OutputValue, ReturnValue, DrawCanvasValue }