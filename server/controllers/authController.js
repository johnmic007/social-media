import User from "../models/userModel.js";
import { compareString, hashString ,createJWT} from "../utils/index.js";
import {sendVerificationEmail} from '../utils/sendEmail.js'


export const register=async(req,res,next)=>{
  const {firstName,lastName,email,password} =req.body;

  //validate fields

  if(!(firstName || lastName || email || password)){
    
    next("enter the required field");

    return;
  }

  try{

    const userExist=await User.findOne({email})

    if(userExist){
      next("Entered address already exists");
      return;
     }

     const hashedPassword=await hashString(password)

     const user=await User.create({
      firstName,
      lastName,
      email,
      password:hashedPassword,
     })


    // send verification to user
    
    sendVerificationEmail(user,res);

  }catch(error){
    console.log(error);
    res.status(404).json({message:error.message})
  }
}

export const login=async(req,res,next)=>{

   const {email,password}=req.body;

   try{

    if(!email || !password){
      next("please provide user details")
      return;
    }

    const user= await User.findOne({email}).select("+password").populate({
      path:"friends",
      select:"firstName lastName location profileUrl -password",
    })

    if(!user){
      next("Invaild email or password");
      return;
    }

    if(!user.verified){
      next("User is not verified . check email account and verify your email")
      return;
    };

    const isMatch=await compareString(password , user?.password);


    if(!isMatch){
      next("Invaild password")
      return;
    }

    user.password=undefined;

    const token=createJWT(user._id)

    res.status(201).json({
      success:true,
      message:"Login Successfully",
      user,
      token,
    })
    

   }catch(error){

       console.log(error);
       console.log("monkey")
       res.status(404).json({message:error.message});

   }

}

