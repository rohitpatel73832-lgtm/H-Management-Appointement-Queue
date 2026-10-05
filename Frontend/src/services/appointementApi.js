import api from "./api"


// Get available slots for a doctor on a date

const getAvailableSlots = async (doctorId, date) => {

    const response = await api.get("/slots", {
        params: {
            doctorId,
            date
        }
    });

    return response.data;
};


// Book an appointment

const bookAppointment = async (appointmentData) => {

    const response = await api.post(
        "/appointements",
        appointmentData
    );

    return response.data;
};


// Get logged-in patient's appointments

const getMyAppointments = async () => {

    const response = await api.get(
        "/appointements/my"
    );

    return response.data;
};


export {
    getAvailableSlots,
    bookAppointment,
    getMyAppointments
};