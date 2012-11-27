cube.piece.type.html = function(board) {
  var timeout;

  var html = cube.piece(board)
      .on("size", resize)
      .on("serialize", serialize)
      .on("deserialize", deserialize);

  var div = d3.select(html.node())
      .classed("html", true);

  if (mode == "edit") {
    div.append("h3")
        .attr("class", "title")
        .text("HTML Snippet");

    var content = div.append("textarea")
        .attr("class", "content")
        .attr("placeholder", "HTML snippet…")
        .on("keyup.text", textchange)
        .on("focus.text", html.focus)
        .on("blur.text", html.blur);
  }

  function resize() {
    var transition = html.transition(),
        innerSize = html.innerSize();

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
    timeout = setTimeout(html.edit, 750);
  }

  function serialize(json) {
    json.type = "html";
    json.divid = 
    json.content = content.property("value");
  }

  function deserialize(json) {
    if (mode == "edit") {
      content.property("value", json.content);
    } else {
      div.html(json.content);
    }
  }

  html.copy = function() {
    return board.add(cube.piece.type.html);
  };

  resize();

  return html;
};
