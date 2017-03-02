import express from 'express'
import bodyParser from 'body-parser'
import bcrypt from 'bcrypt-nodejs'
import jwt from 'express-jwt'
import uuid from 'uuid';
import config from './config'
import {registerUser} from './app/controllers/user'
import {getIndex} from './app/controllers/general'

// Config ==============================================================================

const app = express();
const port = config.app.port;

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
  console.log('Incoming request, cid: '+req.get("x-correlation-id"))
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

router.route('/register')
	.post(registerUser)

// Server Start ========================================================================

app.listen(port);
console.log('Serving on http://localhost:' + port);
