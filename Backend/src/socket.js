import { Server } from "socket.io";

let io;


const initSocket = (server) => {
    io = new Server(server, {

        cors: {
            origin: "http://localhost:5173",
            credentials: true
        }

    });


    io.on("connection", (socket) => {
        console.log(
            `Socket connected: ${socket.id}`
        );


        // Patient joins their own room

        socket.on("join-patient", (userId) => {
            socket.join(`patient:${userId}`);

            console.log(
                `Patient joined room: patient:${userId}`
            );

        });


        socket.on("disconnect", () => {

            console.log(
                `Socket disconnected: ${socket.id}`
            );
        });
    });
    return io;
};


const getIO = () => {

    if (!io) {
        throw new Error(
            "Socket.IO is not initialized"
        );

    }
    return io;
};


export {
    initSocket,
    getIO
};