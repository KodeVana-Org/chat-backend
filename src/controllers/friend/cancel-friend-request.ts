import { FriendRequest } from "../../models/friend.Model";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { Request, Response } from "express";
import { User } from "../../models/user.Model";

const cancel_friend_request = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
    try {
        const { senderId, recipientId } = req.body;

        if (!senderId || !recipientId) {
            throw new ApiError(400, "Both senderId and recipientId are required");
        }

        // Find the friend request
        const friendRequest = await FriendRequest.findOne({
            sender: senderId,
            recipient: recipientId,
            status: "pending",
        });

        if (!friendRequest) {
            throw new ApiError(404, "Friend request not found or already accepted/rejected");
        }

        // Remove friend request ID from sender's sentFriendReq array
        await User.findByIdAndUpdate(senderId, {
            $pull: { sentFriendReq: friendRequest._id }
        });

        // Remove friend request ID from recipient's incomingFriendReq array
        await User.findByIdAndUpdate(recipientId, {
            $pull: { incommingFriendReq: friendRequest._id }
        });

        // Delete the friend request itself
        await FriendRequest.findByIdAndDelete(friendRequest._id);


        return res.status(200).json(
            new ApiResponse(200, {}, "Friend request cancelled successfully")
        );

    } catch (error) {
        console.error("Error cancelling friend request:", error);
        return res.status(500).json(new ApiError(500, "Error cancelling friend request"));
    }
});

export { cancel_friend_request };
