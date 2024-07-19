import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import env from "../config/dotenvConfig";
import { User } from "../models/user.Model";

interface JwtPayload {
  _id: string;
}

// Extend the Request interface to include the user property
declare module "express-serve-static-core" {
  interface Request {
    user?: any; // Use the appropriate type for the user model
  }
}

export const verifyJWT = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    try {
      const decodedToken = jwt.verify(
        token,
        env.ACCESS_TOKEN_SECRET,
      ) as JwtPayload;
      const user = await User.findById(decodedToken._id).select(
        "-password -refreshToken",
      );

      if (!user) {
        throw new ApiError(401, "Invalid access token");
      }

      req.user = user;
      next();
    } catch (error: any) {
      throw new ApiError(401, error.message || "Invalid access token");
    }
  },
);
