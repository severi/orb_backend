import express from 'express'
import bodyParser from 'body-parser'
import bcrypt from 'bcrypt-nodejs'
import jwt from 'express-jwt'
import uuid from 'uuid'
import winston from 'winston'
import config from './config'
import {registerUser, login} from './app/controllers/user'

// Config ==============================================================================

const app = express();
const port = config.app.port;

winston.level = config.logger.level;
const correlationId = function (req, res, next) {
  let correlationId = req.get("x-correlation-id")
  if (correlationId == undefined){
    correlationId = uuid.v1()
    req.headers["x-correlation-id"] = correlationId
  }
  res.set("x-correlation-id", correlationId)
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

app.use('/user', router);

router.route('/register')
	.post(registerUser)

router.route('/login')
  .post(login);

// Server Start ========================================================================

app.listen(port);
console.log('Serving on http://localhost:' + port);
