import mongoose from "mongoose";
import { User } from "./user.models.js";
import { Post } from "./post.models.js";


const CommentSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    content: {
        type: String
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
})

export const Comment = mongoose.model("Comment", CommentSchema)