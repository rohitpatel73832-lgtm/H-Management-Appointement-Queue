import dotenv from "dotenv"
import connectDB from "./db/index.js"
import app from "./app.js"

import { createServer } from "http";
import { Server } from "socket.io";


dotenv.config({
    path:'./.env'
})

const PORT=process.env.PORT || 9004;

//create HTTP server using Express app
const server = createServer(app);

//create Socket.io server
const io= new Server(server,{
    cors: {
        origin: process.env.CORS_ORIGIN,
        credentials: true
    }
})

// Socket.IO connection
io.on("connection", (socket)=>{
    console.log(`Socket connected: ${socket.id}`)

    socket.on("disconnect", ()=>{
        console.log(`Socket disconnected: ${socket.id}`)
    })
});

connectDB()
.then(()=>{
    
    server.listen(PORT ,()=>{
        console.log(`Server is running at port: ${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log("MONGODB connection failed",err);
})