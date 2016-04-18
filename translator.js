var operationTable = {
  "configure": 0,
  "control": 1,
  "wait": 2
};

function translateOperation(lexemes) {
  var operation = operationTable[lexemes[0]];
  var firstOperand = parseInt(lexemes[1]);
  var secondOperand = lexemes[2];

  if (secondOperand === undefined) { //If there is only one operand, split it
    firstOperand = parseInt(firstOperand);

    secondOperand = firstOperand & 0xFF;
    firstOperand = (firstOperand >> 8) & 0xFF;
  } else {
    secondOperand = parseFloat(secondOperand);
  }

  return {
    op: operation,
    first: firstOperand,
    second: secondOperand
  };
}

function translate(program, terminationCallback) {
  var output = [];
  var instructions = program.split(";");
  instructions.pop(); //Remove the last instruction (empty)

  for (var i = 0; i < instructions.length; i++) {
    var instruction = instructions[i].trim();

    if (instruction.length > 0) {
      var lexemes = instruction.split(" ");
      var op = translateOperation(lexemes);

      if ((terminationCallback !== undefined) && (i === instructions.length - 1)) {
        op["callback"] = terminationCallback;
      }

      output.push(op);
    }
  }

  return output;
}
