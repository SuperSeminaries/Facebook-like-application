import { Comment } from "../models/comments.models.js";
import { Post } from "../models/post.models.js";

// Add a comment to a post.
const addCommentToPost = async (req, res) => {
  try {
    const post = req.params.postId;
    const author = req.user.id;
    const { content } = req.body;

    if (!post || !author) {
      return res
        .status(400)
        .json({ message: "Post ID and author ID are required" });
    }

    const newComment = await Comment.create({ post, author, content });

    await Post.findByIdAndUpdate(post, { $push: { comments: newComment._id } });

    res
      .status(201)
      .json({ comment: newComment, message: "Comment added successfully" });
  } catch (error) {
    console.error("Error in addCommentToPost:", error);
    res
      .status(500)
      .json({ error, message: "Failed to add comment to the post" });
  }
};

// commentId: Update a comment.
const updateComment = async (req, res) => {
  try {
    const post = req.params.postId;
    const comment = req.params.commentId;
    const { content } = req.body;

    if (!post || !comment) {
      return res.status(400)
        .json({ message: "Post ID and comment ID are required" });
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      comment,
      { content },
      { new: true }
    );

    if (!updatedComment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    res.status(200).json({
      comment: updatedComment,
      message: "Comment updated successfully",
    });
  } catch (error) {
    console.error("Error in updateComment:", error);
    res.status(500).json({ error, message: "Failed to update the comment" });
  }
};

// Delete a comment.
const deleteComment = async (req, res) => {
  try {
    const post = req.params.postId;
    // console.log(post);
    const comment = req.params.commentId;

    const deletedComment = await Comment.findOneAndDelete({
      _id: comment,
      post,
    });
    if (!deletedComment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    await Post.findByIdAndUpdate(post, {
      $pull: { comments: deletedComment._id },
    });

    res
      .status(200)
      .json({
        comment: deletedComment,
        message: "Comment deleted successfully",
      });
  } catch (error) {
    console.error("Error in deleteComment:", error);
    res.status(500).json({ error, message: "Failed to delete comment" });
  }
};

// Get all comments for a post.
const getCommentsForPost = async (req, res) => {
  try {
    const post = req.params.postId;

    const comments = await Comment.find({ post });

    res.status(200).json({ comments });
  } catch (error) {
    console.error("Error in getCommentsForPost:", error);
    res
      .status(500)
      .json({ error, message: "Failed to get comments for the post" });
  }
};

export { addCommentToPost, updateComment, deleteComment, getCommentsForPost };
