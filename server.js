var express 	= require('express');
var bodyParser  = require('body-parser');
var mongoose    = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var expressJwt = require('express-jwt');

var config = require('./config');
var userCtrl = require('./app/controllers/user');
var generalCtrl = require('./app/controllers/general');

// Config ==============================================================================

mongoose.connect(config.database);

var app = express();
var port = process.env.PORT || 8080;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('secret', config.secret);

// Routes ==============================================================================

var router = express.Router();
var checkAccess = expressJwt({secret: app.get('secret')});

app.use('/', router);

// NOTE: Add 'checkAccess' method to the route chain to require JWT authorization

router.route('/')							// index page
	.get(generalCtrl.getIndex);

router.route('/auth')						// auhtorize user and return token
	.post(generalCtrl.postAuth);

router.route('/api/users')					// Fetch and create users
	.get(checkAccess, userCtrl.getUsers)
	.post(userCtrl.postUser)

router.route('/api/users/:id')				// Manipulate existing users
	.get(checkAccess, userCtrl.getUser)
	.delete(checkAccess, userCtrl.deleteUser)
	.put(checkAccess, userCtrl.putUser);

// Server Start ========================================================================

app.listen(port);
console.log('Serving on http://localhost:' + port);