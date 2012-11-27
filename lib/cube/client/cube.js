cube = {version: "0.0.1"};

var cube_time = d3.time.format.iso;

var cubeParseQueryString = function(string) {
    var params = {}, queries, tmp, i, l; 
    queries = string.split("&");
    for (i = 0, l = queries.length; i < l; i++) {
        tmp = queries[i].split('=');
        params[tmp[0]] = tmp[1];
    }
    return params;
};
