import mongoose from "mongoose";
import Verfication from "../models/emailVerifaction.js";
import User from "../models/userModel.js";
import { compareString, createJWT, hashString } from "../utils/index.js";
import passwordReset from "../models/passwordReset.js";
import { resetPasswordLink } from "../utils/sendEmail.js";
import FriendRequest from "../models/friendRequest.js";

export const verifyEmail = async (req, res) => {
  const userId = req.params.userId;
  const token = req.params.token;

  try {
    const result = await Verfication.findOne({ userId });

    if (result) {
      const { expiresAt, token: hashedToken } = result;

      // Token has expired
      if (expiresAt < Date.now()) {
        await Verification.findOneAndDelete({ userId })
          .then(() => {
            User.findOneAndDelete({ _id: userId })
              .then(() => {
                const message = "Verification token has expired";
                res.redirect(
                  `users/verified?status=error&message=${message}`
                );
              })
              .catch((err) => {
                res.redirect(`users/verified?status=error&message=`);
              });
          });
      } else {
        // Token is valid
        compareString(token, hashedToken)
          .then((isMatch) => {
            if (isMatch) {
              User.findOneAndUpdate({ _id: userId }, { verified: true })
                .then(() => {
                  Verfication.findOneAndDelete({ userId })
                    .then(() => {
                      const message = "Email verified successfully";
                      res.redirect(`users/verified?status=success&message=${message}`);
                    }); 
                });
            } else {
              // Invalid token
              const message = "Verification failed or invalid token";
              res.redirect(`users/verification?status=error&message=${message}`);
            }
          })
          .catch((err) => {
            console.log(err);
            res.redirect(`users/verified?message=`);
          });
      }
    } else {
      const message = "Invalid verification link. Try again later";
      res.redirect(`users/verified?status=error&message=${message}`);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};


export const requestPasswordReset=async(req,res)=>{
    try{
      const {email}=req.body;

      const user=await User.findOne({email})

      if(!user){
        return res.status(404).json({
          status:"FAILED",
          message:"Email address not foound"
        })
      }


      const existingRequest =await passwordReset.findOne({email})

      if(existingRequest){
        if(existingRequest.expiresAt > Date.now()){
          return res.status(201).json({
           status:"PENDING",
           message:"Reset password link has alreay set to you email account"
          })
        }
          await passwordReset.findOneAndDelete({email})
        
      }
        await resetPasswordLink(user,res);
      

    }catch(error){
      console.log(error)
      res.status(404).json({message:error.message})
    }
}

export const resetPassword=async (req,res)=>{
  const {userId ,token }=req.params
  try{

    const user =await User.findById(userId);

    if(!user){
      const message="Invaild password rest link . Try again";
      res.redirect(`/users/resetpassword?status=error&message=${message}`)
    }
      const resetPassword=await passwordReset.findOne({userId})

      if(!resetPassword){
        const message="Invalid password rest Link .try again";
        res.redirect(`/users/resetpassword?status=error&message${message}`)
      }

      const {expiresAt ,token:resetToken}=resetPassword;

      if(expiresAt <Date.now()){
        const message='Invalid reset passeord link . please try again';
        res.redirect(`/users/resetpassword?status=error&message=${message}`)


      }else{
        const isMatch=await compareString(token ,resetToken);

        if(!isMatch){
          const message ="Invalid reset password link . please try again";
          res.redirect(`/users/resetpassword?status=error&message=${message}`)

        }else{
          res.redirect(`/users/resetpassword?type=reset&id=${userId}`)
        }
      }
    

  }catch(error){
    console.log(error)
    res.status(404).json({message:error.message})

  }
}


export const changePassword=async(req,res)=>{

  try{

    const {userId ,password }=req.body;

    const hashedPassword=await hashString(password);

    const user= await User.findOneAndUpdate(
      {_id:userId},
      {password:hashedPassword}
    )

    if(user){
      await passwordReset.findOneAndDelete({userId});

      const message="password sucessfully reset";
      res.redirect(`/users/resetpassword?status=sucess&message=${message}`);
      return;
    }

  }catch(error){
    console.log(error)
    res.status(404).json({message:error.message})
  }
}


export const getUser=async(req,res)=>{

  try{
    const { userId }=req.body.user;
    const {id}=req.params

    const user= await User.findById(id ?? userId).populate({
      path:"friends",
      select:"-password",
    })
    if(!user){
      return res.status(200).send({
        message:"User not found",
        success:false,
        user:user,
      })
        
      
    }

    user.password=undefined;

      res.status(200).json({
        success:true,
        user:user,
      })



  }catch(error){
    console.log(error)
    res.status(500).json({
      message:"auth error",
      success:"false",
      error:error.message,
    })
  }
}

export const updateUser =async (req,res,next)=>{
       
     try{

      const {firstName,lastName,location,profileUrl,profession}=req.body;

      if(!(firstName || lastName || profession || location )){
        next("Please enter all details ...")
        return;
      }

      const {userId}=req.body.user;

      const updateUser={
        firstName,
        lastName,
        location,
        profileUrl,
        profession,
        _id:userId
      }

      const user =await User.findByIdAndUpdate(userId,updateUser,{
        new:true,
      })

      await user.populate({path:"friends", select:"-password"});

      const token=createJWT(user?._id)

      user.password=undefined;

      res.status(200).json({
        success:true,
        message:"user updated seccesfully",
        user,
        token,
      })

     }catch(error){
      console.log(error)
      res.status(404).json({message:error.message})
     }
}

export const friendRequest = async (req, res, next) => {
  try {
    const { userId } = req.body.user;
    const { requestTo } = req.body;

    const requestExist = await FriendRequest.findOne({
      requestFrom: userId,
      requestTo,
    });

    if (requestExist) {
      return next("Friend request already sent");
    }

    const accountExist = await FriendRequest.findOne({
      requestFrom: requestTo, // Corrected typo here
      requestTo: userId,
    });

    if (accountExist) {
       next("Friend request already sent");
       return;
    }

    const newRequest = await FriendRequest.create({
      requestTo,
      requestFrom: userId,
    });

    res.status(201).json({
      success: true,
      message: "Friend request sent successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error",
      success: false,
      error: error.message,
    });
  }
};


export const getFriendRequest=async (req,res,next)=>{

  try{

    const {userId}=req.body.user;

    const request= await FriendRequest.find({
      requestTo:userId,
      requesStatus:"pending"
    })
    .populate({
      path:"requestFrom",
      select:" firstName lastName profileUrl profession -password",
    })
    .limit(10)
    .sort({
      _id:-1,
    })

    res.status(200).json({
      success:true,
      data:request,
    })

  }catch(error){
    console.log(error)
    res.status(500).json({
      message:"auth error",
      success:false,
      error:error.message,
    })
  }
}

export const acceptRequest = async (req, res, next) => {
  try {
    const id = req.body.user.userId;

    const { rid, status } = req.body;

    const requestExist = await FriendRequest.findById(rid);

    if (!requestExist) {
      next("No Friend Request Found.");
      return;
    }

    const newRes = await FriendRequest.findByIdAndUpdate(
      { _id: rid },
      { requesStatus: status }
    );

    if (status === "Accepted") {
      const user = await User.findById(id);

      user.friends.push(newRes?.requestFrom);

      await user.save();

      const friend = await User.findById(newRes?.requestFrom);

      friend.friends.push(newRes?.requestTo);

      await friend.save();
    }

    res.status(201).json({
      success: true,
      message: "Friend Request " + status,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "auth error",
      success: false,
      error: error.message,
    });
  }
};

export const profileViews = async (req, res, next) => {
  try {
    const { userId } = req.body.user;
    const { id } = req.body;

    const user = await Users.findById(id);

    user.views.push(userId);

    await user.save();

    res.status(201).json({
      success: true,
      message: "Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "auth error",
      success: false,
      error: error.message,
    });
  }
};

export const profileView=async(req,res,next)=>{
   

  try
  {const {userId}=req.body;
  const {id}=req.body;

  const user=await User.findById(id);

  user.views.push(userId);

  await user.save();
  res.status(201).json({
    success:true,
    message:"successfully...."
  })
  
  }catch(error){

    console.log(error);
    res.status(500).json({
      message:"auth error",
      success:false,
      error:error.message
    })
  }


}

export const suggestedFriends=async(req,res,next)=>{

  try{

    const {userId}=req.body.user;

    let queryObject={};

    queryObject._id={$ne: userId };

    queryObject.friends={$nin :userId}

    let queryResult=User.find(queryObject)
                        .limit(10)
                        .select("firstName  lastName profileUrl profession -password ")

    const suggestedFriends =await queryResult ;

    res.status(200).json({
      success:true,
      data:suggestedFriends,
    })

  }catch (error){
    console.log(error)
    res.status(500).json({
      message:error.message
    })
  }
}