import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import Verfication from '../models/emailVerifaction.js'
import { hashString } from './index.js';
import passwordReset from '../models/passwordReset.js';

const { AUTH_EMAIL, AUTH_PASSWORD, APP_URL } = process.env;

dotenv.config()

 console.log()
const transport = nodemailer.createTransport({
  host: 'smtp.gmail.com', // Ensure this is the correct Gmail SMTP server hostname
  port: 465, // Port for secure (SSL) connection
  secure: true,
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: 'csxu lsld qeky pulp',
  },
  debug: true, // Add this line to enable debugging
});



export const sendVerificationEmail = async (user, res) => {
  const { _id, email, lastName } = user;

  const token = _id+ uuidv4(); // Generate a new UUID token
 const link = `${process.env.APP_URL}/users/verify/${_id}/${token}`;


  // Mail option
  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: email,
    subject: "Email verification",
    html: `
      <div style='font-family: Arial, sans-serif; font-size: 20px; color: #333; background-color: #f4f4f4; padding: 20px;'>
        <h1 style="color: rgb(8, 56, 188);">Please verify your email address</h1>
        <hr>
        <h4>Hi ${lastName},</h4>
        <p>Please verify your email address so we can confirm it's really you.</p>
        <p>This verification link <b>expires in 1 hour</b></p>
        <br>
        <a href=${link} style="color: #fff; padding: 14px; text-decoration: none; background-color: #000;">Verify Email Address</a>
        <div style="margin-top: 20px;">
          <h5>Best Regards</h5>
          <h5>Fun Sooo Team</h5>
        </div>
      </div>
    `,
  };

  try {
    const hashedToken = await hashString(token);

    const newVerification = await Verfication.create({
      userId: _id,
      token: hashedToken,
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000,
    });

    if (newVerification) {
      transport
        .sendMail(mailOptions)
        .then(() => {
          res.status(201).send({
            success: 'PENDING',
            message: 'Verification email has been sent to your account, please check your email',
          });
        })
        .catch((err) => {
          console.error(err);
          res.status(500).json({ message: 'Something went wrong while sending the email' });
        });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};


export const resetPasswordLink=async (user,res)=>{
  const {_id,email} =user;

  const token =_id+ uuidv4();

  const link =process.env.APP_URL +"users/reset-password/"+_id+"/"+token;

  const mailOptions={
    from:process.env.AUTH_EMAIL,
    to:email,
    subject:"password Reset",

    html:`<div style='font-family: Arial, sans-serif; font-size: 20px; color: #333; background-color: #f4f4f4; padding: 20px;'>
    <h1 style="color: rgb(8, 56, 188);">Please verify your email address</h1>
    <hr>
    <p>Password reset link . please click the link below to reset the password</p>
    <br>
    <a href=${link} style="color: #fff; padding: 14px; text-decoration: none; background-color: #000;">Verify Email Address</a>
    <div style="margin-top: 20px;">
    </div>
  </div>`
  }


  try {
    const hashedToken =await hashString(token);

    const resetEmail=await passwordReset.create({
      userId: _id,
      email:email,
      token: hashedToken,
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000,
    });

    if(resetEmail){
      transport 
      .sendMail(mailOptions)
      .then(()=>{
            res.status(201).send({
              success:"PENDING",
              message:"Reset password link has beeen send to your account",

            })
      })
      .catch((err)=>{
        console.log(err);
        res.status(404).json({
          message:"something went wrong"
        })
      })
    }
  }catch(error){
    console.log(error)

    res.status(404).json({message :"something went wrong"})
    
  }


}
