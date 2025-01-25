/* 
  ** message have
    * content
    * sender
    * media
    * audio
    * document
    * giphyUrl
    * date
    * type => Media | Text | Document | Audio | Giphy
*/

import mongoose, { Schema, Document, Model } from "mongoose";

/**
 * Document Schema for file attachments.
 * This schema represents documents (e.g., PDFs, Word files) that can be sent within messages.
 */

interface DocumentFile {
    url: string;
    name: string;
    size: number;
}



/**
 * There will be -> receiver fields right ? no only sender i gues
 * Message Schema
 * Defines the structure of a message document in the database.
 */

interface IMessage extends Document {
    sender: mongoose.Types.ObjectId;  //Refernce to the User model
    conversationId: mongoose.Types.ObjectId // Reference to the conversation model
    content?: string; //Optional text content
    media?: Array<{
        type: "image" | "video" // Media type
    }>;
    audioUrl?: string;
    giphyUrl?: string;
    document?: DocumentFile;
    type: "Media" | "Text" | "Document" | "Giphy" | "Audio" //Message type
    createdAt?: Date;
    updatedAt?: Date;

}

//Document Schema for a file
const documentSchema = new Schema<DocumentFile>({
    url: { type: String, required: true },
    name: { type: String, required: true },
    size: { type: Number, required: true },
})


const MessageSchema = new Schema<IMessage>(
    {
        sender: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        conversationId: {
            type: Schema.Types.ObjectId,
            ref: "Conversation",
            required: true
        },
        media: [
            {
                type: {
                    type: String,
                    enum: ["image", "video"]
                },
                url: String
            }
        ],
        audioUrl: {
            type: String
        },
        giphyUrl: {
            type: String
        },
        type: {
            type: String,
            enum: ["Media", "Text", "Document", "Giphy", "Audio"]
        },
        document: {
            type: documentSchema
        },

        // NOTE: i dont know it is necesarry or not just puted here 
        content: {
            type: String,
            required: true,
        },
    },
    { timestamps: true },
);

export const Message: Model<IMessage> = mongoose.model<IMessage>(
    "Message",
    MessageSchema,
);
