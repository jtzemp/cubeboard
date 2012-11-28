
var host = '127.0.0.1';
var port = 1180;

process.env.TZ = 'UTC';
var util = require("util");
var dgram = require("dgram");

util.log("starting beacon-emitter");

function emitter(node) {
  var socket = dgram.createSocket("udp4");
  var count = 0;
  return function() {
    count += 1;
    var empty = Math.floor((Math.random() * 25));
    var p1 = Math.floor((Math.random() * 20));
    var p2 = Math.floor((Math.random() * 25));
    var p3 = Math.floor((Math.random() * 35));
    var p4 = Math.floor((Math.random() * 50));
    var pixelsyncs = p1 + p2 + p3 + p4;
    var requests = (pixelsyncs + empty) * Math.floor((Math.random() * 10));
    console.log("beacon: node=" + node + ", count=" + count + ", pixelsyncs=" + pixelsyncs);
    var msg = new Buffer(JSON.stringify({
      "type": "beacon",
      "time": Date.now(),
      "data": {
        "node": node,
        "count": count,
        "requests": requests,
        "pixelsyncs": pixelsyncs,
        "emptyslots": empty,
        "partners": {
          "parnter1": p1,
          "partner2": p2,
          "partner3": p3,
          "partner4": p4
        }
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
