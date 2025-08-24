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

    // If doctor not found, throw error to be caught in catch block
    if (!doctorData?.doctor) {
      throw new Error("Doctor not found");
    }

    return (
      <DoctorProfile
        doctor={doctorData.doctor}
        availableDays={slotsData.days || []}
        specialty={specialty}
      />
    );
  } catch (error) {
    console.error("Error loading doctor profile:", error);
    // Redirect to the specific specialty page, not the root doctors path
    redirect(`/doctors/${specialty}`);
  }
}
