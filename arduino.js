function Arduino(portName) {
    var instance = this;

    this.queue = new Queue();
    this.serialPort = new SerialPort(portName);
    this.serialPort.on("data", function(data) {
        //If we receive a "done" signal
        if (data[0] == 0) {
            console.log("Done received");
            if (instance.queue.isEmpty() == false) {
                instance.queue.dequeue(); //Remove the operation that was just completed
                console.log("Dequeuing");
                var op = instance.queue.peek();
                if (op !== undefined) {
                    instance.writeData([op.command, op.pin, op.value]); //Execute the next
                }
            }
        }
    });

    this.writeData = function(bytes) {
        console.log("Executing " + bytes);
        this.serialPort.write(new Buffer(bytes));
    }

    this.write = function(command, pin, value) {
        if (this.serialPort.isOpen()) {
            this.queue.enqueue({command: command, pin: pin, value: value});

            //If this is the only operation in the queue, execute it
            if (this.queue.getLength() == 1) {
                this.writeData([command, pin, value]);
            }
        } else {
            console.log("not open");
        }
    }

    this.wait = function(value) {
        this.write(2, 0, Math.round(value / 5.0));
    }

    this.control = function(pin, value) {
        this.write(1, pin, Math.round(value * 255));
    }

    this.configure = function(pin, value) {
        this.write(0, pin, value);
    }

    this.isOpen = function() {
        return this.serialPort.isOpen();
    }
}

module.exports = Arduino;
