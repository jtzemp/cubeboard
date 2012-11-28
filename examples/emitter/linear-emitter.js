
var host = '127.0.0.1';
var port = 1180;

process.env.TZ = 'UTC';
var util = require("util");
var dgram = require("dgram");

util.log("starting linear-emitter");

function emitter(node) {
  var socket = dgram.createSocket("udp4");
  var count = 0;
  return function() {
    count += 1;
    console.log("linear: node=" + node + ", count=" + count);
    var msg = new Buffer(JSON.stringify({
      "type": "linear",
      "time": Date.now(),
      "data": {
        "node": node,
        "count": count
      }
    }));
    socket.send(msg, 0, msg.length, port, host, function(err, bytes) {
      if (err) {throw new Error(err);}
    });
  };
}

for (var i=1; i<9; i++) {
  setInterval(emitter(i), 10 * 1000);
}
