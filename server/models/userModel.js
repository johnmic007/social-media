import mongoose from "mongoose";

const { Schema } = mongoose;

// Define the user schema
const userSchema = new Schema({
  firstName: {
    type: String,
    required: [true, "First name is required"],
  },

  lastName: {
    type: String,
    required: [true, "Last name is required"],
  },

  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
  },

  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password length should be greater than 6 characters"],
    select: true,
  },

  location: { type: String },
  profileUrl: { type: String },
  profession: { type: String },
  friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
  verified: { type: Boolean, default: false },
}, { timestamps: true });

// Define the User model
const User = mongoose.model("User", userSchema);

export default User;
