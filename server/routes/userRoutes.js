import express from 'express';
import path from 'path';

import { verifyEmail , requestPasswordReset, changePassword, updateUser, getUser, friendRequest, getFriendRequest, acceptRequest, profileView, suggestedFriends} from '../controllers/userController.js';
import { resetPasswordLink } from '../utils/sendEmail.js';
import { userAuth } from '../middleware/authMiddleware.js';

const router = express.Router();
const __dirname = path.resolve();


// Define the email verification route
router.get('/verify/:userId/:token', verifyEmail);


// reset password

router.post("/request-passwordreset",requestPasswordReset)
router.get("/reset-password/:userId/:token",resetPasswordLink)

router.post("/reset-password",changePassword)


// friend request 

router.post("/friend-request", userAuth ,friendRequest)
router.post("/get-friend-request",userAuth ,getFriendRequest);

// USER ROUTES

router.post("/get-user/:id?",userAuth , getUser)
router.put("/update-user", userAuth , updateUser)

// friend request routes

router.post("/friend-request", userAuth ,friendRequest)
router.post("get-friend-request" , userAuth ,getFriendRequest)

// accepet request

router.post("/accept-request" ,userAuth , acceptRequest)

// view post 

router.post("profile-view",userAuth , profileView)

// suggested friend

router.post("/suggested-friends", userAuth , suggestedFriends)





router.get("verified", (req,res)=>{
  res.sendFile(path.join(__dirname, './views/build' , "index.html"));
})

// Define a route for serving static files (e.g., your front-end application)
router.get('/resetpassword/', (req, res) => {
  res.sendFile(path.join(__dirname, './views/build', "index.html"));
});


export default router;
