import * as Blockly from 'blockly';

export function defineCustomBlocks() {

// -- module imports --
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

Blockly.Blocks['from_import'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("from")
        .appendField(new Blockly.FieldTextInput("math"), "MODULE_NAME")
        .appendField("import")
        .appendField(new Blockly.FieldTextInput("sqrt"), "ITEM_NAME");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip("Import specific items from a module: from X import Y (use commas for multiple items)");
  }
};

Blockly.Blocks['import_as'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("import")
        .appendField(new Blockly.FieldTextInput("numpy"), "MODULE_NAME")
        .appendField("as")
        .appendField(new Blockly.FieldTextInput("np"), "ALIAS");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip("Import a module with an alias: import X as Y");
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

Blockly.Blocks['dict_delete'] = {
  init: function() {
    this.appendValueInput("DICT").setCheck(null).appendField("in dict");
    this.appendValueInput("KEY").setCheck(null).appendField("delete key");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(330);
    this.setTooltip("Delete a key-value pair from a dictionary");
  }
};

Blockly.Blocks['dict_keys'] = {
  init: function() {
    this.appendValueInput("DICT").setCheck(null).appendField("get keys of dict");
    this.setOutput(true, "Array");
    this.setColour(330);
    this.setTooltip("Get a list of all keys in a dictionary");
  }
};

Blockly.Blocks['list_append'] = {
  init: function() {
    this.appendValueInput("LIST").setCheck("Array").appendField("to list");
    this.appendValueInput("ITEM").setCheck(null).appendField("append");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("%{BKY_LISTS_HUE}");
    this.setTooltip("Append an item to the end of a list");
  }
};

// -- tuple blocks --
Blockly.Blocks['tuple_create'] = {
  init: function() {
    this.appendDummyInput().appendField("tuple (");
    this.appendValueInput("A").setCheck(null);
    this.appendDummyInput().appendField(",");
    this.appendValueInput("B").setCheck(null);
    this.appendDummyInput().appendField(")");
    this.setOutput(true, null);
    this.setColour(330);
    this.setTooltip("Create a tuple with two items");
  }
};

Blockly.Blocks['tuple_get'] = {
  init: function() {
    this.appendValueInput("TUPLE").setCheck(null).appendField("get from tuple");
    this.appendValueInput("INDEX").setCheck("Number").appendField("index");
    this.setOutput(true, null);
    this.setColour(330);
    this.setTooltip("Get an item from a tuple by index");
  }
};

Blockly.Blocks['tuple_len'] = {
  init: function() {
    this.appendValueInput("TUPLE").setCheck(null).appendField("len of");
    this.setOutput(true, "Number");
    this.setColour(330);
    this.setTooltip("Get the length of a tuple");
  }
};

Blockly.Blocks['tuple_slice'] = {
  init: function() {
    this.appendValueInput("TUPLE").setCheck(null).appendField("slice tuple");
    this.appendValueInput("START").setCheck("Number").appendField("from");
    this.appendValueInput("END").setCheck("Number").appendField("to");
    this.setOutput(true, null);
    this.setColour(330);
    this.setTooltip("Get a slice of a tuple from start to end index");
  }
};

Blockly.Blocks['tuple_index'] = {
  init: function() {
    this.appendValueInput("TUPLE").setCheck(null).appendField("index of");
    this.appendValueInput("ITEM").setCheck(null).appendField("in tuple");
    this.setOutput(true, "Number");
    this.setColour(330);
    this.setTooltip("Find the first index of an item in a tuple");
  }
};

Blockly.Blocks['tuple_count'] = {
  init: function() {
    this.appendValueInput("TUPLE").setCheck(null).appendField("count");
    this.appendValueInput("ITEM").setCheck(null).appendField("in tuple");
    this.setOutput(true, "Number");
    this.setColour(330);
    this.setTooltip("Count occurrences of an item in a tuple");
  }
};

Blockly.Blocks['tuple_unpack'] = {
  init: function() {
    this.appendValueInput("TUPLE").setCheck(null).appendField("unpack tuple into");
    this.appendDummyInput().appendField(new Blockly.FieldTextInput("a, b"), "VARS");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(330);
    this.setTooltip("Unpack tuple elements into variables (e.g. x, y)");
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
    this.appendDummyInput().appendField("to").appendField(new Blockly.FieldDropdown([
      ["int", "int"],
      ["float", "float"],
      ["str", "str"],
      ["bool", "bool"],
      ["list", "list"],
      ["tuple", "tuple"],
      ["dict", "dict"],
      ["set", "set"]
    ]), "TYPE");
    this.setOutput(true, null);
    this.setColour(180);
    this.setTooltip("Convert a value to a specific data type, e.g. float(input())");
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

Blockly.Blocks['python_input_stmt'] = {
  init: function() {
    this.appendValueInput("PROMPT")
        .setCheck(null)
        .appendField("input()");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
    this.setTooltip("Popup a browser prompt to get user input text");
  }
};


// -- turtle --
Blockly.Blocks['turtle_clear'] = {
  init: function() {
    this.appendDummyInput().appendField("turtle.clear()");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
  }
};
Blockly.Blocks['turtle_speed'] = {
  init: function() {
    this.appendValueInput("SPEED").setCheck("Number").appendField("turtle.speed");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
  }
};
Blockly.Blocks['turtle_xcor'] = {
  init: function() {
    this.appendDummyInput().appendField("turtle.xcor()");
    this.setOutput(true, "Number");
    this.setColour(160);
  }
};
Blockly.Blocks['turtle_ycor'] = {
  init: function() {
    this.appendDummyInput().appendField("turtle.ycor()");
    this.setOutput(true, "Number");
    this.setColour(160);
  }
};
Blockly.Blocks['turtle_import'] = {
  init: function() {
    this.appendDummyInput().appendField("import turtle");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
    this.setTooltip("Load turtle graphics module (import turtle)");
  }
};
Blockly.Blocks['turtle_forward'] = {
  init: function() {
    this.appendValueInput("DISTANCE").setCheck("Number").appendField("turtle.forward");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
  }
};
Blockly.Blocks['turtle_backward'] = {
  init: function() {
    this.appendValueInput("DISTANCE").setCheck("Number").appendField("turtle.backward");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
  }
};
Blockly.Blocks['turtle_right'] = {
  init: function() {
    this.appendValueInput("ANGLE").setCheck("Number").appendField("turtle.right");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
  }
};
Blockly.Blocks['turtle_left'] = {
  init: function() {
    this.appendValueInput("ANGLE").setCheck("Number").appendField("turtle.left");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
  }
};
Blockly.Blocks['turtle_penup'] = {
  init: function() {
    this.appendDummyInput().appendField("turtle.penup()");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
  }
};
Blockly.Blocks['turtle_pendown'] = {
  init: function() {
    this.appendDummyInput().appendField("turtle.pendown()");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
  }
};
Blockly.Blocks['turtle_color'] = {
  init: function() {
    this.appendValueInput("COLOR").setCheck("String").appendField("turtle.color");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
  }
};
Blockly.Blocks['turtle_pensize'] = {
  init: function() {
    this.appendValueInput("SIZE").setCheck("Number").appendField("turtle.pensize");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
  }
};
Blockly.Blocks['turtle_circle'] = {
  init: function() {
    this.appendValueInput("RADIUS").setCheck("Number").appendField("turtle.circle");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
  }
};
Blockly.Blocks['turtle_goto'] = {
  init: function() {
    this.appendDummyInput().appendField("turtle.goto");
    this.appendValueInput("X").setCheck("Number").appendField("x:");
    this.appendValueInput("Y").setCheck("Number").appendField("y:");
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
  }
};
Blockly.Blocks['turtle_begin_fill'] = {
  init: function() {
    this.appendDummyInput().appendField("turtle.begin_fill()");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
  }
};
Blockly.Blocks['turtle_end_fill'] = {
  init: function() {
    this.appendDummyInput().appendField("turtle.end_fill()");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
  }
};
Blockly.Blocks['turtle_fillcolor'] = {
  init: function() {
    this.appendValueInput("COLOR").setCheck("String").appendField("turtle.fillcolor");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
  }
};
Blockly.Blocks['turtle_setheading'] = {
  init: function() {
    this.appendValueInput("ANGLE").setCheck("Number").appendField("turtle.setheading");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
  }
};
Blockly.Blocks['turtle_heading'] = {
  init: function() {
    this.appendDummyInput().appendField("turtle.heading()");
    this.setOutput(true, "Number");
    this.setColour(160);
  }
};
Blockly.Blocks['turtle_write'] = {
  init: function() {
    this.appendValueInput("TEXT").appendField("turtle.write");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
  }
};
Blockly.Blocks['turtle_stamp'] = {
  init: function() {
    this.appendDummyInput().appendField("turtle.stamp()");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
  }
};

}
