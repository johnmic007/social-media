import mongoose from "mongoose";
import { Schema } from "mongoose";


const passwordResetSchema=Schema({
  userId:{type:String, unique:true},
  email:{type:String, unique:Schema},
  token:String,
  createdAt:Date,
  expiresAt:Date,
});

const passwordReset= mongoose.model("PasswordReset",passwordResetSchema)

export default passwordReset;