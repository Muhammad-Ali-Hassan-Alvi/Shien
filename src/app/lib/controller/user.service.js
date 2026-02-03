import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../model/User";
import connectDB from "../config/db.js";

export const userService = {
  register: async ({ userName, email, password }) => {
    await connectDB();

    if (!userName || !email || !password) throw new Error("Missing fields");

    const existingUser = await User.findOne({ email });

    if (existingUser) throw new Error("User already exists");

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      userName,
      email,
      password: hashedPassword,
    });

    const { password: _, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  },

  login: async ({ email, password }) => {
    await connectDB();

    if (!email || !password) throw new Error("Please Enter all Fields");

    const user = await User.findOne({ email });

    if (!user) throw new Error("User not found. Please Register...");

    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched) throw new Error("Invalid Credentials");

    const accessToken = jwt.sign(
      { id: user._id, role: user.userType },
      process.env.JWT_SECRET,
      {
        expiresIn: "10d",
      }
    );

    const refreshToken = jwt.sign(
      { id: user._id, role: user.userType },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    user.refreshToken = refreshToken;
    await user.save();

    // res.setHeader("Set-Cookie", [
    //   cookie.serialize("accessToken", accessToken, {
    //     httpOnly: true,
    //     secure: process.env.NODE_ENV === "production",
    //     sameSite: "lax",
    //     maxAge: 60 * 60 * 24 * 10,
    //     path: "/",
    //   }),
    //   cookie.serialize("refreshToken", refreshToken, {
    //     httpOnly: true,
    //     secure: process.env.NODE_ENV === "production",
    //     sameSite: "lax",
    //     maxAge: 60 * 60 * 24 * 30,
    //     path: "/",
    //   }),
    // ]);

    const { password: _, ...userWithoutPassword } = user.toObject();
    return { user: userWithoutPassword, accessToken, refreshToken };
  },

  getProfile: async (userId) => {
    await connectDB();

    const user = await User.findById(userId).select("-password");
    if (!user) throw new Error("User not found");

    return user;
  },

  updateProfile: async (userId, updateData) => {
    await connectDB();
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).select("-password");

    if (!updateData) throw new Error("Error Updating the User");

    return updatedUser;
  },

  updateShippingAddress: async (userId, addressData) => {
    await connectDB();
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    user.shippingAddress = addressData;
    await user.save();

    return user;
  },

  logout: async (refreshToken) => {
    await connectDB();
    if (!refreshToken) throw new Error("Unable to Logout...");

    const user = await User.findOne({ refreshToken });
    if (!user) throw new Error("User not found");

    user.refreshToken = null;
    await user.save();

    return { success: true };
  },

  refreshToken: async (refreshToken) => {
    await connectDB();
    if (!refreshToken)
      throw new Error("Session Expired. Please Login Again...");

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user || user.refreshToken !== refreshToken)
      throw new Error("Invalid Refresh Token");

    const newAccessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "10d" }
    );

    const newRefreshToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    user.refreshToken = newRefreshToken;
    await user.save();

    return { user, newAccessToken, newRefreshToken };
  },

  deleteProfile: async (userId) => {
    await connectDB();
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    await User.findByIdAndDelete(userId);
    return { success: true };
  },
};
