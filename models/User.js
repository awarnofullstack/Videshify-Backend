const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2")
const jwt = require("jsonwebtoken");
const Image = require("./Image");

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
      required: false
    },
    phone: {
      type: String,
      required: false,
      default: ''
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
    user.resetTokenExpiry = undefined;
    user.resetToken = undefined;
    user.updatedAt = undefined;
    user.__v = undefined;
  }

  return jwt.sign({ user }, process.env.SECRET_KEY, {
    expiresIn: '1d',
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

UserSchema.statics.addResetToken = function (otp) {
  return this.updateOne({ resetToken: otp });
}

// Configure toJSON option to include virtuals
UserSchema.set('toJSON', { virtuals: true });

// Custom Virtuals
UserSchema.virtual('name').get(function () {
  if (!this.first_name || !this.last_name) {
    return null
  }
  return this.first_name + " " + this.last_name;
})

UserSchema.virtual('profile', {
  ref: 'Image',
  localField: '_id',
  foreignField: 'entity_id',
  justOne: true,
  options: { entity: 'User' },
});


module.exports = mongoose.model("User", UserSchema);
