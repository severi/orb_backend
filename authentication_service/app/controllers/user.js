var User = require('../models/user');

// var userExcludes = { 'password': 0, '__v': 0, 'following': 0 };
var userExcludes = {};

function populateModel(req, userModel) {
  userModel.id = req.body.id;
  userModel.password = req.body.password;
  return userModel;
}


// POST /api/users
exports.postUser = function(req, res) {
  console.log("TADAAA")
  var user = new User();
  user = populateModel(req, user);

  user.save(function(err) {
    if (err) {
      console.log("VIRHE");
      return res.send(err);
    }

    console.log("toimii")
    res.json({ message: 'New User added!', data: user });
  });
};

