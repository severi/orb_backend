module.exports = {
  'secret': process.env.JWT_PASSWORD,
  'db': {
    'host': 'user_location_db',
    'port': 6379
  },
  'app': {
    'port': 8080
  },
  'logger': {
    'level': process.env.LOG_LEVEL
  },
	'cache': {
    'TTL_enabled': (process.env.LOCATION_TTL_ENABLED == 'true'),
    'TTL': process.env.LOCATION_TTL_VALUE_SECONDS*1000,
    'checkForExpiredEntriesInterval': process.env.EXPIRED_LOCATION_CHECK_INTERVAL*1000
  }
};
