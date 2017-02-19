var User = require('../models/user');

function populateModel(req, userModel) {
  userModel.id = req.body.id;
  userModel.password = req.body.password;
  return userModel;
}

exports.postUser = function(req, res) {
  var user = new User();
  user = populateModel(req, user);

  user.save(function(err) {
    if (err) {
      return res.send(err);
    }
    res.json({ message: 'New User added!', data: user });
  });
};

