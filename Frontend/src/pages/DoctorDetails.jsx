import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { bookAppointment, getAvailableSlots } from "../services/appointementApi";

//import {getAvailableSlots,bookAppointment} from "../services/appointmentApi";
    
    



function DoctorDetails (){

    const { doctorId } = useParams();

    const [date, setDate] = useState("");

    const [slots, setSlots] = useState([]);

    const [selectedSlot, setSelectedSlot] = useState(null);

    const [loading, setLoading] = useState(false);

    const [booking, setBooking] = useState(false);

    const [message, setMessage] = useState("");


    // Get slots for selected date

    const fetchSlots = async () => {

        if (!date) {
            return;
        }

        try {

            setLoading(true);

            setSelectedSlot(null);

            setMessage("");

            const response = await getAvailableSlots(
                doctorId,
                date
            );

            setSlots(response.data.slots);

        } catch (error) {

            console.log(
                error.response?.data?.message ||
                "Failed to fetch slots"
            );

            setSlots([]);

        } finally {

            setLoading(false);

        }
    };


    // Book selected appointment

    const handleBookAppointment = async () => {

    if (!selectedSlot) {

        setMessage(
            "Please select a slot"
        );

        return;
    }

    try {

        setBooking(true);

        setMessage("");

        const response = await bookAppointment({

            doctorId,

            date,

            startTime:
                selectedSlot.startTime,

            endTime:
                selectedSlot.endTime

        });

        console.log(
            "BOOKING SUCCESS:",
            response
        );

        // Show success message

        setMessage(
            response.message ||
            "Appointment booked successfully"
        );

        setSelectedSlot(null);

        // Refresh slots WITHOUT calling fetchSlots()
        // because fetchSlots() clears the message

        const slotsResponse =
            await getAvailableSlots(
                doctorId,
                date
            );

        setSlots(
            slotsResponse.data.slots
        );

    } catch (error) {

        console.log(
            "BOOKING ERROR:",
            error.response?.data
        );

        setMessage(
            error.response?.data?.message ||
            "Failed to book appointment"
        );

    } finally {

        setBooking(false);

    }
};


    // Fetch slots whenever date changes

    useEffect(() => {

        if (date) {

            fetchSlots();

        }

    }, [date]);


    return (

        <div>

            <h1>
                Doctor Details
            </h1>


            {/* Date */}

            <div>

                <label>
                    Select Date
                </label>

                <br />

                <input
                    type="date"
                    value={date}
                    onChange={(e) =>
                        setDate(e.target.value)
                    }
                />

            </div>


            {/* Loading */}

            {loading && (

                <p>
                    Loading slots...
                </p>

            )}


            {/* No slots */}

            {!loading &&
                date &&
                slots.length === 0 && (

                    <p>
                        No slots available for this date.
                    </p>

                )
            }


            {/* Slots */}

            <div>

                {slots.map((slot, index) => (

                    <button
                        key={index}
                        onClick={() =>
                            setSelectedSlot(slot)
                        }
                    >

                        {slot.startTime}

                        {" - "}

                        {slot.endTime}

                    </button>

                ))}

            </div>


            {/* Selected slot */}

            {selectedSlot && (

                <div>

                    <p>
                        Selected Slot:
                    </p>

                    <p>

                        {selectedSlot.startTime}

                        {" - "}

                        {selectedSlot.endTime}

                    </p>


                    <button
                        onClick={
                            handleBookAppointment
                        }
                        disabled={booking}
                    >

                        {booking
                            ? "Booking..."
                            : "Book Appointment"
                        }

                    </button>

                </div>

            )}


            {/* Message */}

            {message && (

                <p>
                    {message}
                </p>

            )}

        </div>
    );
};


export default DoctorDetails;