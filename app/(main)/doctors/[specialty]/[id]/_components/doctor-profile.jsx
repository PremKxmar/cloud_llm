"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  User,
  Calendar,
  Clock,
  Medal,
  FileText,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { SlotPicker } from "./slot-picker";
import { AppointmentForm } from "./appointment-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

export function DoctorProfile({ doctor, availableDays, specialty, initialError }) {
  const [showBooking, setShowBooking] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [error, setError] = useState(initialError || null);
  const router = useRouter();

  // Clear errors when user interacts with the booking flow
  const clearError = () => {
    setError(null);
  };

  // Calculate total available slots
  const totalSlots = availableDays?.reduce(
    (total, day) => total + day.slots.length,
    0
  );

  const toggleBooking = () => {
    clearError();
    setShowBooking(!showBooking);
    if (!showBooking) {
      // Scroll to booking section when expanding
      setTimeout(() => {
        document.getElementById("booking-section")?.scrollIntoView({
          behavior: "smooth",
        });
      }, 100);
    }
  };

  const handleSlotSelect = (slot) => {
    clearError();
    setSelectedSlot(slot);
  };

  const handleBookingComplete = () => {
    toast.success("Appointment booked successfully!");
    router.push("/appointments");
  };

  const handleBookingError = (errorMessage) => {
    setError(errorMessage);
    // Scroll to error message
    setTimeout(() => {
      document.getElementById("booking-error")?.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }, 100);
  };

  const handleBack = () => {
    setSelectedSlot(null);
    clearError();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Left column - Doctor Photo and Quick Info (fixed on scroll) */}
      <div className="md:col-span-1">
        <div className="md:sticky md:top-24">
          <Card className="border-emerald-900/20 bg-background/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="relative w-32 h-32 rounded-full overflow-hidden mb-4 bg-emerald-900/20">
                  {doctor?.imageUrl ? (
                    <Image
                      src={doctor.imageUrl}
                      alt={doctor.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="h-16 w-16 text-emerald-400" />
                    </div>
                  )}
                </div>

                <h2 className="text-xl font-bold text-white mb-1">
                  {doctor ? `Dr. ${doctor.name}` : "Doctor Not Found"}
                </h2>

                {doctor && (
                  <Badge
                    variant="outline"
                    className="bg-emerald-900/20 border-emerald-900/30 text-emerald-400 mb-4"
                  >
                    {doctor.specialty}
                  </Badge>
                )}

                {doctor && (
                  <div className="flex items-center justify-center mb-2">
                    <Medal className="h-4 w-4 text-emerald-400 mr-2" />
                    <span className="text-muted-foreground">
                      {doctor.experience} years experience
                    </span>
                  </div>
                )}

                {doctor && (
                  <Button
                    onClick={toggleBooking}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 mt-4"
                  >
                    {showBooking ? (
                      <>
                        Hide Booking
                        <ChevronUp className="ml-2 h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Book Appointment
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right column - Doctor Details and Booking Section */}
      <div className="md:col-span-2 space-y-6">
        {error && (
          <div id="booking-error" className="relative">
            <Alert className="border-red-500/30 bg-red-900/10 text-red-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
              <button 
                onClick={() => setError(null)}
                className="absolute top-2 right-2 text-red-300 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </Alert>
          </div>
        )}

        {doctor ? (
          <>
            <Card className="border-emerald-900/20 bg-background/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white">
                  About Dr. {doctor.name}
                </CardTitle>
                <CardDescription>
                  Professional background and expertise
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-emerald-400" />
                    <h3 className="text-white font-medium">Description</h3>
                  </div>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {doctor.description}
                  </p>
                </div>

                <Separator className="bg-emerald-900/20" />

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-emerald-400" />
                    <h3 className="text-white font-medium">Availability</h3>
                  </div>
                  {totalSlots > 0 ? (
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-emerald-400 mr-2" />
                      <p className="text-muted-foreground">
                        {totalSlots} time slots available for booking over the next
                        4 days
                      </p>
                    </div>
                  ) : (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        No available slots for the next 4 days. Please check back
                        later.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Booking Section - Conditionally rendered */}
            {showBooking && (
              <div id="booking-section">
                <Card className="border-emerald-900/20 bg-background/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-white">
                      Book an Appointment
                    </CardTitle>
                    <CardDescription>
                      Select a time slot and provide details for your consultation
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {totalSlots > 0 ? (
                      <>
                        {/* Slot selection step */}
                        {!selectedSlot && (
                          <SlotPicker
                            days={availableDays}
                            onSelectSlot={handleSlotSelect}
                          />
                        )}

                        {/* Appointment form step */}
                        {selectedSlot && (
                          <AppointmentForm
                            doctorId={doctor.id}
                            slot={selectedSlot}
                            onBack={handleBack}
                            onComplete={handleBookingComplete}
                            onError={handleBookingError}
                          />
                        )}
                      </>
                    ) : (
                      <div className="text-center py-6">
                        <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                        <h3 className="text-xl font-medium text-white mb-2">
                          No available slots
                        </h3>
                        <p className="text-muted-foreground">
                          This doctor doesn&apos;t have any available appointment
                          slots for the next 4 days. Please check back later or try
                          another doctor.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        ) : (
          <Card className="border-emerald-900/20 bg-background/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white">
                Doctor Not Found
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  The doctor you're looking for could not be found. Please check the URL or go back to the{" "}
                  <button 
                    onClick={() => router.push(`/doctors/${specialty}`)}
                    className="text-emerald-400 hover:text-emerald-300 underline"
                  >
                    {specialty.charAt(0).toUpperCase() + specialty.slice(1)} Doctors
                  </button>
                  {" "}list.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
