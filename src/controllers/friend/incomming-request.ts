import { User } from "../../models/user.Model";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/ApiError";
import { Response, Request } from "express";
import { ApiResponse } from "../../utils/ApiResponse";
import { FriendRequest } from "../../models/friend.Model";

const incomming_reuest = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
    try {

        const { userId } = req.params
        if (!userId) {
            throw new ApiError(400, "userId not provided")
        }

        const user = await User.findById(userId)

        if (!user) {
            throw new ApiError(404, "user not found")
        }

        const all_request = await FriendRequest.find()

        if (!all_request) {
            throw new ApiError(404, "No Friend Request Found")
        }

        return res
            .status(200)
            .json(new ApiResponse(200, { all_request }, "fetched all incoming request"));

    } catch (error) {
        console.error("while while fetching all friend request", error)
        return res
            .status(500)
            .json("error fetching friends request")
    }
})

export { incomming_reuest }
