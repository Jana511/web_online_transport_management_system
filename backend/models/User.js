import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Rules for every user document (admin, parent or driver)
const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true, // removes spaces at the start and end
      minlength: [3, 'Name must be at least 3 characters'],
      maxlength: [100, 'Name cannot be longer than 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true, // no two users can have the same email
      lowercase: true, // "Kamala@Example.com" is saved as "kamala@example.com"
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^0\d{9}$/, 'Phone must be 10 digits starting with 0'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // never return the password in normal queries
    },
    role: {
      type: String,
      enum: ['admin', 'parent', 'driver'], // only these three values are allowed
      default: 'parent',
    },
    isActive: {
      type: Boolean,
      default: true, // admin can deactivate an account instead of deleting it
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

// ===== Hash the password before saving =====
// Runs automatically every time a user is saved
userSchema.pre('save', async function () {
  // Only hash if the password is new or was changed
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// ===== Check a password at login =====
// Usage: const isMatch = await user.matchPassword('typed password');
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// ===== Remove private fields when sending a user as JSON =====
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

const User = mongoose.model('User', userSchema);

export default User;