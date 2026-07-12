import { pythonGenerator } from 'blockly/python';

export function definePythonGenerators() {

// -- imports & modules --
pythonGenerator.forBlock['import_module'] = function(block) {
  const moduleName = block.getFieldValue('MODULE_NAME');
  return 'import ' + moduleName + '\n';
};

pythonGenerator.forBlock['from_import'] = function(block) {
  const moduleName = block.getFieldValue('MODULE_NAME');
  const itemName = block.getFieldValue('ITEM_NAME');
  return 'from ' + moduleName + ' import ' + itemName + '\n';
};

pythonGenerator.forBlock['import_as'] = function(block) {
  const moduleName = block.getFieldValue('MODULE_NAME');
  const alias = block.getFieldValue('ALIAS');
  return 'import ' + moduleName + ' as ' + alias + '\n';
};

pythonGenerator.forBlock['call_module_function_args'] = function(block, generator) {
  const funcName = block.getFieldValue('FUNC_NAME');
  let args = generator.valueToCode(block, 'ARGS', generator.ORDER_NONE) || '';
  if (args.startsWith('[') && args.endsWith(']')) args = args.slice(1, -1);
  return [`${funcName}(${args})`, generator.ORDER_FUNCTION_CALL];
};

pythonGenerator.forBlock['call_module_function_args_stmt'] = function(block, generator) {
  const funcName = block.getFieldValue('FUNC_NAME');
  let args = generator.valueToCode(block, 'ARGS', generator.ORDER_NONE) || '';
  if (args.startsWith('[') && args.endsWith(']')) args = args.slice(1, -1);
  return `${funcName}(${args})\n`;
};

pythonGenerator.forBlock['time_sleep'] = function(block, generator) {
  pythonGenerator.definitions_['import_time'] = 'import time';
  const time = generator.valueToCode(block, 'TIME', generator.ORDER_NONE) || '1';
  return `time.sleep(${time})\n`;
};

pythonGenerator.forBlock['random_randint'] = function(block, generator) {
  pythonGenerator.definitions_['import_random'] = 'import random';
  const min = generator.valueToCode(block, 'MIN', generator.ORDER_NONE) || '1';
  const max = generator.valueToCode(block, 'MAX', generator.ORDER_NONE) || '10';
  return [`random.randint(${min}, ${max})`, generator.ORDER_FUNCTION_CALL];
};

// -- raw python escape hatches --
pythonGenerator.forBlock['raw_python'] = function(block, generator) {
  return [block.getFieldValue('CODE'), generator.ORDER_ATOMIC];
};

pythonGenerator.forBlock['raw_python_stmt'] = function(block, generator) {
  return block.getFieldValue('CODE') + '\n';
};

// -- dicts --
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

pythonGenerator.forBlock['dict_delete'] = function(block, generator) {
  const dict = generator.valueToCode(block, 'DICT', generator.ORDER_MEMBER) || '{}';
  const key = generator.valueToCode(block, 'KEY', generator.ORDER_NONE) || '""';
  return `del ${dict}[${key}]\n`;
};

pythonGenerator.forBlock['dict_keys'] = function(block, generator) {
  const dict = generator.valueToCode(block, 'DICT', generator.ORDER_MEMBER) || '{}';
  return [`list(${dict}.keys())`, generator.ORDER_FUNCTION_CALL];
};

// -- lists --
pythonGenerator.forBlock['list_append'] = function(block, generator) {
  const list = generator.valueToCode(block, 'LIST', generator.ORDER_MEMBER) || '[]';
  const item = generator.valueToCode(block, 'ITEM', generator.ORDER_NONE) || 'None';
  return `${list}.append(${item})\n`;
};

// -- tuples --
pythonGenerator.forBlock['tuple_create'] = function(block, generator) {
  const a = generator.valueToCode(block, 'A', generator.ORDER_NONE) || 'None';
  const b = generator.valueToCode(block, 'B', generator.ORDER_NONE) || 'None';
  return [`(${a}, ${b})`, generator.ORDER_ATOMIC];
};

pythonGenerator.forBlock['tuple_get'] = function(block, generator) {
  const tup = generator.valueToCode(block, 'TUPLE', generator.ORDER_MEMBER) || '()';
  const idx = generator.valueToCode(block, 'INDEX', generator.ORDER_NONE) || '0';
  return [`${tup}[${idx}]`, generator.ORDER_MEMBER];
};

pythonGenerator.forBlock['tuple_len'] = function(block, generator) {
  const tup = generator.valueToCode(block, 'TUPLE', generator.ORDER_NONE) || '()';
  return [`len(${tup})`, generator.ORDER_FUNCTION_CALL];
};

pythonGenerator.forBlock['tuple_slice'] = function(block, generator) {
  const tup = generator.valueToCode(block, 'TUPLE', generator.ORDER_MEMBER) || '()';
  const start = generator.valueToCode(block, 'START', generator.ORDER_NONE) || '0';
  const end = generator.valueToCode(block, 'END', generator.ORDER_NONE) || '';
  return [`${tup}[${start}:${end}]`, generator.ORDER_MEMBER];
};

pythonGenerator.forBlock['tuple_index'] = function(block, generator) {
  const tup = generator.valueToCode(block, 'TUPLE', generator.ORDER_MEMBER) || '()';
  const item = generator.valueToCode(block, 'ITEM', generator.ORDER_NONE) || 'None';
  return [`${tup}.index(${item})`, generator.ORDER_FUNCTION_CALL];
};

pythonGenerator.forBlock['tuple_count'] = function(block, generator) {
  const tup = generator.valueToCode(block, 'TUPLE', generator.ORDER_MEMBER) || '()';
  const item = generator.valueToCode(block, 'ITEM', generator.ORDER_NONE) || 'None';
  return [`${tup}.count(${item})`, generator.ORDER_FUNCTION_CALL];
};

pythonGenerator.forBlock['tuple_unpack'] = function(block, generator) {
  const tup = generator.valueToCode(block, 'TUPLE', generator.ORDER_NONE) || '()';
  const vars = block.getFieldValue('VARS') || 'a, b';
  return `${vars} = ${tup}\n`;
};

// -- OOP --
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

// -- misc --
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

pythonGenerator.forBlock['python_input_stmt'] = function(block, generator) {
  const promptText = generator.valueToCode(block, 'PROMPT', generator.ORDER_NONE) || '""';
  return `input(${promptText})\n`;
};

// ==========================================
//  turtle graphics
// ==========================================

pythonGenerator.forBlock['turtle_import'] = function(block) {
  return "import turtle\n";
};

pythonGenerator.forBlock['turtle_forward'] = function(block, generator) {
  const dist = generator.valueToCode(block, 'DISTANCE', generator.ORDER_NONE) || '0';
  return `turtle.forward(${dist})\n`;
};

pythonGenerator.forBlock['turtle_backward'] = function(block, generator) {
  const dist = generator.valueToCode(block, 'DISTANCE', generator.ORDER_NONE) || '0';
  return `turtle.backward(${dist})\n`;
};

pythonGenerator.forBlock['turtle_right'] = function(block, generator) {
  const angle = generator.valueToCode(block, 'ANGLE', generator.ORDER_NONE) || '0';
  return `turtle.right(${angle})\n`;
};

pythonGenerator.forBlock['turtle_left'] = function(block, generator) {
  const angle = generator.valueToCode(block, 'ANGLE', generator.ORDER_NONE) || '0';
  return `turtle.left(${angle})\n`;
};

pythonGenerator.forBlock['turtle_penup'] = function(block) {
  return "turtle.penup()\n";
};

pythonGenerator.forBlock['turtle_pendown'] = function(block) {
  return "turtle.pendown()\n";
};

pythonGenerator.forBlock['turtle_color'] = function(block, generator) {
  const color = generator.valueToCode(block, 'COLOR', generator.ORDER_NONE) || "'black'";
  return `turtle.color(${color})\n`;
};

pythonGenerator.forBlock['turtle_pensize'] = function(block, generator) {
  const size = generator.valueToCode(block, 'SIZE', generator.ORDER_NONE) || '1';
  return `turtle.pensize(${size})\n`;
};

pythonGenerator.forBlock['turtle_circle'] = function(block, generator) {
  const radius = generator.valueToCode(block, 'RADIUS', generator.ORDER_NONE) || '50';
  return `turtle.circle(${radius})\n`;
};

pythonGenerator.forBlock['turtle_goto'] = function(block, generator) {
  const x = generator.valueToCode(block, 'X', generator.ORDER_NONE) || '0';
  const y = generator.valueToCode(block, 'Y', generator.ORDER_NONE) || '0';
  return `turtle.goto(${x}, ${y})\n`;
};

pythonGenerator.forBlock['turtle_begin_fill'] = function(block) {
  return "turtle.begin_fill()\n";
};

pythonGenerator.forBlock['turtle_end_fill'] = function(block) {
  return "turtle.end_fill()\n";
};

pythonGenerator.forBlock['turtle_fillcolor'] = function(block, generator) {
  const color = generator.valueToCode(block, 'COLOR', generator.ORDER_NONE) || '"black"';
  return `turtle.fillcolor(${color})\n`;
};

pythonGenerator.forBlock['turtle_setheading'] = function(block, generator) {
  const angle = generator.valueToCode(block, 'ANGLE', generator.ORDER_NONE) || '0';
  return `turtle.setheading(${angle})\n`;
};

pythonGenerator.forBlock['turtle_heading'] = function(block) {
  return ["turtle.heading()", pythonGenerator.ORDER_FUNCTION_CALL];
};

pythonGenerator.forBlock['turtle_write'] = function(block, generator) {
  const text = generator.valueToCode(block, 'TEXT', generator.ORDER_NONE) || '""';
  return `turtle.write(${text})\n`;
};

pythonGenerator.forBlock['turtle_stamp'] = function(block) {
  return "turtle.stamp()\n";
};

pythonGenerator.forBlock['turtle_clear'] = function(block) {
  return "turtle.clear()\n";
};

pythonGenerator.forBlock['turtle_speed'] = function(block, generator) {
  const speed = generator.valueToCode(block, 'SPEED', generator.ORDER_NONE) || '5';
  return `turtle.speed(${speed})\n`;
};

pythonGenerator.forBlock['var_assign'] = function(block, generator) {
  const left = generator.valueToCode(block, 'LEFT', generator.ORDER_NONE) || 'x';
  const right = generator.valueToCode(block, 'RIGHT', generator.ORDER_NONE) || 'None';
  return `${left} = ${right}\n`;
};

pythonGenerator.forBlock['turtle_xcor'] = function(block) {
  return ["turtle.xcor()", pythonGenerator.ORDER_FUNCTION_CALL];
};

pythonGenerator.forBlock['turtle_ycor'] = function(block) {
  return ["turtle.ycor()", pythonGenerator.ORDER_FUNCTION_CALL];
};

}