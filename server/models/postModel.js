import { Schema } from "mongoose";
import mongoose  from "mongoose";


// schema 
const postSchema= new mongoose.Schema(
  {
    userId:{type:Schema.Types.ObjectId, ref:"Users"},
    description:{type:String , required :true},
    image:{type:String},
    likes:[{type:String}],
    comments:[{type:Schema.Types.ObjectId , ref:"comments"}]
  },
  {timestamps:true}
)


const Posts= mongoose.model("Posts",postSchema);

export default Posts;