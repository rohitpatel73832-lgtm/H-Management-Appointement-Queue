import dotenv from "dotenv"
import connectDB from "./db/index.js"
import app from "./app.js"

import { createServer } from "http";
import { initSocket } from "./socket.js";



dotenv.config({
    path:'./.env'
})

const PORT=process.env.PORT || 9004;

//create HTTP server using Express app
const server = createServer(app);

//initialize Socket.io
initSocket(server);


connectDB()
.then(()=>{
    
    server.listen(PORT ,()=>{
        console.log(`Server is running at port: ${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log("MONGODB connection failed",err);
})