var jwt = require('jsonwebtoken');

var marked = require('marked');
var fs = require('fs');

// Index page with the API guide
exports.getIndex = function(req, res) {
  var path = 'README.md';
  fs.readFile(path, 'utf8', function(err, data) {
    if(err) {
      console.log(err);
    }
    res.send(marked(data.toString()));
  });
};
