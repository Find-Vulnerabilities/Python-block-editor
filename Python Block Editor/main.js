import * as Blockly from 'blockly';
import 'blockly/blocks';
import * as En from 'blockly/msg/en';
import { pythonGenerator } from 'blockly/python';

// Set language to English
Blockly.setLocale(En);

// Define Toolbox with Default Blocks and our Custom Module Blocks
const toolbox = {
  "kind": "categoryToolbox",
  "contents": [
    {
      "kind": "category",
      "name": "Logic",
      "colour": "%{BKY_LOGIC_HUE}",
      "contents": [
        { "kind": "block", "type": "controls_if" },
        { "kind": "block", "type": "logic_compare" },
        { "kind": "block", "type": "logic_operation" },
        { "kind": "block", "type": "logic_boolean" },
        { "kind": "block", "type": "logic_negate" }
      ]
    },
    {
      "kind": "category",
      "name": "Loops",
      "colour": "%{BKY_LOOPS_HUE}",
      "contents": [
        { "kind": "block", "type": "controls_repeat_ext" },
        { "kind": "block", "type": "controls_whileUntil" },
        { "kind": "block", "type": "controls_for" }
      ]
    },
    {
      "kind": "category",
      "name": "Math",
      "colour": "%{BKY_MATH_HUE}",
      "contents": [
        { "kind": "block", "type": "math_number" },
        { "kind": "block", "type": "math_arithmetic" },
        { "kind": "block", "type": "math_single" }
      ]
    },
    {
      "kind": "category",
      "name": "Text",
      "colour": "%{BKY_TEXTS_HUE}",
      "contents": [
        { "kind": "block", "type": "text" },
        { "kind": "block", "type": "text_print" },
        { 
          "kind": "block", 
          "type": "python_input", 
          "inputs": { "PROMPT": { "shadow": { "type": "text", "fields": { "TEXT": "Please enter a value:" } } } } 
        },
        {
          "kind": "block",
          "type": "text_prompt_ext",
          "inputs": {
            "TEXT": {
              "shadow": {
                "type": "text",
                "fields": { "TEXT": "Please enter a value:" }
              }
            }
          }
        }
      ]
    },
    {
      "kind": "category",
      "name": "Type Casting",
      "colour": 160,
      "contents": [
        { "kind": "block", "type": "type_cast" }
      ]
    },
    {
      "kind": "category",
      "name": "Lists & Dicts (Arrays)",
      "colour": "%{BKY_LISTS_HUE}",
      "contents": [
        { "kind": "block", "type": "lists_create_with" },
        { "kind": "block", "type": "lists_repeat" },
        { "kind": "block", "type": "lists_length" },
        { "kind": "block", "type": "lists_isEmpty" },
        { "kind": "block", "type": "lists_indexOf" },
        { "kind": "block", "type": "lists_getIndex" },
        { "kind": "block", "type": "lists_setIndex" }
      ]
    },
    {
      "kind": "category",
      "name": "Variables",
      "colour": "%{BKY_VARIABLES_HUE}",
      "custom": "VARIABLE"
    },
    {
      "kind": "category",
      "name": "Functions",
      "colour": "%{BKY_PROCEDURES_HUE}",
      "custom": "PROCEDURE"
    },
    {
      "kind": "category",
      "name": "Turtle Graphics",
      "colour": 160,
      "contents": [
        { "kind": "block", "type": "turtle_import" },
        { "kind": "block", "type": "turtle_forward" },
        { "kind": "block", "type": "turtle_backward" },
        { "kind": "block", "type": "turtle_right" },
        { "kind": "block", "type": "turtle_left" },
        { "kind": "block", "type": "turtle_penup" },
        { "kind": "block", "type": "turtle_pendown" }
      ]
    },
    {
      "kind": "category",
      "name": "Dictionaries",
      "colour": 330,
      "contents": [
        { "kind": "block", "type": "dict_create_empty" },
        { "kind": "block", "type": "dict_get" },
        { "kind": "block", "type": "dict_set" }
      ]
    },
    {
      "kind": "category",
      "name": "OOP (Classes)",
      "colour": 290,
      "contents": [
        { "kind": "block", "type": "class_def" },
        { "kind": "block", "type": "class_instantiate" },
        { "kind": "block", "type": "object_attr_get" },
        { "kind": "block", "type": "object_attr_set" }
      ]
    },
    {
      "kind": "category",
      "name": "Exceptions",
      "colour": 120,
      "contents": [
        { "kind": "block", "type": "try_except_var" }
      ]
    },
    {
      "kind": "category",
      "name": "Advanced/Raw Code",
      "colour": 0,
      "contents": [
        { "kind": "block", "type": "raw_python" },
        { "kind": "block", "type": "raw_python_stmt" }
      ]
    },
    {
      "kind": "category",
      "name": "External Modules",
      "colour": 230,
      "contents": [
        { "kind": "block", "type": "import_module", "fields": { "MODULE_NAME": "math" } },
        { "kind": "block", "type": "import_module", "fields": { "MODULE_NAME": "random" } },
        { "kind": "block", "type": "import_module", "fields": { "MODULE_NAME": "time" } },
        { "kind": "block", "type": "import_module", "fields": { "MODULE_NAME": "datetime" } },
        { "kind": "block", "type": "import_module", "fields": { "MODULE_NAME": "json" } },
        { "kind": "block", "type": "call_module_function_args" },
        { "kind": "block", "type": "call_module_function_args_stmt" },
        { "kind": "block", "type": "time_sleep" },
        { "kind": "block", "type": "random_randint" }
      ]
    }
  ]
};

