import { User, IUser } from "../../models/user.Model";
import { ApiError } from "../../utils/ApiError";
import { asyncHandler } from "../../utils/asyncHandler";
import { Response, Request } from "express";
import mongoose from "mongoose";
import { FriendRequest } from "../../models/friend.Model";
import { ApiResponse } from "../../utils/ApiResponse";

const acceptOrReject = asyncHandler(async (req: Request, res: Response) => {
  try {
    //who is acceptiong or rejecting the request
    const { userId } = req.params;

    const { requestId, action } = req.body;

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      throw new ApiError(400, "Invalid request Id");
    }

    const friendReq = await FriendRequest.findOne({ sender: requestId });
    if (!friendReq) {
      throw new ApiError(404, "Friend request not found");
    }

    if (!friendReq.recipient.equals(userId)) {
      throw new ApiError(403, "You are not authorized to perform is action");
    }

    try {
      friendReq.status =
        action === "accept"
          ? "accepted"
          : action === "reject"
            ? "rejected"
            : friendReq.status;
      await friendReq.save();
    } catch (error) {
      throw new ApiError(500, "Errow whiling processing request");
    }
    const sender = await User.findById(friendReq.sender);
    const recipient = await User.findById(friendReq.recipient);

    if (!sender || !recipient) {
      throw new ApiError(404, "User not found");
    }

    sender.sentFriendReq = sender.sentFriendReq.filter(
      (req) => !req.equals(friendReq._id as mongoose.Types.ObjectId),
    );
    recipient.incommingFriendReq = recipient.incommingFriendReq.filter(
      (req) => !req.equals(friendReq._id as mongoose.Types.ObjectId),
    );

    console.log("now gonna delete");
    if (action === "reject") {
      await FriendRequest.deleteOne({ sender: requestId });
    }
    await sender.save();
    await recipient.save();

    return res
      .status(200)
      .json(new ApiResponse(200, "reqest is either accepted or rejected"));
  } catch (error) {
    throw new ApiError(500, "Internal server error");
  }
});

export { acceptOrReject };
