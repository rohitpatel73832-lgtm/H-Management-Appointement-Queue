import api from "./api";


const createPaymentOrder = async (
    appointmentId
) => {

    const response =
        await api.post(
            "/payments/create-order",
            {
                appointmentId
            }
        );

    return response.data;
};


const verifyPayment = async (
    paymentData
) => {

    const response =
        await api.post(
            "/payments/verify",
            paymentData
        );

    return response.data;
};


export {
    createPaymentOrder,
    verifyPayment
};