
import {deleteCache,getCache,setCache,deleteCachePattern} from "./redis.service.js";
    


// Get appointments from cache
const getAppointmentCache = async (key) => {
    return await getCache(key);
};

// Save appointments for 60 seconds
const setAppointmentCache = async (key, data) => {
    await setCache(key, data, 60);
};

// Delete one specific cached appointment list
const clearAppointmentCache = async (key) => {
    await deleteCache(key);
};

// Patient-specific cache key
const patientAppointmentKey = (patientId, date = "") => {
    return `hmanage:appointments:patient:${patientId}:date:${date}`;
};

// Doctor-specific cache key
const doctorAppointmentKey = (doctorId, date = "") => {
    return `hmanage:appointments:doctor:${doctorId}:date:${date}`;
};

// Clear all cached appointment lists for a patient
const clearPatientAppointmentCache = async (patientId) => {
    if (!patientId) return;

    await deleteCachePattern(
        `hmanage:appointments:patient:${patientId}:date:*`
    );
};

// Clear all cached appointment lists for a doctor
const clearDoctorAppointmentCache = async (doctorId) => {
    if (!doctorId) return;

    await deleteCachePattern(
        `hmanage:appointments:doctor:${doctorId}:date:*`
    );
};

// Clear both patient and doctor appointment caches
const clearAppointmentCaches = async ({ patientId, doctorId }) => {
    try {
        await Promise.all([
            clearPatientAppointmentCache(patientId),
            clearDoctorAppointmentCache(doctorId)
        ]);
    } catch (error) {
        console.error(
            "Appointment cache invalidation failed:",
            error.message
        );
    }
};

export {
    getAppointmentCache,
    setAppointmentCache,
    clearAppointmentCache,
    patientAppointmentKey,
    doctorAppointmentKey,
    clearPatientAppointmentCache,
    clearDoctorAppointmentCache,
    clearAppointmentCaches
};
