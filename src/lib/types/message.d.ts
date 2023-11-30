export interface MessageToWorker<T = void> {
  type: 'runPythonAsync' | 'loadPackagesFromImports' | "setInterruptBuffer" | "getVariables";
  payload?: T;
}

export interface MessageFromWorker<T = void> {
  type: 'pyodideLoaded' | 'loadPackagesFromImportsCompleted' | 'getVariablesCompleted' | 'runPythonAsyncCompleted' | 'stdout' | 'stderr' | 'pythonError' | 'returnValue' | 'drawDOMCanvas';
  payload?: T;
}