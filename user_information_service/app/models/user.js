var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var UserSchema = new mongoose.Schema({
	name: { type: String, required: true },
  email: { type: String, required: true },
	age: { type: Number, required: true },
	gender: { type: String, required: true },
	note: { type: String, required: false }		// A public note that is shown on the radar
});

// Export the Mongoose model
module.exports = mongoose.model('User', UserSchema);