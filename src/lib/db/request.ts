// types/itemRequest.ts
import { ObjectId } from "mongodb";
import { RequestStatus } from "../request";

export interface ItemRequestDoc {
  _id: ObjectId;
  requestorName: string;
  itemRequested: string;
  createdDate: Date;
  lastEditedDate: Date | null;
  status: RequestStatus;
}

export interface ItemRequestDto {
  id: string;
  requestorName: string;
  itemRequested: string;
  createdDate: string;
  lastEditedDate: string | null;
  status: RequestStatus;
}

export interface CreateItemRequestInput {
  requestorName: string;
  itemRequested: string;
}

export interface UpdateStatusInput {
  id: string;
  status: RequestStatus;
}


export function toItemRequestDto(doc: ItemRequestDoc): ItemRequestDto {
  return {
    id: doc._id.toString(),
    requestorName: doc.requestorName,
    itemRequested: doc.itemRequested,
    createdDate: doc.createdDate.toISOString(),
    lastEditedDate: doc.lastEditedDate
      ? doc.lastEditedDate.toISOString()
      : null,
    status: doc.status,
  };
}


export function buildNewItemRequestDoc(
  input: CreateItemRequestInput
): Omit<ItemRequestDoc, "_id"> {
  const now = new Date();

  return {
    requestorName: input.requestorName,
    itemRequested: input.itemRequested,
    createdDate: now,
    lastEditedDate: null,
    status: "PENDING" as RequestStatus,
  };
}
