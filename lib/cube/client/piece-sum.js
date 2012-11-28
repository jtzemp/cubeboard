cube.piece.type.sum = function(board) {
  var timeout,
      socket,
      data = 0,
      format = d3.format(",d");

  var sum = cube.piece(board)
      .on("size", resize)
      .on("serialize", serialize)
      .on("deserialize", deserialize);

  var div = d3.select(sum.node())
      .classed("sum", true);

  if (mode == "edit") {
    div.append("h3")
        .attr("class", "title")
        .text("Rolling Sum");

    var query = div.append("textarea")
        .attr("class", "query")
        .attr("placeholder", "query expression…")
        .on("keyup.sum", querychange)
        .on("focus.sum", sum.focus)
        .on("blur.sum", sum.blur);
  }

  function resize() {
    var innerSize = sum.innerSize(),
        transition = sum.transition();

    if (mode == "edit") {
      transition.select(".query")
          .style("width", innerSize[0] - 12 + "px")
          .style("height", innerSize[1] - 58 + "px");

      transition.select(".time select")
          .style("width", innerSize[0] - 174 + "px");
    } else {
      transition
          .style("font-size", innerSize[0] / 5 + "px")
          .style("line-height", innerSize[1] + "px")
          .text(format(data));
    }
  }

  function redraw() {
    div.text(format(data));
    return true;
  }

  function querychange() {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(sum.edit, 750);
  }

  function serialize(json) {
    json.type = "sum";
    json.query = query.property("value");
  }

  function deserialize(json) {
    if (mode == "edit") {
      query.property("value", json.query);
    } else {
      var params = cubeParseQueryString(json.query);
      var expression = params['expression'];
      var dt = params['step'];
      var t1 = params['stop'];
      var t0 = params['start'];

      // "minus" start is date is added to now seconds
      if (typeof(t0) === 'string' && t0.charAt(0) === '-') {
        t0 = Date.now() + (+t0);
      } else if (typeof(t0) === 'string') {
        t0 = new Date(t0);
      } else {
        t0 = Date.now() - 36e5; // start one hour ago (default)
      }
      // "plus" stop is added to start seconds
      // ('+' character is converted to ' ' in url)
      if (typeof(t1) === 'string' && t1.charAt(0) === '-') {
        t1 = Date.now() + (+t1);
      } else if (typeof(t1) === 'string' && t1.charAt(0) === ' ') {
        t1 = t0 + (+t1);
      } else if (typeof(t1) === 'string') {
        t1 = new Date(t1);
      } else {
        t1 = Date.now();
      }

      t1 = new Date(t1);
      t0 = new Date(t0);

      data = 0;

      if (timeout) timeout = clearTimeout(timeout);

      var url = "http://" + cube['evaluator-http-host'] + ":" + cube['evaluator-http-port'] + "/1.0/metric";
      var qry = "?expression=" + expression + "&start=" + cube_time(t0) + "&stop=" + cube_time(t1) + "&step=" + dt;

      $.getJSON(url + qry, function(a) {
        data = 0;
        a.forEach(function(d) {
          //d.time = cube_time.parse(d.time);
          if (d.value != undefined && d.value != null) {
            data += d.value;
          }
        });
        d3.timer(redraw);
      });
      timeout = setTimeout(function() {deserialize(json);}, 3000 + (Math.random() * 5000));
    }
  }

  sum.copy = function() {
    return board.add(cube.piece.type.sum);
  };

  resize();

  return sum;
};
