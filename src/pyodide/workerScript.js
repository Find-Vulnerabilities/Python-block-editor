export const pyodideWorkerScript = `
importScripts("https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js");

let pyodide = null;
let resolveInput = null;
let resolveTurtle = null;
let turtleSpeedDelay = 15;

self.onmessage = async function(e) {
  const data = e.data;
  if (data.type === 'init') {
    try {
      pyodide = await loadPyodide();
      await pyodide.runPythonAsync(\`
import builtins
import js
import sys
import time
import asyncio
from types import ModuleType

async def async_input(prompt_text=""):
    return await js.request_input_from_main(prompt_text)
builtins.input = async_input

async def async_sleep(secs):
    await asyncio.sleep(secs)
time.sleep = async_sleep

# build a fake turtle module that bridges to the canvas
turtle_mod = ModuleType("turtle")

async def _forward(d): await js.request_turtle('forward', d)
async def _backward(d): await js.request_turtle('backward', d)
async def _right(a): await js.request_turtle('right', a)
async def _left(a): await js.request_turtle('left', a)
async def _penup(): await js.request_turtle('penup', None)
async def _pendown(): await js.request_turtle('pendown', None)
async def _reset(): await js.request_turtle('reset', None)
async def _home(): await js.request_turtle('home', None)
async def _color(c): await js.request_turtle('color', c)
async def _pensize(s): await js.request_turtle('pensize', s)
async def _goto(x, y): await js.request_turtle('goto', [x, y])
async def _circle(r): await js.request_turtle('circle', r)
async def _clear(): await js.request_turtle('clear', None)
async def _pos(): return await js.request_turtle('pos', None)
async def _xcor(): return (await _pos())[0]
async def _ycor(): return (await _pos())[1]
async def _speed(s): await js.request_turtle('speed', s)
async def _begin_fill(): await js.request_turtle('begin_fill', None)
async def _end_fill(): await js.request_turtle('end_fill', None)
async def _fillcolor(c): await js.request_turtle('fillcolor', c)
async def _write(t): await js.request_turtle('write', t)
async def _stamp(): await js.request_turtle('stamp', None)
async def _setheading(a): await js.request_turtle('setheading', a)
async def _heading(): return await js.request_turtle('heading', None)

turtle_mod.forward = _forward
turtle_mod.fd = _forward
turtle_mod.backward = _backward
turtle_mod.bk = _backward
turtle_mod.back = _backward
turtle_mod.right = _right
turtle_mod.rt = _right
turtle_mod.left = _left
turtle_mod.lt = _left
turtle_mod.penup = _penup
turtle_mod.pu = _penup
turtle_mod.up = _penup
turtle_mod.pendown = _pendown
turtle_mod.pd = _pendown
turtle_mod.down = _pendown
turtle_mod.reset = _reset
turtle_mod.home = _home
turtle_mod.color = _color
turtle_mod.pensize = _pensize
turtle_mod.width = _pensize
turtle_mod.goto = _goto
turtle_mod.setpos = _goto
turtle_mod.setposition = _goto
turtle_mod.circle = _circle
turtle_mod.clear = _clear
turtle_mod.pos = _pos
turtle_mod.position = _pos
turtle_mod.xcor = _xcor
turtle_mod.ycor = _ycor
turtle_mod.speed = _speed
turtle_mod.begin_fill = _begin_fill
turtle_mod.end_fill = _end_fill
turtle_mod.fillcolor = _fillcolor
turtle_mod.write = _write
turtle_mod.stamp = _stamp
turtle_mod.setheading = _setheading
turtle_mod.seth = _setheading
turtle_mod.heading = _heading

sys.modules["turtle"] = turtle_mod
      \`);
      pyodide.setStdout({ batched: (str) => postMessage({ type: 'stdout', text: str }) });
      pyodide.setStderr({ batched: (str) => postMessage({ type: 'stderr', text: str }) });
      postMessage({ type: 'ready' });
    } catch (err) {
      postMessage({ type: 'stderr', text: String(err) });
    }
  } else if (data.type === 'run') {
    try {
      await pyodide.loadPackagesFromImports(data.code);
      await pyodide.runPythonAsync(data.code);
      postMessage({ type: 'done' });
    } catch (err) {
      postMessage({ type: 'stderr', text: err.toString() });
      postMessage({ type: 'done' });
    }
  } else if (data.type === 'input_response') {
    if (resolveInput) {
      resolveInput(data.text);
      resolveInput = null;
    }
  } else if (data.type === 'turtle_response') {
    if (resolveTurtle) {
      const fn = resolveTurtle;
      resolveTurtle = null;
      if (turtleSpeedDelay > 0) {
        setTimeout(() => fn(data.res), turtleSpeedDelay);
      } else {
        fn(data.res);
      }
    }
  }
};

self.request_input_from_main = function(prompt_text) {
  return new Promise((resolve) => {
    resolveInput = resolve;
    self.postMessage({ type: 'input_request', text: prompt_text });
  });
};

self.request_turtle = function(cmd, arg) {
  if (cmd === 'speed') {
    let s = Number(arg) || 5;
    if (s === 0) turtleSpeedDelay = 0;
    else turtleSpeedDelay = Math.max(5, 220 - (s * 20));
    return Promise.resolve();
  }
  return new Promise((resolve) => {
     resolveTurtle = resolve;
     self.postMessage({ type: 'turtle', cmd: cmd, arg: arg });
  });
};
`;
