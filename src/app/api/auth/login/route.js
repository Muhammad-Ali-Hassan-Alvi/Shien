import { userService } from "@/app/lib/controller/user.service";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { user, accessToken, refreshToken } = await userService.login(body);

    const response = NextResponse.json({
      message: "Login Success",
      data: user,
    });

    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 10,
      sameSite: "lax",
    });

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 401 });
  }
}
