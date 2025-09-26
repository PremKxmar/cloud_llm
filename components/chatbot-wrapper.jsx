"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import ChatBot from "./chatbot";

const ChatBotWrapper = () => {
  const { user, isLoaded } = useUser();
  const [userRole, setUserRole] = useState(null);
  const [isPatient, setIsPatient] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      if (!isLoaded || !user) {
        setLoading(false);
        return;
      }
      
      try {
        // We'll check the user's role by calling our checkUser function
        const response = await fetch("/api/user-role", {
          method: "GET",
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUserRole(userData.role);
          // Show chatbot for patients and unassigned users (new users who haven't selected a role)
          setIsPatient(userData.role === "PATIENT" || userData.role === "UNASSIGNED");
        } else {
          // If API fails, show chatbot for authenticated users (they can still benefit from health info)
          setIsPatient(true);
        }
      } catch (error) {
        console.error("Error checking user role:", error);
        // On error, show chatbot for authenticated users
        setIsPatient(true);
      } finally {
        setLoading(false);
      }
    };

    checkUserRole();
  }, [user, isLoaded]);

  // Don't show anything while loading or if user is not loaded
  if (loading || !isLoaded) {
    return null;
  }

  // Only show chatbot for authenticated users who are patients or unassigned
  // Don't show for doctors or admins to avoid clutter in their interface
  if (!user || !isPatient || userRole === "DOCTOR" || userRole === "ADMIN") {
    return null;
  }

  return <ChatBot />;
};

export default ChatBotWrapper;
