module.exports = {
	'secret': process.env.JWT_PASSWORD,
	'db': {
		'host': 'authentication_db',
		'port': 27017
	},
	'app': {
		'port': 8080
	}
};