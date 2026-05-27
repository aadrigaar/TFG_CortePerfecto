import mongoose from "mongoose";

const AppointmentSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80
    },
    service: {
      type: String,
      required: true,
      enum: [
        "Corte",
        "Tinte",
        "Peinado",
        "Corte y Peinado",
        "Tinte y Peinado",
        "Corte y Tinte",
        "Corte y Tinte y Peinado"
      ]
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    duration: {
      type: Number,
      required: true,
      min: 1
    },
    date: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/
    },
    time: {
      type: String,
      required: true,
      match: /^\d{2}:\d{2}$/
    },
    startsAt: {
      type: Date,
      required: true,
      index: true
    },
    endsAt: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "confirmed",
      index: true
    },
    source: {
      type: String,
      enum: ["chat", "admin"],
      default: "chat"
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ""
    },
    conversationId: {
      type: String,
      trim: true,
      default: ""
    }
  },
  { timestamps: true }
);

AppointmentSchema.index({ startsAt: 1, endsAt: 1, status: 1 });
AppointmentSchema.index({ customerName: 1, date: 1, time: 1, service: 1 });

const Appointment = mongoose.model("Appointment", AppointmentSchema);

export default Appointment;

