import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError";
import env from "../config/dotenvConfig";

const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction,
): Response<any, Record<string, any>> => {
  let error: ApiError;

  // Check if the error is an instance of ApiError; if not, create a new ApiError instance
  if (!(err instanceof ApiError)) {
    const statusCode =
      err instanceof mongoose.Error || (err as any).statusCode ? 400 : 500;

    const message = err.message || "Something went wrong";
    const stack = env.NODE_ENV === "development" ? err.stack : undefined;

    error = new ApiError(statusCode, message, [], stack);
  } else {
    // If the error is already an instance of ApiError, use it directly
    error = err;
  }

  const response = {
    ...error,
    message: error.message,
    ...(env.NODE_ENV === "development" ? { stack: error.stack } : {}),
  };

  // Send the response
  return res.status(error.statusCode).json(response);
};

export { errorHandler };