// Define Custom Blocks for External Modules support
Blockly.Blocks['import_module'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("import")
        .appendField(new Blockly.FieldTextInput("math"), "MODULE_NAME");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip("Import an external Python module");
  }
};

Blockly.Blocks['call_module_function_args'] = {
  init: function() {
    this.appendValueInput("ARGS")
        .appendField("call function")
        .appendField(new Blockly.FieldTextInput("math.sqrt"), "FUNC_NAME")
        .appendField("with arg(s)");
    this.setOutput(true, null);
    this.setColour(230);
    this.setTooltip("Call a function with an argument");
  }
};

Blockly.Blocks['call_module_function_args_stmt'] = {
  init: function() {
    this.appendValueInput("ARGS")
        .appendField("call stmt")
        .appendField(new Blockly.FieldTextInput("print"), "FUNC_NAME")
        .appendField("with arg(s)");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip("Call a function as a statement (ignores return value) and connects to other blocks from above and below");
  }
};

Blockly.Blocks['raw_python'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("raw code (value):")
        .appendField(new Blockly.FieldTextInput("{'key': 'value'}"), "CODE");
    this.setOutput(true, null);
    this.setColour(0);
    this.setTooltip("Enter raw inline Python code (e.g. for dictionaries)");
  }
};

Blockly.Blocks['raw_python_stmt'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("raw code (stmt):")
        .appendField(new Blockly.FieldTextInput("try:\n  pass\nexcept Exception as e:\n  print(e)"), "CODE");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(0);
    this.setTooltip("Enter raw Python statement (e.g. for try-except)");
  }
};

Blockly.Blocks['time_sleep'] = {
  init: function() {
    this.appendDummyInput().appendField("sleep (seconds)");
    this.appendValueInput("TIME").setCheck("Number");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip("Pause execution for a specific number of seconds");
  }
};

Blockly.Blocks['random_randint'] = {
  init: function() {
    this.appendDummyInput().appendField("random int between");
    this.appendValueInput("MIN").setCheck("Number");
    this.appendDummyInput().appendField("and");
    this.appendValueInput("MAX").setCheck("Number");
    this.setOutput(true, "Number");
    this.setColour(230);
    this.setTooltip("Get a random integer between two numbers");
  }
};

Blockly.Blocks['dict_create_empty'] = {
  init: function() {
    this.appendDummyInput().appendField("empty dictionary {}");
    this.setOutput(true, null);
    this.setColour(330);
    this.setTooltip("Create an empty dictionary");
  }
};

Blockly.Blocks['dict_get'] = {
  init: function() {
    this.appendValueInput("DICT").setCheck(null).appendField("get from dict");
    this.appendValueInput("KEY").setCheck(null).appendField("key");
    this.setOutput(true, null);
    this.setColour(330);
    this.setTooltip("Get a value from a dictionary by key");
  }
};

