export const examples = {
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
