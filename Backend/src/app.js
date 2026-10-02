import express from "express"
import cors from "cors"
import userRouter from "./routes/user.routes.js"
import { errorHandler } from "./utils/ErrorHandler.js"

const app=express()



app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended:true,limit: "16kb"}))
app.use(express.static("public"))

//routing Api
app.use('/api/users', userRouter);




app.use(errorHandler);

export default app;