import User from '../models/user';
import jwt from 'jsonwebtoken';
import marked from 'marked';
import fs from 'fs';

// Index page with the API guide
export function getIndex(req, res) {
  const path = 'README.md';
  fs.readFile(path, 'utf8', (err, data) => {
    if(err) {
      console.log(err);
    }
    res.send(marked(data.toString()));
  });
}

export function postAuth(req, res) {
// Checks the username and password from the DB
// and returns a JWT authorization token on success
    User.findOne({
        name: req.body.name
    }, (err, user) => {

        if (err) throw err;

        if (user && user.verifyPassword(req.body.password)) {
            // on successful authorizaton, create a new authorization token (JWT) and return it
            const payload = { user: user.name };
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
      return res.send(err);
    }
    res.json({ message: 'New User added!', data: user });
  });
}
