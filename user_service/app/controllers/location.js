import axios from 'axios'
import winston from 'winston'
import jwt from 'jsonwebtoken'
import User from '../models/user'
import mongoose from 'mongoose'

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

function getLocationServiceConfig(cid, token) {
  const baseUrl = 'http://location_service:8080'
  let config = getBaseConfig(baseUrl, cid, token)
  return config;
}

function getCorrelationId(req){
  return req.get('x-correlation-id')
}

export function getNearbyUsers(req, res) {
  let cid = getCorrelationId(req)

  const payload = { type: "internal" };
  const token = req.get('authorization').substring(7)

  axios.get("/user/location/nearby", getLocationServiceConfig(cid, token))
    .then(response => {

      console.log("HELLOU")
      console.log(response.data)
      let persons = response.data
      const ids = []
      for (var i = 0; i < persons.length; i++) { // TODO tee siistimpi
        // ids.push(mongoose.Types.ObjectId(persons[i].id))
        ids.push(persons[i].id)
      }

      User.find({
        '_id': { $in: ids}
      }, (err, users) => {
        if (err) {
          winston.error("Cid: "+cid+" "+err);
          return res.status(500).end("Internal Server Error");
        }

        console.log(users);

        for (var i = 0; i < persons.length; i++) { // TODO tee siistimpi

          for (var j = 0; j < users.length; j++) {
            let currentUser = users[j]
            console.log("asd")
            console.log(currentUser)
            console.log(currentUser._id)

            console.log(persons[i].id+" "+currentUser._id)
            if (currentUser._id == persons[i].id){
              persons[i]["user_information"] = currentUser
            }
          }

        }

        console.log("HHHEHHEHEHE")
        console.log(persons)

        return res.json(persons);
      })
    })
    .catch(error => {
      winston.error("Cid: "+cid+" "+error);
      return res.status(500).end("Internal Server Error");
    })

}

