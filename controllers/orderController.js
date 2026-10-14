const mongoose = require("mongoose");

const Order = require("../models/Orders");
const Product = require("../models/Products");
const Client = require("../models/Clients");
const dbConnect = require("../lib/connectionDb");

// إنشاء طلبية جديدة
const createOrder = async (req, res) => {
  try {
    await dbConnect();

    const { fullname, phone, city, address, items } =
      req.body || {};

    // التحقق من معلومات التوصيل
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
        message: "معلومات الزبون والتوصيل ضرورية",
      });
    }

    // التحقق من المنتجات
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "الطلبية خاصها تحتوي على منتج واحد على الأقل",
      });
    }

    // التحقق من معطيات كل منتج
    for (const item of items) {
      if (
        !item.product ||
        !mongoose.isValidObjectId(item.product)
      ) {
        return res.status(400).json({
          message: "معرّف أحد المنتجات غير صالح",
        });
      }

      if (
        !Number.isInteger(item.quantity) ||
        item.quantity < 1
      ) {
        return res.status(400).json({
          message: "الكمية خاصها تكون عدداً صحيحاً موجباً",
        });
      }
    }

    // جلب المنتجات من قاعدة البيانات
    const productIds = [
      ...new Set(items.map((item) => String(item.product))),
    ];

    const products = await Product.find({
      _id: { $in: productIds },
      isActive: true,
    });

    if (products.length !== productIds.length) {
      return res.status(400).json({
        message: "كاين منتج غير موجود أو غير متوفر",
      });
    }

    // التحقق من الاختيارات وحساب الثمن في السيرفر
    let totalPrice = 0;
    const orderItems = [];

    for (const item of items) {
      const product = products.find(
        (p) => p._id.toString() === String(item.product)
      );

      if (!product) {
        return res.status(400).json({
          message: "المنتج غير موجود",
        });
      }

      const selectedCookies = item.selectedCookies;
      const platterSelections = item.platterSelections;

      if (product.category === "cookie_pack") {
        if (
          !Array.isArray(selectedCookies) ||
          selectedCookies.length !== 4
        ) {
          return res.status(400).json({
            message: "باك الكوكيز خاصو يحتوي على 4 أنواع مختلفة",
          });
        }

        const cookieNames = selectedCookies.map(
          (cookie) =>
            typeof cookie.name === "string"
              ? cookie.name.trim()
              : ""
        );

        if (
          cookieNames.some((name) => !name) ||
          new Set(cookieNames).size !== 4 ||
          selectedCookies.some(
            (cookie) =>
              !Number.isInteger(cookie.quantity) ||
              cookie.quantity < 1
          )
        ) {
          return res.status(400).json({
            message: "اختيارات الكوكيز غير صالحة",
          });
        }
      }

      if (product.category === "moroccan_platter") {
        if (
          !Array.isArray(platterSelections) ||
          platterSelections.length !== 7
        ) {
          return res.status(400).json({
            message: "البلاطو المغربي خاصو يحتوي على 7 أنواع",
          });
        }

        const shapes = platterSelections.map(
          (shape) =>
            typeof shape.shape === "string"
              ? shape.shape.trim()
              : ""
        );

        if (
          shapes.some((shape) => !shape) ||
          new Set(shapes).size !== 7 ||
          platterSelections.some(
            (shape) => shape.quantity !== 10
          )
        ) {
          return res.status(400).json({
            message: "كل نوع فالبلاطو خاصو يحتوي على 10 وحدات",
          });
        }
      }

      // الثمن مصدره قاعدة البيانات وليس Frontend
      const unitPrice = product.price;
      totalPrice += unitPrice * item.quantity;

      orderItems.push({
        product: product._id,
        name: product.name,
        unitPrice,
        quantity: item.quantity,

        ...(product.category === "cookie_pack"
          ? { selectedCookies }
          : {}),

        ...(product.category === "moroccan_platter"
          ? { platterSelections }
          : {}),
      });
    }

    // البحث عن الزبون برقم الهاتف أو إنشاء سجل جديد
    const client = await Client.findOneAndUpdate(
      { phone: phone.trim() },
      {
        $set: {
          fullname: fullname.trim(),
          city: city.trim(),
          address: address.trim(),
        },
        $setOnInsert: {
          phone: phone.trim(),
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    // إنشاء الطلبية
    const order = await Order.create({
      client: client._id,

      shippingAddress: {
        fullname: fullname.trim(),
        phone: phone.trim(),
        city: city.trim(),
        address: address.trim(),
      },

      items: orderItems,
      totalPrice,
    });

    return res.status(201).json({
      message: "تم تسجيل الطلبية بنجاح",
      order,
    });
  } catch (err) {
    console.error("createOrder error:", err);

    if (err instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        message: "معلومات الطلبية غير صالحة",
        errors: Object.values(err.errors).map(
          (error) => error.message
        ),
      });
    }

    return res.status(500).json({
      message: "وقع خطأ أثناء إنشاء الطلبية",
    });
  }
};

// جلب جميع الطلبيات
const getAllOrders = async (req, res) => {
  try {
    await dbConnect();

    const orders = await Order.find({})
      .populate("client", "fullname phone city address")
      .populate("items.product", "name image category")
      .sort({ createdAt: -1 })
      .limit(100);

    return res.status(200).json({ orders });
  } catch (err) {
    console.error("getAllOrders error:", err);

    return res.status(500).json({
      message: "وقع خطأ أثناء جلب الطلبيات",
    });
  }
};

// جلب طلبية واحدة حسب ID
const getOrderById = async (req, res) => {
  try {
    await dbConnect();

    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "معرّف الطلبية غير صالح",
      });
    }

    const order = await Order.findById(id)
      .populate("client", "fullname phone city address")
      .populate("items.product", "name image category");

    if (!order) {
      return res.status(404).json({
        message: "الطلبية غير موجودة",
      });
    }

    return res.status(200).json({ order });
  } catch (err) {
    console.error("getOrderById error:", err);

    return res.status(500).json({
      message: "وقع خطأ أثناء جلب الطلبية",
    });
  }
};

// تحديث حالة الطلبية
const updateOrderStatus = async (req, res) => {
  try {
    await dbConnect();

    const { id } = req.params;
    const { status } = req.body || {};

    const allowedStatuses = [
      "pending",
      "confirmed",
      "preparing",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "معرّف الطلبية غير صالح",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "حالة الطلبية غير صالحة",
      });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!order) {
      return res.status(404).json({
        message: "الطلبية غير موجودة",
      });
    }

    return res.status(200).json({
      message: "تم تحديث حالة الطلبية بنجاح",
      order,
    });
  } catch (err) {
    console.error("updateOrderStatus error:", err);

    return res.status(500).json({
      message: "وقع خطأ أثناء تحديث الطلبية",
    });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
};

