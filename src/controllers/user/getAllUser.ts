import { User } from "../../models/user.Model";
import { Response, Request, response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";

const getAllUser = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { userId } = req.body;
        console.log("ID", userId)
        // Fetch all users except the current user
        const allUser = await User.find({ _id: { $ne: userId } }).select("username email avatar");

        if (allUser.length === 0) {
            return res.status(404).json(new ApiError(404, "No users found"));
        }
        console.log("Users:", allUser)
        // Fetch the current user
        let me = await User.findById(userId).select("username email avatar friends sentFriendReq incommingFriendReq bio status");
        if (!me) {
            return res.status(404).json(new ApiError(404, "User not found"));
        }

        // Conditionally populate fields only if they are not empty
        let query = User.findById(userId).select("username email avatar friends sentFriendReq incommingFriendReq bio status");

        if (me.friends?.length) query = query.populate("friends", "username email avatar bio status");
        if (me.sentFriendReq?.length) query = query.populate({
            path: "sentFriendReq",
            model: "Friend",
            select: "recipient status", // Select only necessary fields
            populate: { path: "recipient", select: "username email avatar" }, //the guy detail who send the friend request
        });
        if (me.incommingFriendReq?.length) query = query.populate({
            path: "incommingFriendReq",
            model: "Friend",
            select: "sender status",
            populate: { path: "sender", select: "username email avatar" },
        });

        // Execute the final query with population
        me = await query.exec();

        // Create a filtered response
        const Data = {
            _id: me!._id,
            username: me!.username,
            email: me!.email,
            avatar: me!.avatar,
            bio: me!.bio,
            status: me!.status,
            friends: me!.friends || [],
            sentFriendReq: me!.sentFriendReq || [],
            incommingFriendReq: me!.incommingFriendReq || [],
        };

        return res.status(200).json(
            new ApiResponse(200, { user: Data, users: allUser }, "Successfully fetched all users")
        );
    } catch (error) {
        console.error("Error fetching users:", error);
        return res.status(500).json(new ApiError(500, "Error while fetching users"));
    }
});

export { getAllUser };
