import express 	from 'express'
import bodyParser from 'body-parser'
import mongoose	from 'mongoose'
import bcrypt from 'bcrypt-nodejs'
import jwt from 'express-jwt'

import config from './config'
import {getIndex, postAuth, postUser} from './app/controllers/main'

// Config ==============================================================================

const database = 'mongodb://'+config.db.host+':'+config.db.host
mongoose.connect(database);

let app = express();
const port = config.app.port

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('secret', config.secret);

// Routes ==============================================================================

let router = express.Router();
let checkAccess = jwt({secret: app.get('secret')});

app.use('/', router);
router.route('/authenticate/auth')
	.post(postAuth);

router.route('/authenticate/create_user')
	.post(postUser)


// Server Start ========================================================================

app.listen(port);
console.log('Serving on http://localhost:' + port);
