import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the user from database
    const user = await db.user.findUnique({
      where: { clerkUserId: userId }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Return the user's credit balance
    return NextResponse.json({
      success: true,
      credits: user.credits || 0,
      message: "Credits retrieved successfully"
    });

  } catch (error) {
    console.error("Error fetching credits:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch credits: " + (error.message || "Unknown error") 
      },
      { status: 500 }
    );
  }
}
