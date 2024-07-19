import { Request, Response } from "express";
import { ApiError } from "./ApiError";
import jwt from "jsonwebtoken";
import { asyncHandler } from "./asyncHandler";
import env from "../config/dotenvConfig";
import { User } from "../models/user.Model";
import { generateAccessAndRefreshToken } from "./generateAccessAndRefreshToken";
import { ApiResponse } from "./ApiResponse";

interface JwtPayload {
  _id: string;
}

const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      env.REFRESH_TOKEN_SECRET,
    ) as JwtPayload;

    const user = await User.findById(decodedToken._id);
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user.refreshToken) {
      // Token is valid but already used or expired
      throw new ApiError(401, "Refresh token expired or used");
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    // Update user's refreshToken
    user.refreshToken = newRefreshToken;
    await user.save();

    return res
      .status(200)
      .cookie("accessToken", accessToken)
      .cookie("refreshToken", newRefreshToken)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed",
        ),
      );
  } catch (error: any) {
    throw new ApiError(401, error.message || "Invalid refresh token");
  }
});

export { refreshAccessToken };
