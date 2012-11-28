
var host = '127.0.0.1';
var port = 1180;

process.env.TZ = 'UTC';
var util = require("util");
var dgram = require("dgram");

util.log("starting sine-emitter");

function emitter(node) {
  var socket = dgram.createSocket("udp4");
  var count = 0;
  var radians = 0;
  return function() {
    count += 1;
    radians += 0.1;
    value = Math.floor(11 * Math.sin(radians));
    console.log("sine: node=" + node + ", count=" + count + ", value=" + value);
    var msg = new Buffer(JSON.stringify({
      "type": "sine",
      "time": Date.now(),
      "data": {
        "count": count,
        "value": value
      }
    }));
    socket.send(msg, 0, msg.length, port, host, function(err, bytes) {
      if (err) {throw new Error(err);}
    });
  };
}

setInterval(emitter(0), 5 * 1000);
