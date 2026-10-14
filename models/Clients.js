const mongoose = require("mongoose");

const clientsSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: [true, "Le nom complet est obligatoire"],
      trim: true,
      maxlength: 150,
    },

    phone: {
      type: String,
      required: [true, "Le numéro de téléphone est obligatoire"],
      trim: true,
      match: {
        validator: (value) => /^(0[5-7]\d{8}|\+212[5-7]\d{8})$/.test(value),
        message: "Numéro de téléphone invalide",
      },
    },

    city: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    address: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.Client ||
  mongoose.model("Client", clientsSchema);

