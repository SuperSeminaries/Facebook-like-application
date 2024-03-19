import mongoose from "mongoose";
import { User } from "./user.models.js";
import { Post } from "./post.models.js";


const LikesSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
      },
})

export const Like = mongoose.model("Like", LikesSchema)