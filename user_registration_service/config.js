module.exports = {
	'secret': process.env.JWT_PASSWORD,
	'db': {
		'host': 'orb-db',
		'port': 27017
	},
	'app': {
		'port': 8080
	}
};