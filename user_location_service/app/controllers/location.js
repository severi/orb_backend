var redis    = require('redis');
var config = require('../../config');

var client = redis.createClient(config.db.port, config.db.host);


function populateModel(req) {
  user = {}
  user.latitude = req.body.latitude;
  user.longitude = req.body.longitude;
  user.timestam = new Date();
  return user;
}


exports.getLocation = function(req, res) {
  client.get(req.params.id, function(err, reply) {
    // reply is null when the key is missing
    console.log(reply);
    res.json(JSON.parse(reply));
  });
};

exports.setLocation = function(req, res) {
  let user = populateModel(req);
  client.set(req.params.id, JSON.stringify(user))
  res.json({ message: 'Location set!', data: user});
};
