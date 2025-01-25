import mongoose from "mongoose";
import { Conversation } from "../../models/conversation.Model";
import { Message } from "../../models/message.Model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { Request, Response } from "express";

/**
 * @description Controller to send a message in a conversation (one-to-one or group)
 * @route       POST /api/messages
 * @access      Private
 * @param       {Object} req - Express request object
 * @param       {string} req.body.conversationId - ID of the conversation
 * @param       {string} req.body.type - Type of the message ("Text" | "Media" | "Document" | "Audio" | "Giphy")
 * @param       {string} [req.body.content] - Text content of the message (optional if type is not "Text")
 * @param       {Array} [req.body.media] - Media array containing objects with "type" and "url" (for images/videos)
 * @param       {Object} [req.body.document] - Document object containing "url", "name", and "size"
 * @param       {string} [req.body.audioUrl] - URL for an audio message
 * @param       {string} [req.body.giphyUrl] - URL for a Giphy message
 * @param       {Object} res - Express response object
 * @returns     {Response} - Returns the created message or an error response
 */

/*
 * conversationId :=> Id of the converstion model
 * Type of the message:=>
 
        **Text**
            {
                "conversationId":"6793d5f1818ebb2b43c91243",
                "type": "Text",
                "sender":"677dbe9fdf12277af282c8c9",
                "content": "Hello! How are you?"
            }
         **Media**
             {
              "conversationId": "6793d5f1818ebb2b43c91243",
                "type": "Media",
                "media": [
                    { "type": "image", "url": "https://example.com/image1.jpg" },
                    { "type": "video", "url": "https://example.com/video1.mp4" }
                ]
             }

         **Document**
             {
                "conversationId": "6487f3b2a5f1e24b7c57d95d",
                "type": "Document",
                "document": {
                    "url": "https://example.com/document.pdf",
                    "name": "My Document",
                    "size": 12345
                }
             }

         **Audio**
            {
                "conversationId": "6487f3b2a5f1e24b7c57d95d",
                "type": "Audio",
                "audioUrl": "https://example.com/audio.mp3"
            }

         **Giphy
            {
                "conversationId": "6487f3b2a5f1e24b7c57d95d",
                "type": "Giphy",
                "giphyUrl": "https://giphy.com/some-gif"
            }

 */

export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { sender, conversationId, type, content, media, document, audioUrl, giphyUrl } = req.body

        //validate the conversation
        const conversation = await Conversation.findById(conversationId)
        if (!conversation) {
            throw new ApiError(404, "Conversation not found ")
        }

        //validate the message type and  required field
        if (!type || !["Text", "Media", "Document", "Audio", "Giphy"].includes(type)) {
            throw new ApiError(400, "Invalid messge type")
        }

        if (type === "Text" && !content) {
            throw new ApiError(400, "Text content is required for a Text message")
        }

        if (type === "Media" && (!media || media.length == 0)) {
            throw new ApiError(400, "Media array is required  for a media message")
        }

        if (type == "Document" && !document) {
            throw new ApiError(400, "Document is required  for a document message")
        }

        if (type === "Audio" && !audioUrl) {
            throw new ApiError(400, "Audio URL is required for an Audio message");
        }

        if (type === "Giphy" && !giphyUrl) {
            throw new ApiError(400, "Giphy URL is required for a Giphy message");
        }

        //Construct the message  object
        const newMessage = new Message({
            //sender: req.user?._id, // if i use protected route
            sender: sender,
            conversationId,
            type,
            content,
            media,
            document,
            audioUrl,
            giphyUrl
        })

        //TODO: Here i think i need to add this message to lastMessage field in converstaion model

        //save the message to document
        await newMessage.save()
        return res.status(201).json(
            new ApiResponse(201, { message: newMessage }, "Message Sent Successfully")
        )

    } catch (error: any) {
        console.error("Error while sending message", error)
        throw new ApiError(500, "Internal server error", error.message)

    }
})

/**
 * @description Fetch all messages for a specific conversation
 * @route GET /api/messages/:conversationId
 * @access Protected (Requires authentication)
 */

export const getMessageByConversationId = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
    try {

        const conversationId = req.params.conversationId

        const conversation = await Conversation.findById(conversationId)
        if (!conversation) {
            throw new ApiError(404, "Conversation not found")
        }

        //Fetch the message fromt the converstaion
        const message = await Message.find({ conversationId }).populate({ path: "sender", select: "username avatar" }).sort({ createdAt: 1 })

        //check if not message found
        if (!message || message.length === 0) {
            return res.status(200).json(
                new ApiResponse(200, [], "No messages found in this conversation")
            );
        }

        // Return the messages
        return res.status(200).json(
            new ApiResponse(200, { data: message }, "Messages retrieved successfully")
        );
    } catch (error: any) {
        console.error("Error fetching messages", error);
        throw new ApiError(500, "Internal server error", error.message);
    }

})

/**
 * @desc    Delete a specific message from a conversation
 * @route   DELETE /api/messages/:messageId
 * @access  Private
  
 * Request Params:
 * - messageId: The ID of the message to be deleted
  
 * Request Body:
 * - userId: The ID of the user attempting to delete the message
 */

export const deleteMessage = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
    try {
        const { userId } = req.body
        const messageId = req.params.messageId

        const message = await Message.findById(messageId)
        if (!message) {
            throw new ApiError(404, "Message not found")
        }

        //check if the reqesting message is the sender of the message
        if (message.sender.toString() !== userId.toString()) {
            throw new ApiError(403, "You are not authorized to delete this message")
        }

        //Delete the message 
        await Message.findByIdAndDelete(messageId)

        // I dont know about this mater right now NOTE:
        //update conversation lastmessages filed if the deleted message was the last one
        //
        const conversation = await Conversation.findById(message.conversationId)

        if (conversation?.lastMessage?.toString() === messageId) {
            const previousMessage = await Message.findOne({ conversationId: message.conversationId })
                .sort({ createdAt: -1 }); // Get the most recent message

            conversation.lastMessage = previousMessage?._id as mongoose.Types.ObjectId | undefined; // Use type assertion
            await conversation.save();
        }

        return res.status(200).json(new ApiResponse(200, {}, "Message deleted successfully"));

    } catch (error: any) {
        console.error("Error while deleting message:", error.message);
        throw new ApiError(500, "Internal server error", error.message);
    }
})
