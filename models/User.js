const mongoose = require("mongoose");

const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
    },
    last_name: {
      type: String,
    },
    email: {
      type: String,
      unique: true
    },
    phone: {
      type: Number,
      unique: true
    },
    password: String,
    role: {
      type: String,
      enum: ['student', 'admin', 'counselor', 'student counselor'],
    }
  },
  {
    timestamps: true,
  }
);


// Custom methods 
UserSchema.methods.signJWT = function () {
  const user = this;
  if (user) {
    user.password = undefined;
    user.createdAt = undefined;
    user.updatedAt = undefined;
    user.__v = undefined;
  }

  return jwt.sign({ user }, process.env.SECRET_KEY, {
    expiresIn: '1h',
  });
}

// Custom statics 
UserSchema.statics.findStudents = function (filter) {
  return this.find({ role: 'student', ...filter }).select({ password: 0 });
}

UserSchema.statics.findStudentByID = function (id) {
  return this.findOne({ _id: id }).select({ password: 0 });
}

// Configure toJSON option to include virtuals
UserSchema.set('toJSON', { virtuals: true });

// Custom Virtuals
UserSchema.virtual('name').get(function () {
  return this.first_name + " " + this.last_name;
})





module.exports = mongoose.model("User", UserSchema);
