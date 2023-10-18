import express from "express";
import { userAuth } from "../middleware/authMiddleware";
import { createPost, getPost, getPosts, getUserPost } from "../controllers/postController";

const router =express.Router();

//  create post 


router.post("/create-post" , userAuth , createPost);

// get post 

router.post("/"  ,userAuth ,getPosts)
router.post("/:id" , userAuth ,getPost)
router.post("/get-user-post/:id" , userAuth , getUserPost)


// comments

router.get("/comments/:postId")

export  default  router;