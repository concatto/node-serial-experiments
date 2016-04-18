var express = require("express");
var http = require("http");
var SerialPort = require("serialport").SerialPort
var Queue = require("./queue.js")
var Arduino = require("./arduino.js");

var app = express();
var server = http.Server(app);
var io = require("socket.io")(server);

var arduino = new Arduino("/dev/ttyUSB0");

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
