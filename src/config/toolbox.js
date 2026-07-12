export const toolbox = {
  "kind": "categoryToolbox",
  "contents": [
    {
      "kind": "category",
      "name": "Logic",
      "colour": "%{BKY_LOGIC_HUE}",
      "contents": [
        {
          "kind": "block",
          "type": "var_assign"
        },
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
        { "kind": "block", "type": "controls_for" },
        { "kind": "block", "type": "controls_flow_statements" }
      ]
    },
    {
      "kind": "category",
      "name": "Math",
      "colour": "%{BKY_MATH_HUE}",
      "contents": [
        { "kind": "block", "type": "math_number" },
        { "kind": "block", "type": "math_arithmetic" },
        { "kind": "block", "type": "math_single" },
        { "kind": "block", "type": "math_trig" },
        { "kind": "block", "type": "math_constant" },
        { "kind": "block", "type": "math_round" },
        { "kind": "block", "type": "math_modulo" },
        { "kind": "block", "type": "math_constrain" },
        { "kind": "block", "type": "math_random_int" },
        { "kind": "block", "type": "math_random_float" },
        { "kind": "block", "type": "math_on_list" }
      ]
    },
    {
      "kind": "category",
      "name": "Text",
      "colour": "%{BKY_TEXTS_HUE}",
      "contents": [
        { "kind": "block", "type": "text" },
        { "kind": "block", "type": "text_print" },
        { "kind": "block", "type": "text_join" },
        { "kind": "block", "type": "text_length" },
        {
          "kind": "block",
          "type": "python_input",
          "inputs": { "PROMPT": { "shadow": { "type": "text", "fields": { "TEXT": "Please enter a value:" } } } }
        },
        {
          "kind": "block",
          "type": "python_input_stmt",
          "inputs": { "PROMPT": { "shadow": { "type": "text", "fields": { "TEXT": "Please enter a value:" } } } }
        }
      ]
    },
    {
      "kind": "category",
      "name": "Data Types",
      "colour": 180,
      "contents": [
        { "kind": "block", "type": "type_cast" }
      ]
    },
    {
      "kind": "category",
      "name": "Time",
      "colour": 50,
      "contents": [
        {
          "kind": "block",
          "type": "time_sleep",
          "inputs": { "TIME": { "shadow": { "type": "math_number", "fields": { "NUM": 1 } } } }
        },
        {
          "kind": "block",
          "type": "time_sleep_ms",
          "inputs": { "TIME": { "shadow": { "type": "math_number", "fields": { "NUM": 1000 } } } }
        }
      ]
    },
    {
      "kind": "category",
      "name": "Lists & Dicts (Arrays)",
      "colour": "%{BKY_LISTS_HUE}",
      "contents": [
        { "kind": "block", "type": "lists_create_with" },
        { "kind": "block", "type": "lists_repeat" },
        { "kind": "block", "type": "list_append" },
        { "kind": "block", "type": "lists_length" },
        { "kind": "block", "type": "lists_isEmpty" },
        { "kind": "block", "type": "lists_indexOf" },
        { "kind": "block", "type": "lists_getIndex" },
        { "kind": "block", "type": "lists_setIndex" },
        { "kind": "block", "type": "tuple_create" },
        { "kind": "block", "type": "tuple_get" },
        { "kind": "block", "type": "tuple_len" },
        { "kind": "block", "type": "tuple_slice" },
        { "kind": "block", "type": "tuple_count" },
        { "kind": "block", "type": "tuple_index" },
        { "kind": "block", "type": "tuple_unpack" }
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
        { "kind": "block", "type": "turtle_pendown" },
        { "kind": "block", "type": "turtle_color", "inputs": { "COLOR": { "shadow": { "type": "text", "fields": { "TEXT": "red" } } } } },
        { "kind": "block", "type": "turtle_pensize", "inputs": { "SIZE": { "shadow": { "type": "math_number", "fields": { "NUM": 3 } } } } },
        { "kind": "block", "type": "turtle_circle", "inputs": { "RADIUS": { "shadow": { "type": "math_number", "fields": { "NUM": 50 } } } } },
        { "kind": "block", "type": "turtle_goto", "inputs": { "X": { "shadow": { "type": "math_number", "fields": { "NUM": 0 } } }, "Y": { "shadow": { "type": "math_number", "fields": { "NUM": 0 } } } } },
        { "kind": "block", "type": "turtle_speed", "inputs": { "SPEED": { "shadow": { "type": "math_number", "fields": { "NUM": 5 } } } } },
        { "kind": "block", "type": "turtle_clear" },
        { "kind": "block", "type": "turtle_xcor" },
        { "kind": "block", "type": "turtle_ycor" },
        { "kind": "block", "type": "turtle_begin_fill" },
        { "kind": "block", "type": "turtle_end_fill" },
        { "kind": "block", "type": "turtle_fillcolor", "inputs": { "COLOR": { "shadow": { "type": "text", "fields": { "TEXT": "yellow" } } } } },
        { "kind": "block", "type": "turtle_setheading", "inputs": { "ANGLE": { "shadow": { "type": "math_number", "fields": { "NUM": 90 } } } } },
        { "kind": "block", "type": "turtle_heading" },
        { "kind": "block", "type": "turtle_write", "inputs": { "TEXT": { "shadow": { "type": "text", "fields": { "TEXT": "Hello" } } } } },
        { "kind": "block", "type": "turtle_stamp" }
      ]
    },
    {
      "kind": "category",
      "name": "Dictionaries",
      "colour": 330,
      "contents": [
        { "kind": "block", "type": "dict_create_empty" },
        { "kind": "block", "type": "dict_get" },
        { "kind": "block", "type": "dict_set" },
        { "kind": "block", "type": "dict_delete" },
        { "kind": "block", "type": "dict_keys" }
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
        { "kind": "block", "type": "from_import", "fields": { "MODULE_NAME": "math", "ITEM_NAME": "sqrt" } },
        { "kind": "block", "type": "import_as", "fields": { "MODULE_NAME": "numpy", "ALIAS": "np" } },
        { "kind": "block", "type": "call_module_function_args" },
        { "kind": "block", "type": "call_module_function_args_stmt" },
        { "kind": "block", "type": "random_randint" }
      ]
    }
  ]
};
