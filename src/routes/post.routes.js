import  Router  from "express";
import { createPost, deletePostById, getAllPosts, getPostById, updatePostById } from "../controllers/post.controllers.js";
import { verifyjwt } from "../middlewares/auth.middlewares.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { addCommentToPost, deleteComment, getCommentsForPost, updateComment } from "../controllers/comments.controllers.js";
import { Unlike, like } from "../controllers/likes.controllers.js";
const router = Router()

// /----  Post Routes: ----/

router.route('/').get(verifyjwt, getAllPosts) //  Get all posts.
router.route('/').post(upload.single('image'), verifyjwt, createPost); // Create a new post.
router.route('/').patch(verifyjwt, updatePostById) // Update post by ID.
router.route('/').delete(verifyjwt, deletePostById) // Delete post by ID.
router.route('/').get(verifyjwt, getPostById) // Get post by ID.


// /----  Comment Routes:  ----/

router.route('/:postId/comments').get(verifyjwt, getCommentsForPost) // Get all comments for a post.
router.route('/:postId/comments').post(verifyjwt, addCommentToPost) // Add a comment to a post.
router.route('/:postId/comments/:commentId').put(verifyjwt, updateComment ) // Update a comment.
router.route('/:postId/comments/:commentId').delete(verifyjwt, deleteComment ) //  Delete a comment.


 
// /------ Like Routes:    -----/

router.route('/:postId/like').post(verifyjwt, like) //  Like a post.
router.route('/:postId/like').delete(verifyjwt,Unlike) // Unlike a post.

export default router