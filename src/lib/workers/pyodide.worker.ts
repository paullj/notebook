import type { MessageFromWorker, MessageToWorker } from '$lib/types/message';
import type { PyodideInterface } from '$lib/types/pyodide';

let pyodide: PyodideInterface | undefined;

const applyMatplotlibPatch = (pyodide: PyodideInterface) => {
  console.debug("Applying patch for matplotlib")
  try {
    pyodide.runPython(`
import matplotlib
import matplotlib.pyplot as plt
from js import drawDOMCanvas

matplotlib.use('AGG')

def show():
    canvas = plt.gcf().canvas
    canvas.draw()
    width, height = canvas.get_width_height()
    pixels = canvas.buffer_rgba().tobytes()
    drawDOMCanvas(pixels, height, width)
    matplotlib.pyplot.clf()

matplotlib.pyplot.show = show
                `)
  } catch (e: unknown) {
    console.error(`Patching has failed with error: ${e}`)
  }
}

const parsePythonError = (output: string) => {
  const position = output.search('File "<exec>",');
  if (position < 0) return output;
  return output.slice(position);
}

const loadedKeyword = 'Loaded';
const getLoadedLibraries = (loadedMessage: string) => {
  if (!loadedMessage.startsWith(loadedKeyword)) return [];
  const librariesStr = loadedMessage.substring(loadedKeyword.length);
  const libraries = librariesStr.split(',').map(libraryStr => libraryStr.trim());
  return libraries;
}

async function loadPyodideModule() {
  // @ts-expect-error importing a js library from the web
  await import("https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js");
}

const stdin = () => {
  console.warn("stdin is not implemented yet")
  return "";
}

const stdout = (data: string) => {
  postMessage({
    type: 'stdout',
    payload: data
  } satisfies MessageFromWorker<string>);
}

const stderr = (data: string) => {
  postMessage({
    type: 'stderr',
    payload: data
  } satisfies MessageFromWorker<string>);
}

const handleMessage = (messageEvent: MessageEvent<MessageToWorker<unknown>>) => {
  if (pyodide == undefined) {
    console.error("Pyodide is not loaded yet")
    return;
  }

  const { type, payload } = messageEvent.data;

  switch (type) {
    case 'runPythonAsync':
      handleRunPythonAsync(pyodide, payload as string);
      break;
    case 'setInterruptBuffer':
      pyodide.setInterruptBuffer(payload as Uint8Array);
      break;
    case 'getVariables':
      console.error("getVariables is not implemented yet")
      break;
    case 'loadPackagesFromImports':
      handleLoadPackagesFromImports(pyodide, payload as string);
      break;
  }
}

async function handleRunPythonAsync(pyodide: PyodideInterface, code: string) {
  try {
    let returnValue = await pyodide.runPythonAsync(code);

    if (returnValue !== undefined) {
      let format = "string";

      if (returnValue instanceof pyodide.ffi.PyProxy) {
        if (returnValue._repr_html_ !== undefined) {
          returnValue = returnValue._repr_html_();
          format = "html";
        } else if (returnValue._repr_latex_ !== undefined) {
          returnValue = returnValue._repr_latex_();
          format = "latex";
        } else {
          returnValue = returnValue.__str__();
          format = "string"
        }
      }
      postMessage({
        type: 'returnValue',
        payload: {
          value: returnValue,
          format
        }
      } satisfies MessageFromWorker<{ value: string, format: string }>);
    }
  } catch (error: any) {
    if (error.message !== undefined) {
      postMessage({
        type: 'pythonError',
        payload: parsePythonError(error.message)
      } satisfies MessageFromWorker<string>);
    }
  }
  postMessage({
    type: 'runPythonAsyncCompleted'
  } satisfies MessageFromWorker);
}

async function handleLoadPackagesFromImports(pyodide: PyodideInterface, code: string) {
  let libraries: string[] = []
  await pyodide.loadPackagesFromImports(code, {
    messageCallback: (message) => {
      libraries = getLoadedLibraries(message);
      if (libraries.includes("matplotlib")) {
        applyMatplotlibPatch(pyodide);
      }
    }
  });
  postMessage({
    type: 'loadPackagesFromImportsCompleted',
    payload: libraries
  } satisfies MessageFromWorker<string[]>);
}

async function main() {
  await loadPyodideModule();

  // @ts-expect-error importing a js library from the web
  pyodide = await loadPyodide({
    stdout,
    stderr,
    stdin
  })

  if (pyodide == undefined)
    return;

  const version = pyodide.version;


  const environment = pyodide.runPython(`
        import sys
        sys.version
    `);
  console.log(`Pyodide ${version} running Python ${environment}`);

  postMessage({
    type: 'pyodideLoaded'
  } satisfies MessageFromWorker);

}

onmessage = handleMessage;
main();
