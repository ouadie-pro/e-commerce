const mongoose = require("mongoose");
const Product = require("../models/Products");
const dbConnect = require("../lib/connectionDb");

// إضافة منتج
const addProduct = async (req, res) => {
  try {
    await dbConnect();

    const { name, description, price, image, category } =
      req.body || {};

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof description !== "string" ||
      !description.trim() ||
      price === undefined ||
      price === null ||
      price === "" ||
      !Number.isFinite(Number(price)) ||
      Number(price) < 0 ||
      typeof image !== "string" ||
      !image.trim() ||
      typeof category !== "string" ||
      !category.trim()
    ) {
      return res.status(400).json({
        message: "معلومات المنتج غير مكتملة أو غير صالحة",
      });
    }

    const newProduct = await Product.create({
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      image: image.trim(),
      category: category.trim(),
    });

    return res.status(201).json({
      message: "تمت إضافة المنتج بنجاح",
      product: newProduct,
    });
  } catch (err) {
    console.error("addProduct error:", err);

    if (err instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        message: "بيانات المنتج غير صالحة",
        errors: Object.values(err.errors).map((e) => e.message),
      });
    }

    return res.status(500).json({
      message: "وقع خطأ أثناء إضافة المنتج",
    });
  }
};

// جلب المنتجات
const getAllProducts = async (req, res) => {
  try {
    await dbConnect();

    const products = await Product.find({ isActive: true })
      .sort({ createdAt: -1 });

    return res.status(200).json({ products });
  } catch (err) {
    console.error("getAllProducts error:", err);

    return res.status(500).json({
      message: "وقع خطأ أثناء جلب المنتجات",
    });
  }
};

// حذف منتج
const deleteProduct = async (req, res) => {
  try {
    await dbConnect();

    const { id } = req.params;

    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "معرّف المنتج غير صالح",
      });
    }

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({
        message: "المنتج غير موجود",
      });
    }

    return res.status(200).json({
      message: "تم حذف المنتج بنجاح",
      product: deletedProduct,
    });
  } catch (err) {
    console.error("deleteProduct error:", err);

    return res.status(500).json({
      message: "وقع خطأ أثناء حذف المنتج",
    });
  }
};

// تعديل منتج
const editProduct = async (req, res) => {
  try {
    await dbConnect();

    const { id } = req.params;
    const { name, description, price, image, category } =
      req.body || {};

    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "معرّف المنتج غير صالح",
      });
    }

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof description !== "string" ||
      !description.trim() ||
      price === undefined ||
      price === null ||
      price === "" ||
      !Number.isFinite(Number(price)) ||
      Number(price) < 0 ||
      typeof image !== "string" ||
      !image.trim() ||
      typeof category !== "string" ||
      !category.trim()
    ) {
      return res.status(400).json({
        message: "معلومات المنتج غير مكتملة أو غير صالحة",
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        image: image.trim(),
        category: category.trim(),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        message: "المنتج غير موجود",
      });
    }

    return res.status(200).json({
      message: "تم تعديل المنتج بنجاح",
      product: updatedProduct,
    });
  } catch (err) {
    console.error("editProduct error:", err);

    if (err instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        message: "بيانات المنتج غير صالحة",
        errors: Object.values(err.errors).map((e) => e.message),
      });
    }

    return res.status(500).json({
      message: "وقع خطأ أثناء تعديل المنتج",
    });
  }
};

module.exports = {
  addProduct,
  getAllProducts,
  deleteProduct,
  editProduct,
};
