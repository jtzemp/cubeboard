
var host = '127.0.0.1';
var port = 1180;

process.env.TZ = 'UTC';
var util = require("util");
var dgram = require("dgram");

util.log("starting app-emitter");

function app_emitter(node) {
  var socket = dgram.createSocket("udp4");
  var count = 0;
  var f = function() {
    count += 1;
    var p1 = Math.floor((Math.random() * 20));
    var p2 = Math.floor((Math.random() * 20));
    var p3 = Math.floor((Math.random() * 20));
    var p4 = Math.floor((Math.random() * 20));
    var x = p1 + p2 + p3 + p4;
    var y = x * Math.floor((Math.random() * 10));
    console.log("app: node=" + node + ", count=" + count + ", pixelsync=" + x);
    var message = new Buffer(JSON.stringify({
      "type": "app",
      "time": Date.now(),
      "data": {
        "node": node,
        "count": count,
        "requests": y,
        "pixelsyncs": x,
        "partners": {
          "parnter1": p1,
          "partner2": p2,
          "partner3": p3,
          "partner4": p4
        }
      }
    }));
    socket.send(message, 0, message.length, port, host, function(err, bytes) {
      if (err) {throw new Error(err);}
    });
  };
  return f;
}

for (var i=1; i<9; i++) {
  setInterval(app_emitter(i), 1000);
}
