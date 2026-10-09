import Notification from "../models/notification.model.js";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/AsyncHandler.js";





// Get notifications belonging to the logged-in user
const getMyNotifications = asyncHandler(async (req, res) => {
    const notifications = await Notification.find({
        user: req.userId
    }).sort({
        createdAt: -1
    });

    const unreadCount = await Notification.countDocuments({
        user: req.userId,
        isRead: false
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                notifications,
                unreadCount
            },
            "Notifications fetched successfully"
        )
    );
});

// Mark one of the user's notifications as read
const markNotificationAsRead = asyncHandler(async (req, res) => {
    const { notificationId } = req.params;

    const notification = await Notification.findOne({
        _id: notificationId,
        user: req.userId
    });

    if (!notification) {
        throw new ApiError(
            404,
            "Notification not found"
        );
    }

    notification.isRead = true;

    await notification.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            { notification },
            "Notification marked as read"
        )
    );
});

// Mark all notifications belonging to the user as read
const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
    await Notification.updateMany(
        {
            user: req.userId,
            isRead: false
        },
        {
            $set: {
                isRead: true
            }
        }
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            null,
            "All notifications marked as read"
        )
    );
});

export {
    getMyNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead
};