import Routes from "express";
import { CreateUser, changeCurrentPasword, deleteUserById, getUserById, login, logout, refreshAccesToken, updateUserById, userDetails } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyjwt } from "../middlewares/auth.middlewares.js";

const router = Routes();



// /----- Authentication Routes: -----/

router.route("/signup").post(
  upload.fields([
    { name: "profile_picture", maxCount: 1 },
    { name: "cover_photo", maxCount: 1 },
  ]),
  CreateUser
); //Create a new user account.
router.route("/login").post(login)   //Log in an existing user.
router.route("/logout").post(verifyjwt,logout)  //Log out the current user.
router.route("/currentuser").post(verifyjwt,userDetails)  //Get details of the current logged-in user.
router.route("/password").post(verifyjwt,changeCurrentPasword) // Change current password
router.route('/refreshToken').post(verifyjwt,refreshAccesToken) // refresh access token




// /-----  User Profile Routes:   ------/

router.route('/').get(verifyjwt, getUserById) // Get user profile details by ID.
router.route('/').patch(verifyjwt, updateUserById) //  Update user profile details.
router.route('/').delete(verifyjwt, deleteUserById) // Delete user account.





export default router;
