import { User } from "../../models/user.Model";
import { Response, Request, response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";

const getAllUser = asyncHandler(async (req: Request, res: Response) => {
    try {

        const { userId } = req.body;

        // Fetch the current user
        let me = await User.findById(userId)
            .select("username email avatar friends sentFriendReq incommingFriendReq bio status")
            .populate({
                path: "sentFriendReq",
                model: "Friend",
                select: "recipient",
            });



        // Extract user IDs from sent friend requests
        const sentFriendReqIds = me.sentFriendReq.map((req: any) => req.recipient.toString());

        // Find all users except the current user
        const allUsers = await User.find({ _id: { $ne: userId } }).select("username email avatar");

        // Filter users into two categories
        const usersWithSentRequests = allUsers.filter(user => sentFriendReqIds.includes(user._id.toString()));
        const usersWithoutSentRequests = allUsers.filter(user => !sentFriendReqIds.includes(user._id.toString()));

        // Construct minimal user data response
        const Data = {
            _id: me._id,
            username: me.username,
            email: me.email,
            avatar: me.avatar,
            bio: me.bio,
            status: me.status,
            friends: me.friends || [],
        };

        return res.status(200).json(
            new ApiResponse(200, {
                //me: Data,
                usersWithoutSentRequests, // Users the current user hasn't sent a friend request to
                usersWithSentRequests,    // Users the current user has sent a friend request to
            }, "Successfully fetched users")

        );
    } catch (error) {
        console.error("Error fetching users:", error);
        return res.status(500).json(new ApiError(500, "Error while fetching users"));
    }
});

export { getAllUser };
