import { User } from "../models/user.models.js";
import  Jwt  from "jsonwebtoken";


const verifyjwt = async (req, res, next) => {
    try {
        const token = req.cookies.accessToken   || req.headers['authorization'];

        if (!token) {
            return res.status(401).json({ message: 'Authorization token is required' });
        }
        const decoded = await Jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decoded._id)
        if (!user) {
            res.status(401).json({ message: 'Invalid token'})
        }

        req.user = user
        next()
        // console.log(req);
        // console.log(user);
    } catch (error) {
        console.log(error);
    }
}

export { verifyjwt }
