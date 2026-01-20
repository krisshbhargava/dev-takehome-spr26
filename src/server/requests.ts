import { ObjectId } from "mongodb";
import { PAGINATION_PAGE_SIZE } from "@/lib/constants/config";
import { InvalidInputError } from "@/lib/errors/inputExceptions";
import { RequestStatus } from "@/lib/types/request";
import {
  ItemRequestDoc,
  ItemRequestDto,
  CreateItemRequestInput,
  UpdateStatusInput,
  BatchUpdateStatusInput,
  BatchDeleteInput,
  toItemRequestDto,
  buildNewItemRequestDoc,
} from "@/lib/db/request";
import { getRequestsCollection } from "@/lib/db/collections";
import {
  validateRequestorName,
  validateItemRequested,
  validateStatus,
} from "@/lib/db/requests";

export async function getItemRequests(
  status: string | null,
  page: number
): Promise<{
  data: ItemRequestDto[];
  totalPages: number;
  totalRecords: number;
}> {
  const collection = await getRequestsCollection();

  // Build query filter
  const filter: { status?: RequestStatus } = {};
  if (status) {
    validateStatus(status);
    filter.status = status as RequestStatus;
  }

  // Get total count for pagination
  const totalRecords = await collection.countDocuments(filter);
  const totalPages = Math.ceil(totalRecords / PAGINATION_PAGE_SIZE);

  // Validate page number
  if (page < 1) {
    throw new InvalidInputError("Page number must be >= 1");
  }

  // Calculate skip and limit
  const skip = (page - 1) * PAGINATION_PAGE_SIZE;
  const limit = PAGINATION_PAGE_SIZE;

  // Fetch documents sorted by createdDate descending
  const docs = await collection
    .find(filter)
    .sort({ createdDate: -1 })
    .skip(skip)
    .limit(limit)
    .toArray();

  // Convert to DTOs
  const data = docs.map((doc) => toItemRequestDto(doc));

  return {
    data,
    totalPages,
    totalRecords,
  };
}

export async function createNewRequest(
  request: CreateItemRequestInput
): Promise<ItemRequestDto> {
  // Validate input
  validateRequestorName(request.requestorName);
  validateItemRequested(request.itemRequested);

  const collection = await getRequestsCollection();

  // Build new document
  const newDoc = buildNewItemRequestDoc(request);

  // Insert into database
  const result = await collection.insertOne(newDoc as ItemRequestDoc);

  // Fetch the inserted document
  const insertedDoc = await collection.findOne({ _id: result.insertedId });
  if (!insertedDoc) {
    throw new Error("Failed to retrieve inserted document");
  }

  return toItemRequestDto(insertedDoc);
}

export async function updateRequestStatus(
  request: UpdateStatusInput
): Promise<ItemRequestDto> {
  // Validate input
  validateStatus(request.status);

  // Validate ObjectId format
  if (!ObjectId.isValid(request.id)) {
    throw new InvalidInputError("Invalid request ID format");
  }

  const collection = await getRequestsCollection();
  const objectId = new ObjectId(request.id);

  // Update the document
  const now = new Date();
  const result = await collection.findOneAndUpdate(
    { _id: objectId },
    {
      $set: {
        status: request.status as RequestStatus,
        lastEditedDate: now,
      },
    },
    { returnDocument: "after" }
  );

  if (!result) {
    throw new InvalidInputError("Request not found");
  }

  return toItemRequestDto(result);
}

export async function batchUpdateRequestStatus(
  request: BatchUpdateStatusInput
): Promise<{
  updated: ItemRequestDto[];
  failed: string[];
}> {
  // Validate input
  if (!request.ids || !Array.isArray(request.ids) || request.ids.length === 0) {
    throw new InvalidInputError("IDs array must be provided and non-empty");
  }
  validateStatus(request.status);

  const collection = await getRequestsCollection();
  const now = new Date();
  const objectIds: ObjectId[] = [];
  const failed: string[] = [];

  // Validate and convert all IDs
  for (const id of request.ids) {
    if (!ObjectId.isValid(id)) {
      failed.push(id);
    } else {
      objectIds.push(new ObjectId(id));
    }
  }

  if (objectIds.length === 0) {
    throw new InvalidInputError("No valid IDs provided");
  }

  // Update all valid documents
  const result = await collection.updateMany(
    { _id: { $in: objectIds } },
    {
      $set: {
        status: request.status as RequestStatus,
        lastEditedDate: now,
      },
    }
  );

  // Fetch updated documents
  const updatedDocs = await collection
    .find({ _id: { $in: objectIds } })
    .toArray();

  const updated = updatedDocs.map((doc) => toItemRequestDto(doc));

  return {
    updated,
    failed,
  };
}

export async function batchDeleteRequests(
  request: BatchDeleteInput
): Promise<{
  deleted: number;
  failed: string[];
}> {
  // Validate input
  if (!request.ids || !Array.isArray(request.ids) || request.ids.length === 0) {
    throw new InvalidInputError("IDs array must be provided and non-empty");
  }

  const collection = await getRequestsCollection();
  const objectIds: ObjectId[] = [];
  const failed: string[] = [];

  // Validate and convert all IDs
  for (const id of request.ids) {
    if (!ObjectId.isValid(id)) {
      failed.push(id);
    } else {
      objectIds.push(new ObjectId(id));
    }
  }

  if (objectIds.length === 0) {
    throw new InvalidInputError("No valid IDs provided");
  }

  // Delete all valid documents
  const result = await collection.deleteMany({ _id: { $in: objectIds } });

  return {
    deleted: result.deletedCount,
    failed,
  };
}
