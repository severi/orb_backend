import express from 'express';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt-nodejs';
import expressJwt from 'express-jwt';
import config from './config';
import {getNearbyUsers, removeExpiredLocations, getLocation, setLocation} from './app/controllers/location';
import {getIndex} from './app/controllers/general';
import timers from 'timers';

// Config ==============================================================================

const app = express();
const port = config.app.port;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('secret', config.secret);

// Routes ==============================================================================

const router = express.Router();
const checkAccess = expressJwt({secret: app.get('secret')});

app.use('/', router);

router.route('/test')
	.get(getIndex);

router.route('/user/location/:id')
	.get(checkAccess, getLocation)
	.post(checkAccess, setLocation);

router.route('/user/nearby/:id')
	.get(checkAccess, getNearbyUsers);

// Server Start ========================================================================

app.listen(port);
console.log('Serving on http://localhost:' + port);
if (config.cache.TTL_enabled){
    timers.setInterval(removeExpiredLocations, config.cache.checkForExpiredEntriesInterval)
}
