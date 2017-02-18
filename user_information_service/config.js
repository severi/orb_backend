module.exports = {
	'secret': process.env.JWT_PASSWORD,
	'db': {
		'host': 'user_information_db',
		'port': 27017
	},
	'app': {
		'port': 8080
	}
};