import { Error } from 'mongoose';

export const normalizedErrorMessage = (errors: Error.ValidationError) => {
  return Object.values(errors.errors).map(error => error.message).join(', ');
}
