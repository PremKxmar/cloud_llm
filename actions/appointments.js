"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { deductCreditsForAppointment } from "@/actions/credits";
import { Vonage } from "@vonage/server-sdk";
import { addDays, addMinutes, format, isBefore, endOfDay } from "date-fns";
import { Auth } from "@vonage/auth";

// Initialize Vonage Video API client with proper private key formatting
let privateKey = process.env.VONAGE_PRIVATE_KEY || "";

// Add proper PEM formatting if missing
if (privateKey && !privateKey.startsWith('-----BEGIN PRIVATE KEY-----')) {
  privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey.trim()}\n-----END PRIVATE KEY-----`;
}

const credentials = new Auth({
  applicationId: process.env.NEXT_PUBLIC_VONAGE_APPLICATION_ID,
  privateKey: privateKey
});
const options = {};
const vonage = new Vonage(credentials, options);

/**
 * Book a new appointment with a doctor
 */
export async function bookAppointment(formData) {
  const { userId } = await auth();

  if (!userId) {
    return {
      success: false,
      error: "Unauthorized. Please sign in to book an appointment."
    };
  }

  try {
    // Get the patient user
    const patient = await db.user.findUnique({
      where: {
        clerkUserId: userId,
        role: "PATIENT",
      },
    });

    if (!patient) {
      return {
        success: false,
        error: "Patient not found. Please complete your profile."
      };
    }

    // Parse form data
    const doctorId = formData.get("doctorId");
    const startTime = new Date(formData.get("startTime"));
    const endTime = new Date(formData.get("endTime"));
    const patientDescription = formData.get("description") || null;

    // Validate input
    if (!doctorId || !startTime || !endTime) {
      return {
        success: false,
        error: "Doctor, start time, and end time are required"
      };
    }

    // Check if the doctor exists and is verified
    const doctor = await db.user.findUnique({
      where: {
        id: doctorId,
        role: "DOCTOR",
        verificationStatus: "VERIFIED",
      },
    });

    if (!doctor) {
      return {
        success: false,
        error: "Doctor not found or not verified"
      };
    }

    // Check if the patient has enough credits (2 credits per appointment)
    if (patient.credits < 2) {
      return {
        success: false,
        error: "Insufficient credits to book an appointment"
      };
    }

    // Check if the requested time slot is available
    const overlappingAppointment = await db.appointment.findFirst({
      where: {
        doctorId: doctorId,
        status: "SCHEDULED",
        OR: [
          {
            // New appointment starts during an existing appointment
            startTime: {
              lte: startTime,
            },
            endTime: {
              gt: startTime,
            },
          },
          {
            // New appointment ends during an existing appointment
            startTime: {
              lt: endTime,
            },
            endTime: {
              gte: endTime,
            },
          },
          {
            // New appointment completely overlaps an existing appointment
            startTime: {
              gte: startTime,
            },
            endTime: {
              lte: endTime,
            },
          },
        ],
      },
    });

    if (overlappingAppointment) {
      return {
        success: false,
        error: "This time slot is already booked. Please select another time."
      };
    }

    // Create a new Vonage Video API session
    const sessionId = await createVideoSession();

    // Deduct credits from patient and add to doctor
    const { success, error } = await deductCreditsForAppointment(
      patient.id,
      doctor.id
    );

    if (!success) {
      return {
        success: false,
        error: error || "Failed to deduct credits"
      };
    }

    // Create the appointment with the video session ID
    const appointment = await db.appointment.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        startTime,
        endTime,
        patientDescription,
        status: "SCHEDULED",
        videoSessionId: sessionId,
      },
    });

    revalidatePath("/appointments");
    return { success: true, appointment: appointment };
  } catch (error) {
    console.error("Failed to book appointment:", error);
    return {
      success: false,
      error: "Failed to book appointment: " + (error.message || "Unknown error")
    };
  }
}

/**
 * Generate a Vonage Video API session
 */
async function createVideoSession() {
  try {
    const session = await vonage.video.createSession({ mediaMode: "routed" });
    return session.sessionId;
  } catch (error) {
    throw new Error("Failed to create video session: " + error.message);
  }
}

/**
 * Generate a token for a video session
 */
export async function generateVideoToken(formData) {
  const { userId } = await auth();

  if (!userId) {
    return {
      success: false,
      error: "Unauthorized. Please sign in to join the call."
    };
  }

  try {
    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found"
      };
    }

    const appointmentId = formData.get("appointmentId");

    if (!appointmentId) {
      return {
        success: false,
        error: "Appointment ID is required"
      };
    }

    // Find the appointment and verify the user is part of it
    const appointment = await db.appointment.findUnique({
      where: {
        id: appointmentId,
      },
    });

    if (!appointment) {
      return {
        success: false,
        error: "Appointment not found"
      };
    }

    // Verify the user is either the doctor or the patient for this appointment
    if (appointment.doctorId !== user.id && appointment.patientId !== user.id) {
      return {
        success: false,
        error: "You are not authorized to join this call"
      };
    }

    // Verify the appointment is scheduled
    if (appointment.status !== "SCHEDULED") {
      return {
        success: false,
        error: "This appointment is not currently scheduled"
      };
    }

    // Verify the appointment is within a valid time range
    const now = new Date();
    const appointmentTime = new Date(appointment.startTime);
    const timeDifference = (appointmentTime - now) / (1000 * 60);

    if (timeDifference > 30) {
      return {
        success: false,
        error: "The call will be available 30 minutes before the scheduled time"
      };
    }

    // Generate a token for the video session
    const appointmentEndTime = new Date(appointment.endTime);
    const expirationTime =
      Math.floor(appointmentEndTime.getTime() / 1000) + 60 * 60;

    // Use user's name and role as connection data
    const connectionData = JSON.stringify({
      name: user.name,
      role: user.role,
      userId: user.id,
    });

    // Generate the token with appropriate role and expiration
    const token = vonage.video.generateClientToken(appointment.videoSessionId, {
      role: "publisher",
      expireTime: expirationTime,
      data: connectionData,
    });

    // Update the appointment with the token
    await db.appointment.update({
      where: {
        id: appointmentId,
      },
      data: {
        videoSessionToken: token,
      },
    });

    return {
      success: true,
      videoSessionId: appointment.videoSessionId,
      token: token,
    };
  } catch (error) {
    console.error("Failed to generate video token:", error);
    return {
      success: false,
      error: "Failed to generate video token: " + (error.message || "Unknown error")
    };
  }
}

/**
 * Get doctor by ID
 */
export async function getDoctorById(doctorId) {
  try {
    const doctor = await db.user.findUnique({
      where: {
        id: doctorId,
        role: "DOCTOR",
        verificationStatus: "VERIFIED",
      },
    });

    if (!doctor) {
      return {
        success: false,
        error: "Doctor not found"
      };
    }

    return { 
      success: true,
      doctor 
    };
  } catch (error) {
    console.error("Failed to fetch doctor:", error);
    return {
      success: false,
      error: "Failed to fetch doctor details: " + (error.message || "Unknown error")
    };
  }
}

/**
 * Get available time slots for booking for the next 4 days
 */
export async function getAvailableTimeSlots(doctorId) {
  try {
    // Validate doctor existence and verification
    const doctor = await db.user.findUnique({
      where: {
        id: doctorId,
        role: "DOCTOR",
        verificationStatus: "VERIFIED",
      },
    });

    if (!doctor) {
      return {
        success: false,
        error: "Doctor not found or not verified"
      };
    }

    // Fetch a single availability record
    const availability = await db.availability.findFirst({
      where: {
        doctorId: doctor.id,
        status: "AVAILABLE",
      },
    });

    if (!availability) {
      return {
        success: false,
        error: "No availability set by doctor"
      };
    }

    // Get the next 4 days
    const now = new Date();
    const days = [now, addDays(now, 1), addDays(now, 2), addDays(now, 3)];

    // Fetch existing appointments for the doctor over the next 4 days
    const lastDay = endOfDay(days[3]);
    const existingAppointments = await db.appointment.findMany({
      where: {
        doctorId: doctor.id,
        status: "SCHEDULED",
        startTime: {
          lte: lastDay,
        },
      },
    });

    const availableSlotsByDay = {};

    // For each of the next 4 days, generate available slots
    for (const day of days) {
      const dayString = format(day, "yyyy-MM-dd");
      availableSlotsByDay[dayString] = [];

      // Extract hours and minutes from availability times using LOCAL time
      const startHours = availability.startTime.getHours();
      const startMinutes = availability.startTime.getMinutes();
      const endHours = availability.endTime.getHours();
      const endMinutes = availability.endTime.getMinutes();

      // Create date objects for the target day using LOCAL time
      const availabilityStart = new Date(
        day.getFullYear(),
        day.getMonth(),
        day.getDate(),
        startHours,
        startMinutes
      );
      
      const availabilityEnd = new Date(
        day.getFullYear(),
        day.getMonth(),
        day.getDate(),
        endHours,
        endMinutes
      );

      let current = new Date(availabilityStart);
      const end = new Date(availabilityEnd);

      while (isBefore(current, end) || +current === +end) {
        const next = addMinutes(current, 30);
        
        // Skip slots that end after the availability end time
        if (isBefore(end, next)) {
          break;
        }

        // Skip past slots
        if (isBefore(next, now)) {
          current = next;
          continue;
        }

        const overlaps = existingAppointments.some((appointment) => {
          const aStart = new Date(appointment.startTime);
          const aEnd = new Date(appointment.endTime);

          return (
            (current >= aStart && current < aEnd) ||
            (next > aStart && next <= aEnd) ||
            (current <= aStart && next >= aEnd)
          );
        });

        if (!overlaps) {
          availableSlotsByDay[dayString].push({
            startTime: current.toISOString(),
            endTime: next.toISOString(),
            formatted: `${format(current, "h:mm a")} - ${format(next, "h:mm a")}`,
            day: format(current, "EEEE, MMMM d"),
          });
        }

        current = next;
      }
    }

    // Convert to array of slots grouped by day for easier consumption by the UI
    const result = Object.entries(availableSlotsByDay).map(([date, slots]) => ({
      date,
      displayDate:
        slots.length > 0
          ? slots[0].day
          : format(new Date(date), "EEEE, MMMM d"),
      slots,
    }));

    return { 
      success: true,
      days: result 
    };
  } catch (error) {
    console.error("Failed to fetch available slots:", error);
    return {
      success: false,
      error: "Failed to fetch available time slots: " + (error.message || "Unknown error")
    };
  }
}
