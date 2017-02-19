module.exports = {
	'secret': process.env.JWT_PASSWORD,
	'db': {
		'host': 'user_location_db',
		'port': 6379
	},
	'app': {
		'port': 8080
	},
	'cache': {
		'TTL_enabled': (process.env.LOCATION_TTL_ENABLED == 'true'),
		'TTL': 10
	}
};