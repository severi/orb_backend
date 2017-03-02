import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt-nodejs';
import jwt from 'express-jwt';
import config from './config';
import {getUsers, getUser, postUser, deleteUser, putUser} from './app/controllers/user';
import {getIndex} from './app/controllers/general';

// Config ==============================================================================

const database = 'mongodb://'+config.db.host+':'+config.db.host
mongoose.connect(database);

const app = express();
const port = config.app.port;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('secret', config.secret);

// Routes ==============================================================================

const router = express.Router();
const checkAccess = jwt({secret: app.get('secret')});

app.use('/', router);

router.route('/users/')
	.get(checkAccess, getUsers)
	.post(postUser)

router.route('/users/:id')
	.get(checkAccess, getUser)
	.delete(checkAccess, deleteUser)
	.put(checkAccess, putUser);

// Server Start ========================================================================

app.listen(port);
console.log('Serving on http://localhost:' + port);
