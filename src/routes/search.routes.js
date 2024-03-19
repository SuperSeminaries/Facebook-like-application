import Router from "express"
import { searchPosts, searchUsers } from "../controllers/search.controllers.js"

const router = Router()


// Search Routes:
router.route('/users').get(searchUsers) // Search for users by username or name.
router.route('/posts').get(searchPosts) // Search for posts by content.



export default router