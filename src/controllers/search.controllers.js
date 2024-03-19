import { Post } from "../models/post.models.js";
import { User } from "../models/user.models.js";


// search for users by username or name
const searchUsers = async (req, res) => {
    try {
        const search = req.query.s;
    
        const user = await User.find({
          $or: [{ userName: { $regex: search, $options: "i" } }],
        }).select("-password -referenceToken");
    
        res.status(200).json({ user });
    } catch (error) {
        console.error("Error in searchUsers:", error);
        res.status(500).json({ message: "Failed to search for users", error });
    }
};

// search for posts by content
const searchPosts = async (req, res) => {
    try {
        const query = req.query.q;
        const posts = await Post.find({ content: { $regex: query, $options: 'i' } });

        res.status(200).json({ posts });
    } catch (error) {
        console.error("Error in searchPosts:", error);
        res.status(500).json({ error, message: "Failed to search for posts" });
    }
}

export { searchUsers, searchPosts };
