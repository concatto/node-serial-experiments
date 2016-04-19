function Arduino(serialPort, translator) {
    var instance = this;

    this.loopStack = [];
    this.executing = false;
    this.translator = translator;
    /*this.serialPort = new SerialPort(portName);
    this.serialPort.on("data", function(data) {
        //If we receive a "done" signal
        if (data[0] == 0) {
            console.log("Done received");

        }
    });*/

    this.writeData = function(bytes) {
        console.log("Executing " + bytes);
        //this.serialPort.write(new Buffer(bytes));
    }

    this.halt = function() {
        this.executing = false;
        if (this.terminationCallback !== undefined) {
            this.terminationCallback();
        }
    }

    this.executeNextInstruction = function() {
        if (this.programCounter === this.program.length) {
            this.halt();
            return;
        }

        var operation = this.program[this.programCounter];

        if (operation.type === "instruction") {
            console.log(operation.text);
        } else if (operation.type === "repeat") {
            //Push the current program counter into the stack
            this.loopStack.push({
                programCounter: this.programCounter,
                count: operation.count
            });
        } else if (operation.type === "end") {
            var head = this.loopStack[this.loopStack.length - 1];
            if (head !== undefined) {
                head.count--; //Decrement the amount of jumps
                if (head.count > 0) {
                    this.programCounter = head.programCounter;
                } else {
                    this.loopStack.pop(); //Count is 0, remove the loop from the stack
                }
            }
        }

        this.programCounter++;
    }

    this.executeProgram = function(program, terminationCallback) {
        this.program = this.translator.translate(program);
        this.programCounter = 0;
        this.terminationCallback = terminationCallback;
        this.executing = true;

        while (this.executing) {
            this.executeNextInstruction();
        }
    }

    this.isOpen = function() {
        return this.serialPort.isOpen();
    }
}

module.exports = Arduino;
