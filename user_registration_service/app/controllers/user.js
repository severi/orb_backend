var axios   = require('axios');

function getAuthConfig(token) {
  let config = {
    baseURL: 'http://authentication_service:8080',
    headers: {}
  }
  if (token) {
    config.headers = {
      'Authorization': 'Bearer '+token
    }
  }
  return config;
}

function getUserInformationConfig(token) {
  let config = {
    baseURL: 'http://user_information_service:8080',
    headers: {}
  }
  if (token) {
    config.headers = {
      'Authorization': 'Bearer '+token
    }
  }
  return config;
}

function createUser(user){
  axios.post('/api/users', {
    id : user.id,
    name : user.name,
    age : user.age,
    gender : user.gender,
    note : user.note,
    email: user.email
  },
  getUserInformationConfig())
  .then(function (response) {
    return response
  })
  .catch(function (error) {
    return error
  });
}

function createUserAuthentication(user){
  axios.post('/create_user', {
    id: user.id,
    password: user.password
  },
  getAuthConfig())
  .then(function (response) {
    return response
  })
  .catch(function (error) {
    return error  });
}

exports.registerUser = function(req, res) {
  axios.all([createUserAuthentication(req.body), createUser(req.body)])
  .then(axios.spread(function (acct, perms) {
    res.json({ message: 'New User added!' });
  }));
};
