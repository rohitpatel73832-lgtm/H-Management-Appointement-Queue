import express from "express"
import cors from "cors"
import userRouter from "./routes/user.routes.js"
import { errorHandler } from "./utils/ErrorHandler.js"
import doctorRouter from "./routes/doctor.routes.js"

const app=express()



app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended:true,limit: "16kb"}))
app.use(express.static("public"))

//routing Api for user(patient)
app.use('/api/users', userRouter);

//routing Api for doctor
app.use("/api/doctors",doctorRouter);




app.use(errorHandler);

export default app;