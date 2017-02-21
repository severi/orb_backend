
import config from '../../config'
import redis from 'redis'
import georedis from 'georedis'
import geolib from 'geolib'

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


function transformLocations(userId, locations) {
  let user_location = locations.filter(obj => obj.key == userId)[0]
  locations = locations.filter(obj => obj.key !== userId).map(obj =>
  {
    let bearing = geolib.getBearing(
      {latitude: user_location.latitude, longitude: user_location.longitude},
      {latitude: obj.latitude, longitude: obj.longitude}
    )
    return {
      id: obj.key,
      distance: obj.distance,
      bearing: bearing
    }
  })

  return locations
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
    let transformedLocations = transformLocations(req.params.id, locations)
    res.json(transformedLocations)
  })
}

export function removeExpiredLocations() {
  let expiredDateLimit = Date.now() - (config.cache.TTL);

  client.zrangebyscore('TTL', '-inf', expiredDateLimit, (err, expiredLocationEntries) => {
    if (err) {
      console.log(err)
      return;
    }
    if (expiredLocationEntries.length == 0){
      return;
    }
    geo.removeLocations(expiredLocationEntries, (removeLocationsError, removeLocationsReply) => {
      if (removeLocationsError){
        console.log(removeLocationsError);
        return;
      }
      client.zremrangebyscore('TTL', '-inf', expiredDateLimit, (zremrangebyscoreError, zremrangebyscoreReply) => {
        if (zremrangebyscoreError){
          console.log(zremrangebyscoreError);
          return;
        }
        console.log("deleted expired location entries")
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

function addTmpLocations(user) {
  geo.addLocation(123457, {latitude: 37.406366, longitude: -121.939781});
  // geo.addLocation(9, {latitude: user.latitude, longitude: user.longitude+1});
  // geo.addLocation(99, {latitude: user.latitude+1, longitude: user.longitude+1});
}

export function setLocation(req, res) {
  let user = populateModel(req);
  addTmpLocations(user);

  client.zadd("TTL", user.timestamp, req.params.id);
  geo.addLocation(req.params.id, {latitude: user.latitude, longitude: user.longitude}, (err, reply) => {
    if(err) {
      console.error(err)
      return res.send(err);
    }
    return res.json(reply);
  });
}
