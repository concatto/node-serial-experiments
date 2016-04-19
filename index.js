var express = require("express");
var http = require("http");
var SerialPort = require("serialport").SerialPort
var Queue = require("./queue.js")
var Arduino = require("./arduino.js");
var translator = require("./translator.js");

var app = express();
var server = http.Server(app);
var io = require("socket.io")(server);

var arduino = new Arduino("/dev/ttyUSB0", translator);

app.use(express.static("public"));

app.get("/", function(req, res) {
    res.sendFile(__dirname + "/index.html");
});

io.on("connection", function(socket) {
    socket.on("code", function(data) {
        arduino.executeProgram(data, function() { console.log("Fin"); });
    });

    /*socket.on("request", function(data) {
        if (data == 1) { //State request
            var state = arduino.isOpen() ? 1 : 0;
            socket.emit("response", new Buffer([state]));
        }
    });*/
});

server.listen(4000);
