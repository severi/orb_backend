import User from '../models/user'
import jwt from 'jsonwebtoken'
import marked from 'marked'
import fs from 'fs'
import winston from 'winston'

export function postAuth(req, res) {
  // Checks the email and password from the DB
  // and returns a JWT authorization token on success
  User.findOne({
      email: req.body.email
  }, (err, user) => {
    if (err) {
      throw err
    }
    if (user && user.verifyPassword(req.body.password)) {
        // on successful authorizaton, create a new authorization token (JWT) and return it
        const payload = { user: user.email };
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
  userModel.email = req.body.email;
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
      return res.send(err);
    }
    res.json({ message: 'New User added!', data: user });
  });
}
