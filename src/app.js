import express from 'express';
import cors from 'cors'
import cookieParser from "cookie-parser";
import dbConnect from './db/index1.js';
import dotenv from "dotenv";


const app = express()
// const { express } = app

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

dotenv.config({
    path: './.env'
})

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static("public"))
app.use(cookieParser())


//routes import
import userRouter from './routes/user.routes.js'
import commentRouter from "./routes/comment.routes.js"
import videoRouter  from "./routes/video.routes.js"

// routes declaration
app.use("/api/v1/users", userRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/videos", videoRouter)



dbConnect().then(() => {
    const PORT = process.env.PORT
    app.listen(PORT, () => {
        console.log(`server is running at port`, PORT);
    })

}).catch((error) => {
    console.log(`db error!!`, error);
    process.exit(1)
})