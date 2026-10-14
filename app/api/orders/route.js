
const {
  createOrder,
  getAllOrders,
} = require("../../../controllers/orderController");

export async function POST(request) {
  try {
    const body = await request.json();
    let statusCode = 200;
    let responseData;

    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        responseData = data;
        return this;
      },
    };

    await createOrder({ body }, res);

    return Response.json(responseData, { status: statusCode });
  } catch (error) {
    console.error("POST /api/orders:", error);
    return Response.json(
      { message: "حدث خطأ أثناء إنشاء الطلبية" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    let statusCode = 200;
    let responseData;

    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        responseData = data;
        return this;
      },
    };

    await getAllOrders({}, res);

    return Response.json(responseData, { status: statusCode });
  } catch (error) {
    console.error("GET /api/orders:", error);
    return Response.json(
      { message: "حدث خطأ أثناء جلب الطلبيات" },
      { status: 500 }
    );
  }
}
