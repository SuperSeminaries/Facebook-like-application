import { Like } from "../models/likes.models.js";
import { Post } from "../models/post.models.js";

// Like a post.
const like = async (req, res) => {
  try {
    const post = req.params.postId;
    const author = req.user._id;

    const existingLike = await Like.findOne({ post, author });
    if (existingLike) {
      return res
        .status(400)
        .json({ message: "You have already liked this post" });
    }

    const like = await Like.create({ post, author });

    await Post.findByIdAndUpdate(post, {$push: {likes: like._id}})

    res.status(201).json({ like, message: "Post liked successfully" });
  } catch (error) {
    console.error("Error in like:", error);
    res.status(500).json({ error, message: "Failed to like the post" });
  }
};


// Unlike a post.
const Unlike = async (req, res) => {
    try {
        const post= req.params.postId;
        const author = req.user._id;

        
        const deletedLike = await Like.findOneAndDelete({ post, author });

        if (!deletedLike) {
            return res.status(404).json({ message: "Like not found" });
        }

        
        await Post.findByIdAndUpdate(post, { $pull: { likes: deletedLike._id } });

        res.status(200).json({ message: "Post unliked successfully" });
    } catch (error) {
        console.error("Error in Unlike:", error);
        res.status(500).json({ error, message: "Failed to unlike the post" });
    }
};



export { like, Unlike }
