import { getDoctorById, getAvailableTimeSlots } from "@/actions/appointments";
import { DoctorProfile } from "./_components/doctor-profile";
import { redirect } from "next/navigation";

export default async function DoctorProfilePage({ params }) {
  const { specialty, id } = await params;

  try {
    // Fetch doctor data and available slots in parallel
    const [doctorData, slotsData] = await Promise.all([
      getDoctorById(id),
      getAvailableTimeSlots(id),
    ]);

    return (
      <DoctorProfile
        doctor={doctorData.doctor}
        availableDays={slotsData.days || []}
        specialty={specialty}
      />
    );
  } catch (error) {
    console.error("Error loading doctor profile:", error);
    
    // Only redirect if the doctor isn't found
    if (error.message.includes("Doctor not found")) {
      redirect(`/doctors/${specialty}`);
    }
    
    // For other errors, still show the page but with error state
    return (
      <DoctorProfile
        doctor={null}
        availableDays={[]}
        specialty={specialty}
        initialError={error.message}
      />
    );
  }
}
