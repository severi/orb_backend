import axios from 'axios';
import winston from 'winston'

axios.interceptors.request.use(
  config => {
    winston.debug("-->: "+config.method +" "+config.url +", cid: "+config.headers["x-correlation-id"])
    return config;
  },
  error => {
    winston.warn("error occured")
    return Promise.reject(error);
  }
)

axios.interceptors.response.use(
  response => {
    winston.debug("<--: "+response.status+" for: "+ response.config.method +" "+response.config.url +", cid: "+response.headers["x-correlation-id"])
    return response;
  },
  error => {
    winston.warn("error occured")
    return Promise.reject(error);
  }
)

function getBaseConfig(baseUrl, cid){
  let config = {
    baseURL: baseUrl,
    headers: {'x-correlation-id': cid}
  }
  return config;
}

function getAuthConfig(cid) {
  const baseUrl = 'http://authentication_service:8080'
  let config = getBaseConfig(baseUrl, cid)
  return config;
}

function getUserInformationConfig(cid) {
  const baseUrl = 'http://user_information_service:8080'
  let config = getBaseConfig(baseUrl, cid)
  return config
}

function createUser(req){
  let cid = getCorrelationId(req)
  let user = req.body
  axios.post('/users', {
    id : user.id,
    name : user.name,
    age : user.age,
    gender : user.gender,
    note : user.note,
    email: user.email
  },
    getUserInformationConfig(cid)
  )
}

function createUserAuthentication(req){
  let cid = getCorrelationId(req)
  let user = req.body
  axios.post('/authenticate/create_user', {
    id: user.id,
    password: user.password
  },
    getAuthConfig(cid)
  )
}

function getCorrelationId(req){
  return req.get('x-correlation-id')
}

export function registerUser(req, res) {
  axios.all([createUserAuthentication(req), createUser(req)])
  .then(axios.spread((acct, perms) => {
    res.json({ message: 'New User added!' });
  }));
}
