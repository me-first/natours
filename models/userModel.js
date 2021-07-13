const crypto = require('crypto');
const mongoose = require('mongoose');

const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name']
  },
  email: {
    type: String,
    required: [true, 'Pleas enter your email'],
    unique: [true, 'Email must be unique'],
    validate: [validator.isEmail, 'Please enter valid email format'],
    lowercase: true
  },
  photo: {
    type: String,
    default: 'default.jpg'
  },
  roll: {
    type: String,
    enum: ['user', 'guide', 'lead-guid', 'admin'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false //now this password is invisible at mongoDB
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please re-enter your password to confirm'],
    //Only works on .save() and .create()
    validate: [
      function(el) {
        return el === this.password;
      },
      'Confirm password is incorrect!'
    ]
  },
  passwordChangedAt: {
    type: Date
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});

//ENCRYPTING OR HASHING PASSWORD
userSchema.pre('save', async function(next) {
  //only run this function if password was actually modefied
  if (!this.isModified('password')) return next();

  //bcrypt algorithm -- add string to the password so that two password could not generate same hash
  //hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  //delete the confirm password
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function(next) {
  // if we didn't modefied password
  // this.isNew means if are inserting new document
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();

  //
});

userSchema.pre(/^find/, function(next) {
  //this points towards current query i.e. User.find()

  this.find({ active: { $ne: false } });
  next();
});

//Instance method
userSchema.methods.correctPassword = async function(
  canditatePassword,
  userPassword
) {
  return await bcrypt.compare(canditatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function(JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    // console.log(changedTimeStamp, JWTTimeStamp);
    return JWTTimeStamp < changedTimeStamp; //100(token issued)<200(password changed)
  }

  return false; //false means user not changed password
};

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
