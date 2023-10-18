import { Schema } from "mongoose";
import mongoose  from "mongoose";

const commentSchema= new mongoose.Schema(
  {
    userId:{type:Schema.Types.ObjectId, ref:"Users"},
    postId: {type:Schema.Types.ObjectId, ref:"Posts"},
    comments:{type:Schema.Types.ObjectId, required:true},
    from:{type:String , required:true},
    replies:[{
      rid:{type:Schema.Types.ObjectId},
      userId:{type:Schema.Types.ObjectId,"Users"},
      from:{type:String},
      replyAt:{type:String},
      comment:{type:String},
      created_At:{type:date , default:date.now()},
      updated_At:{type:Date, default:date.now()},
      likes:[{type:String}]
    },],

    likes:[{type:String}],

  },
  {timestamps:true}
)

const Comments= mongoose.model("comments",commentSchema);

export default comments;