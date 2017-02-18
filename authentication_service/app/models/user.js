var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var UserSchema = new mongoose.Schema({
	id: { type: Number, required: true }, 
	password: { type: String, required: true }
});

// Always called before user.save()
UserSchema.pre('save', function(callback) {
  var user = this;

  if (!user.isModified('password')) return callback();

  	// If the password is modified, we need to hash it again, then save
  	bcrypt.genSalt(10, function(err, salt) {
    if (err) return callback(err);

    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) return callback(err);
      user.password = hash;
      callback();
    });

  });
});

// Compare the password
UserSchema.methods.verifyPassword = function(password) {
	return bcrypt.compareSync(password, this.password);
};

// Export the Mongoose model
module.exports = mongoose.model('User', UserSchema);