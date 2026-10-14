const mongoose = require("mongoose");
const Client = require("../models/Clients");
const dbConnect = require("../lib/connectionDb");

const addClient = async (req, res) => {
  try {
    await dbConnect();

    const { fullname, phone, city, address } = req.body || {};

    if (
      typeof fullname !== "string" ||
      !fullname.trim() ||
      typeof phone !== "string" ||
      !phone.trim() ||
      typeof city !== "string" ||
      !city.trim() ||
      typeof address !== "string" ||
      !address.trim()
    ) {
      return res.status(400).json({
        message: "الاسم والهاتف والمدينة والعنوان معلومات ضرورية",
      });
    }

    const newClient = await Client.create({
      fullname: fullname.trim(),
      phone: phone.trim(),
      city: city.trim(),
      address: address.trim(),
    });

    return res.status(201).json({
      message: "تم تسجيل الزبون بنجاح",
      client: newClient,
    });
  } catch (err) {
    console.error("addClient error:", err);

    if (err instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        message: "المعلومات المدخلة غير صالحة",
        errors: Object.values(err.errors).map((e) => e.message),
      });
    }

    return res.status(500).json({
      message: "وقع خطأ أثناء تسجيل الزبون",
    });
  }
};

module.exports = { addClient };
