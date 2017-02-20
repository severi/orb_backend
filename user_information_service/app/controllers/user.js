import User from '../models/user';

const userExcludes = { 'id': 0, '__v': 0};

function populateModel(req, userModel) {
  userModel.id = req.body.id;
  userModel.name = req.body.name;
  userModel.age = req.body.age;
  userModel.gender = req.body.gender;
  userModel.note = req.body.note;
  userModel.email = req.body.email;
  return userModel;
}

export function getUsers(req, res) {
  User.find({}, userExcludes, (err, users) => {
    if (err)
      return res.send(err);

    res.json(users);
  });
}

export function getUser(req, res) {
  User.findById(req.params.id, userExcludes, (err, user) => {
    if (err)
      return res.send(err);

    res.json(user);
  });
}

export function postUser(req, res) {
  let user = new User();
  user = populateModel(req, user);

  user.save(err => {
    if (err) {
      console.log("VIRHE");
      console.log(err);
      return res.send(err);
    }
    
    res.json({ message: 'New User added!', data: user });
  });
}

export function putUser(req, res) {
    User.update({_id: req.params.id}, req.body, (err, user) => {
      if (err)
        return res.send(err);

      res.json({ message: 'User Details updated!', data: user });
    });
}

export function deleteUser(req, res) {
  User.findByIdAndRemove(req.params.id, err => {
    if (err)
      return res.send(err);

    res.json({ message: 'User deleted!' });
  });
}