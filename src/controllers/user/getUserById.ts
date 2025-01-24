import { User } from "../../models/user.Model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { Request, Response } from "express";

/*
 * This function will give the user details : This function will takes the user id from the params and 
 * It will retuern the profile, name,email
 */

const GetSingleUserById = asyncHandler(async (req: Request, res: Response): Promise<Response> => {

    try {
        // Extract userId from the request params
        const userId = req.params.userId;

        // Find user by ID in the database
        const user = await User.findById(userId).select("username avatar email");

        // If user not found, return an error response
        if (!user) {
            return res.status(404).json(new ApiError(400, "User not found"));
        }

        // Return success response with user data
        return res.status(200).json(new ApiResponse(200, user, "User fetched successfully"));
    } catch (error) {
        // Handle errors
        return res.status(500).json(new ApiError(500, "Internal Server Error"));
    }
})

export { GetSingleUserById };