Blockly.Blocks['dict_set'] = {
  init: function() {
    this.appendValueInput("DICT").setCheck(null).appendField("in dict");
    this.appendValueInput("KEY").setCheck(null).appendField("set key");
    this.appendValueInput("VALUE").setCheck(null).appendField("to");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(330);
    this.setTooltip("Set a value in a dictionary");
  }
};

Blockly.Blocks['class_def'] = {
  init: function() {
    this.appendDummyInput().appendField("class").appendField(new Blockly.FieldTextInput("MyClass"), "CLASS_NAME");
    this.appendStatementInput("BODY").setCheck(null);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(290);
    this.setTooltip("Define a new Python class");
  }
};

Blockly.Blocks['class_instantiate'] = {
  init: function() {
    this.appendDummyInput().appendField("new").appendField(new Blockly.FieldTextInput("MyClass"), "CLASS_NAME");
    this.setOutput(true, null);
    this.setColour(290);
    this.setTooltip("Instantiate a class (create an object)");
  }
};

Blockly.Blocks['object_attr_get'] = {
  init: function() {
    this.appendValueInput("OBJ").setCheck(null).appendField("get attr/method");
    this.appendDummyInput().appendField(".").appendField(new Blockly.FieldTextInput("name"), "ATTR");
    this.setOutput(true, null);
    this.setColour(290);
    this.setTooltip("Get an attribute or call a parameterless method of an object");
  }
};

Blockly.Blocks['object_attr_set'] = {
  init: function() {
    this.appendValueInput("OBJ").setCheck(null).appendField("set attr");
    this.appendDummyInput().appendField(".").appendField(new Blockly.FieldTextInput("name"), "ATTR");
    this.appendValueInput("VAL").setCheck(null).appendField("to");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(290);
    this.setTooltip("Set an attribute of an object");
  }
};

Blockly.Blocks['try_except_var'] = {
  init: function() {
    this.appendDummyInput().appendField("try");
    this.appendStatementInput("TRY").setCheck(null);
    this.appendDummyInput().appendField("except Exception as").appendField(new Blockly.FieldTextInput("e"), "VAR");
    this.appendStatementInput("EXCEPT").setCheck(null);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(120);
    this.setTooltip("Try block to catch exceptions with an error variable");
  }
};

Blockly.Blocks['type_cast'] = {
  init: function() {
    this.appendValueInput("VAL").setCheck(null).appendField("convert");
    this.appendDummyInput().appendField("to").appendField(new Blockly.FieldDropdown([["int", "int"], ["float", "float"], ["str", "str"]]), "TYPE");
    this.setOutput(true, null);
    this.setColour(160);
    this.setTooltip("Convert a value to int, float, or str");
  }
};

Blockly.Blocks['python_input'] = {
  init: function() {
    this.appendValueInput("PROMPT")
        .setCheck(null)
        .appendField("input()");
    this.setOutput(true, "String");
    this.setColour(160);
    this.setTooltip("Popup a browser prompt to get user input text");
  }
};

// Python generation logic for custom blocks
pythonGenerator.forBlock['import_module'] = function(block) {
  const moduleName = block.getFieldValue('MODULE_NAME');
  return 'import ' + moduleName + '\n';
};

pythonGenerator.forBlock['call_module_function_args'] = function(block, generator) {
  const funcName = block.getFieldValue('FUNC_NAME');
  let args = generator.valueToCode(block, 'ARGS', generator.ORDER_NONE) || '';
  
  // 如果使用者接的是 List 方塊 (會產出如 "[1, 2]")，我們自動去掉中括號變成 "1, 2"
  // 這樣就能支援多個參數傳入了！例如 math.pow(16, 2)
  if (args.startsWith('[') && args.endsWith(']')) {
    args = args.slice(1, -1);
  }
  
  const code = `${funcName}(${args})`;
  return [code, generator.ORDER_FUNCTION_CALL];
};

pythonGenerator.forBlock['call_module_function_args_stmt'] = function(block, generator) {
  const funcName = block.getFieldValue('FUNC_NAME');
  let args = generator.valueToCode(block, 'ARGS', generator.ORDER_NONE) || '';
  
  if (args.startsWith('[') && args.endsWith(']')) {
    args = args.slice(1, -1);
  }
  
  return `${funcName}(${args})\n`;
};

