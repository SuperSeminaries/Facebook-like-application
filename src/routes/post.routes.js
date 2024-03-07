import  Router  from "express";
import { createPost, deletePostById, getAllPosts, getPostById, updatePostById } from "../controllers/post.controllers.js";
import { verifyjwt } from "../middlewares/auth.middlewares.js";
import { upload } from "../middlewares/multer.middlewares.js";
const router = Router()

// /----  Post Routes: ----/

router.route('/').get(verifyjwt, getAllPosts) //  Get all posts.
router.route('/').post(upload.single('image'), verifyjwt, createPost); // Create a new post.
router.route('/').patch(verifyjwt, updatePostById) // Update post by ID.
router.route('/').delete(verifyjwt, deletePostById) // Delete post by ID.
router.route('/').get(verifyjwt, getPostById) // Get post by ID.






export default router