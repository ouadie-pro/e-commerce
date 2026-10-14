
const { addClient } = require("../../../controllers/clientController");

export async function POST(request) {
  try {
    const body = await request.json();

    const req = { body };
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

    await addClient(req, res);

    return Response.json(responseData, { status: statusCode });
  } catch (error) {
    console.error("POST /api/clients:", error);
    return Response.json(
      { message: "حدث خطأ أثناء إضافة الزبون" },
      { status: 500 }
    );
  }
}
