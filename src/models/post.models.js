import mongoose from "mongoose";
import { User } from "./user.models.js";
import { Like } from "./likes.models.js";
import { Comment } from "./comments.models.js";

const PostSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    content: {
        type: String
    },
    image: {
        type: String
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Like"
    }],
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
    }]

}, {timestamps: true})

export const Post = mongoose.model("Post", PostSchema)