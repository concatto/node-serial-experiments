var express = require("express")();
var http = require("http").Server(express);
var io = require("socket.io")(http);
var SerialPort = require("serialport").SerialPort

var currentValue = 0;
var port = new SerialPort("/dev/ttyUSB0");

express.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});

function broadcastValue(socket) {
  var sender = socket != undefined ? socket.broadcast : io;
  sender.emit("brightness", new Buffer([currentValue]));
}

io.on("connection", function(socket) {
  broadcastValue(socket);
  socket.on("brightness", function(value) {
    currentValue = Math.pow(1 + (parseInt(value)/47.741), 3) - 1;
    broadcastValue(socket);
    if (port.isOpen()) {
      port.write(new Buffer([currentValue]));
    }
  });
});

http.listen(4000);
