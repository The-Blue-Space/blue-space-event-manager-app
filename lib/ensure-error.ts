import { AxiosError } from "axios";
import { ZodError } from "zod";
import logger from "./app-logger";

/**
 * Ensures that an error is an instance of Error
 * @param err - The error to ensure
 * @returns The error if it is an instance of Error, otherwise a new Error with the message "[unable to stringify thrown error]"
 */
export default function ensureError(err: unknown): Error {
  logger.log(err);
  if (err instanceof ZodError) {
    const newError = new Error(err.issues[0].message);
    return newError;
  }
  if (err instanceof AxiosError) {
    if (err.response) {
      const newError = new Error(err.response.data.message);
      return newError;
    }
  }
  if (err instanceof Error) return err;
  let stringText = "[unable to stringify thrown error]";
  try {
    stringText = JSON.stringify(err);
  } catch (error) {
    if (error) throw error;
  }

  const error = new Error(`value thrown as is: ${stringText}`);
  return error;
}

/**
 * Formats a ZodError into a dictionary of field names and error messages
 * @param err - The ZodError to format
 * @returns A dictionary of field names and error messages
 */
export function formatZodErrors(err: ZodError) {
	const errors = err.issues.reduce((acc, err) => {
		const field = err.path[0];
		acc[field as string] = err.message;
		return acc;
	}, {} as Record<string, string>);
	return errors;
}
