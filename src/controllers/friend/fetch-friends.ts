import mongoose from "mongoose";
import { IUser, User } from "../../models/user.Model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { Request, Response } from "express";

// Fetch user friends
const get_friends = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
    try {
        const { userId } = req.params;

        // Ensure userId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new ApiError(400, "Invalid user ID");
        }

        // Find the user and populate their friends
        const user: IUser | null = await User.findById(userId).populate("friends", "username avatar");

        // Check if user exists
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        // Check if user has friends
        if (!user.friends || user.friends.length === 0) {
            return res.status(200).json(new ApiResponse(200, [], "No friends found"));
        }
        //TODO: last message and last seen

        // Return the list of friends
        return res.status(200).json(
            new ApiResponse(200, { friends: user.friends }, "User's friends fetched successfully")
        );

    } catch (error) {
        console.error("Error while fetching friends:", error);

        // Handle known API errors gracefully
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(new ApiResponse(error.statusCode, {}, error.message));
        }

        // Handle unexpected errors
        return res.status(500).json(new ApiResponse(500, {}, "An unexpected error occurredhffff"));
    }
});

export { get_friends }
