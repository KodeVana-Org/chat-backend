import { User } from "../../models/user.Model";
import { Response, Request, response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";

const getAllUser = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { userId } = req.body;

        // Fetch all users except the current user
        const allUser = await User.find({ _id: { $ne: userId } });

        if (allUser.length === 0) {
            return res.status(404).json(new ApiError(404, "No users found"));
        }

        // Fetch the current user
        let me = await User.findById(userId);
        if (!me) {
            return res.status(404).json(new ApiError(404, "User not found"));
        }

        // Conditionally populate fields only if they are not empty
        let query = User.findById(userId);
        if (me.friends?.length) query = query.populate("friends");
        if (me.sentFriendReq?.length) query = query.populate({
            path: "sentFriendReq",
            model: "Friend", // Ensure this matches mongoose.model name
        });
        if (me.incommingFriendReq?.length) query = query.populate({
            path: "incommingFriendReq",
            model: "Freind"
            //model: "FriendRequest",
        });

        // Execute the final query with population
        me = await query.exec();

        const Data = {
            ...me!.toObject(),
            friends: me!.friends || [],
            sentFriendReq: me!.sentFriendReq || [],
            incommingFriendReq: me!.incommingFriendReq || [],
        };

        return res.status(200).json(
            new ApiResponse(200, { me: Data, all_users: allUser }, "Successfully fetched all users")
        );
    } catch (error) {
        console.error("Error fetching users:", error);
        return res.status(500).json(new ApiError(500, "Error while fetching users"));
    }
}); export { getAllUser };
