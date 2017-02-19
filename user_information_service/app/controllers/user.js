var User = require('../models/user');

var userExcludes = { 'id': 0, '__v': 0};

function populateModel(req, userModel) {
  userModel.id = req.body.id;
  userModel.name = req.body.name;
  userModel.age = req.body.age;
  userModel.gender = req.body.gender;
  userModel.note = req.body.note;
  userModel.email = req.body.email;
  return userModel;
}

exports.getUsers = function(req, res) {
  User.find({}, userExcludes, function(err, users) {
    if (err)
      return res.send(err);

    res.json(users);
  });
};

exports.getUser = function(req, res) {
  User.findById(req.params.id, userExcludes, function(err, user) {
    if (err)
      return res.send(err);

    res.json(user);
  });
};

exports.postUser = function(req, res) {
  var user = new User();
  user = populateModel(req, user);

  user.save(function(err) {
    if (err) {
      console.log("VIRHE");
      console.log(err);
      return res.send(err);
    }
    
    res.json({ message: 'New User added!', data: user });
  });
};

exports.putUser = function (req, res) {
    User.update({_id: req.params.id}, req.body, function (err, user) {
      if (err)
        return res.send(err);

      res.json({ message: 'User Details updated!', data: user });
    });
};

exports.deleteUser = function(req, res) {
  User.findByIdAndRemove(req.params.id, function(err) {
    if (err)
      return res.send(err);

    res.json({ message: 'User deleted!' });
  });
};