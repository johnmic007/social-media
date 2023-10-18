import Posts from "../models/postModel";
import User from "../models/userModel";


export const createPost= async (req,res,next)=>{


  try{

    const {userId}=req.body.user;

    const {description , image}=req.body;

    if(!description){
      next("you must provide a discription");
      return;
    }

    const post =await Posts.create({
      userId,
      description,
      image,
    })

    res.status(200).json({
      success:true,
      message:"Post created sucessfully ",
      data:post,
    })

  }catch(error){
    console.log(error);
    res.status(404).json({message:error.message})
  }
}

export const getPosts=async (req,res,next)=>{
  try{

    const {userId}=req.body.user;
    const {search}=req.body;

    const user=await User.findById(userId)

    const friends=user?.friends?.toString().split(",") ?? [];

    friends.push(userId);

    const searchPostQuery={
      $or:[
        {
          description :{$regex: search , $option:"i"},
        }
      ]
    }

    const posts=await Posts.find(search ? searchPostQuery : {})
                           .populate({
                            path:"userId",
                            select:"firstName lastName location profileUrl -passsword"
                           })
                           .sort({_id:-1})

    const friendsPosts=posts.filter((post)=>{
      return friends.includes(post?.userId?.toString())
    });

    const otherPost=posts?.filter(
    (post)=> !friends.includes(post?.userId?.toString())
    )

    let postRes=null;

    if(friendsPosts?.length>0){
      postRes =search ? friendsPosts :[...friendsPosts , ...otherPost];

    }else{
      postRes=posts;
    }

    res.status(200).json({
      success:true,
      message:"successfully",
      data:postRes,
    })

  }catch(error){
    console.log(error)
    res.status(404).json({message: error.message})

  }
}

export const getPost=async (req,res,next)=>{
  try{

    const {id}=req.params;

    const post =await Posts.findById(id).populate({
      path:"userId",
      select:"firstName lastName location profileUrl -password",

    })

    res.status(200).json({
      success:true,
      message:"successfullyy",
      data:post,
    })

  }catch(error){
    console.log(error)
    res.status(500).json({message:error.message})
  }
}

export const getUserPost =async (req,res,next)=>{
  try{

    const {id}=req.params;

    const post= await Posts.find({userId:id})
                           .populate({
                            path:"userId",
                            select:"firstName lastName location profileUrl -password"

                           })
                           .sort({_id:-1 })
    res.status(200).json({
      success:true,
      message:"succesfully",
      data:post,
    })

  }catch(error){
     console.log(error);
     res.status(400).json({message:error.message})
  }
}