import { User, IUser } from "../../models/user.Model";
import { ApiError } from "../../utils/ApiError";
import { asyncHandler } from "../../utils/asyncHandler";
import { Response, Request } from "express";
import mongoose from "mongoose";
import { FriendRequest, IFriendRequest } from "../../models/friend.Model";
import { ApiResponse } from "../../utils/ApiResponse";

//id who  is acceptiong or rejecting the request
//const { userId } = req.params;
//
//const { requestId, action } = req.body;
//
//if (!mongoose.Types.ObjectId.isValid(requestId)) {
//    throw new ApiError(400, "Invalid request Id");
//}
//
//const friendReq = await FriendRequest.findOne({ sender: requestId });
//console.log(friendReq)
//
//if (!friendReq) {
//    throw new ApiError(404, "Friend request not found");
//}
//
//console.log("this is also running")
//if (!friendReq.recipient.equals(userId)) {
//    throw new ApiError(403, "You are not authorized to perform is action");
//}
//
//try {
//    friendReq.status =
//        action === "accept"
//            ? "accepted"
//            : action === "reject"
//                ? "rejected"
//                : friendReq.status;
//    await friendReq.save();
//    console.log("mean user request is saved")
//} catch (error) {
//    throw new ApiError(500, "Errow whiling processing request");
//}
//const sender = await User.findById(friendReq.sender);
//console.log("sender", sender)
//const recipient = await User.findById(friendReq.recipient);
//console.log("rec", recipient)
//
//if (!sender || !recipient) {
//    throw new ApiError(404, "User not found");
//}
//
//sender.sentFriendReq = sender.sentFriendReq.filter(
//    (req) => !req.equals(friendReq._id as mongoose.Types.ObjectId),
//);
//recipient.incommingFriendReq = recipient.incommingFriendReq.filter(
//    (req) => !req.equals(friendReq._id as mongoose.Types.ObjectId),
//);
//
//console.log("now gonna delete");
//if (action === "reject") {
//    await FriendRequest.deleteOne({ sender: requestId });
//}
//await sender.save();
//await recipient.save();

const acceptOrReject = asyncHandler(async (req: Request, res: Response): Promise<void> => {

    // --> THIS ROUTE IS LITTLE BIT HARD TO UNDERSTAND <-- \\
    // userId :=> Is the user's id  who will accpet or reject the request 
    // requestId : => Is the id of the friends model

    try {


        //grab the id from parmas or url
        const { userId } = req.params; // ID of the user accepting/rejecting the request
        const { requestId, action } = req.body; // Friend request ID and action

        //check id is valid or not
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new ApiError(400, "Invalid user ID");
        }

        if (!mongoose.Types.ObjectId.isValid(requestId)) {
            throw new ApiError(400, "Invalid request ID");
        }

        // Find the friend request by its ID
        const friendReq = await FriendRequest.findById(requestId) as IFriendRequest | null;
        if (!friendReq) {
            throw new ApiError(404, "Friend request not found");
        }

        // Check if the current user is the recipient of the friend request
        if (!friendReq.recipient.equals(new mongoose.Types.ObjectId(userId))) {
            throw new ApiError(403, "You are not authorized to perform this action");
        }

        // Handle rejection
        if (action === "reject") {
            await FriendRequest.deleteOne({ _id: requestId });

            // Remove references from sender and recipient
            const sender: IUser | null = await User.findById(friendReq.sender);
            const recipient: IUser | null = await User.findById(friendReq.recipient);

            if (sender) {
                sender.sentFriendReq = sender.sentFriendReq.filter(
                    (req) => !req.equals(friendReq._id)
                );
                await sender.save();
            }

            if (recipient) {
                recipient.incommingFriendReq = recipient.incommingFriendReq.filter(
                    (req) => !req.equals(friendReq._id)
                );
                await recipient.save();
            }

            res.status(200).json(new ApiResponse(200, "Friend request rejected"));
            return;
        }

        // Handle acceptance
        if (action === "accept") {
            friendReq.status = "accepted";
            await friendReq.save();

            const sender: IUser | null = await User.findById(friendReq.sender);
            const recipient: IUser | null = await User.findById(friendReq.recipient);

            if (sender && recipient) {
                sender.friends = sender.friends || [];
                recipient.friends = recipient.friends || [];

                //push the id in both friend field
                sender.friends.push(recipient._id);
                recipient.friends.push(sender._id);


                // Remove references from both sender and recipient
                sender.sentFriendReq = sender.sentFriendReq.filter(
                    (req) => req.toString() !== friendReq._id.toString()
                );
                recipient.incommingFriendReq = recipient.incommingFriendReq.filter(
                    (req) => req.toString() !== friendReq._id.toString()
                );
                await sender.save();
                await recipient.save();
                // Now delete the friend request from the database since it's accepted
                await FriendRequest.deleteOne({ _id: friendReq._id });
            }

            res.status(200).json(new ApiResponse(200, "Friend request accepted"));
            return;

        } else {
            throw new ApiError(400, "Invalid action");
        }
    } catch (error) {
        console.error("eror while handling request", error)
        throw new ApiError(500, "Error while sending friend request");
    }

});

export { acceptOrReject };
