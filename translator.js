var operationTable = {
    "configure": 1,
    "control": 2,
    "wait": 3,
    "repeat": 100,
    "end": 101
};

function splitValue(value) {
    value = parseInt(value);
    return {
        high: (value >> 8) & 0xFF,
        low: value & 0xFF
    };
}

function translateOperation(lexemes) {
    var code = operationTable[lexemes[0]];
    var operation = {code: code};

    if (code < 100) {
        operation.type = "instruction";
        var firstOperand = lexemes[1];
        var secondOperand = lexemes[2];

        if (secondOperand === undefined) { //If there is only one operand, split it
            var values = splitValue(firstOperand);

            operation.firstOperand = values.high;
            operation.secondOperand = values.low;
        } else {
            operation.firstOperand = parseInt(firstOperand);
            operation.secondOperand = parseFloat(secondOperand);
        }
    } else if (code === 100) {
        operation.type = "repeat";
        operation.count = parseInt(lexemes[1]);
    } else if (code === 101) {
        operation.type = "end";
    }

    operation.text = lexemes.join(" ");
    return operation;
}

function filterArray(array, predicate) {
    var filteredArray = [];
    for (var i = 0; i < array.length; i++) {
        if (predicate(array[i])) {
            filteredArray.push(array[i]);
        }
    }
    return filteredArray;
}

function translateProgram(program) {
    var output = [];
    var instructions = filterArray(program.split("\n"), function(str) {
        return str.trim().length > 0;
    });

    for (var i = 0; i < instructions.length; i++) {
        var instruction = instructions[i].trim();

        var lexemes = instruction.split(" ");
        var op = translateOperation(lexemes);

        output.push(op);
    }

    return output;
}

module.exports = {translate: translateProgram};
