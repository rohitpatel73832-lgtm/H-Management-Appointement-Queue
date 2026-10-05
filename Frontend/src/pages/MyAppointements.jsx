import { useEffect, useState } from "react";
import { getMyAppointments } from "../services/appointementApi";

//import {  getMyAppointments } from "../services/appointmentApi";


const MyAppointments = () => {

    const [appointments, setAppointments] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    // Fetch appointments

    const fetchAppointments = async () => {

        try {

            setLoading(true);

            const response =
                await getMyAppointments();

            setAppointments(
                response.data.appointments
            );

        } catch (error) {

            setError(
                error.response?.data?.message ||
                "Failed to fetch appointments"
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        fetchAppointments();

    }, []);


    // Loading

    if (loading) {

        return (
            <div>
                Loading appointments...
            </div>
        );

    }


    // Error

    if (error) {

        return (
            <div>
                {error}
            </div>
        );

    }


    return (

        <div>

            <h1>
                My Appointments
            </h1>


            {appointments.length === 0 ? (

                <p>
                    You don't have any appointments.
                </p>

            ) : (

                appointments.map(
                    (appointment) => (

                        <div
                            key={appointment._id}
                        >

                            <h2>

                                {
                                    appointment.doctor
                                        ?.user?.name
                                }

                            </h2>


                            <p>

                                {
                                    appointment.doctor
                                        ?.specialization
                                }

                            </p>


                            <p>

                                Date:{" "}
                                {appointment.date}

                            </p>


                            <p>

                                Time:{" "}

                                {appointment.startTime}

                                {" - "}

                                {appointment.endTime}

                            </p>


                            <p>

                                Status:{" "}

                                {appointment.status}

                            </p>

                        </div>

                    )
                )

            )}

        </div>

    );
};


export default MyAppointments;