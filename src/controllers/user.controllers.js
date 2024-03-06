import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import Jwt from "jsonwebtoken";

// /-------**** Authentication  User Profile controllers     ****-------/

// Create a new user account.
const CreateUser = async (req, res) => {
  try {
    const {
      userName,
      email,
      password,
      full_name,
      birthdate,
      gender,
      location,
      bio,
    } = req.body;

    if (
      [userName, email, password, full_name].some(
        (fildes) => fildes && fildes.trim() === ""
      )
    ) {
      return res.status(400).json({ message: "All fildes are required" });
    }

    const existedUser = await User.findOne({ $or: [{ userName }, { email }] });

    if (existedUser) {
      // If a user with the provided email or username already exists
      console.error("User with the provided email or username already exists");
      return res.status(400).json({
        message: "User with the provided email or username already exists",
      });
    }

    const profile_picture_LocalPath = req.files?.profile_picture[0]?.path;
    const cover_photo_LocalPath = req.files?.cover_photo[0]?.path;

    if (!profile_picture_LocalPath) {
      throw new Error("profile_picture local path is missing");
    }

    const profile_picture = await uploadOnCloudinary(profile_picture_LocalPath);
    const cover_photo = await uploadOnCloudinary(cover_photo_LocalPath);

    if (!profile_picture) {
      return res
        .status(400)
        .json({ error: "profile_picture file upload failed" });
    }

    const user = await User.create({
      userName: userName.toLowerCase(),
      email,
      password,
      full_name,
      profile_picture: profile_picture.url,
      cover_photo: (cover_photo && cover_photo.url) || "",
      birthdate,
      gender,
      location,
      bio,
    });

    const createdUser = await User.findById(user._id).select(
      "-password -referenceToken"
    );

    if (!createdUser) {
      return res.status(500).json({ error: "User creation failed" }); // Corrected error message
    }
    // Respond with the created user object
    return res.status(201).json({ user: createdUser }); // Renamed key to 'user' for clarity
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create user", error: error.message });
  }
};

// generate AccessToken And ReferenceToken
const generateAccessTokenAndReferenceToken = async (userId) => {
  const user = await User.findById(userId);
  const accessToken = await user.generateAccessToken();
  const referenceToken = await user.generateReferenceToken();

  user.referenceToken = referenceToken;

  await user.save({ validateBeforeSave: false });
  return { accessToken, referenceToken };
};

// Log in an existing user.
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    let errors = {};
    if (!email) {
      errors.email = "email is required";
    }
    if (!password) {
      errors.password = "password is required";
    }

    return res.status(400).json(errors);
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ user: "email does not exist" });
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    return res.status(401).json({ password: "wrong password" });
  }

  const { accessToken, referenceToken } =
    await generateAccessTokenAndReferenceToken(user._id);

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("referenceToken", referenceToken, options)
    .json({ accessToken, referenceToken, message: "User login successfully" });
};

// Log out the current user.
const logout = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { referenceToken: undefined } },
      { new: true }
    );
    console.log(user.referenceToken);
    console.log(user.accessToken);

    const option = {
      httpOnly: true,
      secure: true,
    };

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get details of the current logged-in user
const userDetails = async (req, res) => {
  const user = await User.findById(req.user._id).select(
    "-password -referenceToken"
  );

  return res
    .status(200)
    .json({ user, message: "Current user fetched successfully" });
};

// Request a password reset email.
const forgotpassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.password = undefined;
};

// change Current Pasword
const changeCurrentPasword = async (req, res) => {
  const { password, newPassword } = req.body;

  if (!password || !newPassword) {
    let errors = {};
    if (!password) {
      password.errors = "password is required";
    }

    if (!newPassword) {
      newPassword, (errors = "newPassword is required");
    }
  }
  // console.log(password, newPassword);

  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!password) {
    return res.status(400).json({ message: "Invalid password" });
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return res.status(200).json({ message: "Password updated successfully" });
};

// refresh AccesToken
const refreshAccesToken = async (req, res) => {
  const incomingRefressToken =
    req.cookies.referenceToken || req.body.refreshToken;

  if (!incomingRefressToken) {
    res.status(400).json({ message: "unAuthorized request" });
  }

  const decoded = await Jwt.verify(
    incomingRefressToken,
    process.env.REFERENCE_TOKEN_SECRET
  );

  const user = await User.findById(decoded._id);

  if (!user) {
    return res.status(401).json({ message: "invalid RefressToken" });
  }

  if (incomingRefressToken !== user.referenceToken) {
    res.status(400).json({ message: " RefressToken expire" });
  }

  const { accessToken, referenceToken: newreferenceToken } =
    await generateAccessTokenAndReferenceToken(user._id);

  const option = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, option)
    .cookie("refreshAccesToken", newreferenceToken, option)
    .json({
      accessToken,
      newreferenceToken,
      message: "refresh Token created successfully ",
    });
};

// /-------****   User Profile controllers     ****-------/

//  Get user profile details by ID
const getUserById = async (req, res) => {
  try {
    const userId = req.query.id;

    console.log(userId);

    const user = await User.findById(userId).select(
      "-password -referenceToken"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    console.error("Error in getUserById:", error);
    res.status(500).json({ error, message: "Internal Server Error" });
  }
};

//Update user profile details
const updateUserById = async (req, res) => {
  try {
    const userId = req.query.id;
    const updateUserData = req.body;

    const updatedUser = await User.findById(userId, updateUserData, {
      new: true,
    }).select("-password -referenceToken");
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user: updatedUser });
  } catch (error) {
    console.error("Error in updateUserById:", error);
    res.status(500).json({ error, message: "Internal Server Error" });
  }
};

// Delete user account
const deleteUserById = async (req, res) => {
  try {
    const userId = req.query.id;

    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error in deleteUserById:", error);
    res.status(500).json({ error, message: "Internal Server Error" });
  }
};

export {
  CreateUser,
  login,
  logout,
  userDetails,
  changeCurrentPasword,
  refreshAccesToken,
  getUserById,
  updateUserById,
  deleteUserById
};
