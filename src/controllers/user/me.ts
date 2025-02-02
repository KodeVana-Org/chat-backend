import { User } from "../../models/user.Model";
import jwt from "jsonwebtoken";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { Request, Response } from "express";

const me = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
    try {
        let user;

        // Check if `userId` is provided
        const { userId } = req.body;

        if (userId) {
            // Fetch user by `userId`
            user = await User.findById(userId);
        } else {
            // If `userId` is not provided, validate the token
            const authHeader = req.headers["authorization"];
            if (!authHeader) {
                throw new ApiError(403, "Token not provided");
            }

            const token = authHeader.split(" ")[1]; // Extract token from "Bearer <token>"
            if (!token) {
                throw new ApiError(403, "Invalid token format");
            }

            // Decode token to get the user ID (assuming you have a verifyToken function)
            const decoded = await new Promise((resolve, reject) => {
                jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, (err, decoded) => {
                    if (err) return reject(new ApiError(401, "Invalid or expired token"));
                    resolve(decoded);
                });
            });

            const { _id } = decoded as { _id: string };
            user = await User.findById(_id);
        }

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        return res
            .status(200)
            .json(new ApiResponse(200, { user }, "Fetched user successfully"));
    } catch (error) {
        console.error("Error while trying to fetch user", error);

        // Handle known API errors gracefully
        if (error instanceof ApiError) {
            return res
                .status(error.statusCode)
                .json(new ApiResponse(error.statusCode, {}, error.message));
        }

        // Handle unexpected errors
        return res
            .status(500)
            .json(new ApiResponse(500, {}, "An unexpected error occurred"));
    }
});

export { me };

