import mongoose from "mongoose";
import bcrypt from "bcrypt";
import Jwt from "jsonwebtoken";

const UserSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      // unique: true,
    },
    email: {
      type: String,
      required: true,
      // unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    full_name: {
      type: String,
      required: true,
    },
    profile_picture: {
      type: String,
      required: true,
    },
    cover_photo: {
      type: String,
    },
    birthdate: {
      type: Date,
      default: Date.now, // Set the default value to the current date
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },
    location: {
      type: String,
      default: ""
    },
    bio: {
      type: String,
      default: ""
    },
    referenceToken: {
      type: String,
    },
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    this.password = await bcrypt.hash(this.password, 12);
  } catch (error) {
    console.log("message", error);
  }
});

UserSchema.methods.isPasswordCorrect = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    throw error;
    console.log("ispass", error);
  }
};

UserSchema.methods.generateAccessToken = async function () {
  return Jwt.sign({ _id: this._id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRE,
  });
};

UserSchema.methods.generateReferenceToken = async function () {
  return Jwt.sign({ _id: this._id }, process.env.REFERENCE_TOKEN_SECRET, {
    expiresIn: process.env.REFERENCE_TOKEN_EXPIRE,
  });
};

export const User = mongoose.model("User", UserSchema);
