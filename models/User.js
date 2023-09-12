const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2")
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
    },
    approved: {
      type: Boolean,
      default: false,
      required: false
    },
    resetToken: {
      type: String,
      default: null,
    },
    resetTokenExpiry: {
      type: Date,
      expires: '10m',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.plugin(mongoosePaginate);

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


UserSchema.methods.makeApprove = function (id) {
  return this.updateOne({ approved: true });
}

UserSchema.methods.makePending = function (id) {
  return this.updateOne({ approved: false });
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
