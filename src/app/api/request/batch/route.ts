import { ResponseType } from "@/lib/types/apiResponse";
import {
  batchUpdateRequestStatus,
  batchDeleteRequests,
} from "@/server/requests";
import { ServerResponseBuilder } from "@/lib/builders/serverResponseBuilder";
import { InputException } from "@/lib/errors/inputExceptions";
import { HTTP_STATUS_CODE } from "@/lib/types/apiResponse";

export async function PATCH(request: Request) {
  try {
    const req = await request.json();
    const result = await batchUpdateRequestStatus(req);
    return new Response(JSON.stringify(result), {
      status: HTTP_STATUS_CODE.OK,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    if (e instanceof InputException) {
      return new ServerResponseBuilder(ResponseType.INVALID_INPUT).build();
    }
    return new ServerResponseBuilder(ResponseType.UNKNOWN_ERROR).build();
  }
}

export async function DELETE(request: Request) {
  try {
    const req = await request.json();
    const result = await batchDeleteRequests(req);
    return new Response(JSON.stringify(result), {
      status: HTTP_STATUS_CODE.OK,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    if (e instanceof InputException) {
      return new ServerResponseBuilder(ResponseType.INVALID_INPUT).build();
    }
    return new ServerResponseBuilder(ResponseType.UNKNOWN_ERROR).build();
  }
}
