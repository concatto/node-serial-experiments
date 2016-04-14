var express = require("express")();
var http = require("http").Server(express);
var io = require("socket.io")(http);
var SerialPort = require("serialport").SerialPort

var currentValue = 0;
var port = new SerialPort("/dev/ttyUSB0");

var Arduino = function(serialPort) {
  this.serialPort = serialPort;
}

/**
 * Value: 0 to 1, where 1 is HIGH.
 */
Arduino.prototype.write = function(command, value) {
  if (this.serialPort.isOpen()) {
    console.log("writing " + command + ", " + value);
    this.serialPort.write(new Buffer([command, value]));
  } else {
    console.log("not open");
  }
}

Arduino.prototype.control = function(pin, value) {
  this.write(pin, Math.round(value * 255));
}

Arduino.prototype.wait = function(value) {
  this.write(1, Math.round(value / 5.0));
}

var arduino = new Arduino(port);

express.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});

function broadcastValue(socket) {
  var sender = socket != undefined ? socket.broadcast : io;
  sender.emit("brightness", new Buffer([currentValue]));
}

io.on("connection", function(socket) {
  socket.on("code", function(data) {
    var commands = data.split("\n");
    for (var i = 0; i < commands.length; i++) {
      var tokens = commands[i].split(" ");
      console.log(tokens);
      if (tokens[0] == "wait") {
        arduino.wait(parseInt(tokens[1]));
      } else if (tokens[0] == "control") {
        arduino.control(parseInt(tokens[1]), parseInt(tokens[2]));
      }
    }
  });

  /*broadcastValue(socket);
  socket.on("brightness", function(value) {
    currentValue = Math.pow(1 + (parseInt(value)/47.741), 3) - 1;
    broadcastValue(socket);
    if (port.isOpen()) {
      port.write(new Buffer([currentValue]));
    }
  });*/
});

http.listen(4000);
