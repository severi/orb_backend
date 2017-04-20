import User from '../models/user'

const userExcludes = { 'id': 0, '__v': 0};

export function getUsers(req, res) {
  console.log("getting users")
  User.find(req.query, userExcludes, (err, users) => {
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
