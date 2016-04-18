var express = require("express");
var http = require("http");
var SerialPort = require("serialport").SerialPort
var Queue = require("./queue.js")

var app = express();
var server = http.Server(app);
var io = require("socket.io")(server);

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

var arduino = new Arduino("COM6");

app.use(express.static("public"));

app.get("/", function(req, res) {
    res.sendFile(__dirname + "/index.html");
});

io.on("connection", function(socket) {
    socket.on("code", function(data) {
        var commands = data.split("\n");
        for (var i = 0; i < commands.length; i++) {
            var tokens = commands[i].split(" ");
            if (tokens[0] == "wait") {
                arduino.wait(parseInt(tokens[1]));
            } else if (tokens[0] == "control") {
                arduino.control(parseInt(tokens[1]), parseInt(tokens[2]));
            } else if (tokens[0] == "configure") {
                arduino.configure(parseInt(tokens[1]), parseInt(tokens[2]));
            }
        }
    });

    socket.on("request", function(data) {
        if (data == 1) { //State request
            var state = arduino.isOpen() ? 1 : 0;
            socket.emit("response", new Buffer([state]));
        }
    });
});

server.listen(4000);
