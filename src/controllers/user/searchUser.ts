
import { User } from "../../models/user.Model";
import { Response, Request } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";

/**
 * Retrieves a list of users from the database based on a search query.
 * Excludes the currently authenticated user from the results.
 * 
 * @function allUsers
 * @async
 * 
 * @param {Object} req.query - The query parameters from the URL.
 * @param {string} [req.query.search] - The search keyword to filter users by name or email.
 * @param {string} req.user._id - The ID of the authenticated user to exclude from the results.
 
 * @example
 * // Request: GET /api/users?search=John
 * // Authenticated user ID: 12345
 * // Response: [
 * //   { _id: "67890", name: "John Doe", email: "john@example.com" },
 * //   { _id: "54321", name: "Johnny Appleseed", email: "johnny@example.com" }
 * // ]
 */

const searchAllUser = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
    try {
        const keyword = req.query.search
            ? {
                $or: [
                    { name: { $regex: req.query.search, $options: "i" } }, // Case-insensitive regex search for name
                    { email: { $regex: req.query.search, $options: "i" } }, // Case-insensitive regex search for email
                ],
            }
            : {};

        // Fetch users from the database excluding the current user
        const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });

        return res
            .status(200)
            .json(
                new ApiResponse(200, { users }, "Search completed successfully"),
            );
    } catch (error) {
        throw new ApiError(500, "Error occurred while fetching users");
    }
});

export { searchAllUser };
