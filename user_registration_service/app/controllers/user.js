import axios from 'axios';
import winston from 'winston'

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

function getCorrelationId(req){
  return req.get('x-correlation-id')
}

export function registerUser(req, res) {
  let cid = getCorrelationId(req)
  let user = req.body
  axios.post('/user/user_information', {
    name : user.name,
    age : user.age,
    gender : user.gender,
    note : user.note,
    email: user.email
  },
    getUserInformationConfig(cid)
  ).then(response => {
    let userId = response.data._id //TODO: id instead of _id
    axios.post('/user/authenticate/create_user', {
      id: userId,
      password: user.password
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
  })
  .catch(error => {
    winston.error("Cid: "+cid+" Error occured when creating new user entry to user_information_service")
    winston.error("Cid: "+cid+" "+error)
    res.status(500).end("Internal Server Error");
  })
}


function getUserId(response){
  return response.data[0]._id //TODO: id instead of _id
}

export function login(req, res) {
  let cid = getCorrelationId(req)
  let user = req.body

  let config = {
    params: {
      email: user.email
    },
    ...getUserInformationConfig(cid)
  }

  axios.get('/user/user_information', config)
  .then(function (response) {
    let userId = getUserId(response)

    axios.post('/user/authenticate/auth', {
      id: userId,
      password: user.password
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
  .catch(function (error) {
    winston.error("Cid: "+cid+" "+error)
    res.status(500).end("Internal Server Error");
  });
}

