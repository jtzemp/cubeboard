cube.piece.type.script = function(board) {
  var timeout;

  var script = cube.piece(board)
      .on("size", resize)
      .on("serialize", serialize)
      .on("deserialize", deserialize);

  var div = d3.select(script.node())
      .classed("script", true);

  if (mode == "edit") {
    div.append("h3")
        .attr("class", "title")
        .text("JavaScript Snippet");

    var content = div.append("textarea")
        .attr("class", "content")
        .attr("placeholder", "javascript+jquery…")
        .on("keyup.text", textchange)
        .on("focus.text", script.focus)
        .on("blur.text", script.blur);
  }

  function resize() {
    var transition = script.transition(),
        innerSize = script.innerSize();

    if (mode == "edit") {
      transition.select(".content")
          .style("width", innerSize[0] - 12 + "px")
          .style("height", innerSize[1] - 34 + "px");
    } else {
      transition
          .style("font-size", innerSize[0] / 12 + "px")
          .style("margin-top", innerSize[1] / 2 + innerSize[0] / 5 - innerSize[0] / 12 + "px");
    }
  }

  function textchange() {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(script.edit, 750);
  }

  function serialize(json) {
    json.type = "script";
    json.content = content.property("value");
  }

  function deserialize(json) {
    if (mode == "edit") {
      content.property("value", json.content);
    } else {
      var id = "piece" + json.id;
      div.attr('id', id);

      var code = '(function(id) {\n' + json.content + '\n})("' + id + '");';
      var head = document.getElementsByTagName('head')[0];
      var selt = document.createElement('script');
      selt.type = 'text/javascript';
      selt.appendChild(document.createTextNode(code));
      head.appendChild(selt);
    }
  }

  script.copy = function() {
    return board.add(cube.piece.type.script);
  };

  resize();

  return script;
};
