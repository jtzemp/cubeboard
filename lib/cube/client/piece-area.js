cube.piece.type.area = function(board) {
  var timeout,
      data = [],
      dt0;

  var area = cube.piece(board)
      .on("size", resize)
      .on("serialize", serialize)
      .on("deserialize", deserialize);

  var div = d3.select(area.node())
      .classed("area", true);

  if (mode == "edit") {
    div.append("h3")
        .attr("class", "title")
        .text("Area Chart");

    var query = div.append("textarea")
        .attr("class", "query")
        .attr("placeholder", "query expression…")
        .on("keyup.area", querychange)
        .on("focus.area", area.focus)
        .on("blur.area", area.blur);
  } else {
    var m = [6, 40, 14, 10], // top, right, bottom, left margins
        socket;

    var svg = div.append("svg:svg");

    var x = d3.time.scale(),
        y = d3.scale.linear(),
        xAxis = d3.svg.axis().scale(x).orient("bottom").tickSubdivide(true),
        yAxis = d3.svg.axis().scale(y).orient("right");

    var a = d3.svg.area()
        .interpolate("step-after")
        .x(function(d) { return x(d.time); })
        .y0(function(d) { return y(0); })
        .y1(function(d) { return y(d.value); });

    var l = d3.svg.line()
        .interpolate("step-after")
        .x(function(d) { return x(d.time); })
        .y(function(d) { return y(d.value); });

    var g = svg.append("svg:g")
        .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

    g.append("svg:g").attr("class", "y axis").call(yAxis);
    g.append("svg:path").attr("class", "area");
    g.append("svg:g").attr("class", "x axis").call(xAxis);
    g.append("svg:path").attr("class", "line");
  }

  function resize() {
    var transition = area.transition();

    if (mode == "edit") {
      var innerSize = area.innerSize();

      transition.select(".query")
          .style("width", innerSize[0] - 12 + "px")
          .style("height", innerSize[1] - 58 + "px");

      transition.select(".time select")
          .style("width", innerSize[0] - 174 + "px");

    } else {
      var z = board.squareSize(),
          w = area.size()[0] * z - m[1] - m[3],
          h = area.size()[1] * z - m[0] - m[2];

      x.range([0, w]);
      y.range([h, 0]);

      // Adjust the ticks based on the current chart dimensions.
      xAxis.ticks(w / 80).tickSize(-h, 0);
      yAxis.ticks(h / 25).tickSize(-w, 0);

      transition.select("svg")
          .attr("width", w + m[1] + m[3])
          .attr("height", h + m[0] + m[2]);

      transition.select(".area")
          .attr("d", a(data));

      transition.select(".x.axis")
          .attr("transform", "translate(0," + h + ")")
          .call(xAxis)
        .select("path")
          .attr("transform", "translate(0," + (y(0) - h) + ")");

      transition.select(".y.axis")
          .attr("transform", "translate(" + w + ",0)")
          .call(yAxis);

      transition.select(".line")
          .attr("d", l(data));
    }
  }

  function redraw() {
    if (data.length > 1) data[data.length - 1].value = data[data.length - 2].value;

    var z = board.squareSize(),
        h = area.size()[1] * z - m[0] - m[2],
        min = d3.min(data, cube_piece_areaValue),
        max = d3.max(data, cube_piece_areaValue);

    if ((min < 0) && (max < 0)) max = 0;
    else if ((min > 0) && (max > 0)) min = 0;
    y.domain([min, max]).nice();

    div.select(".area").attr("d", a(data));
    div.select(".y.axis").call(yAxis.tickFormat(cube_piece_format(y.domain())));
    div.select(".x.axis").call(xAxis).select("path").attr("transform", "translate(0," + (y(0) - h) + ")");
    div.select(".line").attr("d", l(data));
    return true;
  }

  function querychange() {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(area.edit, 750);
  }

  function serialize(json) {
    json.type = "area";
    json.query = query.property("value");
  }

  function deserialize(json) {
    if (mode == "edit") {
      query.property("value", json.query);
    } else {
      var params = cubeParseQueryString(json.query);
      var expression = params['expression'];
      var dt1 = params['step'];
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
      t1 = new Date(Math.floor(t1.getTime() / dt1) * dt1);

      var d0 = x.domain();
      var d1 = [t0, t1];

      if (dt0 != dt1) {
        data = [];
        dt0 = dt1;
      }

      if (d0 != d1 + "") {
        x.domain(d1);
        resize();
        var times = data.map(cube_piece_areaTime);
        data = data.slice(d3.bisectLeft(times, t0), d3.bisectLeft(times, t1));
        data.push({time: t1, value: 0});
      }

      if (timeout) timeout = clearTimeout(timeout);

      var url = "http://" + cube['evaluator-http-host'] + ":" + cube['evaluator-http-port'] + "/1.0/metric";
      var qry = "?expression=" + expression + "&start=" + cube_time(t0) + "&stop=" + cube_time(t1) + "&step=" + dt1;

      $.getJSON(url + qry, function(a) {
        data = [];
        a.forEach(function(d) {
          d.time = cube_time.parse(d.time);
          data.push(d);
        });
        d3.timer(redraw);
      });
      timeout = setTimeout(function() {deserialize(json);}, 3000 + (Math.random() * 5000));

    }
  }

  area.copy = function() {
    return board.add(cube.piece.type.area);
  };

  resize();

  return area;
};

function cube_piece_areaTime(d) {
  return d.time;
}

function cube_piece_areaValue(d) {
  return d.value;
}

var cube_piece_formatNumber = d3.format(".2r");

function cube_piece_areaMultipler(step) {
  return step / (step === 2e4 ? 20
      : step === 3e5 ? 5
      : 1);
}

function cube_piece_format(domain) {
  var prefix = d3.formatPrefix(Math.max(-domain[0], domain[1]), 2);
  return function(value) {
    return cube_piece_formatNumber(value * prefix.scale) + prefix.symbol;
  };
}
