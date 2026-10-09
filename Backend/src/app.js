import express from "express"
import cors from "cors"
import userRouter from "./routes/user.routes.js"
import { errorHandler } from "./utils/ErrorHandler.js"
import doctorRouter from "./routes/doctor.routes.js"
import availabilityRouter from "./routes/availability.routes.js"
import slotRouter from "./routes/slot.routes.js"
import appointmentRouter from "./routes/appointement.routes.js"
import queueRouter from "./routes/queue.routes.js"
import paymentRouter from "./routes/payment.routes.js"
import notificationRouter from "./routes/notification.routes.js"

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

//routing Api for doctor (availability,deletion...)
app.use("/api/availability",availabilityRouter);

//routing api for slot booked by patient 
app.use("/api/slots",slotRouter);

//routing api for patient booking their doctors slot
app.use("/api/appointements",appointmentRouter);

//routing api for doctors viewing their todays patient list
app.use("/api/queue", queueRouter)

//routing api for payment
app.use("/api/payments", paymentRouter);

//routing API for notification
app.use("/api/notifications",notificationRouter);





app.use(errorHandler);

export default app;