pythonGenerator.forBlock['raw_python'] = function(block, generator) {
  return [block.getFieldValue('CODE'), generator.ORDER_ATOMIC];
};

pythonGenerator.forBlock['raw_python_stmt'] = function(block, generator) {
  return block.getFieldValue('CODE') + '\n';
};

pythonGenerator.forBlock['time_sleep'] = function(block, generator) {
  pythonGenerator.definitions_['import_time'] = 'import time\nimport asyncio';
  const time = generator.valueToCode(block, 'TIME', generator.ORDER_NONE) || '1';
  // Use await asyncio.sleep in Pyodide to not freeze the browser
  return `await asyncio.sleep(${time})\n`;
};

pythonGenerator.forBlock['random_randint'] = function(block, generator) {
  pythonGenerator.definitions_['import_random'] = 'import random';
  const min = generator.valueToCode(block, 'MIN', generator.ORDER_NONE) || '1';
  const max = generator.valueToCode(block, 'MAX', generator.ORDER_NONE) || '10';
  return [`random.randint(${min}, ${max})`, generator.ORDER_FUNCTION_CALL];
};

pythonGenerator.forBlock['dict_create_empty'] = function(block, generator) {
  return ['{}', generator.ORDER_ATOMIC];
};

pythonGenerator.forBlock['dict_get'] = function(block, generator) {
  const dict = generator.valueToCode(block, 'DICT', generator.ORDER_MEMBER) || '{}';
  const key = generator.valueToCode(block, 'KEY', generator.ORDER_NONE) || '""';
  return [`${dict}[${key}]`, generator.ORDER_MEMBER];
};

pythonGenerator.forBlock['dict_set'] = function(block, generator) {
  const dict = generator.valueToCode(block, 'DICT', generator.ORDER_MEMBER) || '{}';
  const key = generator.valueToCode(block, 'KEY', generator.ORDER_NONE) || '""';
  const value = generator.valueToCode(block, 'VALUE', generator.ORDER_NONE) || 'None';
  return `${dict}[${key}] = ${value}\n`;
};

pythonGenerator.forBlock['class_def'] = function(block, generator) {
  const className = block.getFieldValue('CLASS_NAME');
  const body = generator.statementToCode(block, 'BODY') || '  pass\n';
  return `class ${className}:\n${body}`;
};

pythonGenerator.forBlock['class_instantiate'] = function(block, generator) {
  const className = block.getFieldValue('CLASS_NAME');
  return [`${className}()`, generator.ORDER_FUNCTION_CALL];
};

pythonGenerator.forBlock['object_attr_get'] = function(block, generator) {
  const obj = generator.valueToCode(block, 'OBJ', generator.ORDER_MEMBER) || 'obj';
  const attr = block.getFieldValue('ATTR');
  return [`${obj}.${attr}`, generator.ORDER_MEMBER];
};

pythonGenerator.forBlock['object_attr_set'] = function(block, generator) {
  const obj = generator.valueToCode(block, 'OBJ', generator.ORDER_MEMBER) || 'obj';
  const attr = block.getFieldValue('ATTR');
  const val = generator.valueToCode(block, 'VAL', generator.ORDER_NONE) || 'None';
  return `${obj}.${attr} = ${val}\n`;
};

pythonGenerator.forBlock['try_except_var'] = function(block, generator) {
  const tryBlock = generator.statementToCode(block, 'TRY') || '  pass\n';
  const exceptBlock = generator.statementToCode(block, 'EXCEPT') || '  pass\n';
  const varName = block.getFieldValue('VAR') || 'e';
  return `try:\n${tryBlock}except Exception as ${varName}:\n${exceptBlock}`;
};

pythonGenerator.forBlock['type_cast'] = function(block, generator) {
  const val = generator.valueToCode(block, 'VAL', generator.ORDER_NONE) || '0';
  const type = block.getFieldValue('TYPE');
  return [`${type}(${val})`, generator.ORDER_FUNCTION_CALL];
};

pythonGenerator.forBlock['python_input'] = function(block, generator) {
  const promptText = generator.valueToCode(block, 'PROMPT', generator.ORDER_NONE) || '""';
  return [`input(${promptText})`, generator.ORDER_FUNCTION_CALL];
};

