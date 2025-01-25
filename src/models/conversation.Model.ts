import mongoose, { Schema, Document, Model } from "mongoose";

//Inteface of participants
interface Iparticipant {
    userId: mongoose.Types.ObjectId;
    isAdmin: boolean;
    role?: string;
}

//conversation interface
export interface IConversation extends Document {
    participants: Iparticipant[]; //List of participants
    isGroupChat: boolean; // false for one to one chat
    groupName?: string;
    groupImage?: string;
    lastMessage?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

//participants schema
const participantsSchema = new Schema<Iparticipant>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        Default: "memeber"
    }
})


//converstaion schema
const conversationSchema = new Schema<IConversation>(
    {
        participants: {

            type: [participantsSchema],
            validate: [
                (val: Iparticipant[]) => val.length > 0,
                "Conversation must have at least two participant."
            ],
            required: true
        },
        isGroupChat: {
            type: Boolean,
            default: false,
            required: true
        },
        groupName: {
            type: String,
            trim: true,
            default: null // only used for group chat
        },
        groupImage: {
            type: String,
            default: null // only used for group chat
        },
        lastMessage: {
            type: Schema.Types.ObjectId,
            ref: "Message",
        },
    },
    { timestamps: true },
);

export const Conversation: Model<IConversation> = mongoose.model<IConversation>("Conversation", conversationSchema);
