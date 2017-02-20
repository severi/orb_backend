
import config from '../../config';
import redis from 'redis';
import georedis from 'georedis'

const client = redis.createClient(config.db.port, config.db.host);
const geo = georedis.initialize(client, {
  zset: 'userLocations',
  nativeGeo: true
});

function populateModel(req) {
  let user = {}
  user.latitude = req.body.latitude;
  user.longitude = req.body.longitude;
  user.timestamp = Date.now();
  return user;
}


export function getNearbyUsers(req, res) {
  const options = {
    withCoordinates: true, // Will provide coordinates with locations, default false
    withHashes: false, // Will provide a 52bit Geohash Integer, default false
    withDistances: true, // Will provide distance from query, default false
    order: 'ASC', // or 'DESC' or true (same as 'ASC'), default false
    units: 'm', // or 'km', 'mi', 'ft', default 'm'
    count: 100, // Number of results to return, default undefined
    accurate: false // Useful if in emulated mode and accuracy is important, default false
  };

  geo.nearby(req.params.id, 5000, options, (err, locations) => {
    if(err) {
      console.error(err)
      return res.send(err);
    }
    locations = locations.filter(obj => obj.key !== req.params.id); // filter out user's own location
    res.json(locations)
  })
}

export function removeExpiredLocations() {
  let expiredDateLimit = Date.now() - (config.cache.TTL*1000);

  client.zrangebyscore('TTL', '-inf', expiredDateLimit, (err, reply) => {
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
    geo.removeLocations(reply, (err1, reply1) => {
      if (err1){
        console.log(err1);
        return;
      }
      console.log("deleted");
      console.log(reply1);
      client.zremrangebyscore('TTL', '-inf', expiredDateLimit, (err2, reply2) => {
        if (err2){
          console.log(err2);
          return;
        }
        console.log("EVERYTHING DELETED");
      });
    });
  });

}

export function getLocation(req, res) {
  geo.location(req.params.id, (err, location) => {
    if(err) {
      console.log("error")
      console.error(err)
      return res.send(err);
    }
    console.log(location)
    return res.json(location);
  })
}

export function setLocation(req, res) {
  let user = populateModel(req);

  client.zadd("TTL", user.timestamp, req.params.id);

  geo.addLocation(req.params.id, {latitude: user.latitude, longitude: user.longitude}, (err, reply) => {
    if(err) {
      console.error(err)
      return res.send(err);
    }
    return res.json(reply);
  });
}
