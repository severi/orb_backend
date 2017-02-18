var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var UserSchema = new mongoose.Schema({
	name: { type: String, required: true }, 
	password: { type: String, required: true },
	age: { type: Number, required: true },
	gender: { type: String, required: true },
	note: String,		// A public note that is shown on the radar
	latitude: Number,
	longitude: Number,
	lastupdate: Date,	// When was the location last updated?
	following:  []		// Append all the followed friends to a list (for now)
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