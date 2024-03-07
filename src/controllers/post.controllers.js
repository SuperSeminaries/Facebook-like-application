import { Post } from "../models/post.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// Create a new post.
const createPost = async (req, res) => {
  try {
    const author = req.user._id;
    const content = req.body.content;
    const imageLocalPath = req.file.path;

    if (!imageLocalPath) {
      throw new Error("Image local path is missing");
    }

    const image = await uploadOnCloudinary(imageLocalPath);

    if (!image) {
      return res.status(400).json({ error: "Image file upload failed" });
    }

    const newPost = await Post.create({
      content,
      author,
      image: image.url,
    });

    res.status(201).json({ newPost, message: "Post created successfully" });
  } catch (error) {
    console.error("Error in createPost:", error);
    res.status(500).json({ error, message: "Failed to create post" });
  }
};

// Update post by ID.
const updatePostById = async (req, res) => {
  try {
    const postId = req.query.id;

    if (!postId) {
      return res.status(400).json({ message: "ID is required" });
    }

    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: "Content cannot be empty" });
    }

    const post = await Post.findByIdAndUpdate(
      postId,
      { content },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({ post, message: "Post updated successfully" });
  } catch (error) {
    console.error("Error in updatePost:", error);
    res.status(500).json({ error, message: "Failed to update post" });
  }
};

// Delete post by ID.
const deletePostById = async (req, res) => {
  try {
    const postId = req.query.id;

    if (!postId) {
      return res.status(400).json({ message: "ID is required" });
    }

    const post = await Post.findByIdAndDelete(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({ post, message: "Post deleted successfully" });
    
  } catch (error) {
    console.error("Error in DeletePost:", error);
    res.status(500).json({ error, message: "Failed to Delete post" });
  }
};

// Get post by ID.
const getPostById = async (req, res) => {
    try {
        const postId = req.query.id;

        if (!postId) {
            return res.status(400).json({ message: "ID is required" });
        }

        const post = await Post.findById(postId)
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

         res.status(200).json({ post, message: "Post retrieved successfully" });

        
    } catch (error) {
        console.error("Error in getPost:", error);
        res.status(500).json({ error, message: "Failed to get post" });
    }
}

// Get all posts
const getAllPosts = async (req, res) => {
    try {

        const post = await Post.find()
        res.status(200).json({ post: post });
        
    } catch (error) {
        console.error("Error in getAllPosts:", error);
        res.status(500).json({ error, message: "Failed to get All  post" });
    }
}



export { createPost, updatePostById, deletePostById, getPostById, getAllPosts };
