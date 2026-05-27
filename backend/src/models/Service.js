import mongoose from "mongoose";

const ServiceSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
      min: 1,
      max: 7
    },
    key: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    nombre: {
      type: String,
      required: true,
      trim: true
    },
    descripcion: {
      type: String,
      required: true,
      trim: true
    },
    precio: {
      type: Number,
      required: true,
      min: 0
    },
    duracion_minutos: {
      type: Number,
      required: true,
      min: 1
    }
  },
  { timestamps: true, collection: "servicios" }
);

ServiceSchema.index({ id: 1, key: 1 });

const Service = mongoose.model("Service", ServiceSchema);

export default Service;