// Inject Blockly Workspace
const workspace = Blockly.inject('blocklyDiv', {
  toolbox: toolbox,
  grid: { spacing: 20, length: 3, colour: '#ccc', snap: true }
});

// Ensure Blockly resizes correctly when the browser window is resized
window.addEventListener('resize', () => {
  Blockly.svgResize(workspace);
}, false);

// Load from LocalStorage on initialize if available
const savedState = localStorage.getItem('blocklyWorkspace');
if (savedState) {
  try {
    Blockly.serialization.workspaces.load(JSON.parse(savedState), workspace);
  } catch (err) {}
}

const codeDiv = document.getElementById('codeDiv');

// Live update generated Python code
function updateCode() {
  const code = pythonGenerator.workspaceToCode(workspace);
  codeDiv.textContent = code || '# Your Python code will appear here...';
  
  // Syntax Highlighting
  delete codeDiv.dataset.highlighted;
  if (window.hljs) hljs.highlightElement(codeDiv);
}


workspace.addChangeListener(updateCode);
workspace.addChangeListener((e) => {
  // Auto-save logic on every block change (ignore UI events like clicking)
  if (!e.isUiEvent) {
    const state = Blockly.serialization.workspaces.save(workspace);
    localStorage.setItem('blocklyWorkspace', JSON.stringify(state));
  }
});

