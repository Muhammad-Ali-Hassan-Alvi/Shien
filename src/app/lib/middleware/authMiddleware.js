import jwt from "jsonwebtoken";
import User from "../model/User";
import connectDB from "../config/db";
import { NextResponse } from "next/server";

const getTokenFromRequest = (req) => {
  const cookieToken = req.cookies.get("accessToken")?.value;
  if (cookieToken) return cookieToken;

  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }
  return null;
};

export const getAuthUser = async (req) => {
  await connectDB();
  const token = getTokenFromRequest(req);

  if (!token) {
    throw new Error("UNAUTHORIZED");
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id).select("-password");

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  return user;
};
export const authorizeRoles = (user, ...allowedRoles) => {
  if (!allowedRoles.includes(user.userType)) {
    return NextResponse.json(
      {
        message: `Access Denied. Only roles [${allowedRoles.join(
          ", "
        )}] are allowed`,
      },
      { status: 403 }
    );
  }
  return true;
};
