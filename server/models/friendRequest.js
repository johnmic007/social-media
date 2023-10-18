import { Schema } from "mongoose";
import mongoose from "mongoose";

const requestSchema =Schema(
  {
    requestTo :{type:Schema.Types.ObjectId, ref:"User"},
    requestFrom :{type:Schema.Types.ObjectId, ref:"User"},
    requesStatus:{type:String , default:"pending"},
  },
  {timesStamps:true}
)

const FriendRequest =mongoose.model("FriendRequest", requestSchema)

export default FriendRequest;