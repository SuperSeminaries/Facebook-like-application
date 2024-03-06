import express from "express";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())


import authRoutes from "./src/routes/user.routes.js"
import userRoutes from "./src/routes/user.routes.js"

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)

export { app };
