const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(":").map(Number);

    return hours * 60 + minutes;
};

const minutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
};

const generateSlots = (startTime, endTime, slotDuration = 30) => {

    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    const slots = [];

    let currentTime = startMinutes;

    while (currentTime + slotDuration <= endMinutes) {

        const slotStart = minutesToTime(currentTime);

        const slotEnd = minutesToTime(
            currentTime + slotDuration
        );

        slots.push({
            startTime: slotStart,
            endTime: slotEnd
        });

        currentTime += slotDuration;
    }

    return slots;
};

export {
    generateSlots
};