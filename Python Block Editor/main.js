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
        { "kind": "block", "type": "import_module" },
        { "kind": "block", "type": "call_module_function_args" },
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

    // Patch input() to use browser prompt
    await pyodideInstance.runPythonAsync(`
import builtins
import js
def browser_input(prompt_text=""):
    res = js.prompt(prompt_text)
    return res if res is not None else ""
builtins.input = browser_input
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
  
  consoleOutput.textContent = ''; // clear output
  const code = pythonGenerator.workspaceToCode(workspace);
  
  if (!code.trim()) {
    consoleOutput.textContent = '>>> No code to run.\n';
    runBtn.disabled = false;
    runBtn.textContent = originalText;
    return;
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

