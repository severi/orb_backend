var User = require('../models/user');

var userExcludes = { 'password': 0, '__v': 0, 'following': 0 };
//var userExcludes = {};

function populateModel(req, userModel) {

  userModel.name = req.body.name;
  userModel.password = req.body.password;
  userModel.age = req.body.age;
  userModel.gender = req.body.gender;
  userModel.note = req.body.note;
  userModel.latitude = req.body.latitude;
  userModel.longitude = req.body.longitude;
  userModel.lastupdate = new Date().toISOString();
  userModel.following = req.body.following;

  return userModel;
}

// GET /api/users
exports.getUsers = function(req, res) {
  User.find({}, userExcludes, function(err, users) {
    if (err)
      res.send(err);

    res.json(users);
  });
};

// GET A SINGLE /api/users/:id
exports.getUser = function(req, res) {
  User.findById(req.params.id, userExcludes, function(err, user) {
    if (err)
      res.send(err);

    res.json(user);
  });
};

// POST /api/users
exports.postUser = function(req, res) {
  var user = new User();
  user = populateModel(req, user);

  user.save(function(err) {
    if (err)
      res.send(err);

    res.json({ message: 'New User added!', data: user });
  });
};

// PUT /api/users
exports.putUser = function (req, res) {
    User.update({_id: req.params.id}, req.body, function (err, user) {
      if (err)
        res.send(err);

      res.json({ message: 'User Details updated!', data: user });
    });
};

// DELETE /api/users
exports.deleteUser = function(req, res) {
  User.findByIdAndRemove(req.params.id, function(err) {
    if (err)
      res.send(err);

    res.json({ message: 'User deleted!' });
  });
};