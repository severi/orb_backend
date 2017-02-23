import express from 'express';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt-nodejs';
import expressJwt from 'express-jwt';
import config from './config';
import {registerUser} from './app/controllers/user';
import {getIndex} from './app/controllers/general';

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

router.route('/register')
	.post(registerUser)

// Server Start ========================================================================

app.listen(port);
console.log('Serving on http://localhost:' + port);
