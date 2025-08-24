"use client";

import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { Loader2, Clock, ArrowLeft, Calendar, CreditCard } from "lucide-react";
import { bookAppointment } from "@/actions/appointments";
import { toast } from "sonner";
import useFetch from "@/hooks/use-fetch";

export function AppointmentForm({ 
  doctorId, 
  slot, 
  onBack, 
  onComplete,
  onError 
}) {
  const [description, setDescription] = useState("");
  const [credits, setCredits] = useState(null);
  const [creditsLoading, setCreditsLoading] = useState(true);

  // Use the useFetch hook to handle loading, data, and error states
  const { loading, data, error, fn: submitBooking } = useFetch(async (formData) => {
    try {
      const result = await bookAppointment(formData);
      return result;
    } catch (err) {
      // Return the error message in a consistent format
      return {
        success: false,
        error: err.message || "Failed to book appointment. Please try again."
      };
    }
  });

  // Fetch user credits on mount
  useEffect(() => {
    const fetchCredits = async () => {
      try {
        setCreditsLoading(true);
        const response = await fetch('/api/credits');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch credits: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
          setCredits(result.credits);
        } else {
          console.error("Credit fetch failed:", result.error);
          setCredits(0);
          toast.error("Could not load your credit balance. Please try again.");
        }
      } catch (err) {
        console.error("Error fetching credits:", err);
        setCredits(0);
        toast.error("Network error: Could not load credit balance");
      } finally {
        setCreditsLoading(false);
      }
    };

    fetchCredits();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if credits have been loaded
    if (credits === null) {
      toast.error("Credit information not loaded. Please try again.");
      return;
    }

    // Check if user has enough credits
    if (credits < 2) {
      toast.error("Not enough credits! You need 2 credits to book an appointment.");
      onError("Not enough credits! You need 2 credits to book an appointment.");
      return;
    }

    // Create form data
    const formData = new FormData();
    formData.append("doctorId", doctorId);
    formData.append("startTime", slot.startTime);
    formData.append("endTime", slot.endTime);
    formData.append("description", description);

    // Submit booking using the function from useFetch
    await submitBooking(formData);
  };

  // Handle response after booking attempt
  useEffect(() => {
    if (data) {
      if (data.success) {
        onComplete();
      } else if (data.error) {
        // Handle specific error cases
        if (data.error.includes("Insufficient credits")) {
          toast.error("Not enough credits! You need 2 credits to book an appointment.");
          onError("Not enough credits! You need 2 credits to book an appointment.");
        } else if (data.error.includes("already booked")) {
          toast.error("This time slot is no longer available. Please select another time.");
          onError("This time slot is no longer available. Please select another time.");
        } else {
          toast.error(data.error);
          onError(data.error);
        }
      }
    }
    
    if (error) {
      console.error("Booking error:", error);
      const errorMessage = error.message || "Failed to book appointment. Please try again.";
      toast.error(errorMessage);
      onError(errorMessage);
    }
  }, [data, error, onComplete, onError]);

  // Show loading state while credits are being fetched
  if (creditsLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
        <span className="ml-2 text-muted-foreground">Loading credit balance...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-muted/20 p-4 rounded-lg border border-emerald-900/20 space-y-3">
        <div className="flex items-center">
          <Calendar className="h-5 w-5 text-emerald-400 mr-2" />
          <span className="text-white font-medium">
            {format(new Date(slot.startTime), "EEEE, MMMM d, yyyy")}
          </span>
        </div>
        <div className="flex items-center">
          <Clock className="h-5 w-5 text-emerald-400 mr-2" />
          <span className="text-white">{slot.formatted}</span>
        </div>
        <div className="flex items-center">
          <CreditCard className="h-5 w-5 text-emerald-400 mr-2" />
          <span className="text-muted-foreground">
            Cost: <span className="text-white font-medium">2 credits</span>
            {credits !== null && credits < 2 && (
              <span className="text-red-400 ml-2"> (You have {credits} credits)</span>
            )}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">
          Describe your medical concern (optional)
        </Label>
        <Textarea
          id="description"
          placeholder="Please provide any details about your medical concern or what you'd like to discuss in the appointment..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="bg-background border-emerald-900/20 h-32"
          disabled={loading}
        />
        <p className="text-sm text-muted-foreground">
          This information will be shared with the doctor before your appointment.
        </p>
      </div>

      <div className="flex justify-between pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={loading}
          className="border-emerald-900/30"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Change Time Slot
        </Button>
        <Button
          type="submit"
          disabled={loading || (credits !== null && credits < 2)}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Booking...
            </>
          ) : credits !== null && credits < 2 ? (
            "Get More Credits"
          ) : (
            "Confirm Booking"
          )}
        </Button>
      </div>
    </form>
  );
}
