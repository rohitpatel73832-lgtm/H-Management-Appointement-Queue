import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User is required"],
            index: true
        },

        title: {
            type: String,
            required: [true, "Notification title is required"],
            trim: true
        },

        message: {
            type: String,
            required: [true, "Notification message is required"],
            trim: true
        },

        type: {
            type: String,
            enum: [
                "appointment",
                "payment",
                "queue",
                "system"
            ],
            required: [true, "Notification type is required"]
        },

        relatedId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null
        },

        isRead: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

notificationSchema.index({
    user: 1,
    createdAt: -1
});

const Notification = mongoose.model(
    "Notification",
    notificationSchema
);

export default Notification;