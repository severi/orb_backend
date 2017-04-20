import User from '../models/user'
import jwt from 'jsonwebtoken'
import marked from 'marked'
import fs from 'fs'
import winston from 'winston'

export function postAuth(req, res) {
  // Checks the id and password from the DB
  // and returns a JWT authorization token on success

  User.findOne({
      id: req.body.id
  }, (err, user) => {
    if (err) {
      winston.error("Cid: "+cid+" "+err)
      return res.status(500).end("Internal Server Error")
    }
    if (user && user.verifyPassword(req.body.password)) {
        // on successful authorizaton, create a new authorization token (JWT) and return it
        const payload = { id: user.id };
        const token = jwt.sign(payload, req.app.get('secret'), {
            expiresIn: 3600     // expires in seconds
        });

        res.json({
            success: true,
            message: 'You are tokenized!',
            token: token
        });
    }

    else {
        res.json({ success: false, "message": "Authorizaton failed." });
    }
  });
}


function populateModel(req, userModel) {
  userModel.id = req.body.id;
  userModel.password = req.body.password;
  return userModel;
}

export function postUser(req, res) {
  let user = new User();
  user = populateModel(req, user);

  user.save(err => {
    if (err) {
      winston.error("Failed to create authentication entry, cid: "+req.get("x-correlation-id"))
      winston.error(err)
      return res.status(500).end("Internal Server Error");
    }
    res.json({ message: 'New User added!', data: user });
  });
}
