import express from 'express'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt-nodejs'
import jwt from 'express-jwt'
import uuid from 'uuid'
import winston from 'winston'
import config from './config'
import {getUsers, getUser, postUser, deleteUser, putUser} from './app/controllers/user'
import {getIndex} from './app/controllers/general'

// Config ==============================================================================

const database = 'mongodb://'+config.db.host+':'+config.db.host
mongoose.connect(database);

const app = express();
const port = config.app.port;

winston.level = config.logger.level;
const correlationId = function (req, res, next) {
  let correlationId = req.get("x-correlation-id");
  if (correlationId == undefined){
    correlationId = uuid.v1()
    req.headers["x-correlation-id"] = correlationId
  }
  next()
}

const requestLogger = function (req, res, next) {
  let correlationId = req.get("x-correlation-id");
  winston.debug("Received: "+req.method+" "+req.url+", cid: "+req.get("x-correlation-id"))
  next()
}

app.use(correlationId)
app.use(requestLogger)
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
