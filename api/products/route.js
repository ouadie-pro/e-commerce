
const {
  addProduct,
  getAllProducts,
  deleteProduct,
  editProduct,
} = require("../../../controllers/productController");

export async function GET() {
  try {
    const req = {};
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

    await getAllProducts(req, res);

    return Response.json(responseData, { status: statusCode });
  } catch (error) {
    console.error("GET /api/products:", error);
    return Response.json(
      { message: "حدث خطأ أثناء جلب المنتجات" },
      { status: 500 }
    );
  }
}

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

    await addProduct({ body }, res);

    return Response.json(responseData, { status: statusCode });
  } catch (error) {
    console.error("POST /api/products:", error);
    return Response.json(
      { message: "حدث خطأ أثناء إضافة المنتج" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json();
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

    await deleteProduct({ body: { id } }, res);

    return Response.json(responseData, { status: statusCode });
  } catch (error) {
    console.error("DELETE /api/products:", error);
    return Response.json(
      { message: "حدث خطأ أثناء حذف المنتج" },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
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

    await editProduct({ body }, res);

    return Response.json(responseData, { status: statusCode });
  } catch (error) {
    console.error("PATCH /api/products:", error);
    return Response.json(
      { message: "حدث خطأ أثناء تعديل المنتج" },
      { status: 500 }
    );
  }
}
