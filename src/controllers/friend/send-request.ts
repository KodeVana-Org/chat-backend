import { User } from "../../models/user.Model";
import { IUser } from "../../models/user.Model";
import { ApiError } from "../../utils/ApiError";
import { asyncHandler } from "../../utils/asyncHandler";
import { Response, Request } from "express";
import { ApiResponse } from "../../utils/ApiResponse";
import { FriendRequest, IFriendRequest } from "../../models/friend.Model";
import mongoose from "mongoose";

const sent_fr_request = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { recipientId } = req.params;
        const { senderId } = req.body;
        console.log(recipientId, senderId);

        const recipient = await User.findById(recipientId);
        const sender: IUser | null = await User.findById(senderId);

        if (!recipient || !sender) {
            throw new ApiError(404, "userId or sender Id not found");
        }
        //check if a friend reqest already exists or already sended
        const existingRequest = await FriendRequest.findOne({
            sender: sender._id,
            recipient: recipient._id,
        });


        if (existingRequest) {
            //console.log("Friend request already exists. Throwing error...");
            //throw new ApiError(400, "Friend request already sended");
            return res
                .status(201)
                .json(new ApiResponse(200, {}, "Friend request already sent"));
        }

        try {
            //create a new friend request
            const friendReq: IFriendRequest = new FriendRequest({
                sender: sender._id,
                recipient: recipient._id,
                status: "pending",
            });
            await friendReq.save();

            //add recipient(request accepter ) id to sender's model
            sender.sentFriendReq.push(friendReq._id as mongoose.Types.ObjectId);

            //add sender id to recipient(request accepter) model
            recipient.incommingFriendReq.push(
                friendReq._id as mongoose.Types.ObjectId,
            );
        } catch (error) {
            throw new ApiError(500, "Error while saving friend");
        }

        await sender.save();
        await recipient.save();
        return res
            .status(200)
            .json(new ApiResponse(200, "friend requeset sent successfully"));
    } catch (error) {
        throw new ApiError(500, "Error while sending friend request");
    }
});

export { sent_fr_request };
