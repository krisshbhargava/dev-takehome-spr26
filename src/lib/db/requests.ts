import { RequestStatus } from '../types/request';
import { InputException } from '../errors/inputExceptions';

export function validateRequestorName(name: string): void {
  if (!name || name.length < 3 || name.length > 30) {
    throw new InputException('Requestor name must be between 3-30 characters');
  }
}

export function validateItemRequested(item: string): void {
  if (!item || item.length < 2 || item.length > 100) {
    throw new InputException('Item requested must be between 2-100 characters');
  }
}

export function validateStatus(status: string): void {
  if (!Object.values(RequestStatus).includes(status as RequestStatus)) {
    throw new InputException(`Status must be one of: ${Object.values(RequestStatus).join(', ')}`);
  }
}