var express 	= require('express');
var bodyParser  = require('body-parser');
var bcrypt = require('bcrypt-nodejs');
var expressJwt = require('express-jwt');

var config = require('./config');
var locationCtrl = require('./app/controllers/location');
var generalCtrl = require('./app/controllers/general');

// Config ==============================================================================

var app = express();
var port = config.app.port

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('secret', config.secret);

// Routes ==============================================================================

var router = express.Router();
var checkAccess = expressJwt({secret: app.get('secret')});

app.use('/', router);

router.route('/test')
	.get(generalCtrl.getIndex);

router.route('/user/location/:id')
	.get(checkAccess, locationCtrl.getLocation)
	.post(checkAccess, locationCtrl.setLocation);

// Server Start ========================================================================

app.listen(port);
console.log('Serving on http://localhost:' + port);