var User = require('../models/user');
var jwt = require('jsonwebtoken');

// Index page with the API guide
exports.getIndex = function(req, res) {
    res.sendfile('./public/guide.html');
};

exports.postAuth = function(req, res) {
// Checks the username and password from the DB
// and returns a JWT authorization token on success
    User.findOne({
        name: req.body.name
    }, function(err, user) {

        if (err) throw err;

        if (user && user.verifyPassword(req.body.password)) {
            // on successful authorizaton, create a new authorization token (JWT) and return it
            var payload = { user: user.name };
            var token = jwt.sign(payload, req.app.get('secret'), {
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
};