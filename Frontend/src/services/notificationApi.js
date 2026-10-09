import api from "./api";

const getMyNotifications = async () => {
    const response = await api.get("/notifications/my");
    return response.data;
};

const markNotificationAsRead = async (notificationId) => {
    const response = await api.patch(
        `/notifications/${notificationId}/read`
    );

    return response.data;
};

const markAllNotificationsAsRead = async () => {
    const response = await api.patch(
        "/notifications/read-all"
    );

    return response.data;
};

export {
    getMyNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead
};