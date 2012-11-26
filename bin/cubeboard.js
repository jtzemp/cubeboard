var options = require("./cubeboard-config"),
    cube = require("../"),
    server = cube.server(options);

server.register = function(db, endpoints) {
  cube.visualizer.register(db, endpoints, options);
};

server.start();
