import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { getMyNotifications, markAllNotificationsAsRead, markNotificationAsRead } from "../controllers/notification.controller.js";




const notificationRouter = express.Router();

notificationRouter.get("/my",protect,getMyNotifications);
notificationRouter.patch("/read-all", protect, markAllNotificationsAsRead);
notificationRouter.patch("/:notificationId/read",protect,markNotificationAsRead);







export default notificationRouter;