const mongoose = require("mongoose");

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
    },
    phone: {
      type: Number,
    },
    password: {
      type: String,
    },
    role: {
      type: String,
      enum: ['student', 'admin', 'counselor', 'student counselor'],
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", UserSchema);
