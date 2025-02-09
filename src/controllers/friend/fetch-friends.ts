import mongoose from "mongoose";
import { IUser, User } from "../../models/user.Model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { Request, Response } from "express";
import { Conversation } from "../../models/conversation.Model";
import { Message } from "../../models/message.Model";

interface LastMessage {
    _id: mongoose.Types.ObjectId;
    sender: mongoose.Types.ObjectId;
    conversationId: mongoose.Types.ObjectId;
    type: string;
    content?: string;
    media?: any[];
    audioUrl?: string;
    document?: {
        url: string;
        name: string;
        size: number;
    };
    createdAt: Date;
    updatedAt: Date;
    toObject(): any; // Add this to satisfy TypeScript
}

interface FormattedLastMessage {
    createdAt: Date;
    type: string;
    content?: string;
    media?: any[];
    audioUrl?: string;
    document?: {
        url: string;
        name: string;
        size: number;
    };
}

// Fetch user friends
const get_friends = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
    try {

        const { userId } = req.params;
        /*
         *  lets grab the conversatinId for fetching lastMessage
         *
         */

        // Ensure userId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new ApiError(400, "Invalid user ID");
        }

        // Find the user and populate their friends
        //const user: IUser | null = await User.findById(userId).populate("friends", "username avatar");
        const user = await User.findById(userId).populate({
            path: "friends",
            select: "username avatar", // Select only necessary fields
        });

        // Check if user exists
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        // Check if user has friends
        if (!user.friends || user.friends.length === 0) {
            return res.status(200).json(new ApiResponse(200, [], "No friends found"));
        }
        //TODO:  and last seen


        const friendsWithLastMessage = await Promise.all(
            user.friends.map(async (friend) => {
                // Ensure the friend is a valid document
                if (!friend || typeof friend === "string" || friend instanceof mongoose.Types.ObjectId) {
                    return {
                        _id: friend?.toString() || "unknown_id", // Use the ObjectId as a string
                        username: "Unknown",
                        avatar: null,
                        lastMessage: null,
                    };
                }

                // TypeScript now knows `friend` is a valid Mongoose document
                const friendDoc = friend as mongoose.Document & {
                    _id: mongoose.Types.ObjectId;
                    username: string;
                    avatar: {
                        url: string;
                        _id: mongoose.Types.ObjectId;
                    };
                };

                // Find the conversation between the current user and the friend
                const conversation = await Conversation.findOne({
                    participants: {
                        $all: [
                            { $elemMatch: { userId: userId } },
                            { $elemMatch: { userId: friendDoc._id } },
                        ],
                    },
                });

                // Fetch the last message for the conversation
                let lastMessage = null;
                if (conversation) {
                    lastMessage = await Message.findOne({ conversationId: conversation._id })
                        .sort({ createdAt: -1 }) // Get the most recent message
                        .exec();
                }

                // Extract only the required fields from the last message
                let formattedLastMessage: FormattedLastMessage | null = null;
                if (lastMessage) {
                    // TypeScript now knows `lastMessage` is a valid Mongoose document
                    const lastMessageDoc = lastMessage as mongoose.Document & LastMessage;

                    formattedLastMessage = {
                        createdAt: lastMessageDoc.createdAt,
                        type: lastMessageDoc.type,
                    };

                    // Dynamically include only the relevant content based on the message type
                    if (lastMessageDoc.type === "Text" && lastMessageDoc.content) {
                        formattedLastMessage.content = lastMessageDoc.content;
                    } else if (lastMessageDoc.type === "Media" && lastMessageDoc.media) {
                        formattedLastMessage.media = lastMessageDoc.media;
                    } else if (lastMessageDoc.type === "Audio" && lastMessageDoc.audioUrl) {
                        formattedLastMessage.audioUrl = lastMessageDoc.audioUrl;
                    } else if (lastMessageDoc.type === "Document" && lastMessageDoc.document) {
                        formattedLastMessage.document = lastMessageDoc.document;
                    }
                }

                return {
                    ...friendDoc.toObject(), // Convert Mongoose document to plain object
                    lastMessage: formattedLastMessage, // Add the formatted last message
                };
            })
        );
        // Return the list of friends
        return res.status(200).json(
            new ApiResponse(200, {
                //friends: user.friends, lastMessage
                friends: friendsWithLastMessage
            }, "User's friends fetched successfully")
        );

    } catch (error) {
        console.error("Error while fetching friends:", error);

        // Handle known API errors gracefully
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(new ApiResponse(error.statusCode, {}, error.message));
        }

        // Handle unexpected errors
        return res.status(500).json(new ApiResponse(500, {}, "An unexpected error occurredhffff"));
    }
});

export { get_friends }
