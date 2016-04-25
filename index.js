var express = require("express");
var http = require("http");
var SerialPort = require("serialport").SerialPort
var Queue = require("./queue.js")
var Arduino = require("./arduino.js");
var translator = require("./translator.js");

var app = express();
var server = http.Server(app);
var io = require("socket.io")(server);

var arduino = new Arduino(new SerialPort("/dev/ttyUSB0"), translator);

arduino.onTermination(function() { console.log("Fin"); });
arduino.onInstructionCompleted(function() {
    emitState(arduino.getDigitalState());
});

function emitState(state) {
    io.emit("state", state);
}

var commands = {
    "on": function(subject, value) { subject.executeProgram("control " + value + " 1"); },
    "off": function(subject, value) { subject.executeProgram("control " + value + " 0"); }
};

app.use(express.static("public"));
app.get("/", function(req, res) {
    res.sendFile(__dirname + "/index.html");
});

io.on("connection", function(socket) {
    emitState(arduino.getDigitalState());

    socket.on("code", function(data) {
        arduino.executeProgram(data);
    });

    socket.on("stop", function() {
        console.log("halting");
        arduino.halt();
    });

    socket.on("command", function(data) {
        commands[data.op](arduino, parseInt(data.port));
    });

    /*socket.on("request", function(data) {
        if (data == 1) { //State request
            var state = arduino.isOpen() ? 1 : 0;
            socket.emit("response", new Buffer([state]));
        }
    });*/
});

server.listen(4000);
