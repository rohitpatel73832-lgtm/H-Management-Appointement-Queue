import Notification from "../models/notification.model.js";
import { getIO } from "../socket.js";

const createNotification = async ({
    userId,
    title,
    message,
    type,
    relatedId = null
}) => {
    const notification = await Notification.create({
        user: userId,
        title,
        message,
        type,
        relatedId
    });

    // Send the saved notification in real time.
    // If Socket.IO is unavailable, the saved notification
    // can still be fetched through the notification API.
    try {
        const io = getIO();

        io.to(`patient:${userId}`).emit(
            "new-notification",
            notification
        );
    } catch (error) {
        console.error(
            "Notification saved, but real-time delivery failed:",
            error.message
        );
    }

    return notification;
};

export { createNotification };