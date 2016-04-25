function Arduino(serialPort, translator) {
    var instance = this;

    this.digitalState = 0;
    this.loopStack = [];
    this.running = false;
    this.translator = translator;
    this.serialPort = serialPort
    this.serialPort.on("data", function(data) {
        //If we receive a "done" signal
        if (data[0] == 0) {
            console.log("Done received");
            instance.fetchAndExecute();
        }
    });

    this.fetchAndExecute = function() {
        if (this.running) {
            if (this.programCounter < this.program.length) {
                this.executeNextInstruction();
            } else {
                this.halt();
            }
        }
    }

    this.writeData = function(bytes) {
        console.log("Executing " + bytes);
        this.serialPort.write(new Buffer(bytes));
    }

    this.halt = function() {
        this.running = false;
        if (this.terminationCallback !== undefined) {
            this.terminationCallback();
        }
    }

    this.jump = function(counter) {
        this.programCounter = counter;
    }

    this.executeNextInstruction = function() {
        var operation = this.program[this.programCounter];

        if (operation.type === "instruction") {
            this.writeData([operation.code, operation.firstOperand, operation.secondOperand]);
            if (operation.code == 2) {
                var on = parseInt(operation.secondOperand) > 0;
                if (on) {
                    this.digitalState = this.digitalState | (1 << operation.firstOperand);
                } else {
                    this.digitalState = this.digitalState & ~(1 << operation.firstOperand);
                }
                console.log(this.digitalState + " uino; on = " + on);
            }
            if (this.instructionCallback !== undefined) {
                this.instructionCallback(this.programCounter, operation);
            }
            this.programCounter++;
        } else {
            if (operation.type === "repeat") {
                //Push the current program counter onto the stack
                this.loopStack.push({
                    programCounter: this.programCounter,
                    amount: operation.amount
                });
            } else if (operation.type === "end") {
                var head = this.loopStack[this.loopStack.length - 1];
                if (head !== undefined) {
                    if (head.amount === "forever") {
                        this.jump(head.programCounter);
                    } else {
                        head.amount--; //Decrement the amount of jumps
                        if (head.amount > 0) {
                            this.jump(head.programCounter);
                        } else {
                            this.loopStack.pop(); //Count is 0, remove the loop from the stack
                        }
                    }
                }
            }

            this.programCounter++;
            this.fetchAndExecute();
        }
    }

    this.onTermination = function(terminationCallback) {
        this.terminationCallback = terminationCallback;
    }

    this.onInstructionCompleted = function(instructionCallback) {
        this.instructionCallback = instructionCallback;
    }

    this.executeProgram = function(program) {
        this.program = this.translator.translate(program);
        this.programCounter = 0;
        this.running = true;

        this.fetchAndExecute();
    }

    this.isOpen = function() {
        return this.serialPort.isOpen();
    }

    this.getDigitalState = function() {
        return this.digitalState;
    }
}

module.exports = Arduino;
