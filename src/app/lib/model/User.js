import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      // required: [true, "Please provide a name"], // Relax requirement if we use userName
    },
    userName: { type: String }, // Legacy field mapping

    email: {
      type: String,
      unique: true,
      sparse: true,
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    userType: { // Legacy field support
      type: String,
      enum: ["user", "admin"],
    },
    addresses: [
      {
        fullName: String,
        phone: String,
        address: String,
        city: String,
        isDefault: { type: Boolean, default: false },
      },
    ],
    shippingAddress: [], // Legacy field support (array in provided JSON)
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
