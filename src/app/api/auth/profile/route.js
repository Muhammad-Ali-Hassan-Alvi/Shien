import { userService } from "@/app/lib/controller/user.service";
import { NextResponse } from "next/server";
import { getAuthUser } from "@/app/lib/middleware/authMiddleware";

export async function GET(req) {
  try {
    const authUser = await getAuthUser(req);
    const user = await userService.getProfile(authUser.id);
    return NextResponse.json({
      message: "Profile Fetched Successfully",
      data: user,
    });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const authUser = await getAuthUser(req);
    const body = await req.body();
    const updatedUser = await userService.updateProfile(authUser._id, body);
    return NextResponse(
      { message: "Profile Updated Successfully", data: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
