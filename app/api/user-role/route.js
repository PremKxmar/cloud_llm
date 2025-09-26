import { NextResponse } from "next/server";
import { checkUser } from "@/lib/checkUser";

export async function GET() {
  try {
    const user = await checkUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      role: user.role,
      name: user.name,
      email: user.email
    });
    
  } catch (error) {
    console.error("Error checking user role:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
