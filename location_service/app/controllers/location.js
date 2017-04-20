import config from '../../config'
import redis from 'redis'
import georedis from 'georedis'
import geolib from 'geolib'
import winston from 'winston'

const client = redis.createClient(config.db.port, config.db.host);
const geo = georedis.initialize(client, {
  zset: 'userLocations',
  nativeGeo: true
});

function populateModel(req) {
  let location = {}
  location.latitude = req.body.latitude;
  location.longitude = req.body.longitude;
  location.timestamp = Date.now();
  return location;
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

function extractUserId(req){
  return req.user.id
}

export function getNearbyUsers(req, res) {
  // addTmpLocations()
  const userId = extractUserId(req)
  const options = {
    withCoordinates: true, // Will provide coordinates with locations, default false
    withHashes: false, // Will provide a 52bit Geohash Integer, default false
    withDistances: true, // Will provide distance from query, default false
    order: 'ASC', // or 'DESC' or true (same as 'ASC'), default false
    units: 'm', // or 'km', 'mi', 'ft', default 'm'
    count: 100, // Number of results to return, default undefined
    accurate: false // Useful if in emulated mode and accuracy is important, default false
  };

  geo.nearby(userId, 5000, options, (err, locations) => {
    if(err) {
      winston.error(err)
      return res.send(err);
    }
    let transformedLocations = transformLocations(userId, locations)
    res.json(transformedLocations)
  })
}

export function removeExpiredLocations() {
  let expiredDateLimit = Date.now() - (config.cache.TTL);

  client.zrangebyscore('TTL', '-inf', expiredDateLimit, (err, expiredLocationEntries) => {
    if (err) {
      winston.error(err)
      return;
    }
    if (expiredLocationEntries.length == 0){
      return;
    }
    geo.removeLocations(expiredLocationEntries, (removeLocationsError, removeLocationsReply) => {
      if (removeLocationsError){
        winston.error(removeLocationsError);
        return;
      }
      client.zremrangebyscore('TTL', '-inf', expiredDateLimit, (zremrangebyscoreError, zremrangebyscoreReply) => {
        if (zremrangebyscoreError){
          winston.error(zremrangebyscoreError);
          return;
        }
        winston.info("deleted expired location entries: "+expiredLocationEntries.length)
      });
    });
  });

}

export function getLocation(req, res) {
  const userId = extractUserId(req)
  geo.location(userId, (err, location) => {
    if(err) {
      winston.error(err)
      return res.send(err);
    }
    return res.json(location);
  })
}

let tmpMultiplier = 0

function addTmpLocations() {
  let lat = 37.406366+ tmpMultiplier*0.00005
  console.log(lat)
  geo.addLocation(1234571, {latitude: lat, longitude: -121.939781})
  // console.log("SEVERI")
  // client.zadd("TTL", user.timestamp, 1234571);
  // geo.addLocation(9, {latitude: 37.406368, longitude: -121.939781});
  // client.zadd("TTL", user.timestamp, 9);
  // geo.addLocation(99, {latitude: user.latitude+, longitude: -121.939781});
  // client.zadd("TTL", user.timestamp, 99);

  // // should not be visible
  // geo.addLocation(6, {latitude: 17.406366, longitude: -21.939781});
  // client.zadd("TTL", user.timestamp, 6);

  if (tmpMultiplier>40) {
    tmpMultiplier--
  } else {
    tmpMultiplier++
  }
}

export function setLocation(req, res) {
  const userId = extractUserId(req)
  let location = populateModel(req);

  client.zadd("TTL", location.timestamp, userId);
  geo.addLocation(userId, {latitude: location.latitude, longitude: location.longitude}, (err, reply) => {
    if(err) {
      winston.error(err)
      return res.send(err)
    }
    return res.json(reply)
  })
}
