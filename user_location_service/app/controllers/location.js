
var config = require('../../config');

var redis  = require('redis'),
    client = redis.createClient(config.db.port, config.db.host);
var geo    = require('georedis').initialize(client)

// geo.addLocation("test1", {latitude: 12.2312, longitude: 62.1232}, function(err, reply){
//   if(err) console.error(err)
//   else console.log('added location:', reply)
// });

// geo.addLocation("test2", {latitude: 12.23123, longitude: 62.12323}, function(err, reply){
//   if(err) console.error(err)
//   else console.log('added location:', reply)
// });

function populateModel(req) {
  user = {}
  user.latitude = req.body.latitude;
  user.longitude = req.body.longitude;
  user.timestamp = Date.now(); 
  return user;
}


exports.getNearbyUsers = function(req, res) {
  var options = {
    withCoordinates: true, // Will provide coordinates with locations, default false
    withHashes: false, // Will provide a 52bit Geohash Integer, default false
    withDistances: true, // Will provide distance from query, default false
    order: 'ASC', // or 'DESC' or true (same as 'ASC'), default false
    units: 'm', // or 'km', 'mi', 'ft', default 'm'
    count: 100, // Number of results to return, default undefined
    accurate: false // Useful if in emulated mode and accuracy is important, default false
  }

  geo.nearby(req.params.id, 5000, options, function(err, locations){
    if(err) {
      console.error(err)
      return res.send(err);
    }
    locations = locations.filter(function( obj ) { // filter out user's own location
      return obj.key !== req.params.id;
    });
    res.json(locations)
  })
};

exports.removeExpiredLocations = function() {
  let expiredDateLimit = Date.now() - (config.cache.TTL*1000);

  client.zrangebyscore('TTL', '-inf', expiredDateLimit, function(err, reply){
    if (err) {
      console.log(err)
      return;
    }
    if (reply.length == 0){
      console.log("nothing to remove");
      return;
    }
    console.log("moi")
    console.log(reply);
    console.log("hei")
    geo.removeLocations(reply, function(err1, reply1){
      if (err1){
        console.log(err1);
        return;
      }
      console.log("deleted");
      console.log(reply1);
      client.zremrangebyscore('TTL', '-inf', expiredDateLimit, function(err2, reply2){
        if (err2){
          console.log(err2);
          return;
        }
        console.log("EVERYTHING DELETED");
      });
    });
  });

}

exports.getLocation = function(req, res) {
  geo.location(req.params.id, function(err, location){
    if(err) {
      console.error(err)
      return res.send(err);
    }
    console.log(location)
    return res.json(location);
  })
};


exports.setLocation = function(req, res) {
  let user = populateModel(req);

  client.zadd("TTL", user.timestamp, req.params.id);
  client.zadd("TTL", user.timestamp, req.params.id+1);
  client.zadd("TTL", user.timestamp+5, req.params.id+2);
  client.zadd("TTL", user.timestamp, req.params.id);

  geo.addLocation(req.params.id, {latitude: user.latitude, longitude: user.longitude}, function(err, reply){
    if(err) {
      console.error(err)
      return res.send(err);
    }
    return res.json(reply);
  });
};
