import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectToDatabase } from "@/lib/db/connect";
import User from "@/models/User";

export async function POST(request, { params }) {
  const action = params.action[0]; // login, signup, etc.

  try {
    const body = await request.json();

    if (action === "login") {
      const { email, password } = body;

      if (!email || !password) {
        return NextResponse.json(
          {
            success: false,
            message: "Email and password are required",
          },
          { status: 400 }
        );
      }

      await connectToDatabase();

      return NextResponse.json({
        success: true,
        token: "mock-token",
        data: {
          user: {
            _id: "user-id",
            name: "User Name",
            email: email,
          },
        },
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: "Unsupported action",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error(`API Error (${action}):`, error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error",
      },
      { status: 500 }
    );
  }
}
