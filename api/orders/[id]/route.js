
const {
  getOrderById,
  updateOrderStatus,
} = require("../../../../controllers/orderController");

export async function GET(request, { params }) {
  try {
    const { id } = await params;
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

    await getOrderById({ params: { id } }, res);

    return Response.json(responseData, { status: statusCode });
  } catch (error) {
    console.error("GET /api/orders/[id]:", error);
    return Response.json(
      { message: "حدث خطأ أثناء جلب الطلبية" },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
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

    await updateOrderStatus(
      { params: { id }, body },
      res
    );

    return Response.json(responseData, { status: statusCode });
  } catch (error) {
    console.error("PATCH /api/orders/[id]:", error);
    return Response.json(
      { message: "حدث خطأ أثناء تحديث الطلبية" },
      { status: 500 }
    );
  }
}
