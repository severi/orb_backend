import mongoose from 'mongoose';
import bcrypt from 'bcrypt-nodejs';

const UserSchema = new mongoose.Schema({
	name: { type: String, required: true },
  email: { type: String, required: true, unique: true},
	age: { type: Number, required: true },
	gender: { type: String, required: true },
	note: { type: String, required: false }		// A public note that is shown on the radar
});

// Export the Mongoose model
export default mongoose.model('User', UserSchema);
