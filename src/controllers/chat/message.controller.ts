import mongoose from "mongoose";
import { Conversation } from "../../models/conversation.Model";
import { Message } from "../../models/message.Model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { Request, Response } from "express";
import { io } from "../../app";
import { cloudinary } from "../../config/cloudinaryConfigs";

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
               "sender":"677dbe9fdf12277af282c8c9",
              "conversationId": "6793d5f1818ebb2b43c91243",
                "type": "Media",
                "media" "image file"

                //"media": [
                //    { "type": "image", "url": "https://example.com/image1.jpg" },
                //    { "type": "video", "url": "https://example.com/video1.mp4" }
                //]
             }

         **Document**
             {
               "sender":"677dbe9fdf12277af282c8c9",
                "conversationId": "6487f3b2a5f1e24b7c57d95d",
                "type": "Document",
                "document": "pdf file"
                //"document": {
                //    "url": "https://example.com/document.pdf",
                //    "name": "My Document",
                //    "size": 12345
                //}
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

type MulterFiles = {
    [fieldname: string]: Express.Multer.File[]
}

type MediaUrl = {
    type: "image" | "video";
    url: string;
};

export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { sender, conversationId, type, content } = req.body
        let { audioUrl, giphyUrl } = req.body

        const files = req.files as MulterFiles

        //validate the conversation
        const conversation = await Conversation.findById(conversationId)
        if (!conversation) {
            throw new ApiError(404, "Conversation not found ")
        }

        //validate the message type and  required field
        if (!type || !["Text", "Media", "Document", "Audio", "Giphy"].includes(type)) {
            throw new ApiError(400, "Invalid messge type")
        }

        const mediaUrls: MediaUrl[] = []; // Explicitly type the array
        let documentUrl: {
            url: string;
            name: string;
            size: number
        } | null = null;

        //Handle file uploads based on message type
        switch (type) {
            case "Text":
                if (!content) {
                    throw new ApiError(400, "Text content is required for a Text message")
                }
                break;

            case "Media":
                if (!files || !files.media || files.media.length === 0) {
                    throw new ApiError(400, "Media files is required for a Media message")
                }

                //Upload media files to cloudinary
                for (const file of files.media) {

                    // this comment code only work when i saved the file temperory to uploads other wise need to convert in base64
                    //const result = await cloudinary.uploader.upload(file.path, {
                    //    resource_type: file.mimetype.startsWith("video") ? "video" : "image",
                    //})

                    const base64Data = file.buffer.toString("base64"); // Convert Buffer to base64 
                    const result = await cloudinary.uploader.upload(
                        `data:${file.mimetype};base64,${base64Data}`, {
                        resource_type: file.mimetype.startsWith("video") ? "video" : "image",
                    }
                    );
                    mediaUrls.push({
                        type: file.mimetype.startsWith("video") ? "video" : "image",
                        url: result.secure_url,
                    })
                }
                //fs.unlinkSync(file.path); // Delete the temporary file no need here bease im not storing right now
                break;

            case "Document":
                if (!files || !files.document || files.document.length === 0) {
                    throw new ApiError(400, "Document file is required for a document message")
                }
                // Upload document to Cloudinary
                const documentFile = files.document[0];
                //const documentResult = await cloudinary.uploader.upload(documentFile.path, {

                const base64Data = documentFile.buffer.toString("base64"); // Convert Buffer to base64
                const documentResult = await cloudinary.uploader.upload(
                    `data:${documentFile.mimetype};base64,${base64Data}`, {
                    resource_type: "auto", // Automatically detect resource type
                });
                documentUrl = {
                    url: documentResult.secure_url,
                    name: documentFile.originalname,
                    size: documentFile.size,
                };
                break;

            //NOTE handling here
            case "Audio":
                if (!files || !files.audio || files.audio.length === 0) {
                    throw new ApiError(400, "Audio file is required for an Audio message");
                }
                // Upload audio to Cloudinary
                const audioFile = files.audio[0];
                const audioResult = await cloudinary.uploader.upload(audioFile.path, {
                    resource_type: "video", // Cloudinary treats audio files as video
                });
                audioUrl = audioResult.secure_url;
                break;

            case "Giphy":
                if (!req.body.giphyUrl) {
                    throw new ApiError(400, "Giphy URL is required for a Giphy message");
                }
                giphyUrl = req.body.giphyUrl;
                break;
        }


        /****

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

        ******/

        // Construct the message object based on the type
        const messageData = new Message({
            sender: sender,
            conversationId,
            type,
            content: type === "Text" ? content : undefined, // Only include content for Text messages
            media: type === "Media" ? mediaUrls : undefined, // Only include media for Media messages
            document: type === "Document" ? documentUrl : undefined, // Only include document for Document messages
        });


        const newMessage = new Message(messageData);
        await newMessage.save()

        // Remove 'media' field from Text and Document messages
        if (type !== "Media") {
            await Message.updateOne({ _id: newMessage._id }, { $unset: { media: "" } });
        }

        conversation.lastMessage = newMessage._id as mongoose.Types.ObjectId; // Use type assertion
        await conversation.save();

        io.to(conversationId).emit("receiveMessage", newMessage);  // Emit message to specific room

        return res.status(201).json(
            new ApiResponse(201, { data: newMessage }, "Message Sent Successfully")
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

        //update conversation lastmessages filed if the deleted message was the last one

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

/**
 * @description Fetch Media for specific messageId
 * @route GET /api/messages/:messageId/media
 * @access Protected (Requires authentication)
 */

export const getMessageMedia = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
    const messageId = req.params.messageId;

    // Validate messageId
    if (!mongoose.Types.ObjectId.isValid(messageId)) {
        throw new ApiError(400, "Invalid message ID");
    }

    // Fetch the message
    const message = await Message.findById(messageId).select("media");
    if (!message) {
        throw new ApiError(404, "Message not found");
    }

    // Check if the message has media
    if (!message.media || message.media.length === 0) {
        throw new ApiError(404, "No media found for this message");
    }

    // Return the media details
    return res.status(200).json(
        new ApiResponse(200, { media: message.media }, "Media fetched successfully")
    );
});

