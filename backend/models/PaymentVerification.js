import mongoose from "mongoose";

const paymentVerificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["upi", "qr"],
      required: true,
    },
    upiIdUsed: {
      type: String,
    },
    utr: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (v) {
          return /^\d{12}$/.test(v);
        },
        message: (props) =>
          `${props.value} is not a valid 12-digit UTR number!`,
      },
    },
    screenshotUrl: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    adminNotes: {
      type: String,
      default: "",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "PaymentVerification",
  },
);

const PaymentVerification = mongoose.model(
  "PaymentVerification",
  paymentVerificationSchema,
);
export default PaymentVerification;
