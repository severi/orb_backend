import axios from 'axios'
import winston from 'winston'
import jwt from 'jsonwebtoken'
import User from '../models/user'

function populateModel(userInformation, userModel) {
  userModel.id = userInformation.id;
  userModel.name = userInformation.name;
  userModel.age = userInformation.age;
  userModel.gender = userInformation.gender;
  userModel.note = userInformation.note;
  userModel.email = userInformation.email;
  return userModel;
}

axios.interceptors.request.use(
  config => {
    winston.debug("-->: "+config.method +" "+config.url +", cid: "+config.headers["x-correlation-id"])
    return config;
  },
  error => {
    winston.error("error occured")
    return Promise.reject(error);
  }
)

axios.interceptors.response.use(
  response => {
    winston.debug("<--: "+response.status+" for: "+ response.config.method +" "+response.config.url +", cid: "+response.headers["x-correlation-id"])
    return response;
  },
  error => {
    winston.error("error occured")
    return Promise.reject(error);
  }
)

function getBaseConfig(baseUrl, cid, token){
  let config = {
    baseURL: baseUrl,
    headers: {'x-correlation-id': cid}
  }
  if (token) {
    config.headers = {
      'Authorization': 'Bearer '+token,
      ...config.headers
    }
  }
  return config;
}

function getAuthConfig(cid, token) {
  const baseUrl = 'http://authentication_service:8080'
  let config = getBaseConfig(baseUrl, cid, token)
  return config;
}

function getCorrelationId(req){
  return req.get('x-correlation-id')
}

export function registerUser(req, res) {
  let cid = getCorrelationId(req)

  let user = new User();
  user = populateModel(req.body, user);

  user.save(err => {

    if (err) {
      winston.error("Cid: "+cid+" "+err);
      return res.status(500).end("Internal Server Error");
    }

    let userId = user._id //TODO: id instead of _id
    axios.post('/user/authenticate/create_user', {
      id: userId,
      password: req.body.password
    },
      getAuthConfig(cid)
    )
    .then(authResponse => {
      winston.info("Cid: "+cid+" New user created successfully")
      res.send('OK')
    })
    .catch(authError => {
      winston.error("Cid: "+cid+" Error occured when creating new user entry to authentication_service")
      winston.error("Cid: "+cid+" "+authError)
      res.status(500).end("Internal Server Error");
    })

  });
}

export function login(req, res) {
  let cid = getCorrelationId(req)

  const payload = { type: "internal" };
  const token = jwt.sign(payload, req.app.get('secret'), {
    expiresIn: 30     // expires in seconds
  });

  User.findOne({ 'email': req.body.email }, function (err, user) {
    if (err) {
      winston.error("Cid: "+cid+" "+err);
      return res.status(500).end("Internal Server Error");
    }

    axios.post('/user/authenticate/auth', {
      id: user._id,
      password: req.body.password
    },
      getAuthConfig(cid)
    )
    .then(authResponse => {
      winston.info("Cid: "+cid+" User autheticated: "+(authResponse.data.success?"success":"failed"))
      res.json(authResponse.data)
    })
    .catch(authError => {
      winston.error("Cid: "+cid+" "+authError)
      res.status(500).end("Internal Server Error");
    })

  })
}

