import mongoose, { Schema, model, Document } from "mongoose";

//Define interface for document
export interface ITermpEmail extends Document {
    email: string,
    otp: number,
}

const TempEamilSchema = new Schema<ITermpEmail>(
    {
        email: {
            type: String
        },
        otp: {
            type: Number
        }
    }
)

export const TempEmail = mongoose.models.TempEmail || model<ITermpEmail>("TempEmail", TempEamilSchema)
