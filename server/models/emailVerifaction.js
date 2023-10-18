import mongoose from "mongoose";
import { Schema } from "mongoose";


const emailVerficationSchema=Schema({
  userId:String,
  token:String,
  createdAt:Date,
  expiresAt:Date,
})

const Verfication=mongoose.model("Verification",emailVerficationSchema)

export default Verfication;