
import { User } from "../../models/user.Model";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/ApiError";
import { Response, Request } from "express";
import { ApiResponse } from "../../utils/ApiResponse";
import { FriendRequest } from "../../models/friend.Model";

const outgoing_request = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
    try {

        const { userId } = req.params
        if (!userId) {
            throw new ApiError(400, "userId not provided")
        }

        const user = await User.findById(userId)

        if (!user) {
            throw new ApiError(404, "user not found")
        }

        const sentRequests = await FriendRequest.find({ sender: userId })
            .populate("recipient", "name email status") // Fetch recipient details
            .exec();

        if (!sentRequests.length) {
            throw new ApiError(404, "No outgoing friend requests found");
        }
        return res
            .status(200)
            .json(new ApiResponse(200, { sentRequests }, "fetched all ongoing freind request"));

    } catch (error) {
        console.error("while while fetching all friend request", error)
        return res
            .status(500)
            .json("error fetching ongoing friend request")
    }
})

export { outgoing_request }