// -------- Turtle JS API --------
window.turtleAPI = {
  reset: function() {
    const canvas = document.getElementById('turtle-canvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
    this.angle = -90; // Default pointing UP
    this.penDown = true;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
  },
  home: function() {
    const canvas = document.getElementById('turtle-canvas');
    if(!canvas) return;
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
    this.angle = -90;
    const ctx = canvas.getContext('2d');
    if(this.penDown) { ctx.lineTo(this.x, this.y); ctx.stroke(); }
    else { ctx.moveTo(this.x, this.y); }
  },
  forward: function(d) {
    const canvas = document.getElementById('turtle-canvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    const rad = this.angle * (Math.PI / 180);
    this.x += d * Math.cos(rad);
    this.y += d * Math.sin(rad);
    if(this.penDown) {
      ctx.lineTo(this.x, this.y);
      ctx.stroke();
    } else {
      ctx.moveTo(this.x, this.y);
    }
  },
  backward: function(d) { this.forward(-d); },
  right: function(a) { this.angle += a; },
  left: function(a) { this.angle -= a; },
  penup: function() { this.penDown = false; },
  pendown: function() { this.penDown = true; }
};
// initial config
window.addEventListener('load', () => { if(window.turtleAPI) window.turtleAPI.reset(); });

// Pyodide (Python WebAssembly execution) setup
const consoleOutput = document.getElementById('console-output');
let pyodideInstance = null;

async function initPyodide() {
  try {
    consoleOutput.textContent += 'Initializing Python environment...\n';
    // pyodide function loaded globally in index.html
    pyodideInstance = await loadPyodide({
      stdout: (text) => {
        consoleOutput.textContent += text + '\n';
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
      },
      stderr: (text) => {
        consoleOutput.textContent += 'Error: ' + text + '\n';
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
      }
    });

    // Patch input() & implement turtle graphic mock
    await pyodideInstance.runPythonAsync(`
import builtins
import js
import sys
from types import ModuleType

def browser_input(prompt_text=""):
    res = js.prompt(prompt_text)
    return res if res is not None else ""
builtins.input = browser_input

# Custom Turtle module for browser canvas
turtle_mod = ModuleType("turtle")
def _forward(d): js.turtleAPI.forward(d)
def _backward(d): js.turtleAPI.backward(d)
def _right(a): js.turtleAPI.right(a)
def _left(a): js.turtleAPI.left(a)
def _penup(): js.turtleAPI.penup()
def _pendown(): js.turtleAPI.pendown()
def _reset(): js.turtleAPI.reset()
def _home(): js.turtleAPI.home()
turtle_mod.forward = _forward
turtle_mod.fd = _forward
turtle_mod.backward = _backward
turtle_mod.bk = _backward
turtle_mod.right = _right
turtle_mod.rt = _right
turtle_mod.left = _left
turtle_mod.lt = _left
turtle_mod.penup = _penup
turtle_mod.pu = _penup
turtle_mod.pendown = _pendown
turtle_mod.pd = _pendown
turtle_mod.reset = _reset
turtle_mod.home = _home
sys.modules["turtle"] = turtle_mod
`);

    consoleOutput.textContent += 'Python environment ready! (Packages load automatically via import)\n';
  } catch(err) {
    consoleOutput.textContent = 'Failed to load Python environment: ' + err + '\n';
  }
}
initPyodide();

// Button Logic: Run Python in Browser
const runBtn = document.getElementById('btn-run');
runBtn.addEventListener('click', async () => {
  if (!pyodideInstance) {
    alert('Python environment is still loading. Please wait.');
    return;
  }
  
  if (runBtn.disabled) return;
  runBtn.disabled = true;
  const originalText = runBtn.textContent;
  runBtn.textContent = '⏳ Running...';
  
  if (window.turtleAPI) window.turtleAPI.reset(); // clear turtle canvas
  consoleOutput.textContent = ''; // clear output
  const code = pythonGenerator.workspaceToCode(workspace);
  
  if (!code.trim()) {
    consoleOutput.textContent = '>>> No code to run.\n';
    runBtn.disabled = false;
    runBtn.textContent = originalText;
    return;
  }

  // 自動智慧切換：如果程式碼裡有引入海龜，就自動把右下角切換到海龜畫布頁籤
  if (code.includes('import turtle')) {
    document.getElementById('tab-turtle').click();
  } else {
    document.getElementById('tab-console').click();
  }

  // Auto-load packages from import statements gracefully
  try {
    await pyodideInstance.loadPackagesFromImports(code);
  } catch(err) {
    console.warn('Package load check:', err);
  }

  consoleOutput.textContent += '>>> Running...\n';
  try {
    // 注入非同步暫停，防止無窮迴圈鎖死瀏覽器
    const safeCode = "import asyncio\n" + code.replace(/^(\s*)(while .*?:|for .*?:)\n/gm, "$1$2\n$1  await asyncio.sleep(0.001)\n");
    await pyodideInstance.runPythonAsync(safeCode);
  } catch(err) {
    consoleOutput.textContent += err;
  }
  consoleOutput.textContent += '\n>>> Finished.\n';
  consoleOutput.scrollTop = consoleOutput.scrollHeight;
  
  runBtn.disabled = false;
  runBtn.textContent = originalText;
});

// Button Logic: Clear console
document.getElementById('btn-clear-console').addEventListener('click', () => {
  consoleOutput.textContent = '';
});

// Button Logic: Clear workspace
document.getElementById('btn-clear-blocks').addEventListener('click', () => {
  if (confirm('Are you sure you want to clear all blocks? This cannot be undone.')) {
    workspace.clear();
  }
});

// Button Logic: Stop / Reset
document.getElementById('btn-stop').addEventListener('click', () => {
  if (confirm('Are you sure you want to stop the execution? (This will reload the page)')) {
    window.location.reload();
  }
});

// Button Logic: Export Python
document.getElementById('btn-export-py').addEventListener('click', () => {
  const code = pythonGenerator.workspaceToCode(workspace);
  const blob = new Blob([code], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'script.py';
  a.click();
  URL.revokeObjectURL(url);
});

// Button Logic: Save Workspace (Blocks) to JSON (For later import)
document.getElementById('btn-save-blocks').addEventListener('click', () => {
  const state = Blockly.serialization.workspaces.save(workspace);
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'workspace.json';
  a.click();
  URL.revokeObjectURL(url);
});

// Button Logic: Load Workspace (Blocks) from JSON
const fileInput = document.getElementById('file-input');
document.getElementById('btn-load-blocks').addEventListener('click', () => {
  fileInput.click();
});

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(event) {
    try {
      const state = JSON.parse(event.target.result);
      Blockly.serialization.workspaces.load(state, workspace);
    } catch (err) {
      alert("Failed to load blocks. Please ensure the file is a valid JSON workspace.");
    }
  };
  reader.readAsText(file);
  fileInput.value = ''; // Reset input
});

// Built-in Examples Logic
const examples = {
  hello: {
    "blocks": { "blocks": [ { "type": "text_print", "x": 50, "y": 50, "inputs": { "TEXT": { "shadow": { "type": "text", "fields": { "TEXT": "Hello, World!" } } } } } ] }
  },
  loop: {
    "variables": [{"name": "i", "id": "var_i"}],
    "blocks": { "blocks": [ {"type": "controls_for", "x": 50, "y": 50, "fields": {"VAR": {"id": "var_i"}}, "inputs": {"FROM": {"shadow": {"type": "math_number", "fields": {"NUM": 1}}}, "TO": {"shadow": {"type": "math_number", "fields": {"NUM": 10}}}, "BY": {"shadow": {"type": "math_number", "fields": {"NUM": 1}}}, "DO": {"block": {"type": "text_print", "inputs": {"TEXT": {"block": {"type": "variables_get", "fields": {"VAR": {"id": "var_i"}}}}}}}}} ] }
  },
  turtle: {
    "variables": [{"name": "j", "id": "var_j"}],
    "blocks": { "blocks": [
      {
        "type": "turtle_import", "x": 50, "y": 50,
        "next": {
          "block": {
            "type": "controls_for",
            "fields": {"VAR": {"id": "var_j"}},
            "inputs": {
              "FROM": {"shadow": {"type": "math_number", "fields": {"NUM": 1}}},
              "TO": {"shadow": {"type": "math_number", "fields": {"NUM": 4}}},
              "BY": {"shadow": {"type": "math_number", "fields": {"NUM": 1}}},
              "DO": {
                "block": {
                  "type": "turtle_forward",
                  "inputs": {"DISTANCE": {"shadow": {"type": "math_number", "fields": {"NUM": 50}}}},
                  "next": {
                    "block": {
                      "type": "turtle_right",
                      "inputs": {"ANGLE": {"shadow": {"type": "math_number", "fields": {"NUM": 90}}}}
                    }
                  }
                }
              }
            }
          }
        }
      }
    ]}
  },
  guess: {
    "variables": [
      {"name": "answer", "id": "ans"},
      {"name": "guess", "id": "g"}
    ],
    "blocks": {
      "blocks": [
        {
          "type": "import_module", "x": 50, "y": 50,
          "fields": {"MODULE_NAME": "random"},
          "next": {
            "block": {
              "type": "variables_set",
              "fields": {"VAR": {"id": "ans"}},
              "inputs": {
                "VALUE": {
                  "block": {
                    "type": "random_randint",
                    "inputs": {
                      "MIN": {"shadow": {"type": "math_number", "fields": {"NUM": 1}}},
                      "MAX": {"shadow": {"type": "math_number", "fields": {"NUM": 100}}}
                    }
                  }
                }
              },
              "next": {
                "block": {
                  "type": "variables_set",
                  "fields": {"VAR": {"id": "g"}},
                  "inputs": {
                    "VALUE": {"shadow": {"type": "math_number", "fields": {"NUM": 0}}}
                  },
                  "next": {
                    "block": {
                      "type": "controls_whileUntil",
                      "fields": {"MODE": "WHILE"},
                      "inputs": {
                        "BOOL": {
                          "block": {
                            "type": "logic_compare",
                            "fields": {"OP": "NEQ"},
                            "inputs": {
                              "A": {"block": {"type": "variables_get", "fields": {"VAR": {"id": "g"}}}},
                              "B": {"block": {"type": "variables_get", "fields": {"VAR": {"id": "ans"}}}}
                            }
                          }
                        }
                      },
                      "DO": {
                        "block": {
                          "type": "variables_set",
                          "fields": {"VAR": {"id": "g"}},
                          "inputs": {
                            "VALUE": {
                              "block": {
                                "type": "type_cast",
                                "fields": {"TYPE": "int"},
                                "inputs": {
                                  "VAL": {
                                    "block": {
                                      "type": "python_input",
                                      "inputs": {
                                        "PROMPT": {"shadow": {"type": "text", "fields": {"TEXT": "Guess a number (1-100): "}}}
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          },
                          "next": {
                            "block": {
                              "type": "controls_if",
                              "extraState": {"elseIfCount": 1},
                              "inputs": {
                                "IF0": {
                                  "block": {
                                    "type": "logic_compare",
                                    "fields": {"OP": "LT"},
                                    "inputs": {
                                      "A": {"block": {"type": "variables_get", "fields": {"VAR": {"id": "g"}}}},
                                      "B": {"block": {"type": "variables_get", "fields": {"VAR": {"id": "ans"}}}}
                                    }
                                  }
                                },
                                "DO0": {
                                  "block": {
                                    "type": "text_print",
                                    "inputs": {"TEXT": {"shadow": {"type": "text", "fields": {"TEXT": "Too small!"}}}}
                                  }
                                },
                                "IF1": {
                                  "block": {
                                    "type": "logic_compare",
                                    "fields": {"OP": "GT"},
                                    "inputs": {
                                      "A": {"block": {"type": "variables_get", "fields": {"VAR": {"id": "g"}}}},
                                      "B": {"block": {"type": "variables_get", "fields": {"VAR": {"id": "ans"}}}}
                                    }
                                  }
                                },
                                "DO1": {
                                  "block": {
                                    "type": "text_print",
                                    "inputs": {"TEXT": {"shadow": {"type": "text", "fields": {"TEXT": "Too big!"}}}}
                                  }
                                }
                              }
                            }
                          }
                        }
                      },
                      "next": {
                        "block": {
                          "type": "text_print",
                          "inputs": {"TEXT": {"shadow": {"type": "text", "fields": {"TEXT": "You win! 🎉"}}}}
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      ]
    }
  }
};

document.getElementById('example-select').addEventListener('change', (e) => {
  const val = e.target.value;
  if (!val) return;
  if (confirm('Load this example? This will replace your current workspace blocks.')) {
    workspace.clear();
    Blockly.serialization.workspaces.load(examples[val], workspace);
  }
  e.target.value = ""; // Reset selector
});


// -------- Turtle Custom Blocks Definitions --------
Blockly.Blocks['turtle_import'] = {
  init: function() {
    this.appendDummyInput().appendField("import turtle");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
    this.setTooltip("Load turtle graphics module (import turtle)");
  }
};
pythonGenerator.forBlock['turtle_import'] = function(block) { return "import turtle\n"; };

Blockly.Blocks['turtle_forward'] = {
  init: function() {
    this.appendValueInput("DISTANCE").setCheck("Number").appendField("turtle.forward");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
  }
};
pythonGenerator.forBlock['turtle_forward'] = function(block, generator) {
  const dist = generator.valueToCode(block, 'DISTANCE', generator.ORDER_NONE) || '0';
  return `turtle.forward(${dist})\n`;
};

Blockly.Blocks['turtle_backward'] = {
  init: function() {
    this.appendValueInput("DISTANCE").setCheck("Number").appendField("turtle.backward");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
  }
};
pythonGenerator.forBlock['turtle_backward'] = function(block, generator) {
  const dist = generator.valueToCode(block, 'DISTANCE', generator.ORDER_NONE) || '0';
  return `turtle.backward(${dist})\n`;
};

Blockly.Blocks['turtle_right'] = {
  init: function() {
    this.appendValueInput("ANGLE").setCheck("Number").appendField("turtle.right");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
  }
};
pythonGenerator.forBlock['turtle_right'] = function(block, generator) {
  const angle = generator.valueToCode(block, 'ANGLE', generator.ORDER_NONE) || '0';
  return `turtle.right(${angle})\n`;
};

Blockly.Blocks['turtle_left'] = {
  init: function() {
    this.appendValueInput("ANGLE").setCheck("Number").appendField("turtle.left");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
  }
};
pythonGenerator.forBlock['turtle_left'] = function(block, generator) {
  const angle = generator.valueToCode(block, 'ANGLE', generator.ORDER_NONE) || '0';
  return `turtle.left(${angle})\n`;
};

Blockly.Blocks['turtle_penup'] = {
  init: function() {
    this.appendDummyInput().appendField("turtle.penup()");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
  }
};
pythonGenerator.forBlock['turtle_penup'] = function(block) { return "turtle.penup()\n"; };

Blockly.Blocks['turtle_pendown'] = {
  init: function() {
    this.appendDummyInput().appendField("turtle.pendown()");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
  }
};
pythonGenerator.forBlock['turtle_pendown'] = function(block) { return "turtle.pendown()\n"; };



