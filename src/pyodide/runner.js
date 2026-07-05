import { turtleAPI } from '../turtle/turtleGraphics.js';
import { pyodideWorkerScript } from './workerScript.js';

let pyodideWorker = null;
let consoleOutput = null;
let runBtn = null;

export function setRunButton(btnElement) {
  runBtn = btnElement;
}

export function setConsoleOutput(consoleElement) {
  consoleOutput = consoleElement;
}

export function initPyodideWorker() {
  if (!consoleOutput) {
    console.error("Call setConsoleOutput before initializing the worker.");
    return;
  }
  if (pyodideWorker) {
    pyodideWorker.terminate();
  }

  consoleOutput.textContent += 'Initializing Python Worker environment...\n';
  if (runBtn) runBtn.disabled = true;

  const blob = new Blob([pyodideWorkerScript], { type: 'application/javascript' });
  pyodideWorker = new Worker(URL.createObjectURL(blob));

  pyodideWorker.onmessage = function(e) {
    const data = e.data;
    if (data.type === 'ready') {
      consoleOutput.textContent += 'Python environment ready! (Web Worker)\n';
      if (runBtn) runBtn.disabled = false;
    } else if (data.type === 'stdout') {
      consoleOutput.textContent += data.text + '\n';
      consoleOutput.scrollTop = consoleOutput.scrollHeight;
    } else if (data.type === 'stderr') {
      consoleOutput.textContent += 'Error: ' + data.text + '\n';
      consoleOutput.scrollTop = consoleOutput.scrollHeight;
    } else if (data.type === 'turtle') {
      let res = null;
      if (turtleAPI && turtleAPI[data.cmd]) {
        res = turtleAPI[data.cmd](data.arg);
      }
      pyodideWorker.postMessage({ type: 'turtle_response', res: res });
    } else if (data.type === 'input_request') {
      const resp = prompt(data.text);
      pyodideWorker.postMessage({ type: 'input_response', text: resp !== null ? resp : "" });
    } else if (data.type === 'done') {
      consoleOutput.textContent += '\n>>> Finished.\n';
      consoleOutput.scrollTop = consoleOutput.scrollHeight;
      if (runBtn) {
        runBtn.disabled = false;
        runBtn.textContent = '▶ Run';
      }
    }
  };

  pyodideWorker.postMessage({ type: 'init' });
}

export function runPythonCode(code) {
  if (!pyodideWorker) {
    alert('Python environment is still loading. Please wait.');
    return;
  }

  if (runBtn) {
    if (runBtn.disabled) return;
    runBtn.disabled = true;
    runBtn.textContent = '⏳ Running...';
  }

  turtleAPI.reset();
  consoleOutput.textContent = '';

  if (!code || !code.trim()) {
    consoleOutput.textContent = '>>> No code to run.\n';
    if (runBtn) {
      runBtn.disabled = false;
      runBtn.textContent = '▶ Run';
    }
    return;
  }

  // the turtle/input/time.sleep bridges use await, so user-defined functions
  // need to be async too. blockly's procedure blocks generate plain 'def'.
  code = code.replace(/^(\s*)def /gm, '$1async def ');

  if (code.includes('import turtle')) {
    document.getElementById('tab-turtle')?.click();
  } else {
    document.getElementById('tab-console')?.click();
  }

  consoleOutput.textContent += '>>> Running...\n';
  pyodideWorker.postMessage({ type: 'run', code: code });
}
