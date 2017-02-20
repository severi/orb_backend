import mongoose from 'mongoose';
import bcrypt from 'bcrypt-nodejs';

const UserSchema = new mongoose.Schema({
	id: { type: Number, required: true }, 
	password: { type: String, required: true }
});

// Always called before user.save()
UserSchema.pre('save', function(callback) {
  const user = this;

  if (!user.isModified('password')) return callback();

  	// If the password is modified, we need to hash it again, then save
  	bcrypt.genSalt(10, (err, salt) => {
    if (err) return callback(err);

    bcrypt.hash(user.password, salt, null, (err, hash) => {
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
export default mongoose.model('User', UserSchema);