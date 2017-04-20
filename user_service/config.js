module.exports = {
	'secret': process.env.JWT_PASSWORD,
	'db': {
		'host': 'user_db',
		'port': 27017
	},
	'app': {
		'port': 8080
	},
  'logger': {
    'level': process.env.LOG_LEVEL
  }
};
