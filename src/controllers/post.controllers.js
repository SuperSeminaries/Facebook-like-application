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

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({ post, message: "Post retrieved successfully" });
  } catch (error) {
    console.error("Error in getPost:", error);
    res.status(500).json({ error, message: "Failed to get post" });
  }
};

// Get all posts
const getAllPosts = async (req, res) => {
  try {
    const pageSize = parseInt(req.query.pageSize) || 10;
    const pageNumber = parseInt(req.query.page) || 1;

    // Calculate the number of documents to skip based on the page number and page size
    const skip = (pageNumber - 1) * pageSize;

    // const post = await Post.find()

    const posts = await Post.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author",
          pipeline: [
            {
              $project: {
                userName: 1,
                full_name: 1,
                profile_picture: 1,
                cover_photo: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          author: {
            $arrayElemAt: ["$author", 0],
          },
        },
      },

      {
        $lookup: {
          from: "likes",
          localField: "likes",
          foreignField: "_id",
          as: "likes",
          pipeline: [
            {
              $lookup: {
                from: "users",
                localField: "author",
                foreignField: "_id",
                as: "author",
                pipeline: [
                  {
                    $project: {
                      userName: 1,
                      full_name: 1,
                      profile_picture: 1,
                    },
                  },
                ],
              },
            },
            {
              $addFields: {
                author: {
                  $arrayElemAt: ["$author", 0],
                },
              },
            },
          ],
        },
      },

      {
        $lookup: {
          from: "comments",
          localField: "comments",
          foreignField: "_id",
          as: "comments",
          pipeline: [
            {
              $lookup: {
                from: "users",
                localField: "author",
                foreignField: "_id",
                as: "author",
                pipeline: [
                  {
                    $project: {
                      userName: 1,
                      profile_picture: 1,
                    },
                  },
                ],
              },
            },
            {
              $addFields: {
                author: {
                  $arrayElemAt: ["$author", 0],
                },
              },
            },
          ],
        },
      },

      {
        $project: {
          image: "$image",
          content: "$content",
          author: "$author",
          likes: "$likes",
          comments: "$comments",
        },
      },
    ])
      .skip(skip) // Skip documents
      .limit(pageSize); // Limit the number of documents returned

    // const totalPost = await Post.countDocuments();
    res.status(200).json({ post: posts, pageSize });
  } catch (error) {
    console.error("Error in getAllPosts:", error);
    res.status(500).json({ error, message: "Failed to get All  post" });
  }
};

export {
  createPost,
  updatePostById,
  deletePostById,
  getPostById,
  getAllPosts
};
