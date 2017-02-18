var express 	= require('express');
var bodyParser  = require('body-parser');
var mongoose    = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var expressJwt = require('express-jwt');

var config = require('./config');
var userCtrl = require('./app/controllers/user');
var generalCtrl = require('./app/controllers/general');

// Config ==============================================================================

let database = 'mongodb://'+config.db.host+':'+config.db.host
mongoose.connect(database);

var app = express();
var port = config.app.port

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('secret', config.secret);

// Routes ==============================================================================

var router = express.Router();
var checkAccess = expressJwt({secret: app.get('secret')});

app.use('/', router);

// NOTE: Add 'checkAccess' method to the route chain to require JWT authorization

router.route('/test')							// index page
	.get(generalCtrl.getIndex);

router.route('/authenticate')				// auhtorize user and return token
	.post(generalCtrl.postAuth);

router.route('/create_user')
	.post(userCtrl.postUser)


// Server Start ========================================================================

app.listen(port);
console.log('Serving on http://localhost:' + port);